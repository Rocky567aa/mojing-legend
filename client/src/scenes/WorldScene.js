/**
 * WorldScene — 主世界等距地图场景
 *
 * 等距坐标系：
 *   屏幕 x = (tileX - tileY) * TILE_HALF_W
 *   屏幕 y = (tileX + tileY) * TILE_HALF_H
 *
 * 地图用 2D 数组存储：map[row][col] = tileType
 * 每帧按 y 轴排序精灵，实现等距遮挡效果
 */

const TILE_W = 64   // 等距瓦片宽度（菱形）
const TILE_H = 32   // 等距瓦片高度
const MAP_COLS = 40
const MAP_ROWS = 40

// 瓦片类型
const TILE = {
  GRASS: 0,
  STONE: 1,
  FIRE_ORE: 2,   // 火玄矿
  ICE_ORE: 3,    // 寒冰矿
  THUNDER_ORE: 4, // 雷纹矿
  DARK_ORE: 5,   // 暗影矿
  HOLY_ORE: 6,   // 圣光矿
  BASE_GROUND: 7  // 基地地块
}

const TILE_COLORS = {
  [TILE.GRASS]: { top: 0x3a7a3a, left: 0x2a5a2a, right: 0x4a8a4a },
  [TILE.STONE]: { top: 0x666677, left: 0x444455, right: 0x777788 },
  [TILE.FIRE_ORE]: { top: 0xcc3300, left: 0x881100, right: 0xff4400 },
  [TILE.ICE_ORE]: { top: 0x2299cc, left: 0x115588, right: 0x44aaee },
  [TILE.THUNDER_ORE]: { top: 0xddbb00, left: 0x997700, right: 0xffdd22 },
  [TILE.DARK_ORE]: { top: 0x550077, left: 0x330055, right: 0x7700aa },
  [TILE.HOLY_ORE]: { top: 0xddcc66, left: 0x998833, right: 0xffee88 },
  [TILE.BASE_GROUND]: { top: 0x5555aa, left: 0x333377, right: 0x6666bb }
}

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' })
    this.mapData = []
    this.tileSprites = []
    this.playerPos = { col: 20, row: 20 }
    this.saveData = null
  }

  init(data) {
    this.saveData = data
  }

  create() {
    const { width, height } = this.scale

    // 生成地图数据（简单程序化）
    this.generateMap()

    // 渲染等距瓦片
    this.isoContainer = this.add.container(width / 2, 120)
    this.renderIsometricMap()

    // 玩家角色（临时用矩形代替，后续替换精灵）
    this.player = this.add.graphics()
    this.drawPlayer()

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    })

    // 点击地块交互
    this.input.on('pointerdown', (pointer) => this.onTileClick(pointer))

    // UI提示
    this.add.text(16, 16, `职业：${this.saveData?.profession || '?'}  |  WASD/方向键移动  |  点击瓦片挖矿`, {
      fontSize: '13px', color: '#aaaacc', backgroundColor: '#00000088',
      padding: { x: 8, y: 4 }
    })

    // 进入基地按钮
    const baseBtn = this.add.text(width - 16, 16, '🏠 进入基地', {
      fontSize: '14px', color: '#ffffff',
      backgroundColor: '#4400aa88',
      padding: { x: 10, y: 6 }
    }).setOrigin(1, 0).setInteractive()
    baseBtn.on('pointerdown', () => this.scene.start('BaseScene', this.saveData))

    // 移动节流
    this.moveTimer = 0
  }

  generateMap() {
    for (let r = 0; r < MAP_ROWS; r++) {
      this.mapData[r] = []
      for (let c = 0; c < MAP_COLS; c++) {
        const noise = Math.random()
        // 简单随机地形（后续替换为 Simplex Noise）
        if (noise < 0.55) this.mapData[r][c] = TILE.GRASS
        else if (noise < 0.75) this.mapData[r][c] = TILE.STONE
        else if (noise < 0.82) this.mapData[r][c] = TILE.FIRE_ORE
        else if (noise < 0.87) this.mapData[r][c] = TILE.ICE_ORE
        else if (noise < 0.91) this.mapData[r][c] = TILE.THUNDER_ORE
        else if (noise < 0.94) this.mapData[r][c] = TILE.DARK_ORE
        else if (noise < 0.97) this.mapData[r][c] = TILE.HOLY_ORE
        else this.mapData[r][c] = TILE.BASE_GROUND
      }
    }
    // 玩家出生点周围设为草地
    for (let r = 18; r <= 22; r++)
      for (let c = 18; c <= 22; c++)
        this.mapData[r][c] = TILE.GRASS
  }

  renderIsometricMap() {
    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        const type = this.mapData[r][c]
        const { x, y } = this.isoToScreen(c, r)
        this.drawIsoTile(x, y, type, r, c)
      }
    }
  }

  drawIsoTile(x, y, type, row, col) {
    const colors = TILE_COLORS[type]
    const g = this.add.graphics()
    const hw = TILE_W / 2
    const hh = TILE_H / 2
    const depth = 8  // 瓦片厚度

    // 顶面（菱形）
    g.fillStyle(colors.top, 1)
    g.fillPoints([
      { x: x, y: y - hh },
      { x: x + hw, y: y },
      { x: x, y: y + hh },
      { x: x - hw, y: y }
    ], true)

    // 左侧面
    g.fillStyle(colors.left, 1)
    g.fillPoints([
      { x: x - hw, y: y },
      { x: x, y: y + hh },
      { x: x, y: y + hh + depth },
      { x: x - hw, y: y + depth }
    ], true)

    // 右侧面
    g.fillStyle(colors.right, 1)
    g.fillPoints([
      { x: x, y: y + hh },
      { x: x + hw, y: y },
      { x: x + hw, y: y + depth },
      { x: x, y: y + hh + depth }
    ], true)

    // 轮廓线
    g.lineStyle(1, 0x000000, 0.15)
    g.strokePoints([
      { x, y: y - hh }, { x: x + hw, y },
      { x, y: y + hh }, { x: x - hw, y }
    ], true)

    g.setDepth(row + col)
    this.isoContainer.add(g)

    // 矿石标记（后续替换为精灵图）
    if (type >= TILE.FIRE_ORE && type <= TILE.HOLY_ORE) {
      const labels = ['', '', '', '🔴', '🔵', '⚡', '🌑', '✨']
      const label = this.add.text(x, y - hh - 4, labels[type], {
        fontSize: '12px'
      }).setOrigin(0.5, 1).setDepth(row + col + 1)
      this.isoContainer.add(label)
    }
  }

  isoToScreen(col, row) {
    return {
      x: (col - row) * (TILE_W / 2),
      y: (col + row) * (TILE_H / 2)
    }
  }

  drawPlayer() {
    const { x: sx, y: sy } = this.isoToScreen(this.playerPos.col, this.playerPos.row)
    const { width, height } = this.scale
    const px = width / 2 + sx
    const py = 120 + sy - TILE_H

    this.player.clear()
    this.player.fillStyle(0xff66ff, 1)
    this.player.fillCircle(px, py, 10)
    this.player.fillStyle(0xffffff, 1)
    this.player.fillCircle(px, py - 8, 6)
  }

  update(time) {
    if (time - this.moveTimer < 200) return

    let moved = false
    const { col, row } = this.playerPos

    if ((this.cursors.up.isDown || this.wasd.up.isDown) && row > 0) {
      this.playerPos.row--; moved = true
    } else if ((this.cursors.down.isDown || this.wasd.down.isDown) && row < MAP_ROWS - 1) {
      this.playerPos.row++; moved = true
    } else if ((this.cursors.left.isDown || this.wasd.left.isDown) && col > 0) {
      this.playerPos.col--; moved = true
    } else if ((this.cursors.right.isDown || this.wasd.right.isDown) && col < MAP_COLS - 1) {
      this.playerPos.col++; moved = true
    }

    if (moved) {
      this.drawPlayer()
      this.moveTimer = time
    }
  }

  onTileClick(pointer) {
    // 将屏幕坐标反转回等距坐标（点击挖矿）
    const { width } = this.scale
    const rx = pointer.x - width / 2
    const ry = pointer.y - 120
    const col = Math.round((rx / (TILE_W / 2) + ry / (TILE_H / 2)) / 2)
    const row = Math.round((ry / (TILE_H / 2) - rx / (TILE_W / 2)) / 2)

    if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) return
    const type = this.mapData[row][col]
    if (type >= TILE.FIRE_ORE && type <= TILE.HOLY_ORE) {
      this.mineOre(col, row, type)
    }
  }

  mineOre(col, row, type) {
    const oreNames = { 2: '火玄矿', 3: '寒冰晶矿', 4: '雷纹矿', 5: '暗影矿脉', 6: '圣光矿' }
    const oreName = oreNames[type] || '矿石'

    // 更新存档
    const save = this.saveData
    if (!save.inventory.ores[oreName]) save.inventory.ores[oreName] = 0
    save.inventory.ores[oreName]++
    localStorage.setItem('mojing_save', JSON.stringify(save))

    // 将矿石格变为普通石块
    this.mapData[row][col] = TILE.STONE

    // 浮动文字反馈
    const { x, y } = this.isoToScreen(col, row)
    const { width } = this.scale
    const sx = width / 2 + x
    const sy = 120 + y
    const floatText = this.add.text(sx, sy, `+1 ${oreName}`, {
      fontSize: '14px', color: '#ffdd44', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5)
    this.tweens.add({
      targets: floatText, y: sy - 50, alpha: 0,
      duration: 1200,
      onComplete: () => floatText.destroy()
    })

    console.log(`挖到 ${oreName}，背包：`, save.inventory.ores)
  }
}
