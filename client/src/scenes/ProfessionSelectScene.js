/**
 * ProfessionSelectScene — 永久职业选择场景
 * 选定后写入存档，不可更改
 */

const PROFESSIONS = [
  {
    id: 'warrior',
    name: '战刃者',
    icon: '⚔️',
    element: '🔥 火焰晶',
    passive: '火焰晶强化上限 +2 级',
    desc: '高爆发近战，适合激进打法',
    difficulty: '★★★',
    beginnerFriendly: false,
    color: 0xff4400
  },
  {
    id: 'mage_frost',
    name: '霜法师',
    icon: '🧊',
    element: '❄️ 冰霜晶',
    passive: '冰霜矿采集量 ×1.5',
    desc: '群控魔法输出，需要走位技巧',
    difficulty: '★★★★',
    beginnerFriendly: false,
    color: 0x44aaff
  },
  {
    id: 'assassin',
    name: '雷影刺客',
    icon: '⚡',
    element: '⚡ 雷电晶',
    passive: '炼金时 10% 几率额外产出同阶晶',
    desc: '极速暴击单体，高难高回报',
    difficulty: '★★★★★',
    beginnerFriendly: false,
    color: 0xffdd00
  },
  {
    id: 'warlock',
    name: '暗影巫师',
    icon: '🌑',
    element: '🌑 暗影晶',
    passive: '提纯步骤耗时 -40%',
    desc: '战略控制与弱化，生产链最快',
    difficulty: '★★★★',
    beginnerFriendly: false,
    color: 0x8800cc
  },
  {
    id: 'paladin',
    name: '圣光骑士',
    icon: '✨',
    element: '✨ 神圣晶',
    passive: '副作用触发率 -30%',
    desc: '高防持久坦克，新手最友好',
    difficulty: '★★',
    beginnerFriendly: true,
    color: 0xffee88
  },
  {
    id: 'alchemist',
    name: '混沌炼晶师',
    icon: '🌀',
    element: '🌀 混沌晶',
    passive: '20% 免疫副作用 + 合成效率 +15%',
    desc: '全能合成专家，最易出圣晶',
    difficulty: '★★★',
    beginnerFriendly: false,
    color: 0xff66ff
  }
]

export default class ProfessionSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ProfessionSelectScene' })
    this.selected = null
    this.cards = []
  }

  create() {
    const { width, height } = this.scale

    // 背景渐变
    const bg = this.add.graphics()
    bg.fillGradientStyle(0x0a0a2a, 0x0a0a2a, 0x1a0a3a, 0x1a0a3a, 1)
    bg.fillRect(0, 0, width, height)

    // 粒子背景效果（魔晶光点）
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, width)
      const y = Phaser.Math.Between(0, height)
      const size = Phaser.Math.FloatBetween(1, 3)
      const alpha = Phaser.Math.FloatBetween(0.2, 0.8)
      const colors = [0x9933ff, 0x3399ff, 0xff3366, 0xffcc00, 0x33ffcc]
      const color = colors[Phaser.Math.Between(0, colors.length - 1)]
      const dot = this.add.graphics()
      dot.fillStyle(color, alpha)
      dot.fillCircle(x, y, size)
      this.tweens.add({
        targets: dot,
        alpha: 0,
        duration: Phaser.Math.Between(1500, 4000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      })
    }

    // 标题
    this.add.text(width / 2, 60, '选择你的职业', {
      fontSize: '36px',
      color: '#cc88ff',
      fontStyle: 'bold',
      stroke: '#6600aa',
      strokeThickness: 4
    }).setOrigin(0.5)

    this.add.text(width / 2, 105, '⚠️  此选择永久生效，无法更改，请慎重决定', {
      fontSize: '14px',
      color: '#ff8844'
    }).setOrigin(0.5)

    // 职业卡片（3列 × 2行）
    const cols = 3
    const cardW = 200
    const cardH = 220
    const gapX = 30
    const gapY = 24
    const totalW = cols * cardW + (cols - 1) * gapX
    const startX = (width - totalW) / 2

    PROFESSIONS.forEach((prof, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const cx = startX + col * (cardW + gapX)
      const cy = 200 + row * (cardH + gapY)

      const card = this.add.container(cx, cy)

      // 卡片背景
      const cardBg = this.add.graphics()
      cardBg.fillStyle(0x1a1a3a, 0.95)
      cardBg.lineStyle(2, prof.color, 0.6)
      cardBg.fillRoundedRect(0, 0, cardW, cardH, 12)
      cardBg.strokeRoundedRect(0, 0, cardW, cardH, 12)

      const icon = this.add.text(cardW / 2, 28, prof.icon, { fontSize: '32px' }).setOrigin(0.5)
      const name = this.add.text(cardW / 2, 68, prof.name, {
        fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5)
      const element = this.add.text(cardW / 2, 92, prof.element, {
        fontSize: '12px', color: '#aaaacc'
      }).setOrigin(0.5)
      const desc = this.add.text(cardW / 2, 118, prof.desc, {
        fontSize: '11px', color: '#8888aa',
        wordWrap: { width: cardW - 20 },
        align: 'center'
      }).setOrigin(0.5)
      const passive = this.add.text(cardW / 2, 158, prof.passive, {
        fontSize: '10px', color: '#66cc88',
        wordWrap: { width: cardW - 20 },
        align: 'center'
      }).setOrigin(0.5)
      const diff = this.add.text(cardW / 2, 195, prof.difficulty, {
        fontSize: '13px', color: '#ffaa44'
      }).setOrigin(0.5)

      if (prof.beginnerFriendly) {
        const tag = this.add.text(cardW - 8, 8, '新手', {
          fontSize: '10px', color: '#ffffff',
          backgroundColor: '#22aa55',
          padding: { x: 4, y: 2 }
        }).setOrigin(1, 0)
        card.add(tag)
      }

      card.add([cardBg, icon, name, element, desc, passive, diff])
      card.setSize(cardW, cardH)
      card.setInteractive(new Phaser.Geom.Rectangle(0, 0, cardW, cardH), Phaser.Geom.Rectangle.Contains)

      card.on('pointerover', () => {
        if (this.selected !== prof.id) {
          cardBg.clear()
          cardBg.fillStyle(0x2a2a4a, 0.98)
          cardBg.lineStyle(2, prof.color, 1)
          cardBg.fillRoundedRect(0, 0, cardW, cardH, 12)
          cardBg.strokeRoundedRect(0, 0, cardW, cardH, 12)
          this.tweens.add({ targets: card, scaleX: 1.04, scaleY: 1.04, duration: 120 })
        }
      })

      card.on('pointerout', () => {
        if (this.selected !== prof.id) {
          cardBg.clear()
          cardBg.fillStyle(0x1a1a3a, 0.95)
          cardBg.lineStyle(2, prof.color, 0.6)
          cardBg.fillRoundedRect(0, 0, cardW, cardH, 12)
          cardBg.strokeRoundedRect(0, 0, cardW, cardH, 12)
          this.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 120 })
        }
      })

      card.on('pointerdown', () => this.selectProfession(prof))

      this.cards.push({ card, cardBg, prof })
    })

    // 确认按钮（初始隐藏）
    this.confirmBtn = this.add.container(width / 2, height - 60)
    const btnBg = this.add.graphics()
    btnBg.fillStyle(0x6600cc, 1)
    btnBg.fillRoundedRect(-100, -22, 200, 44, 10)
    const btnText = this.add.text(0, 0, '确认选择', {
      fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5)
    this.confirmBtn.add([btnBg, btnText])
    this.confirmBtn.setAlpha(0)
    this.confirmBtn.setInteractive(
      new Phaser.Geom.Rectangle(-100, -22, 200, 44),
      Phaser.Geom.Rectangle.Contains
    )
    this.confirmBtn.on('pointerdown', () => this.confirmSelection())
  }

  selectProfession(prof) {
    this.selected = prof.id
    this.cards.forEach(({ card, cardBg, prof: p }) => {
      cardBg.clear()
      if (p.id === prof.id) {
        cardBg.fillStyle(0x2a1a4a, 1)
        cardBg.lineStyle(3, p.color, 1)
        cardBg.fillRoundedRect(0, 0, 200, 220, 12)
        cardBg.strokeRoundedRect(0, 0, 200, 220, 12)
      } else {
        cardBg.fillStyle(0x1a1a3a, 0.7)
        cardBg.lineStyle(2, p.color, 0.3)
        cardBg.fillRoundedRect(0, 0, 200, 220, 12)
        cardBg.strokeRoundedRect(0, 0, 200, 220, 12)
      }
    })
    this.tweens.add({ targets: this.confirmBtn, alpha: 1, duration: 300 })
  }

  confirmSelection() {
    if (!this.selected) return
    // 二次确认
    const prof = PROFESSIONS.find(p => p.id === this.selected)
    const { width, height } = this.scale

    const overlay = this.add.graphics()
    overlay.fillStyle(0x000000, 0.7)
    overlay.fillRect(0, 0, width, height)

    const dialog = this.add.container(width / 2, height / 2)
    const dBg = this.add.graphics()
    dBg.fillStyle(0x1a1a3a, 1)
    dBg.lineStyle(2, 0x9933ff, 1)
    dBg.fillRoundedRect(-200, -100, 400, 200, 16)
    dBg.strokeRoundedRect(-200, -100, 400, 200, 16)

    const dText = this.add.text(0, -55,
      `你选择了【${prof.name}】\n此选择永久生效，无法更改\n是否确认？`,
      { fontSize: '16px', color: '#ffffff', align: 'center', lineSpacing: 8 }
    ).setOrigin(0.5)

    const confirmBtn = this.add.text(-70, 50, '✅ 确认', {
      fontSize: '16px', color: '#44ff88', fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive()

    const cancelBtn = this.add.text(70, 50, '❌ 返回', {
      fontSize: '16px', color: '#ff4444'
    }).setOrigin(0.5).setInteractive()

    dialog.add([dBg, dText, confirmBtn, cancelBtn])

    confirmBtn.on('pointerdown', () => {
      // 写入本地存档
      const saveData = {
        profession: this.selected,
        professionChosenAt: Date.now(),
        baseLevel: 1,
        crystals: [],
        inventory: { ores: {}, powders: {}, purifiedPowders: {}, purifier: 5, fuel: 10 }
      }
      localStorage.setItem('mojing_save', JSON.stringify(saveData))
      // 播放职业觉醒动画后跳转
      this.cameras.main.fadeOut(800, 0, 0, 0)
      this.time.delayedCall(800, () => this.scene.start('WorldScene', saveData))
    })

    cancelBtn.on('pointerdown', () => {
      overlay.destroy()
      dialog.destroy()
    })
  }
}
