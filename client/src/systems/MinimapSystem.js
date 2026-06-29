/**
 * MinimapSystem.js — M21 小地图
 *
 * 屏幕右上角固定小地图，采样玩家周围群系并以颜色块绘制，中心为玩家。
 * 为性能考虑：低分辨率采样 + 节流刷新（默认 400ms），不在每帧重绘。
 */

// 21 群系 → 代表色（与世界配色风格一致）
const BIOME_COLORS = [
  0x4a7a3a, // 0 草原
  0x3a6a2a, // 1 森林
  0x6a8a4a, // 2 丘陵
  0x2a6a8a, // 3 湖泊/水域
  0x8a4a2a, // 4 荒漠/火山缘
  0xcce0ee, // 5 雪原
  0x5a8a4a, // 6 雨林
  0xaa5522, // 7 熔岩地
  0xaaccee, // 8 冰原
  0x4a6a2a, // 9 毒沼
  0x6a5a8a, // 10 雷暴高地
  0x33223a, // 11 暗影荒野
  0xddcc88, // 12 圣光圣地
  0x2a5a7a, // 13 深海
  0x1a4a6a, // 14 漩涡之地
  0x3a5a1a, // 15 腐毒丛林
  0x7a3a1a, // 16 烈焰熔域
  0x5a4a7a, // 17 雷霆峡谷
  0x2a1a3a, // 18 永夜深渊
  0xeeddaa, // 19 天界圣域
  0x1a0a2a, // 20 魔神领域
]

export class MinimapSystem {
  constructor(scene, { size = 120, sampleRadius = 90, step = 3, refreshMs = 400 } = {}) {
    this.scene = scene
    this.size = size
    this.sampleRadius = sampleRadius   // 覆盖玩家周围 ±N tile
    this.step = step                   // 采样步长（tile）
    this._timer = 0
    this._refreshMs = refreshMs

    const { width: W } = scene.scale
    const pad = 14
    const x = W - pad - size
    const y = 44   // 坐标文字下方

    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(205)

    // 背景框
    this.frame = scene.add.rectangle(x + size / 2, y + size / 2, size + 4, size + 4, 0x000000, 0.55)
      .setStrokeStyle(2, 0x9966cc).setScrollFactor(0)
    this.gfx = scene.add.graphics().setScrollFactor(0)
    this._ox = x
    this._oy = y

    // 标题 + 玩家中心点
    this.label = scene.add.text(x + size / 2, y - 9, '🗺 小地图', {
      fontSize: '10px', color: '#bbaadd',
    }).setOrigin(0.5, 1).setScrollFactor(0)
    this.playerDot = scene.add.circle(x + size / 2, y + size / 2, 3, 0xffff00)
      .setStrokeStyle(1, 0x000000).setScrollFactor(0)

    this.container.add([this.frame, this.gfx, this.label, this.playerDot])
  }

  update(dt) {
    this._timer -= dt
    if (this._timer > 0) return
    this._timer = this._refreshMs
    this._redraw()
  }

  _redraw() {
    const wg = this.scene.worldGen
    const pt = this.scene.playerTile
    if (!wg || !pt) return

    const { size, sampleRadius, step, _ox: ox, _oy: oy } = this
    const cells = Math.floor((sampleRadius * 2) / step)
    const cellPx = size / cells

    this.gfx.clear()
    for (let i = 0; i < cells; i++) {
      for (let j = 0; j < cells; j++) {
        const tx = pt.x - sampleRadius + i * step
        const ty = pt.y - sampleRadius + j * step
        let color
        if (tx < 0 || ty < 0 || tx >= 2850 || ty >= 2850) {
          color = 0x05050a   // 世界边界外
        } else {
          const b = wg.getBiome(tx, ty) ?? 0
          color = BIOME_COLORS[b] ?? 0x444466
        }
        this.gfx.fillStyle(color, 1)
        this.gfx.fillRect(ox + i * cellPx, oy + j * cellPx, Math.ceil(cellPx), Math.ceil(cellPx))
      }
    }
    // 边框（盖住溢出）
    this.gfx.lineStyle(2, 0x9966cc, 1)
    this.gfx.strokeRect(ox, oy, size, size)
  }

  destroy() {
    this.container?.destroy(true)
  }
}
