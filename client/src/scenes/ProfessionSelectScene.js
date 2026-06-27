/**
 * ProfessionSelectScene — 每次进游戏时选择英雄职业（8位英雄，4×2布局）
 * 可重新选择，选定后更新存档并进入世界
 */
import { PROFESSIONS } from '../data/HeroData.js'

export default class ProfessionSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ProfessionSelectScene' })
    this.selected = null
    this.cards = []
    this.existingSave = null
  }

  init(data) {
    this.selected = null
    this.cards = []
    this.existingSave = (data && data.existingSave) ? data.existingSave : null
  }

  create() {
    const { width, height } = this.scale

    // 背景渐变
    const bg = this.add.graphics()
    bg.fillGradientStyle(0x0a0a2a, 0x0a0a2a, 0x1a0a3a, 0x1a0a3a, 1)
    bg.fillRect(0, 0, width, height)

    // 粒子背景
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, width)
      const y = Phaser.Math.Between(0, height)
      const size  = Phaser.Math.FloatBetween(1, 3)
      const alpha = Phaser.Math.FloatBetween(0.2, 0.8)
      const colors = [0x9933ff, 0x3399ff, 0xff3366, 0xffcc00, 0x33ffcc]
      const color  = colors[Phaser.Math.Between(0, colors.length - 1)]
      const dot = this.add.graphics()
      dot.fillStyle(color, alpha)
      dot.fillCircle(x, y, size)
      this.tweens.add({
        targets: dot, alpha: { from: alpha, to: 0.05 },
        duration: Phaser.Math.Between(1500, 4000),
        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 2000)
      })
    }

    // 标题
    this.add.text(width / 2, 48, '选择你的英雄', {
      fontSize: '32px', color: '#cc88ff',
      fontStyle: 'bold', stroke: '#6600aa', strokeThickness: 4
    }).setOrigin(0.5)

    const curName = this.existingSave
      ? PROFESSIONS.find(p => p.id === this.existingSave.profession)?.name ?? '无'
      : null
    const subtitle = curName
      ? `当前英雄：${curName}  ·  可重新选择`
      : '每局开始时选择一位英雄，随时可换'
    this.add.text(width / 2, 90, subtitle, {
      fontSize: '13px', color: '#aaaacc'
    }).setOrigin(0.5)

    // 英雄卡片：4列 × 2行
    const cols   = 4
    const cardW  = 185
    const cardH  = 210
    const gapX   = 18
    const gapY   = 18
    const totalW = cols * cardW + (cols - 1) * gapX
    const startX = (width - totalW) / 2
    const startY = 118

    PROFESSIONS.forEach((prof, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const cx  = startX + col * (cardW + gapX)
      const cy  = startY + row * (cardH + gapY)

      const card = this.add.container(cx, cy)

      const cardBg = this.add.graphics()
      this._drawCardBg(cardBg, prof, cardW, cardH, false, false)

      const icon    = this.add.text(cardW / 2, 25,  prof.icon, { fontSize: '28px' }).setOrigin(0.5)
      const name    = this.add.text(cardW / 2, 60,  prof.name, {
        fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
        wordWrap: { width: cardW - 16 }, align: 'center'
      }).setOrigin(0.5)
      const element = this.add.text(cardW / 2, 84,  prof.element, {
        fontSize: '11px', color: '#aaaacc'
      }).setOrigin(0.5)
      const desc    = this.add.text(cardW / 2, 108, prof.desc, {
        fontSize: '10px', color: '#8888aa',
        wordWrap: { width: cardW - 18 }, align: 'center'
      }).setOrigin(0.5)
      const passive = this.add.text(cardW / 2, 152, prof.passive, {
        fontSize: '9px', color: '#66cc88',
        wordWrap: { width: cardW - 18 }, align: 'center'
      }).setOrigin(0.5)
      const diff    = this.add.text(cardW / 2, 189, prof.difficulty, {
        fontSize: '12px', color: '#ffaa44'
      }).setOrigin(0.5)

      card.add([cardBg, icon, name, element, desc, passive, diff])

      if (prof.beginnerFriendly) {
        const tag = this.add.text(cardW - 6, 6, '新手', {
          fontSize: '9px', color: '#ffffff',
          backgroundColor: '#22aa55', padding: { x: 3, y: 2 }
        }).setOrigin(1, 0)
        card.add(tag)
      }

      card.setSize(cardW, cardH)
      card.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, cardW, cardH),
        Phaser.Geom.Rectangle.Contains
      )

      card.on('pointerover', () => {
        if (this.selected !== prof.id) {
          this._drawCardBg(cardBg, prof, cardW, cardH, true, false)
          this.tweens.add({ targets: card, scaleX: 1.04, scaleY: 1.04, duration: 110 })
        }
      })
      card.on('pointerout', () => {
        if (this.selected !== prof.id) {
          this._drawCardBg(cardBg, prof, cardW, cardH, false, false)
          this.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 110 })
        }
      })
      card.on('pointerdown', () => this.selectProfession(prof))

      this.cards.push({ card, cardBg, prof })
    })

    // 确认按钮
    this.confirmBtn = this.add.container(width / 2, height - 36)
    const btnBg = this.add.graphics()
    btnBg.fillStyle(0x6600cc, 1)
    btnBg.fillRoundedRect(-110, -22, 220, 44, 10)
    const btnText = this.add.text(0, 0, '确认选择', {
      fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5)
    this.confirmBtn.add([btnBg, btnText])
    this.confirmBtn.setAlpha(0)
    this.confirmBtn.setInteractive(
      new Phaser.Geom.Rectangle(-110, -22, 220, 44),
      Phaser.Geom.Rectangle.Contains
    )
    this.confirmBtn.on('pointerdown', () => this.confirmSelection())
    this.confirmBtn.on('pointerover', () => { btnBg.clear(); btnBg.fillStyle(0x9933ff,1); btnBg.fillRoundedRect(-110,-22,220,44,10) })
    this.confirmBtn.on('pointerout',  () => { btnBg.clear(); btnBg.fillStyle(0x6600cc,1); btnBg.fillRoundedRect(-110,-22,220,44,10) })
  }

  _drawCardBg(g, prof, w, h, hover, selected) {
    g.clear()
    if (selected) {
      g.fillStyle(0x2a1a4a, 1)
      g.lineStyle(3, prof.color, 1)
    } else if (hover) {
      g.fillStyle(0x2a2a4a, 0.98)
      g.lineStyle(2, prof.color, 1)
    } else {
      g.fillStyle(0x1a1a3a, 0.95)
      g.lineStyle(2, prof.color, 0.55)
    }
    g.fillRoundedRect(0, 0, w, h, 10)
    g.strokeRoundedRect(0, 0, w, h, 10)
  }

  selectProfession(prof) {
    this.selected = prof.id
    this.cards.forEach(({ card, cardBg, prof: p }) => {
      const isSelected = p.id === prof.id
      this._drawCardBg(cardBg, p, 185, 210, false, isSelected)
      if (!isSelected) this.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 110 })
    })
    this.tweens.add({ targets: this.confirmBtn, alpha: 1, duration: 300 })
  }

  confirmSelection() {
    if (!this.selected) return
    const base = this.existingSave || {
      baseLevel: 1, crystals: [],
      inventory: { ores: {}, powders: {}, purifiedPowders: {}, purifier: 5, fuel: 10 }
    }
    const saveData = { ...base, profession: this.selected, professionChosenAt: Date.now() }
    localStorage.setItem('mojing_save', JSON.stringify(saveData))
    this.cameras.main.fadeOut(600, 0, 0, 0)
    this.time.delayedCall(600, () => this.scene.start('WorldScene', saveData))
  }
}
