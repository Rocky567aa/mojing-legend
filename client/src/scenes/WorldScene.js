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
    // 按 depth 排序渲染（远处先画），实现等距遮挡
    const drawCalls = []
    for (let r = 0; r < CHUNK; r++) {
      for (let c = 0; c < CHUNK; c++) {
        const wx = cx * CHUNK + c
        const wy = cy * CHUNK + r
        const { tile, height } = tiles[r][c]
        const { sx, sy } = this.tileToScreen(wx, wy, height)
        drawCalls.push({ sx, sy, tile, height, wx, wy, depth: wy + wx })
      }
    }
    // depth 排序（伪3D：行+列越大越靠前）
    drawCalls.sort((a, b) => a.depth - b.depth)
    for (const d of drawCalls) {
      this.drawTile(d.sx, d.sy, d.tile, d.height, d.depth, container)
      if (this.worldGen.isOre(d.tile) && ORE_INFO[d.tile]) {
        this.drawOreMarker(d.sx, d.sy, ORE_INFO[d.tile], container)
      }
    }
  }

  drawTile(sx, sy, tileType, h, depth, container) {
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

    // 脉冲动画（每个矿石节奏略不同）
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

  // ── 玩家精灵 ──────────────────────────────────────────────────────────────

  createPlayerGraphic() {
    const profColors = {
      warrior: 0xff4400, mage_frost: 0x44aaff,
      assassin: 0xffdd00, warlock: 0x8800cc,
      paladin: 0xffee88, alchemist: 0xff66ff,
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

  update(time) {
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
