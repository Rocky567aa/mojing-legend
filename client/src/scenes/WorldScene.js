/**
 * WorldScene — 主世界等距地图场景（M1 重构版）
 *
 * 架构变化（M1）：
 *   - 地形生成全部委托 WorldGen（Simplex Noise + Voronoi）
 *   - WorldScene 只负责：渲染、摄像机、输入、交互
 *   - 区块缓存存储 WorldGen 产出的完整 tile 数据（tile + biome + height）
 *   - 高度差渲染：根据 height 字段偏移 Y 轴（±3格 × 6px）
 *
 * 等距坐标公式：
 *   screenX = (wx - wy) * HALF_W
 *   screenY = (wx + wy) * HALF_H - height * HEIGHT_STEP
 *
 * 美术：西方魔法风格（深蓝/午夜紫主色，金色/银白高光，矿石自发光）
 */

import { WorldGen, TILE_COLORS, ORE_INFO, WORLD_CONFIG, TILE } from '../utils/WorldGen.js'
import { PickupNotification } from '../ui/PickupNotification.js'
import { DecorationSystem } from '../systems/DecorationSystem.js'
import { PlantSystem } from '../entities/PlantSystem.js'
import { InsectSystem } from '../entities/InsectSystem.js'
import { MonsterSystem } from '../entities/MonsterSystem.js'
import { CombatSystem } from '../systems/CombatSystem.js'
import { DayNightSystem } from '../systems/DayNightSystem.js'
import { WeatherSystem } from '../systems/WeatherSystem.js'
import { BIOME_ID_TO_TILE_KEY } from '../utils/BiomeTileMap.js'

const TILE_W = 64        // 等距瓦片宽
const TILE_H = 32        // 等距瓦片高
const HEIGHT_STEP = 6    // 每格高度差对应的屏幕 Y 偏移（像素）
const TILE_DEPTH = 10    // 瓦片侧面厚度

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' })
    this.chunkCache = new Map()         // key: "cx_cy" → tile 数据
    this.chunkContainers = new Map()    // key: "cx_cy" → Phaser Container
    this.playerTile = { x: WORLD_CONFIG.SPAWN.x, y: WORLD_CONFIG.SPAWN.y }
    this.worldGen = null
    this.saveData = null
    this.moveTimer = 0
    this.lastChunkKey = ''             // 防止重复触发 loadVisibleChunks
    // 动态瓦片动画列表（key: "wx_wy" → overlay graphics）
    this.animatedTileOverlays = new Map()
    // 子系统
    this.pickupNotif = null
    this.decoSystem = null
    this.plantSystem = null
    this.insectSystem = null
    this.monsterSystem = null
    this.combatSystem  = null
  }

  init(data) {
    this.saveData = data
  }

  create() {
    const { width, height } = this.scale

    // 西方魔法背景（深夜蓝黑）
    this.cameras.main.setBackgroundColor('#060a14')

    // 用存档种子初始化 WorldGen（正式版种子从服务器获取）
    const seed = this.saveData?.worldSeed ?? 54321
    this.worldGen = new WorldGen(seed)

    // 主地图容器
    this.worldContainer = this.add.container(0, 0)

    // 初始化子系统
    this.pickupNotif = new PickupNotification(this)
    this.decoSystem = new DecorationSystem(this, this.worldContainer)
    this.insectSystem = new InsectSystem(this, this.worldContainer)
    this.plantSystem = new PlantSystem(this, this.worldContainer, this.insectSystem)
    this.monsterSystem = new MonsterSystem(this, this.worldContainer)
    this.combatSystem  = new CombatSystem(this)
    this.combatSystem.init(this.saveData?.profession ?? 'kane')

    // 加载初始区块
    this.loadVisibleChunks()

    // 玩家精灵（占位用图形，后续替换等距精灵图）
    this.playerGraphic = this.createPlayerGraphic()

    // 输入
    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    })

    // 点击挖矿
    this.input.on('pointerdown', ptr => this.handleClick(ptr))

    // ── UI ─────────────────────────────────────────────────────────────────
    // 左上：职业 + 操作提示
    this.hintText = this.add.text(14, 14, '', {
      fontSize: '12px', color: '#aaaacc',
      backgroundColor: '#00000099',
      padding: { x: 8, y: 5 }
    }).setDepth(200).setScrollFactor(0)

    // 右上：坐标 + 区域 + 世界信息
    this.coordText = this.add.text(width - 14, 14, '', {
      fontSize: '11px', color: '#ccaa88',
      backgroundColor: '#00000088',
      padding: { x: 7, y: 4 },
      align: 'right',
    }).setOrigin(1, 0).setDepth(200).setScrollFactor(0)

    // 右下：进入基地按钮
    const baseBtn = this.add.text(width - 14, height - 14, '🏠 进入基地', {
      fontSize: '14px', color: '#ffe0aa',
      backgroundColor: '#330066bb',
      padding: { x: 12, y: 7 }
    }).setOrigin(1, 1).setInteractive({ useHandCursor: true }).setDepth(200).setScrollFactor(0)
    baseBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(350, 0, 0, 0)
      this.time.delayedCall(350, () => this.scene.start('BaseScene', this.saveData))
    })
    baseBtn.on('pointerover', () => baseBtn.setStyle({ color: '#ffffff' }))
    baseBtn.on('pointerout',  () => baseBtn.setStyle({ color: '#ffe0aa' }))

    this.combatSystem.buildUI(width, height)

    // ── 昼夜循环 + 天气系统 ────────────────────────────────────────────────
    this.dayNightSystem = new DayNightSystem(this, { startTime: 0.33 /* 从早晨开始 */ })
    this.weatherSystem  = new WeatherSystem(this)

    // 初始怪物生成
    for (let i = 0; i < 3; i++) {
      this.monsterSystem.trySpawnNear(
        this.playerTile, this.worldGen,
        (wx, wy, h) => this.tileToScreen(wx, wy, h)
      )
    }

    this.updateUI()

    // 淡入
    this.cameras.main.fadeIn(500, 0, 0, 0)
  }

  // ── 区块管理 ──────────────────────────────────────────────────────────────

  chunkOf(tx, ty) {
    return {
      cx: Math.floor(tx / WORLD_CONFIG.CHUNK_SIZE),
      cy: Math.floor(ty / WORLD_CONFIG.CHUNK_SIZE),
    }
  }

  loadVisibleChunks() {
    const { cx: pcx, cy: pcy } = this.chunkOf(this.playerTile.x, this.playerTile.y)
    const half = Math.floor(WORLD_CONFIG.VISIBLE_CHUNKS / 2)

    const needed = new Set()
    for (let dx = -half; dx <= half; dx++) {
      for (let dy = -half; dy <= half; dy++) {
        const cx = pcx + dx
        const cy = pcy + dy
        if (cx < 0 || cy < 0 || cx >= WORLD_CONFIG.CHUNKS || cy >= WORLD_CONFIG.CHUNKS) continue
        const key = `${cx}_${cy}`
        needed.add(key)
        if (!this.chunkContainers.has(key)) this.buildChunk(cx, cy)
      }
    }

    // 卸载超出范围的区块
    for (const [key, c] of this.chunkContainers) {
      if (!needed.has(key)) {
        c.destroy(true)
        this.chunkContainers.delete(key)
        this.chunkCache.delete(key)
      }
    }

    // 更新地图容器偏移（玩家始终居中）
    this.updateCameraOffset()
  }

  buildChunk(cx, cy) {
    const key = `${cx}_${cy}`
    // 用 WorldGen 生成真实地形
    const tiles = this.worldGen.generateChunk(cx, cy)
    this.chunkCache.set(key, tiles)

    const container = this.add.container(0, 0)
    this.renderChunk(cx, cy, tiles, container)
    this.worldContainer.add(container)
    this.chunkContainers.set(key, container)
  }

  rebuildChunk(cx, cy) {
    const key = `${cx}_${cy}`
    const old = this.chunkContainers.get(key)
    if (old) { old.destroy(true); this.chunkContainers.delete(key) }
    this.buildChunk(cx, cy)
  }

  // ── 渲染 ──────────────────────────────────────────────────────────────────

  tileToScreen(wx, wy, height = 0) {
    return {
      sx: (wx - wy) * (TILE_W / 2),
      sy: (wx + wy) * (TILE_H / 2) - height * HEIGHT_STEP,
    }
  }

  renderChunk(cx, cy, tiles, container) {
    const CHUNK = WORLD_CONFIG.CHUNK_SIZE
    const drawCalls = []
    for (let r = 0; r < CHUNK; r++) {
      for (let c = 0; c < CHUNK; c++) {
        const wx = cx * CHUNK + c
        const wy = cy * CHUNK + r
        const { tile, height, animated } = tiles[r][c]
        const { sx, sy } = this.tileToScreen(wx, wy, height)
        drawCalls.push({ sx, sy, tile, height, wx, wy, depth: wy + wx, animated })
      }
    }
    drawCalls.sort((a, b) => a.depth - b.depth)

    for (const d of drawCalls) {
      const biomeId = this.worldGen.getBiome(d.wx, d.wy)
      this.drawTile(d.sx, d.sy, d.tile, d.height, d.depth, container, biomeId)

      // 矿石发光标记
      if (this.worldGen.isOre(d.tile) && ORE_INFO[d.tile]) {
        this.drawOreMarker(d.sx, d.sy, ORE_INFO[d.tile], container)
      }

      // 动态瓦片动画叠加层
      if (d.animated) {
        this.addAnimatedTileOverlay(d.wx, d.wy, d.sx, d.sy, d.tile, d.depth, container)
      }
    }

    // 装饰物渲染（叠在地面之上）
    this.decoSystem.renderChunkDecorations(
      tiles, cx, cy,
      (wx, wy, h) => this.tileToScreen(wx, wy, h),
      container
    )

    // 植物生成（需在装饰物之后，避免位置冲突）
    this.plantSystem.spawnChunkPlants(
      tiles, cx, cy,
      (wx, wy, h) => this.tileToScreen(wx, wy, h)
    )

    // 昆虫生成
    this.insectSystem.spawnChunkInsects(
      tiles, cx, cy,
      (wx, wy, h) => this.tileToScreen(wx, wy, h)
    )
  }

  drawTile(sx, sy, tileType, h, depth, container, biomeId = 0) {
    const c = TILE_COLORS[tileType] || TILE_COLORS[TILE.GRASS]
    const hw = TILE_W / 2, hh = TILE_H / 2
    const D = TILE_DEPTH + h * 2  // 高处的砖更厚（视觉强化）

    const g = this.add.graphics()
    // 顶面（菱形）
    g.fillStyle(c.top, 1)
    g.fillPoints([
      { x: sx,      y: sy - hh },
      { x: sx + hw, y: sy      },
      { x: sx,      y: sy + hh },
      { x: sx - hw, y: sy      },
    ], true)
    // 左侧面（西面）
    g.fillStyle(c.left, 1)
    g.fillPoints([
      { x: sx - hw, y: sy     },
      { x: sx,      y: sy + hh },
      { x: sx,      y: sy + hh + D },
      { x: sx - hw, y: sy + D },
    ], true)
    // 右侧面（南面）
    g.fillStyle(c.right, 1)
    g.fillPoints([
      { x: sx,      y: sy + hh },
      { x: sx + hw, y: sy      },
      { x: sx + hw, y: sy + D  },
      { x: sx,      y: sy + hh + D },
    ], true)
    // 边线（暗色，西方魔法风：低调轮廓）
    g.lineStyle(0.8, 0x000000, 0.2)
    g.strokePoints([
      { x: sx, y: sy - hh }, { x: sx + hw, y: sy },
      { x: sx, y: sy + hh }, { x: sx - hw, y: sy },
    ], true)

    g.setDepth(depth)
    container.add(g)

    // AI-生成地形贴图叠加层 (仅群系 6-20)
    const aiTileKey = BIOME_ID_TO_TILE_KEY[biomeId]
    if (aiTileKey && this.textures.exists(aiTileKey)) {
      const hw = TILE_W / 2, hh = TILE_H / 2
      // 在顶面中心叠加纹理图像（菱形顶面包裹在矩形图像内，四角被相邻瓦片遮挡）
      const img = this.add.image(sx, sy, aiTileKey)
      img.setDisplaySize(TILE_W * 1.05, TILE_H * 1.05)
      img.setAlpha(0.55)          // 半透明叠加，保留程序色彩底层
      img.setDepth(depth + 0.01)
      container.add(img)
    }
  }

  drawOreMarker(sx, sy, info, container) {
    // 发光矿石标记（西方魔法：Bloom 圆点 + 图标 + 脉冲）
    const glow = this.add.graphics()
    glow.fillStyle(info.glow, 0.85)
    glow.fillCircle(sx, sy - 8, 7)
    glow.fillStyle(0xffffff, 0.4)
    glow.fillCircle(sx - 2, sy - 10, 2.5)

    // 外圈光晕
    const halo = this.add.graphics()
    halo.lineStyle(2, info.glow, 0.35)
    halo.strokeCircle(sx, sy - 8, 11)

    const baseDur = 1100 + Math.sin(sx * 0.3 + sy * 0.5) * 600
    this.tweens.add({
      targets: [glow, halo],
      alpha: { from: 0.85, to: 0.3 },
      duration: baseDur,
      yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut',
    })

    const icon = this.add.text(sx, sy - 18, info.icon, { fontSize: '9px' }).setOrigin(0.5, 1)

    container.add([glow, halo, icon])
  }

  // 动态瓦片动画叠加层（熔岩流、冰霜、雷电等）
  addAnimatedTileOverlay(wx, wy, sx, sy, tileType, depth, container) {
    const colorDef = TILE_COLORS[tileType]
    if (!colorDef || !colorDef.animated) return

    const hw = 32, hh = 16   // 半宽半高（64×32 等距菱形）

    // 动画叠加层（透明度变化覆盖在基础瓦片上）
    const overlay = this.add.graphics()
    overlay.fillStyle(colorDef.animColor, 0.45)
    overlay.fillPoints([
      { x: sx,      y: sy - hh },
      { x: sx + hw, y: sy      },
      { x: sx,      y: sy + hh },
      { x: sx - hw, y: sy      },
    ], true)
    overlay.setDepth(depth + 0.1)
    container.add(overlay)

    // 根据瓦片类型选择不同动画
    switch (tileType) {
      case TILE.LAVA_FLOW:
        // 熔岩：橙红脉冲
        this.tweens.add({
          targets: overlay,
          alpha: { from: 0.2, to: 0.7 },
          duration: 600 + Math.sin(wx + wy) * 200,
          yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        })
        break

      case TILE.FROST_GLOW:
        // 冰霜：随机闪烁（模拟晶体折射）
        this.tweens.add({
          targets: overlay,
          alpha: { from: 0.1, to: 0.6 },
          duration: 1800 + Math.random() * 800,
          yoyo: true, repeat: -1, ease: 'Sine.easeIn',
        })
        // 随机闪光点
        this.time.addEvent({
          delay: 1200 + Math.random() * 1500,
          callback: () => {
            if (!overlay.active) return
            const spark = this.add.graphics()
            spark.fillStyle(0xffffff, 0.9)
            spark.fillCircle(sx + (Math.random() - 0.5) * 40, sy + (Math.random() - 0.5) * 20, 1.5)
            container.add(spark)
            this.tweens.add({
              targets: spark, alpha: 0, duration: 400,
              onComplete: () => spark.destroy()
            })
          },
          repeat: -1,
        })
        break

      case TILE.THUNDER_STONE:
        // 雷电石：快速闪烁
        overlay.alpha = 0
        this.tweens.add({
          targets: overlay, alpha: { from: 0, to: 0.8 },
          duration: 80, yoyo: true,
          delay: 2000 + Math.random() * 3000,
          repeat: -1,
          repeatDelay: 1500 + Math.random() * 2000,
        })
        break

      case TILE.MUSHROOM_GLOW:
        // 菌落：慢呼吸脉冲
        this.tweens.add({
          targets: overlay,
          alpha: { from: 0.1, to: 0.5 },
          duration: 2200 + Math.random() * 600,
          yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        })
        break

      case TILE.RUNE_GLOW:
        // 符文地：金色波纹
        this.tweens.add({
          targets: overlay,
          alpha: { from: 0.15, to: 0.55 },
          duration: 2600 + Math.random() * 800,
          yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        })
        break

      case TILE.STREAM:
        // 溪流：蓝色涌动（Y轴偏移模拟流动）
        this.tweens.add({
          targets: overlay,
          alpha: { from: 0.3, to: 0.65 },
          y: { from: 0, to: -4 },
          duration: 1000,
          yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        })
        break
    }
  }

  // ── 玩家精灵 ──────────────────────────────────────────────────────────────

  createPlayerGraphic() {
    const profColors = {
      kane: 0xff5500, vera: 0xffdd00, oren: 0x44aaff, lena: 0xffee88,
      ella: 0x44ff88, reg: 0xff8800, mag: 0x9900cc, thor: 0x88ddff,
      // legacy
      warrior: 0xff4400, mage_frost: 0x44aaff, assassin: 0xffdd00, warlock: 0x8800cc,
    }
    const col = profColors[this.saveData?.profession] || 0xffffff
    const g = this.add.graphics()
    // 身体（等距人形占位）
    g.fillStyle(col, 1)
    g.fillCircle(0, 0, 9)        // 躯体
    g.fillStyle(0xffffff, 0.9)
    g.fillCircle(-3, -7, 5.5)   // 头部
    // 魔法光晕
    g.lineStyle(2, col, 0.5)
    g.strokeCircle(0, 0, 13)
    g.setDepth(99999).setScrollFactor(0)
    const { width, height } = this.scale
    g.x = width / 2
    g.y = height / 2 - 40
    return g
  }

  updateCameraOffset() {
    const { width, height } = this.scale
    const { sx, sy } = this.tileToScreen(
      this.playerTile.x, this.playerTile.y,
      this.worldGen.getHeight(this.playerTile.x, this.playerTile.y)
    )
    this.worldContainer.x = width / 2 - sx
    this.worldContainer.y = height / 2 - 40 - sy
  }

  // ── 更新循环 ──────────────────────────────────────────────────────────────

  update(time, delta) {
    const now  = this.time.now
    const dt   = delta ?? 16

    // ── 生物系统帧更新 ─────────────────────────────────────────────────────
    if (this.insectSystem) this.insectSystem.update(dt, now)
    if (this.plantSystem)  this.plantSystem.update(now)
    if (this.combatSystem) this.combatSystem.update(dt)

    // ── 昼夜 + 天气 ────────────────────────────────────────────────────────
    if (this.dayNightSystem) this.dayNightSystem.update(dt)
    if (this.weatherSystem) {
      const biome = this.worldGen?.getBiome(this.playerTile.x, this.playerTile.y) ?? 0
      this.weatherSystem.update(dt, biome)
    }

    // ── 怪物 AI 更新 ──────────────────────────────────────────────────────
    if (this.monsterSystem && this.worldGen) {
      const { sx: psx, sy: psy } = this.tileToScreen(
        this.playerTile.x, this.playerTile.y,
        this.worldGen.getHeight(this.playerTile.x, this.playerTile.y)
      )
      const attacks = this.monsterSystem.update(dt, psx, psy)
      if (attacks && this.combatSystem) {
        for (const { atk } of attacks) {
          const dmg = Math.round(atk * (0.85 + Math.random() * 0.3))
          this.combatSystem.takeDamage(dmg)
        }
      }
    }

    if (time - this.moveTimer < 160) return

    const { x, y } = this.playerTile
    const MAX = WORLD_CONFIG.TILES - 1
    let nx = x, ny = y

    if (this.cursors.up.isDown    || this.wasd.up.isDown)    ny = Math.max(0, y - 1)
    else if (this.cursors.down.isDown  || this.wasd.down.isDown)  ny = Math.min(MAX, y + 1)
    else if (this.cursors.left.isDown  || this.wasd.left.isDown)  nx = Math.max(0, x - 1)
    else if (this.cursors.right.isDown || this.wasd.right.isDown) nx = Math.min(MAX, x + 1)

    if (nx !== x || ny !== y) {
      this.playerTile = { x: nx, y: ny }
      this.loadVisibleChunks()
      this.updateUI()
      this.moveTimer = time
      // 玩家移动时尝试在周围生成怪物
      if (this.monsterSystem && this.worldGen) {
        this.monsterSystem.trySpawnNear(
          this.playerTile, this.worldGen,
          (wx, wy, h) => this.tileToScreen(wx, wy, h)
        )
        const { sx: psx2, sy: psy2 } = this.tileToScreen(
          nx, ny, this.worldGen.getHeight(nx, ny)
        )
        this.monsterSystem.pruneFar(psx2, psy2)
      }
    }
  }

  // ── UI ────────────────────────────────────────────────────────────────────

  updateUI() {
    const { x, y } = this.playerTile
    const biome = this.worldGen.getBiome(x, y)
    const biomeName = this.worldGen.getBiomeName(biome)
    const prof = this.saveData?.profession || '未知职业'

    // 距出生点距离（米）
    const sp = WORLD_CONFIG.SPAWN
    const dist = Math.round(
      Math.sqrt((x - sp.x) ** 2 + (y - sp.y) ** 2) * WORLD_CONFIG.TILE_METERS
    )

    this.hintText.setText(`${prof}  |  WASD 移动  |  点击矿石挖矿`)
    this.coordText.setText(
      `${biomeName}\n坐标 (${x}, ${y})\n距出生点 ${dist >= 1000 ? (dist/1000).toFixed(1)+'km' : dist+'m'}\n种子 #${this.worldGen.seed}`
    )
  }

  // ── 挖矿交互 ──────────────────────────────────────────────────────────────

  handleClick(ptr) {
    // 先检测是否点到怪物 → 攻击
    const lx = ptr.x - this.worldContainer.x
    const ly = ptr.y - this.worldContainer.y
    if (this.monsterSystem && this.combatSystem) {
      const m = this.monsterSystem.getAt(lx, ly)
      if (m) {
        this.combatSystem.attack(m)
        return
      }
    }

    // 屏幕坐标 → 世界格坐标
    const rx = ptr.x - this.worldContainer.x
    const ry = ptr.y - this.worldContainer.y
    const wx = Math.round((rx / (TILE_W / 2) + ry / (TILE_H / 2)) / 2)
    const wy = Math.round((ry / (TILE_H / 2) - rx / (TILE_W / 2)) / 2)

    // 距离限制：3 格内可挖
    if (Math.abs(wx - this.playerTile.x) > 3 || Math.abs(wy - this.playerTile.y) > 3) return
    if (wx < 0 || wy < 0 || wx >= WORLD_CONFIG.TILES || wy >= WORLD_CONFIG.TILES) return

    const { cx, cy } = this.chunkOf(wx, wy)
    const key = `${cx}_${cy}`
    const tiles = this.chunkCache.get(key)
    if (!tiles) return

    const C = WORLD_CONFIG.CHUNK_SIZE
    const lc = wx - cx * C, lr = wy - cy * C
    if (lc < 0 || lc >= C || lr < 0 || lr >= C) return

    const cell = tiles[lr][lc]
    const info = ORE_INFO[cell.tile]
    if (!info) return  // 非矿石，不处理

    this.doMine(wx, wy, cell, info, key, tiles, lc, lr, cx, cy)
  }

  doMine(wx, wy, cell, info, key, tiles, lc, lr, cx, cy) {
    // 把矿石格替换为地面
    const biome = cell.biome
    const fallbackTiles = [TILE.COBBLESTONE, TILE.COBBLESTONE, TILE.VOID_STONE, TILE.MARBLE]
    tiles[lr][lc] = {
      tile: fallbackTiles[biome < 4 ? biome >> 1 : 2] || TILE.COBBLESTONE,
      biome,
      height: cell.height,
    }

    // 存档更新
    const save = this.saveData
    if (!save.inventory) save.inventory = { ores: {} }
    if (!save.inventory.ores) save.inventory.ores = {}
    save.inventory.ores[info.drops] = (save.inventory.ores[info.drops] || 0) + 1
    localStorage.setItem('mojing_save', JSON.stringify(save))

    // ── 拾取通知（中文名称 + 等级卡片）──────────────────────────
    this.pickupNotif.show(info.drops, 1)

    // 重新渲染该区块
    this.rebuildChunk(cx, cy)

    // 浮动文字特效（西方魔法风格）
    const { sx, sy } = this.tileToScreen(wx, wy, cell.height)
    const px = this.worldContainer.x + sx
    const py = this.worldContainer.y + sy

    const colorHex = '#' + info.glow.toString(16).padStart(6, '0')
    const txt = this.add.text(px, py - 6, `✦ +1 ${info.name}`, {
      fontSize: '13px', color: colorHex,
      fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(99998).setScrollFactor(0)
    this.tweens.add({
      targets: txt, y: py - 65, alpha: 0,
      duration: 1600, ease: 'Power2',
      onComplete: () => txt.destroy(),
    })

    // 光爆特效（爆裂圆环）
    const burst = this.add.graphics().setDepth(99997).setScrollFactor(0)
    burst.lineStyle(2, info.glow, 0.9)
    burst.strokeCircle(px, py, 18)
    this.tweens.add({
      targets: burst, alpha: 0, scaleX: 2.2, scaleY: 2.2,
      duration: 550, ease: 'Power3',
      onComplete: () => burst.destroy(),
    })

    // 粒子（简单模拟）
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 / 5) * i
      const dot = this.add.graphics().setDepth(99997).setScrollFactor(0)
      dot.fillStyle(info.glow, 0.9)
      dot.fillCircle(px, py, 3)
      this.tweens.add({
        targets: dot,
        x: px + Math.cos(angle) * 28,
        y: py + Math.sin(angle) * 28,
        alpha: 0, scaleX: 0.2, scaleY: 0.2,
        duration: 700, ease: 'Power2',
        onComplete: () => dot.destroy(),
      })
    }
  }
}
