/**
 * TitleScene — M21 标题画面
 *
 * 游戏入口：动态魔晶粒子背景 + 标题 + 开始/继续按钮。
 * 有存档 → 显示「继续冒险」(直接进世界) 与「新游戏」(回职业选择)。
 * 无存档 → 单个「开始游戏」按钮。
 */
import { getSound } from '../systems/SoundSystem.js'

const GRADE_COLORS = [0x55dd55, 0x4488ff, 0xcc66ff, 0xffcc00, 0xff4444, 0xff44cc]

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' })
  }

  init(data) {
    this.existingSave = data?.existingSave ?? null
  }

  create() {
    const { width: W, height: H } = this.scale
    this.cameras.main.setBackgroundColor('#05060f')

    // ── 漂浮魔晶粒子背景 ────────────────────────────────────────────────
    this.gems = []
    for (let i = 0; i < 36; i++) {
      const color = GRADE_COLORS[Phaser.Math.Between(0, GRADE_COLORS.length - 1)]
      const size = Phaser.Math.Between(4, 14)
      const g = this.add.graphics({ x: Phaser.Math.Between(0, W), y: Phaser.Math.Between(0, H) })
      this._drawGem(g, size, color)
      g.alpha = Phaser.Math.FloatBetween(0.2, 0.7)
      g._vy = Phaser.Math.FloatBetween(-0.35, -0.1)
      g._vx = Phaser.Math.FloatBetween(-0.15, 0.15)
      g._spin = Phaser.Math.FloatBetween(-0.01, 0.01)
      this.gems.push(g)
    }

    // ── 标题 ──────────────────────────────────────────────────────────────
    const title = this.add.text(W / 2, H * 0.30, '魔 晶 传 说', {
      fontSize: Math.min(72, W * 0.11) + 'px', color: '#cc88ff',
      fontStyle: 'bold', stroke: '#3a1a5a', strokeThickness: 8,
    }).setOrigin(0.5).setDepth(10)
    title.setShadow(0, 0, '#aa44ff', 24, true, true)
    this.tweens.add({ targets: title, scale: 1.04, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.inOut' })

    this.add.text(W / 2, H * 0.30 + 58, 'CRYSTAL  LEGEND  ·  伪 3D 等距沙盒', {
      fontSize: '15px', color: '#7766aa', letterSpacing: 2,
    }).setOrigin(0.5).setDepth(10)

    // ── 按钮 ──────────────────────────────────────────────────────────────
    const mkBtn = (y, label, color, onClick) => {
      const btn = this.add.text(W / 2, y, label, {
        fontSize: '22px', color: '#ffffff', fontStyle: 'bold',
        backgroundColor: color, padding: { x: 36, y: 12 },
      }).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true })
      btn.on('pointerover', () => { btn.setScale(1.06); getSound().pickup?.() })
      btn.on('pointerout',  () => btn.setScale(1.0))
      btn.on('pointerdown', () => { getSound().ensure(); onClick() })
      return btn
    }

    if (this.existingSave) {
      const sv = this.existingSave
      const lvl = sv.player?.level ?? '?'
      const prof = sv.profession ?? '?'
      this.add.text(W / 2, H * 0.52, `存档：${prof} · Lv.${lvl}`, {
        fontSize: '14px', color: '#88ddaa',
      }).setOrigin(0.5).setDepth(10)
      mkBtn(H * 0.60, '▶  继续冒险', '#5522aa99', () => {
        this.cameras.main.fadeOut(400, 0, 0, 0)
        this.time.delayedCall(400, () => this.scene.start('WorldScene', sv))
      })
      mkBtn(H * 0.72, '✦  新游戏', '#33336699', () => {
        this.cameras.main.fadeOut(400, 0, 0, 0)
        this.time.delayedCall(400, () => this.scene.start('ProfessionSelectScene', { existingSave: sv }))
      })
    } else {
      mkBtn(H * 0.60, '▶  开始游戏', '#5522aa99', () => {
        this.cameras.main.fadeOut(400, 0, 0, 0)
        this.time.delayedCall(400, () => this.scene.start('ProfessionSelectScene', { existingSave: null }))
      })
    }

    this.add.text(W / 2, H - 24, '🔊 点击任意按钮启用音效  ·  M 键静音', {
      fontSize: '11px', color: '#555577',
    }).setOrigin(0.5).setDepth(10)

    this.cameras.main.fadeIn(600, 0, 0, 0)
  }

  _drawGem(g, s, color) {
    g.clear()
    g.fillStyle(color, 1)
    g.lineStyle(1, 0xffffff, 0.5)
    g.beginPath()
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 2
      const px = Math.cos(a) * s, py = Math.sin(a) * s
      if (i === 0) g.moveTo(px, py); else g.lineTo(px, py)
    }
    g.closePath(); g.fillPath(); g.strokePath()
  }

  update() {
    const { width: W, height: H } = this.scale
    for (const g of this.gems) {
      g.y += g._vy
      g.x += g._vx
      g.rotation += g._spin
      if (g.y < -20) { g.y = H + 20; g.x = Phaser.Math.Between(0, W) }
    }
  }
}
