/**
 * WorldScene — 主世界等距地图场景
 *
 * 世界规模：1.3亿平方米（130 km²）
 *   总网格：2850 × 2850 格（每格 4m × 4m）
 *   区块系统：每区块 32 × 32 格（128m × 128m）
 *   总区块：~89 × 89 = 7,921 区块
 *   可见范围：玩家周围 7 × 7 区块（约 896m × 896m）
 *
 * 等距坐标系：
 *   屏幕 x = (tileX - tileY) * TILE_HALF_W
 *   屏幕 y = (tileX + tileY) * TILE_HALF_H
 *
 * 美术风格：西方魔法（Western Fantasy Magic）
 *   配色：深蓝/午夜紫为主，金色/银白为高光
 *   矿石：自发光 Bloom 效果，对应各区域色调
 */

const TILE_W = 64         // 等距瓦片宽（菱形）
const TILE_H = 32         // 等距瓦片高
const TILE_SIZE_METERS = 4  // 每格 = 4m × 4m

// 区块配置
const CHUNK_SIZE = 32       // 每区块 32×32 格
const VISIBLE_CHUNKS = 7    // 可见范围：7×7 区块
const WORLD_CHUNKS = 89     // 世界总宽/高（格数）
const WORLD_TILES = WORLD_CHUNKS * CHUNK_SIZE  // = 2848 格 ≈ 2850

// 瓦片类型（对应西方魔法地貌）
const TILE = {
  // 中央草原（起始区）
  GRASS: 0,
  COBBLESTONE: 1,
  // 火焰峡谷
  OBSIDIAN: 2,
  LAVA_CRACK: 3,
  // 永冻峡湾
  ICE: 4,
  FROST_STONE: 5,
  // 裂空高地
  SCORCHED_ROCK: 6,
  LIGHTNING_SCAR: 7,
  // 幽暗地穴
  VOID_STONE: 8,
  DARK_CRYSTAL_FLOOR: 9,
  // 神圣遗迹
  MARBLE: 10,
  RUNE_STONE: 11,
  // 矿石（地面可交互）
  FIRE_ORE: 12,
  ICE_ORE: 13,
  THUNDER_ORE: 14,
  DARK_ORE: 15,
  HOLY_ORE: 16,
  CHAOS_ORE: 17,
}

// 生物群系 ID（对应世界区域划分）
const BIOME = {
  GRASSLAND: 0,    // 中央草原（30%）
  FIRE_VALLEY: 1,  // 火焰峡谷（15%）
  FROST_FJORD: 2,  // 永冻峡湾（15%）
  THUNDER_HIGHLAND: 3, // 裂空高地（15%）
  DARK_CAVERN: 4,  // 幽暗地穴（15%）
  HOLY_RUINS: 5,   // 神圣遗迹（10%）
}

// 地貌对应瓦片配色（西方魔法风格）
const TILE_COLORS = {
  [TILE.GRASS]: { top: 0x2d5a1b, left: 0x1a3a0f, right: 0x3d7a25 },
  [TILE.COBBLESTONE]: { top: 0x555566, left: 0x333344, right: 0x666677 },
  [TILE.OBSIDIAN]: { top: 0x1a1a2a, left: 0x0a0a1a, right: 0x2a2a3a },
  [TILE.LAVA_CRACK]: { top: 0x441100, left: 0x220800, right: 0x661a00 },
  [TILE.ICE]: { top: 0x99ccee, left: 0x6699bb, right: 0xaaddff },
  [TILE.FROST_STONE]: { top: 0x7799aa, left: 0x556677, right: 0x88aacc },
  [TILE.SCORCHED_ROCK]: { top: 0x3a3a2a, left: 0x222215, right: 0x4a4a35 },
  [TILE.LIGHTNING_SCAR]: { top: 0x4a3a0a, left: 0x2a2005, right: 0x5a4a15 },
  [TILE.VOID_STONE]: { top: 0x0a0a1a, left: 0x050510, right: 0x150a25 },
  [TILE.DARK_CRYSTAL_FLOOR]: { top: 0x200a35, left: 0x100520, right: 0x300a4a },
  [TILE.MARBLE]: { top: 0xddddd0, left: 0xaaaaaa, right: 0xeeeeee },
  [TILE.RUNE_STONE]: { top: 0xbbaa88, left: 0x887766, right: 0xccbb99 },
  [TILE.FIRE_ORE]: { top: 0xcc3300, left: 0x881100, right: 0xff4400 },
  [TILE.ICE_ORE]: { top: 0x2299cc, left: 0x115588, right: 0x44aaee },
  [TILE.THUNDER_ORE]: { top: 0xddbb00, left: 0x997700, right: 0xffdd22 },
  [TILE.DARK_ORE]: { top: 0x550077, left: 0x330055, right: 0x7700aa },
  [TILE.HOLY_ORE]: { top: 0xddcc66, left: 0x998833, right: 0xffee88 },
  [TILE.CHAOS_ORE]: { top: 0x9966ff, left: 0x6633cc, right: 0xcc99ff },
}

// 矿石配置（名称、光晕颜色）
const ORE_CONFIG = {
  [TILE.FIRE_ORE]: { name: '火玄矿', glowColor: 0xff4400, label: '🔴', region: '火焰峡谷' },
  [TILE.ICE_ORE]: { name: '寒冰晶矿', glowColor: 0x44aaee, label: '🔵', region: '永冻峡湾' },
  [TILE.THUNDER_ORE]: { name: '雷纹矿', glowColor: 0xffdd22, label: '⚡', region: '裂空高地' },
  [TILE.DARK_ORE]: { name: '暗影矿脉', glowColor: 0x7700aa, label: '🌑', region: '幽暗地穴' },
  [TILE.HOLY_ORE]: { name: '圣光矿', glowColor: 0xffee88, label: '✨', region: '神圣遗迹' },
  [TILE.CHAOS_ORE]: { name: '混沌原石', glowColor: 0xcc99ff, label: '🌈', region: '神圣遗迹' },
}

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' })
    // 区块缓存（key: "chunkX_chunkY" → 2D tile array）
    this.chunkCache = new Map()
    // 已加载区块的渲染容器
    this.chunkContainers = new Map()
    // 玩家世界坐标（格单位）
    this.playerTile = { x: Math.floor(WORLD_TILES / 2), y: Math.floor(WORLD_TILES / 2) }
    this.saveData = null
    this.moveTimer = 0
    // 世界随机种子（正式版从服务器获取）
    this.worldSeed = 12345
  }

  init(data) {
    this.saveData = data
  }

  create() {
    const { width, height } = this.scale

    // 背景色（西方魔法夜空：深蓝黑）
    this.cameras.main.setBackgroundColor('#0a0a1a')

    // 主地图容器（等距渲染根节点）
    this.worldContainer = this.add.container(width / 2, height / 2 - 60)

    // 加载玩家周围 7×7 区块
    this.loadVisibleChunks()

    // 玩家精灵（西方魔法角色占位，后续替换精灵图）
    this.playerGraphic = this.add.graphics()
    this.renderPlayer()

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    })

    // 点击地块挖矿
    this.input.on('pointerdown', (pointer) => this.handleTileClick(pointer))

    // UI 信息栏
    this.uiText = this.add.text(16, 16, '', {
      fontSize: '12px', color: '#aaaacc',
      backgroundColor: '#00000088',
      padding: { x: 8, y: 4 }
    }).setDepth(100)

    this.coordText = this.add.text(width - 16, 16, '', {
      fontSize: '11px', color: '#8866aa',
      backgroundColor: '#00000066',
      padding: { x: 6, y: 3 }
    }).setOrigin(1, 0).setDepth(100)

    this.updateUI()

    // 进入基地按钮
    const baseBtn = this.add.text(width - 16, height - 16, '🏠 进入基地', {
      fontSize: '14px', color: '#ffffff',
      backgroundColor: '#4400aa99',
      padding: { x: 10, y: 6 }
    }).setOrigin(1, 1).setInteractive().setDepth(100)
    baseBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0)
      this.time.delayedCall(400, () => this.scene.start('BaseScene', this.saveData))
    })

    // 相机淡入
    this.cameras.main.fadeIn(500, 0, 0, 0)
  }

  // ── 区块管理 ────────────────────────────────────────────────────────────────

  getChunkCoord(tileX, tileY) {
    return {
      cx: Math.floor(tileX / CHUNK_SIZE),
      cy: Math.floor(tileY / CHUNK_SIZE)
    }
  }

  loadVisibleChunks() {
    const { cx: pcx, cy: pcy } = this.getChunkCoord(this.playerTile.x, this.playerTile.y)
    const half = Math.floor(VISIBLE_CHUNKS / 2)

    const needed = new Set()
    for (let dx = -half; dx <= half; dx++) {
      for (let dy = -half; dy <= half; dy++) {
        const cx = pcx + dx
        const cy = pcy + dy
        if (cx < 0 || cy < 0 || cx >= WORLD_CHUNKS || cy >= WORLD_CHUNKS) continue
        const key = `${cx}_${cy}`
        needed.add(key)
        if (!this.chunkContainers.has(key)) {
          this.loadChunk(cx, cy)
        }
      }
    }

    // 卸载不再需要的区块
    for (const [key, container] of this.chunkContainers) {
      if (!needed.has(key)) {
        container.destroy(true)
        this.chunkContainers.delete(key)
        this.chunkCache.delete(key)
      }
    }
  }

  loadChunk(cx, cy) {
    const key = `${cx}_${cy}`
    // 生成或读取区块数据
    const tiles = this.generateChunk(cx, cy)
    this.chunkCache.set(key, tiles)

    // 渲染区块
    const container = this.add.container(0, 0)
    this.renderChunk(cx, cy, tiles, container)
    this.worldContainer.add(container)
    this.chunkContainers.set(key, container)
  }

  generateChunk(cx, cy) {
    const tiles = []
    for (let r = 0; r < CHUNK_SIZE; r++) {
      tiles[r] = []
      for (let c = 0; c < CHUNK_SIZE; c++) {
        const worldC = cx * CHUNK_SIZE + c
        const worldR = cy * CHUNK_SIZE + r
        tiles[r][c] = this.generateTile(worldC, worldR)
      }
    }
    return tiles
  }

  generateTile(worldX, worldY) {
    // 简单程序化生成（正式版用 Simplex Noise + Voronoi）
    const biome = this.getBiome(worldX, worldY)
    const rand = this.seededRandom(worldX * 31337 + worldY * 7919 + this.worldSeed)

    switch (biome) {
      case BIOME.GRASSLAND:
        if (rand < 0.6) return TILE.GRASS
        if (rand < 0.85) return TILE.COBBLESTONE
        return TILE.FIRE_ORE // 起始区低密度杂矿
      case BIOME.FIRE_VALLEY:
        if (rand < 0.5) return TILE.OBSIDIAN
        if (rand < 0.75) return TILE.LAVA_CRACK
        if (rand < 0.95) return TILE.COBBLESTONE
        return TILE.FIRE_ORE
      case BIOME.FROST_FJORD:
        if (rand < 0.5) return TILE.ICE
        if (rand < 0.8) return TILE.FROST_STONE
        if (rand < 0.95) return TILE.COBBLESTONE
        return TILE.ICE_ORE
      case BIOME.THUNDER_HIGHLAND:
        if (rand < 0.5) return TILE.SCORCHED_ROCK
        if (rand < 0.75) return TILE.LIGHTNING_SCAR
        if (rand < 0.95) return TILE.COBBLESTONE
        return TILE.THUNDER_ORE
      case BIOME.DARK_CAVERN:
        if (rand < 0.55) return TILE.VOID_STONE
        if (rand < 0.8) return TILE.DARK_CRYSTAL_FLOOR
        if (rand < 0.94) return TILE.COBBLESTONE
        return TILE.DARK_ORE
      case BIOME.HOLY_RUINS:
        if (rand < 0.4) return TILE.MARBLE
        if (rand < 0.7) return TILE.RUNE_STONE
        if (rand < 0.88) return TILE.COBBLESTONE
        if (rand < 0.97) return TILE.HOLY_ORE
        return TILE.CHAOS_ORE // 非常稀有
      default:
        return TILE.GRASS
    }
  }

  getBiome(worldX, worldY) {
    // 简单 Voronoi 占位（正式版用真正的 Voronoi 算法）
    // 中央区域为草原，周边按方向分配生物群系
    const centerX = WORLD_TILES / 2
    const centerY = WORLD_TILES / 2
    const dx = worldX - centerX
    const dy = worldY - centerY
    const dist = Math.sqrt(dx * dx + dy * dy)
    const maxDist = WORLD_TILES * 0.4

    if (dist < maxDist * 0.35) return BIOME.GRASSLAND

    // 按角度划分五大区域
    const angle = Math.atan2(dy, dx) * 180 / Math.PI + 180
    if (angle < 60) return BIOME.FIRE_VALLEY
    if (angle < 132) return BIOME.FROST_FJORD
    if (angle < 204) return BIOME.THUNDER_HIGHLAND
    if (angle < 276) return BIOME.DARK_CAVERN
    if (angle < 324) return BIOME.HOLY_RUINS
    return BIOME.FIRE_VALLEY
  }

  seededRandom(seed) {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  // ── 渲染 ─────────────────────────────────────────────────────────────────────

  renderChunk(cx, cy, tiles, container) {
    for (let r = 0; r < CHUNK_SIZE; r++) {
      for (let c = 0; c < CHUNK_SIZE; c++) {
        const worldC = cx * CHUNK_SIZE + c
        const worldR = cy * CHUNK_SIZE + r
        const { sx, sy } = this.tileToScreen(worldC, worldR)
        const type = tiles[r][c]
        this.drawTile(sx, sy, type, worldR + worldC, container)

        // 矿石发光标记（西方魔法风格）
        if (ORE_CONFIG[type]) {
          const ore = ORE_CONFIG[type]
          this.drawOreGlow(sx, sy, ore, container)
        }
      }
    }
  }

  tileToScreen(tileX, tileY) {
    return {
      sx: (tileX - tileY) * (TILE_W / 2),
      sy: (tileX + tileY) * (TILE_H / 2)
    }
  }

  drawTile(sx, sy, type, depth, container) {
    const c = TILE_COLORS[type] || TILE_COLORS[TILE.GRASS]
    const hw = TILE_W / 2
    const hh = TILE_H / 2
    const D = 8 // 瓦片厚度

    const g = this.add.graphics()
    // 顶面
    g.fillStyle(c.top, 1)
    g.fillPoints([
      { x: sx, y: sy - hh },
      { x: sx + hw, y: sy },
      { x: sx, y: sy + hh },
      { x: sx - hw, y: sy }
    ], true)
    // 左侧面
    g.fillStyle(c.left, 1)
    g.fillPoints([
      { x: sx - hw, y: sy },
      { x: sx, y: sy + hh },
      { x: sx, y: sy + hh + D },
      { x: sx - hw, y: sy + D }
    ], true)
    // 右侧面
    g.fillStyle(c.right, 1)
    g.fillPoints([
      { x: sx, y: sy + hh },
      { x: sx + hw, y: sy },
      { x: sx + hw, y: sy + D },
      { x: sx, y: sy + hh + D }
    ], true)
    // 轮廓（西方魔法风：暗色边线）
    g.lineStyle(1, 0x000000, 0.25)
    g.strokePoints([
      { x: sx, y: sy - hh }, { x: sx + hw, y: sy },
      { x: sx, y: sy + hh }, { x: sx - hw, y: sy }
    ], true)
    g.setDepth(depth)
    container.add(g)
  }

  drawOreGlow(sx, sy, ore, container) {
    // 矿石发光圆点（西方魔法风格，后续替换为精灵图 + Bloom shader）
    const g = this.add.graphics()
    g.fillStyle(ore.glowColor, 0.7)
    g.fillCircle(sx, sy - 6, 6)
    g.fillStyle(0xffffff, 0.3)
    g.fillCircle(sx - 2, sy - 8, 2)

    // 发光脉冲动画
    this.tweens.add({
      targets: g,
      alpha: { from: 0.7, to: 0.3 },
      duration: 1200 + Math.random() * 800,
      yoyo: true,
      repeat: -1
    })

    const label = this.add.text(sx, sy - 12, ore.label, { fontSize: '10px' }).setOrigin(0.5, 1)
    container.add(g)
    container.add(label)
  }

  renderPlayer() {
    this.playerGraphic.clear()
    // 根据职业用不同颜色（后续替换为精灵图）
    const profColors = {
      warrior: 0xff4400, mage_frost: 0x44aaff,
      assassin: 0xffdd00, warlock: 0x8800cc,
      paladin: 0xffee88, alchemist: 0xff66ff
    }
    const color = profColors[this.saveData?.profession] || 0xffffff
    this.playerGraphic.fillStyle(color, 1)
    this.playerGraphic.fillCircle(0, 0, 8)
    this.playerGraphic.fillStyle(0xffffff, 0.8)
    this.playerGraphic.fillCircle(-2, -6, 5)
    this.playerGraphic.setDepth(9999)
    this.updatePlayerScreenPos()
  }

  updatePlayerScreenPos() {
    const { width, height } = this.scale
    const { sx, sy } = this.tileToScreen(this.playerTile.x, this.playerTile.y)
    // 玩家始终在屏幕中心，地图随玩家滚动
    this.worldContainer.x = width / 2 - sx
    this.worldContainer.y = height / 2 - 60 - sy
    this.playerGraphic.x = width / 2
    this.playerGraphic.y = height / 2 - 60
  }

  // ── 更新循环 ─────────────────────────────────────────────────────────────────

  update(time) {
    if (time - this.moveTimer < 180) return

    let moved = false
    const { x, y } = this.playerTile

    if ((this.cursors.up.isDown || this.wasd.up.isDown) && y > 0) {
      this.playerTile.y--; moved = true
    } else if ((this.cursors.down.isDown || this.wasd.down.isDown) && y < WORLD_TILES - 1) {
      this.playerTile.y++; moved = true
    } else if ((this.cursors.left.isDown || this.wasd.left.isDown) && x > 0) {
      this.playerTile.x--; moved = true
    } else if ((this.cursors.right.isDown || this.wasd.right.isDown) && x < WORLD_TILES - 1) {
      this.playerTile.x++; moved = true
    }

    if (moved) {
      this.updatePlayerScreenPos()
      this.loadVisibleChunks()
      this.updateUI()
      this.moveTimer = time
    }
  }

  updateUI() {
    const { x, y } = this.playerTile
    const biome = this.getBiome(x, y)
    const biomeNames = ['🌿 中央草原', '🌋 火焰峡谷', '🏔️ 永冻峡湾', '⛈️ 裂空高地', '🌑 幽暗地穴', '🏛️ 神圣遗迹']
    const prof = this.saveData?.profession || '未知'
    this.uiText.setText(`职业：${prof}  |  WASD移动  |  点击矿石挖矿`)
    const distFromCenter = Math.round(
      Math.sqrt((x - WORLD_TILES / 2) ** 2 + (y - WORLD_TILES / 2) ** 2) * TILE_SIZE_METERS
    )
    this.coordText.setText(
      `${biomeNames[biome]}\n坐标 (${x}, ${y})\n距出生点 ${distFromCenter}m\n世界总面积 1.3亿 m²`
    )
  }

  // ── 交互 ─────────────────────────────────────────────────────────────────────

  handleTileClick(pointer) {
    const { width, height } = this.scale
    // 屏幕坐标 → 等距格坐标
    const rx = pointer.x - this.worldContainer.x
    const ry = pointer.y - this.worldContainer.y
    const tileX = Math.round((rx / (TILE_W / 2) + ry / (TILE_H / 2)) / 2)
    const tileY = Math.round((ry / (TILE_H / 2) - rx / (TILE_W / 2)) / 2)

    // 只允许挖周围 3 格内的矿
    if (Math.abs(tileX - this.playerTile.x) > 3 || Math.abs(tileY - this.playerTile.y) > 3) return

    const { cx, cy } = this.getChunkCoord(tileX, tileY)
    const key = `${cx}_${cy}`
    const tiles = this.chunkCache.get(key)
    if (!tiles) return

    const localC = tileX - cx * CHUNK_SIZE
    const localR = tileY - cy * CHUNK_SIZE
    if (localC < 0 || localC >= CHUNK_SIZE || localR < 0 || localR >= CHUNK_SIZE) return

    const type = tiles[localR][localC]
    const ore = ORE_CONFIG[type]
    if (!ore) return

    this.mineOre(tileX, tileY, type, ore, key, tiles, localC, localR)
  }

  mineOre(tileX, tileY, type, ore, chunkKey, tiles, localC, localR) {
    // 更新区块数据
    const biome = this.getBiome(tileX, tileY)
    tiles[localR][localC] = [TILE.COBBLESTONE, TILE.VOID_STONE, TILE.MARBLE][Math.floor(biome / 2)] || TILE.COBBLESTONE

    // 更新存档
    const save = this.saveData
    if (!save.inventory.ores[ore.name]) save.inventory.ores[ore.name] = 0
    save.inventory.ores[ore.name]++
    localStorage.setItem('mojing_save', JSON.stringify(save))

    // 重新渲染该区块
    const container = this.chunkContainers.get(chunkKey)
    if (container) {
      container.destroy(true)
      this.chunkContainers.delete(chunkKey)
    }
    this.loadChunk(Math.floor(tileX / CHUNK_SIZE), Math.floor(tileY / CHUNK_SIZE))

    // 西方魔法风格浮动文字
    const { sx, sy } = this.tileToScreen(tileX, tileY)
    const px = this.worldContainer.x + sx
    const py = this.worldContainer.y + sy
    const floatText = this.add.text(px, py, `✦ +1 ${ore.name}`, {
      fontSize: '14px',
      color: `#${ore.glowColor.toString(16).padStart(6, '0')}`,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(9998)
    this.tweens.add({
      targets: floatText, y: py - 55, alpha: 0,
      duration: 1400,
      onComplete: () => floatText.destroy()
    })

    // 矿石发光爆裂特效
    const burst = this.add.graphics()
    burst.lineStyle(2, ore.glowColor, 0.8)
    burst.strokeCircle(px, py, 20)
    this.tweens.add({
      targets: burst, alpha: 0, scaleX: 2, scaleY: 2,
      duration: 600,
      onComplete: () => burst.destroy()
    })
  }
}
