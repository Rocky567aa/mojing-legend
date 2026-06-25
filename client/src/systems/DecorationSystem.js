/**
 * DecorationSystem.js — 世界装饰物系统
 *
 * 负责生成、渲染、动画化世界中的装饰道具：
 *   🔥 火把（壁挂/地插）—— 跳动火焰动画
 *   🏮 魔法灯笼 —— 浮动 + 发光脉冲
 *   🚩 旗帜 —— 飘动动画
 *   🪣 木桶/铁箱 —— 静态装饰
 *   💎 水晶柱 —— 缓慢旋转光晕
 *   🌿 魔法草药 —— 微微摇曳
 *   ⚓ 铁钩 —— 静态
 *   💀 骷髅架 —— 偶发紫色闪光
 *   🪨 古代石碑 —— 符文光脉冲
 *
 * 装饰物按生物群系分布，由 WorldGen 在区块生成时决定位置。
 * 装饰物渲染在地面瓦片之上，使用独立图层（depth > 瓦片）。
 */

// 装饰类型 ID
export const DECO = {
  TORCH: 0,           // 火把
  MAGIC_LANTERN: 1,   // 魔法灯笼
  BANNER: 2,          // 旗帜
  BARREL: 3,          // 木桶
  CRYSTAL_PILLAR: 4,  // 水晶柱
  MAGIC_HERB: 5,      // 魔法草药
  IRON_HOOK: 6,       // 铁钩
  SKULL_POLE: 7,      // 骷髅架
  RUNE_STONE: 8,      // 古代石碑（装饰版）
  LAVA_VENT: 9,       // 岩浆喷口
  ICE_SPIKE: 10,      // 冰刺
  THUNDER_ROD: 11,    // 雷电导引柱
  DARK_MUSHROOM: 12,  // 暗影菌
  HOLY_PILLAR: 13,    // 圣光石柱
  MAGIC_WELL: 14,     // 魔法水井
}

// 每种装饰物的配置
const DECO_CONFIG = {
  [DECO.TORCH]: {
    name: '魔法火把', w: 8, h: 24,
    colors: { stick: 0x8B4513, flame: 0xff6600, flameTop: 0xffcc00 },
    animated: true, light: 0xff4400, lightRadius: 40,
  },
  [DECO.MAGIC_LANTERN]: {
    name: '魔法灯笼', w: 14, h: 20,
    colors: { frame: 0x8b6914, glow: 0x9933ff, chain: 0x888888 },
    animated: true, light: 0x9933ff, lightRadius: 55,
  },
  [DECO.BANNER]: {
    name: '旗帜', w: 16, h: 32,
    colors: { pole: 0x888888, cloth: 0x9900cc, trim: 0xffcc00 },
    animated: true,
  },
  [DECO.BARREL]: {
    name: '橡木桶', w: 16, h: 14,
    colors: { wood: 0x8B4513, ring: 0x555555 },
    animated: false,
  },
  [DECO.CRYSTAL_PILLAR]: {
    name: '水晶柱', w: 10, h: 28,
    colors: { crystal: 0x9933ff, glow: 0xcc66ff },
    animated: true, light: 0x9933ff, lightRadius: 35,
  },
  [DECO.MAGIC_HERB]: {
    name: '魔法草药', w: 14, h: 14,
    colors: { stem: 0x2d5a1b, leaf: 0x44cc44, glow: 0x88ff44 },
    animated: true,
  },
  [DECO.IRON_HOOK]: {
    name: '铁钩', w: 10, h: 16,
    colors: { metal: 0x888888, rust: 0x8B4513 },
    animated: false,
  },
  [DECO.SKULL_POLE]: {
    name: '骷髅架', w: 10, h: 26,
    colors: { pole: 0x888888, skull: 0xddddbb, eye: 0x9900cc },
    animated: true, light: 0x440066, lightRadius: 25,
  },
  [DECO.RUNE_STONE]: {
    name: '古代石碑', w: 18, h: 22,
    colors: { stone: 0x666688, rune: 0xffcc00 },
    animated: true, light: 0xffcc00, lightRadius: 30,
  },
  [DECO.LAVA_VENT]: {
    name: '岩浆喷口', w: 16, h: 8,
    colors: { rim: 0x441100, lava: 0xff4400, glow: 0xff8800 },
    animated: true, light: 0xff4400, lightRadius: 50,
  },
  [DECO.ICE_SPIKE]: {
    name: '冰刺', w: 8, h: 20,
    colors: { ice: 0x99ccee, glow: 0xaaddff },
    animated: true, light: 0x4499ff, lightRadius: 20,
  },
  [DECO.THUNDER_ROD]: {
    name: '雷电导引柱', w: 8, h: 30,
    colors: { rod: 0x888844, spark: 0xffdd00, glow: 0xffffff },
    animated: true, light: 0xffdd00, lightRadius: 45,
  },
  [DECO.DARK_MUSHROOM]: {
    name: '暗影菌', w: 14, h: 14,
    colors: { cap: 0x440066, stem: 0x330044, spot: 0xcc44cc },
    animated: true, light: 0x550077, lightRadius: 22,
  },
  [DECO.HOLY_PILLAR]: {
    name: '圣光石柱', w: 12, h: 32,
    colors: { stone: 0xddccaa, rune: 0xffffff, glow: 0xffeeaa },
    animated: true, light: 0xffeeaa, lightRadius: 60,
  },
  [DECO.MAGIC_WELL]: {
    name: '魔法水井', w: 20, h: 16,
    colors: { stone: 0x888888, water: 0x4499ff, glow: 0x66aaff },
    animated: true, light: 0x4499ff, lightRadius: 30,
  },
}

// ── DecorationSystem 类 ───────────────────────────────────────────────────────

export class DecorationSystem {
  /**
   * @param {Phaser.Scene} scene
   * @param {Phaser.GameObjects.Container} worldContainer - 主地图容器
   */
  constructor(scene, worldContainer) {
    this.scene = scene
    this.worldContainer = worldContainer
    this.decoContainers = new Map()  // key: "wx_wy" → container
    this.animationTweens = []
  }

  /**
   * 为一个区块中的所有装饰物添加渲染
   * @param {Array} tiles - WorldGen 产出的 32×32 tile 数组（含 deco 字段）
   * @param {number} cx, cy - 区块坐标
   * @param {Function} tileToScreen - 坐标转换函数
   * @param {Phaser.GameObjects.Container} chunkContainer
   */
  renderChunkDecorations(tiles, cx, cy, tileToScreen, chunkContainer) {
    const CHUNK = 32
    for (let r = 0; r < CHUNK; r++) {
      for (let c = 0; c < CHUNK; c++) {
        const cell = tiles[r][c]
        if (cell.deco === undefined || cell.deco === null) continue

        const wx = cx * CHUNK + c
        const wy = cy * CHUNK + r
        const { sx, sy } = tileToScreen(wx, wy, cell.height)
        const key = `${wx}_${wy}`

        if (this.decoContainers.has(key)) continue

        const container = this.drawDeco(cell.deco, sx, sy, wx + wy)
        if (container) {
          chunkContainer.add(container)
          this.decoContainers.set(key, container)
        }
      }
    }
  }

  /**
   * 绘制单个装饰物，返回 Phaser.Container
   */
  drawDeco(decoType, sx, sy, depth) {
    const scene = this.scene
    const cfg = DECO_CONFIG[decoType]
    if (!cfg) return null

    const container = scene.add.container(sx, sy - cfg.h / 2 - 4)
    container.setDepth(depth + 0.5)  // 略高于地面瓦片

    switch (decoType) {
      case DECO.TORCH:         this._drawTorch(container, cfg); break
      case DECO.MAGIC_LANTERN: this._drawLantern(container, cfg); break
      case DECO.BANNER:        this._drawBanner(container, cfg); break
      case DECO.BARREL:        this._drawBarrel(container, cfg); break
      case DECO.CRYSTAL_PILLAR:this._drawCrystalPillar(container, cfg); break
      case DECO.MAGIC_HERB:    this._drawMagicHerb(container, cfg); break
      case DECO.IRON_HOOK:     this._drawIronHook(container, cfg); break
      case DECO.SKULL_POLE:    this._drawSkullPole(container, cfg); break
      case DECO.RUNE_STONE:    this._drawRuneStone(container, cfg); break
      case DECO.LAVA_VENT:     this._drawLavaVent(container, cfg); break
      case DECO.ICE_SPIKE:     this._drawIceSpike(container, cfg); break
      case DECO.THUNDER_ROD:   this._drawThunderRod(container, cfg); break
      case DECO.DARK_MUSHROOM: this._drawDarkMushroom(container, cfg); break
      case DECO.HOLY_PILLAR:   this._drawHolyPillar(container, cfg); break
      case DECO.MAGIC_WELL:    this._drawMagicWell(container, cfg); break
    }

    // 光源光圈（发光装饰物）
    if (cfg.light && cfg.lightRadius) {
      const light = scene.add.graphics()
      light.fillStyle(cfg.light, 0.06)
      light.fillCircle(0, cfg.h / 2, cfg.lightRadius)
      container.addAt(light, 0)  // 放在最底层

      // 光圈脉冲
      scene.tweens.add({
        targets: light, alpha: { from: 0.06, to: 0.12 },
        duration: 1400 + Math.random() * 600,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      })
    }

    return container
  }

  // ── 各装饰物绘制函数 ─────────────────────────────────────────────────────────

  _drawTorch(c, cfg) {
    const s = this.scene
    const g = s.add.graphics()
    // 木柄
    g.fillStyle(cfg.colors.stick, 1)
    g.fillRect(-2, 2, 4, 18)
    // 火焰底部
    g.fillStyle(cfg.colors.flame, 1)
    g.fillEllipse(0, 0, 8, 10)
    c.add(g)

    // 火焰顶（动画化）
    const flame = s.add.graphics()
    flame.fillStyle(cfg.colors.flameTop, 0.9)
    flame.fillEllipse(0, -3, 5, 8)
    c.add(flame)

    // 火焰跳动动画
    s.tweens.add({
      targets: flame,
      scaleX: { from: 0.8, to: 1.2 },
      scaleY: { from: 0.9, to: 1.1 },
      y: { from: 0, to: -2 },
      alpha: { from: 0.9, to: 0.7 },
      duration: 200 + Math.random() * 150,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    })

    // 火花粒子（简单模拟）
    this._sparkLoop(c, 0, -6, cfg.colors.flameTop)
  }

  _drawLantern(c, cfg) {
    const s = this.scene
    const g = s.add.graphics()
    // 铁链
    g.lineStyle(1, cfg.colors.chain, 0.8)
    g.lineBetween(0, -16, 0, -8)
    // 灯笼框架
    g.lineStyle(2, cfg.colors.frame, 1)
    g.strokeRoundedRect(-7, -8, 14, 16, 3)
    // 内部发光
    g.fillStyle(cfg.colors.glow, 0.5)
    g.fillRoundedRect(-5, -6, 10, 12, 2)
    c.add(g)

    // 脉冲发光层
    const glow = s.add.graphics()
    glow.fillStyle(cfg.colors.glow, 0.6)
    glow.fillCircle(0, 0, 6)
    c.add(glow)

    s.tweens.add({
      targets: c,  // 整体浮动
      y: { from: c.y, to: c.y - 4 },
      duration: 1800 + Math.random() * 400,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    })
    s.tweens.add({
      targets: glow,
      alpha: { from: 0.4, to: 0.9 },
      scaleX: { from: 0.8, to: 1.2 },
      scaleY: { from: 0.8, to: 1.2 },
      duration: 900 + Math.random() * 300,
      yoyo: true, repeat: -1,
    })
  }

  _drawBanner(c, cfg) {
    const s = this.scene
    const g = s.add.graphics()
    // 旗杆
    g.lineStyle(2, cfg.colors.pole, 1)
    g.lineBetween(0, -16, 0, 16)
    g.fillStyle(cfg.colors.pole, 1)
    g.fillCircle(0, -16, 3)
    c.add(g)

    // 旗布（通过 tweens 实现飘动效果）
    const cloth = s.add.graphics()
    cloth.fillStyle(cfg.colors.cloth, 1)
    cloth.fillPoints([
      { x: 0, y: -14 }, { x: 16, y: -10 }, { x: 16, y: 2 }, { x: 0, y: -2 }
    ], true)
    // 旗边金色
    cloth.lineStyle(1, cfg.colors.trim, 1)
    cloth.strokePoints([
      { x: 0, y: -14 }, { x: 16, y: -10 }, { x: 16, y: 2 }, { x: 0, y: -2 }
    ], true)
    c.add(cloth)

    // 飘动：交替 scaleX 模拟波浪
    s.tweens.add({
      targets: cloth,
      scaleX: { from: 1, to: 0.7 },
      duration: 700 + Math.random() * 200,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    })
  }

  _drawBarrel(c, cfg) {
    const g = this.scene.add.graphics()
    g.fillStyle(cfg.colors.wood, 1)
    g.fillEllipse(0, 0, 16, 10)
    g.fillRect(-8, -6, 16, 10)
    g.lineStyle(1.5, cfg.colors.ring, 1)
    g.strokeEllipse(0, 0, 16, 8)
    g.strokeEllipse(0, -4, 16, 8)
    g.fillStyle(cfg.colors.ring, 1)
    g.fillRect(-8, -2, 16, 2)
    c.add(g)
  }

  _drawCrystalPillar(c, cfg) {
    const s = this.scene
    const g = s.add.graphics()
    // 底座
    g.fillStyle(0x666688, 1)
    g.fillRect(-7, 10, 14, 6)
    // 主体晶体
    g.fillStyle(cfg.colors.crystal, 0.9)
    g.fillPoints([
      { x: 0, y: -16 }, { x: 6, y: -6 }, { x: 5, y: 10 }, { x: -5, y: 10 }, { x: -6, y: -6 }
    ], true)
    // 高光
    g.fillStyle(0xffffff, 0.3)
    g.fillPoints([
      { x: -2, y: -14 }, { x: 1, y: -4 }, { x: -1, y: -4 }
    ], true)
    c.add(g)

    // 旋转光圈
    const halo = s.add.graphics()
    halo.lineStyle(1.5, cfg.colors.glow, 0.7)
    halo.strokeEllipse(0, 0, 18, 10)
    c.add(halo)
    s.tweens.add({
      targets: halo,
      scaleX: { from: 0.8, to: 1.2 },
      scaleY: { from: 0.8, to: 1.2 },
      alpha: { from: 0.3, to: 0.8 },
      duration: 1600 + Math.random() * 400,
      yoyo: true, repeat: -1,
    })
  }

  _drawMagicHerb(c, cfg) {
    const s = this.scene
    const g = s.add.graphics()
    g.lineStyle(1.5, cfg.colors.stem, 1)
    g.lineBetween(-3, 8, -3, 0); g.lineBetween(0, 8, 0, -2); g.lineBetween(3, 8, 3, 0)
    g.fillStyle(cfg.colors.leaf, 0.9)
    g.fillEllipse(-5, -2, 7, 5)
    g.fillEllipse(5, -2, 7, 5)
    g.fillEllipse(0, -6, 6, 5)
    // 发光点
    g.fillStyle(cfg.colors.glow, 0.8)
    g.fillCircle(-5, -2, 1.5)
    g.fillCircle(5, -2, 1.5)
    g.fillCircle(0, -6, 1.5)
    c.add(g)

    s.tweens.add({
      targets: c, rotation: { from: -0.05, to: 0.05 },
      duration: 1200 + Math.random() * 400,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    })
  }

  _drawIronHook(c, cfg) {
    const g = this.scene.add.graphics()
    g.lineStyle(2.5, cfg.colors.metal, 1)
    g.lineBetween(0, -8, 0, 4)
    g.beginPath(); g.arc(4, 4, 4, Math.PI, Math.PI * 1.7, false); g.strokePath()
    g.fillStyle(cfg.colors.rust, 0.4)
    g.fillRect(-1, -2, 2, 4)
    c.add(g)
  }

  _drawSkullPole(c, cfg) {
    const s = this.scene
    const g = s.add.graphics()
    g.fillStyle(cfg.colors.pole, 1)
    g.fillRect(-1, -10, 2, 22)
    g.fillStyle(cfg.colors.skull, 1)
    g.fillEllipse(0, -14, 10, 10)
    g.fillStyle(0x0a0a1e, 1)
    g.fillEllipse(-2.5, -14, 3, 3); g.fillEllipse(2.5, -14, 3, 3)  // 眼眶
    c.add(g)

    // 眼睛发光（偶发）
    const eyes = s.add.graphics()
    eyes.fillStyle(cfg.colors.eye, 0.8)
    eyes.fillCircle(-2.5, -14, 1.5); eyes.fillCircle(2.5, -14, 1.5)
    eyes.alpha = 0
    c.add(eyes)

    s.tweens.add({
      targets: eyes, alpha: { from: 0, to: 0.9 },
      duration: 200, yoyo: true,
      delay: 3000 + Math.random() * 5000,
      repeat: -1,
      repeatDelay: 3000 + Math.random() * 4000,
    })
  }

  _drawRuneStone(c, cfg) {
    const s = this.scene
    const g = s.add.graphics()
    g.fillStyle(cfg.colors.stone, 1)
    g.fillPoints([
      { x: -9, y: 10 }, { x: -8, y: -10 }, { x: 0, y: -14 }, { x: 8, y: -10 }, { x: 9, y: 10 }
    ], true)
    g.lineStyle(1, cfg.colors.rune, 0.7)
    g.lineBetween(-4, -8, 4, -8)
    g.lineBetween(0, -8, 0, 4)
    g.lineBetween(-4, 0, 4, 0)
    c.add(g)

    const glow = s.add.graphics()
    glow.lineStyle(1, cfg.colors.rune, 0.8)
    glow.lineBetween(-4, -8, 4, -8)
    glow.lineBetween(0, -8, 0, 4)
    glow.lineBetween(-4, 0, 4, 0)
    c.add(glow)

    s.tweens.add({
      targets: glow, alpha: { from: 0.3, to: 1.0 },
      duration: 1800 + Math.random() * 600,
      yoyo: true, repeat: -1,
    })
  }

  _drawLavaVent(c, cfg) {
    const s = this.scene
    const g = s.add.graphics()
    g.fillStyle(cfg.colors.rim, 1)
    g.fillEllipse(0, 4, 16, 8)
    g.fillStyle(cfg.colors.lava, 0.9)
    g.fillEllipse(0, 3, 10, 5)
    c.add(g)

    const bubble = s.add.graphics()
    bubble.fillStyle(cfg.colors.glow, 0.8)
    bubble.fillCircle(0, 0, 4)
    c.add(bubble)

    s.tweens.add({
      targets: bubble, y: { from: 2, to: -14 }, alpha: { from: 0.8, to: 0 },
      scaleX: { from: 1, to: 0.4 }, scaleY: { from: 1, to: 0.4 },
      duration: 800 + Math.random() * 400,
      repeat: -1, delay: Math.random() * 1000,
    })
  }

  _drawIceSpike(c, cfg) {
    const s = this.scene
    const g = s.add.graphics()
    g.fillStyle(cfg.colors.ice, 0.9)
    g.fillPoints([{ x: 0, y: -20 }, { x: 4, y: 0 }, { x: -4, y: 0 }], true)
    g.fillStyle(0xffffff, 0.4)
    g.fillPoints([{ x: -1, y: -18 }, { x: 0, y: -8 }, { x: -2, y: -8 }], true)
    c.add(g)

    s.tweens.add({
      targets: c, alpha: { from: 0.7, to: 1.0 },
      duration: 2000 + Math.random() * 800,
      yoyo: true, repeat: -1,
    })
  }

  _drawThunderRod(c, cfg) {
    const s = this.scene
    const g = s.add.graphics()
    g.fillStyle(cfg.colors.rod, 1)
    g.fillRect(-2, -14, 4, 26)
    g.fillStyle(cfg.colors.spark, 1)
    g.fillPoints([{ x: -4, y: -10 }, { x: 0, y: -18 }, { x: 1, y: -10 }, { x: 5, y: -18 }], false)
    c.add(g)

    // 电弧闪光
    const arc = s.add.graphics()
    arc.lineStyle(1.5, cfg.colors.glow, 0.9)
    arc.lineBetween(-4, -10, 4, -14)
    arc.lineBetween(4, -14, 0, -6)
    arc.alpha = 0
    c.add(arc)

    s.tweens.add({
      targets: arc, alpha: { from: 0, to: 1 },
      duration: 80, yoyo: true,
      repeat: -1,
      delay: 1500 + Math.random() * 2000,
      repeatDelay: 1000 + Math.random() * 2000,
    })
  }

  _drawDarkMushroom(c, cfg) {
    const s = this.scene
    const g = s.add.graphics()
    g.fillStyle(cfg.colors.stem, 1)
    g.fillRect(-2, 0, 4, 8)
    g.fillStyle(cfg.colors.cap, 1)
    g.fillEllipse(0, -2, 14, 10)
    g.fillStyle(cfg.colors.spot, 0.7)
    g.fillCircle(-2, -3, 2); g.fillCircle(3, -2, 1.5); g.fillCircle(0, -5, 1)
    c.add(g)

    s.tweens.add({
      targets: c, alpha: { from: 0.6, to: 1.0 },
      duration: 1600 + Math.random() * 400,
      yoyo: true, repeat: -1,
    })
  }

  _drawHolyPillar(c, cfg) {
    const s = this.scene
    const g = s.add.graphics()
    g.fillStyle(cfg.colors.stone, 1)
    g.fillRect(-6, -14, 12, 26)
    g.fillRect(-8, 10, 16, 4)
    g.fillRect(-8, -16, 16, 4)
    g.lineStyle(1, cfg.colors.rune, 0.6)
    for (let y = -10; y <= 6; y += 6) {
      g.lineBetween(-4, y, 4, y)
    }
    c.add(g)

    const halo = s.add.graphics()
    halo.fillStyle(cfg.colors.glow, 0.15)
    halo.fillCircle(0, -5, 20)
    c.addAt(halo, 0)

    s.tweens.add({
      targets: halo, alpha: { from: 0.1, to: 0.3 },
      duration: 2000 + Math.random() * 600,
      yoyo: true, repeat: -1,
    })
  }

  _drawMagicWell(c, cfg) {
    const s = this.scene
    const g = s.add.graphics()
    // 井壁
    g.fillStyle(cfg.colors.stone, 1)
    g.fillEllipse(0, 4, 20, 10)
    g.fillRect(-10, -4, 20, 8)
    g.fillStyle(cfg.colors.water, 0.7)
    g.fillEllipse(0, 4, 16, 7)
    // 横木
    g.fillStyle(cfg.colors.stone, 1)
    g.fillRect(-12, -6, 24, 3)
    g.fillRect(-11, -14, 3, 10)
    g.fillRect(8, -14, 3, 10)
    c.add(g)

    const ripple = s.add.graphics()
    ripple.lineStyle(1, cfg.colors.glow, 0.7)
    ripple.strokeEllipse(0, 4, 10, 5)
    c.add(ripple)

    s.tweens.add({
      targets: ripple,
      scaleX: { from: 0.4, to: 1.0 }, scaleY: { from: 0.4, to: 1.0 },
      alpha: { from: 0.8, to: 0 },
      duration: 1200,
      repeat: -1, delay: Math.random() * 800,
    })
  }

  // 火花粒子循环（火把用）
  _sparkLoop(container, x, y, color) {
    const scene = this.scene
    const emit = () => {
      if (!container.active) return
      const spark = scene.add.graphics()
      spark.fillStyle(color, 0.9)
      spark.fillCircle(0, 0, 1.5)
      spark.x = x + (Math.random() - 0.5) * 4
      spark.y = y
      container.add(spark)

      scene.tweens.add({
        targets: spark,
        x: spark.x + (Math.random() - 0.5) * 8,
        y: spark.y - 12 - Math.random() * 8,
        alpha: 0, scaleX: 0.3, scaleY: 0.3,
        duration: 600 + Math.random() * 300,
        onComplete: () => spark.destroy(),
      })
    }

    // 定时循环发射火花
    scene.time.addEvent({
      delay: 180 + Math.random() * 120,
      callback: emit,
      callbackScope: this,
      repeat: -1,
    })
  }

  // 卸载区块时清理装饰物
  clearChunk(cx, cy, tiles) {
    const CHUNK = 32
    for (let r = 0; r < CHUNK; r++) {
      for (let c = 0; c < CHUNK; c++) {
        const wx = cx * CHUNK + c
        const wy = cy * CHUNK + r
        const key = `${wx}_${wy}`
        const cont = this.decoContainers.get(key)
        if (cont) {
          cont.destroy(true)
          this.decoContainers.delete(key)
        }
      }
    }
  }
}
