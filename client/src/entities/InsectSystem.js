/**
 * InsectSystem — 昆虫生态系统
 *
 * 昆虫类型：
 *   FIREFLY   — 萤火虫（夜间发光，随机飘动）
 *   BEETLE    — 甲虫（地面爬行，较慢）
 *   BUTTERFLY — 蝴蝶（高速飞行，靠近花朵聚集）
 *   MOTH      — 飞蛾（被光源吸引，偶尔受食虫植物诱骗）
 *   SCORPION  — 蝎子（幽暗地穴，攻击玩家）
 *   DRAGONFLY — 蜻蜓（溪流附近，快速直线移动）
 *
 * 行为规则：
 *   - 每只昆虫都有 position + velocity + wanderTimer
 *   - wanderTimer 到期时：随机改变方向 / 靠近目标（花朵/光源）
 *   - 被食虫植物光晕诱惑：方向向植物偏转
 *   - 被捕获：fade out + 销毁
 *
 * 渲染：用 Phaser Graphics 绘制简化精灵（不用纹理图集）
 */

export const INSECT_TYPE = {
  FIREFLY:   0,
  BEETLE:    1,
  BUTTERFLY: 2,
  MOTH:      3,
  SCORPION:  4,
  DRAGONFLY: 5,
}

// 昆虫基础配置
const INSECT_CONFIG = {
  [INSECT_TYPE.FIREFLY]: {
    label: '萤火虫',
    speed: 28,         // 像素/秒
    flightHeight: 20,  // 离地高度（Y偏移）
    size: 3,
    color: 0xffff44,
    glow: 0xffdd00,
    biomes: [0, 5],    // 草原 + 神圣遗迹
    density: 0.012,
  },
  [INSECT_TYPE.BEETLE]: {
    label: '甲虫',
    speed: 18,
    flightHeight: 0,
    size: 4,
    color: 0x3a3a00,
    glow: null,
    biomes: [0, 1, 3],
    density: 0.018,
  },
  [INSECT_TYPE.BUTTERFLY]: {
    label: '彩蝶',
    speed: 48,
    flightHeight: 16,
    size: 6,
    color: 0xff88cc,
    glow: 0xff44aa,
    biomes: [0, 5],
    density: 0.010,
  },
  [INSECT_TYPE.MOTH]: {
    label: '飞蛾',
    speed: 35,
    flightHeight: 14,
    size: 5,
    color: 0xaaaaaa,
    glow: null,
    biomes: [4, 2, 0],
    density: 0.014,
    attractedToGlow: true,  // 会被食虫植物发光诱惑
  },
  [INSECT_TYPE.SCORPION]: {
    label: '幽暗蝎',
    speed: 22,
    flightHeight: 0,
    size: 6,
    color: 0x1a0033,
    glow: 0x6600aa,
    biomes: [4],
    density: 0.008,
    hostile: true,   // 会攻击玩家
    dmg: 6,
  },
  [INSECT_TYPE.DRAGONFLY]: {
    label: '魔晶蜻蜓',
    speed: 70,
    flightHeight: 12,
    size: 5,
    color: 0x00aaff,
    glow: 0x0066ff,
    biomes: [0, 2],
    density: 0.009,
  },
}

// 生物群系→昆虫密度系数
const BIOME_INSECT_MULT = {
  0: 1.0, 1: 0.5, 2: 0.6, 3: 0.7, 4: 1.2, 5: 0.8,
}

let _insectCounter = 0

export class InsectSystem {
  /**
   * @param {Phaser.Scene} scene
   * @param {Phaser.GameObjects.Container} worldContainer
   */
  constructor(scene, worldContainer) {
    this.scene = scene
    this.container = worldContainer
    // id → { type, cfg, x, y, vx, vy, graphics, glowGraphics, wanderDelay, state, id }
    this.insects = new Map()
    this.maxInsects = 120  // 全局上限，防止性能问题
  }

  // ── 区块加载时生成昆虫 ────────────────────────────────────────────────────

  spawnChunkInsects(tiles, cx, cy, tileToScreen) {
    if (this.insects.size >= this.maxInsects) return
    const CHUNK = 32
    for (let r = 0; r < CHUNK; r++) {
      for (let c = 0; c < CHUNK; c++) {
        const cell = tiles[r][c]
        if (!cell) continue
        const biome = cell.biome ?? 0
        const wx = cx * CHUNK + c
        const wy = cy * CHUNK + r
        const hash = this._hash(wx, wy, 0xbee7)
        const mult = BIOME_INSECT_MULT[biome] ?? 1

        // 遍历该群系支持的昆虫类型
        for (const [type, cfg] of Object.entries(INSECT_CONFIG)) {
          if (!cfg.biomes.includes(biome)) continue
          if (this._hash(wx, wy, 0x1000 + Number(type)) > cfg.density * mult) continue
          if (this.insects.size >= this.maxInsects) return

          const { sx, sy } = tileToScreen(wx, wy, cell.height ?? 0)
          this._spawnInsect(Number(type), sx, sy)
        }
      }
    }
  }

  _spawnInsect(type, sx, sy) {
    const id = ++_insectCounter
    const cfg = INSECT_CONFIG[type]
    const angle = Math.random() * Math.PI * 2
    const speed = cfg.speed * (0.7 + Math.random() * 0.6)
    const g = this.scene.add.graphics()
    const fy = sy - cfg.flightHeight
    this._drawInsect(g, sx, fy, type)
    g.setDepth(9000)  // 始终在地面上方
    this.container.add(g)

    // 发光效果
    let glowG = null
    if (cfg.glow) {
      glowG = this.scene.add.graphics()
      glowG.fillStyle(cfg.glow, 0.3)
      glowG.fillCircle(sx, fy, cfg.size + 5)
      glowG.setDepth(8999)
      this.container.add(glowG)
      this.scene.tweens.add({
        targets: glowG,
        alpha: { from: 0.15, to: 0.55 },
        duration: 600 + Math.random() * 400,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      })
    }

    const insect = {
      id, type, cfg,
      x: sx, y: fy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      baseY: fy,
      bobTimer: Math.random() * Math.PI * 2,
      wanderDelay: 2000 + Math.random() * 3000,
      state: 'wander',
      graphics: g,
      glowGraphics: glowG,
    }
    this.insects.set(id, insect)
  }

  _drawInsect(g, sx, sy, type) {
    g.clear()
    const cfg = INSECT_CONFIG[type]
    switch (type) {
      case INSECT_TYPE.FIREFLY:
        g.fillStyle(cfg.color, 1)
        g.fillCircle(sx, sy, 3)
        g.fillStyle(0xffffff, 0.6)
        g.fillCircle(sx - 0.8, sy - 0.8, 1.2)
        break

      case INSECT_TYPE.BEETLE:
        // 椭圆身体
        g.fillStyle(0x1a1a00, 1)
        g.fillEllipse(sx, sy, 8, 5)
        g.fillStyle(0x555500, 1)
        g.fillEllipse(sx, sy - 1, 6, 3)
        // 触角
        g.lineStyle(1, 0x333300, 0.9)
        g.strokeLineShape(new Phaser.Geom.Line(sx - 2, sy - 3, sx - 6, sy - 7))
        g.strokeLineShape(new Phaser.Geom.Line(sx + 2, sy - 3, sx + 6, sy - 7))
        break

      case INSECT_TYPE.BUTTERFLY:
        // 翅膀（四片，随机色）
        g.fillStyle(cfg.color, 0.85)
        g.fillEllipse(sx - 6, sy - 3, 11, 7)
        g.fillEllipse(sx + 6, sy - 3, 11, 7)
        g.fillEllipse(sx - 4, sy + 3, 8, 5)
        g.fillEllipse(sx + 4, sy + 3, 8, 5)
        // 花纹点
        g.fillStyle(0xffffff, 0.4)
        g.fillCircle(sx - 5, sy - 3, 1.5)
        g.fillCircle(sx + 5, sy - 3, 1.5)
        // 身体
        g.fillStyle(0x000000, 1)
        g.fillRect(sx - 1, sy - 5, 2, 10)
        break

      case INSECT_TYPE.MOTH:
        g.fillStyle(cfg.color, 0.7)
        g.fillEllipse(sx - 5, sy - 2, 10, 6)
        g.fillEllipse(sx + 5, sy - 2, 10, 6)
        g.fillStyle(0x888888, 1)
        g.fillRect(sx - 1, sy - 5, 2, 10)
        // 触角（扇形）
        g.lineStyle(1, 0xaaaaaa, 0.8)
        g.strokeLineShape(new Phaser.Geom.Line(sx - 1, sy - 5, sx - 5, sy - 11))
        g.strokeLineShape(new Phaser.Geom.Line(sx + 1, sy - 5, sx + 5, sy - 11))
        break

      case INSECT_TYPE.SCORPION:
        // 身体
        g.fillStyle(0x0d001a, 1)
        g.fillEllipse(sx, sy, 10, 6)
        // 尾巴（弧线）
        g.lineStyle(3, 0x0d001a, 1)
        g.strokeLineShape(new Phaser.Geom.Line(sx + 4, sy, sx + 10, sy - 4))
        g.strokeLineShape(new Phaser.Geom.Line(sx + 10, sy - 4, sx + 12, sy - 10))
        // 毒针
        g.fillStyle(0xcc00ff, 1)
        g.fillTriangle(sx + 11, sy - 11, sx + 14, sy - 14, sx + 13, sy - 8)
        // 钳子
        g.lineStyle(2, 0x0d001a, 1)
        g.strokeLineShape(new Phaser.Geom.Line(sx - 4, sy - 2, sx - 10, sy - 6))
        g.strokeLineShape(new Phaser.Geom.Line(sx - 4, sy - 2, sx - 10, sy + 1))
        break

      case INSECT_TYPE.DRAGONFLY:
        // 翅膀（透明蓝）
        g.fillStyle(0x00aaff, 0.5)
        g.fillEllipse(sx - 8, sy - 1, 15, 5)
        g.fillEllipse(sx + 8, sy - 1, 15, 5)
        g.fillStyle(0x0066ff, 0.4)
        g.fillEllipse(sx - 6, sy + 3, 11, 4)
        g.fillEllipse(sx + 6, sy + 3, 11, 4)
        // 细长身体
        g.fillStyle(0x003388, 1)
        g.fillRect(sx - 1, sy - 4, 2, 8)
        g.fillStyle(0x0055aa, 1)
        g.fillCircle(sx, sy - 4, 3)
        break
    }
  }

  // ── 查找最近昆虫（供食虫植物调用）────────────────────────────────────────

  findNearestInsect(cx, cy, radius) {
    let nearest = null
    let minDist = radius
    for (const [id, insect] of this.insects) {
      if (insect.state === 'captured') continue
      const dist = Math.hypot(insect.x - cx, insect.y - cy)
      if (dist < minDist) {
        minDist = dist
        nearest = insect
      }
    }
    return nearest
  }

  captureInsect(id) {
    const insect = this.insects.get(id)
    if (!insect) return
    insect.state = 'captured'
    this.scene.tweens.add({
      targets: [insect.graphics, insect.glowGraphics].filter(Boolean),
      alpha: 0, scaleX: 0.1, scaleY: 0.1,
      duration: 200,
      onComplete: () => {
        insect.graphics?.destroy()
        insect.glowGraphics?.destroy()
        this.insects.delete(id)
      }
    })
  }

  // ── 每帧更新：昆虫移动 ────────────────────────────────────────────────────

  update(delta, now) {
    const dt = delta / 1000  // 转为秒
    for (const [id, insect] of this.insects) {
      if (insect.state === 'captured') continue
      const cfg = insect.cfg

      // 上下浮动（飞行昆虫）
      if (cfg.flightHeight > 0) {
        insect.bobTimer += dt * 2.5
        const bobY = Math.sin(insect.bobTimer) * 3
        insect.y = insect.baseY + bobY
      }

      // 游荡方向变换
      insect.wanderDelay -= delta
      if (insect.wanderDelay <= 0) {
        const angle = Math.random() * Math.PI * 2
        const speed = cfg.speed * (0.6 + Math.random() * 0.8)
        insect.vx = Math.cos(angle) * speed
        insect.vy = Math.sin(angle) * speed
        insect.wanderDelay = 1500 + Math.random() * 3500
      }

      // 移动
      insect.x += insect.vx * dt
      insect.baseY += insect.vy * dt

      // 世界边界软碰撞（±2000 像素范围游荡）
      if (Math.abs(insect.x) > 2000 || Math.abs(insect.baseY) > 2000) {
        insect.vx *= -1
        insect.vy *= -1
      }

      // 重绘精灵
      this._drawInsect(insect.graphics, insect.x, insect.y, insect.type)
      if (insect.glowGraphics) {
        insect.glowGraphics.clear()
        insect.glowGraphics.fillStyle(cfg.glow, 0.3)
        insect.glowGraphics.fillCircle(insect.x, insect.y, cfg.size + 5)
      }

      // 翅膀扇动（蝴蝶/飞蛾：scaleX 摇摆）
      if (type === INSECT_TYPE.BUTTERFLY || type === INSECT_TYPE.MOTH) {
        insect.graphics.scaleX = 0.85 + Math.sin(insect.bobTimer * 8) * 0.15
      }
    }
  }

  _hash(wx, wy, salt = 0) {
    let h = (wx * 73856093) ^ (wy * 19349663) ^ salt
    h = ((h >> 16) ^ h) * 0x45d9f3b
    h = ((h >> 16) ^ h) * 0x45d9f3b
    h = (h >> 16) ^ h
    return Math.abs(h % 10000) / 10000
  }
}
