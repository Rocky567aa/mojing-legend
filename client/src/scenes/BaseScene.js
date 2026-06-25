/**
 * BaseScene — 基地场景
 * 玩家在此建造基地，安装机器，进行炼晶生产链
 */

export default class BaseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BaseScene' })
    this.saveData = null
  }

  init(data) {
    this.saveData = data
  }

  create() {
    const { width, height } = this.scale
    const save = this.saveData
    const baseLevel = save?.baseLevel || 1

    // 背景
    const bg = this.add.graphics()
    bg.fillGradientStyle(0x0a0a2a, 0x0a0a2a, 0x0a1a2a, 0x0a1a2a, 1)
    bg.fillRect(0, 0, width, height)

    this.add.text(width / 2, 30, `🏠 我的基地  |  Lv.${baseLevel}`, {
      fontSize: '24px', color: '#cc88ff', fontStyle: 'bold'
    }).setOrigin(0.5)

    // 背包显示
    this.renderInventory(save)

    // 机器区域
    this.renderMachines(save, baseLevel)

    // 返回世界按钮
    const backBtn = this.add.text(16, 16, '← 返回世界', {
      fontSize: '14px', color: '#aaaacc',
      backgroundColor: '#00000088',
      padding: { x: 8, y: 5 }
    }).setInteractive()
    backBtn.on('pointerdown', () => this.scene.start('WorldScene', this.saveData))
  }

  renderInventory(save) {
    const inv = save?.inventory || {}
    const { width } = this.scale

    this.add.text(40, 80, '🎒 背包 / 矿石库存', {
      fontSize: '16px', color: '#88aaff', fontStyle: 'bold'
    })

    const ores = inv.ores || {}
    const oreList = Object.entries(ores)
    if (oreList.length === 0) {
      this.add.text(40, 110, '暂无矿石，前往世界地图挖矿', {
        fontSize: '13px', color: '#666688'
      })
    } else {
      oreList.forEach(([name, count], i) => {
        this.add.text(40 + (i % 4) * 160, 110 + Math.floor(i / 4) * 28, `${name} × ${count}`, {
          fontSize: '13px', color: '#ddddaa'
        })
      })
    }

    this.add.text(40, 165, `净化剂: ${inv.purifier || 0}  |  炼金燃料: ${inv.fuel || 0}`, {
      fontSize: '13px', color: '#88ccaa'
    })
  }

  renderMachines(save, baseLevel) {
    const { width } = this.scale

    const machines = [
      {
        id: 'crusher', name: '⚙️ 搅碎机', requiredLevel: 1,
        desc: '矿石 → 矿粉 + 杂质渣',
        action: '开始粉碎',
        color: 0x885533
      },
      {
        id: 'purifier', name: '🧪 提纯槽', requiredLevel: 3,
        desc: '矿粉 + 净化剂 → 纯净矿粉',
        action: '开始提纯',
        color: 0x336688
      },
      {
        id: 'furnace', name: '🔥 炼金机', requiredLevel: 2,
        desc: '纯净矿粉 + 燃料 → ✨魔晶',
        action: '开始炼金',
        color: 0x884400
      }
    ]

    this.add.text(40, 210, '🏭 生产机器', {
      fontSize: '16px', color: '#88aaff', fontStyle: 'bold'
    })

    machines.forEach((machine, i) => {
      const x = 40 + i * 280
      const y = 245
      const unlocked = baseLevel >= machine.requiredLevel

      const g = this.add.graphics()
      g.fillStyle(unlocked ? 0x1a1a3a : 0x111122, 0.95)
      g.lineStyle(2, unlocked ? machine.color : 0x333344, 0.8)
      g.fillRoundedRect(x, y, 260, 200, 12)
      g.strokeRoundedRect(x, y, 260, 200, 12)

      this.add.text(x + 130, y + 30, machine.name, {
        fontSize: '16px', color: unlocked ? '#ffffff' : '#555566',
        fontStyle: 'bold'
      }).setOrigin(0.5)

      this.add.text(x + 130, y + 60, machine.desc, {
        fontSize: '12px', color: unlocked ? '#aaaacc' : '#333344',
        align: 'center', wordWrap: { width: 240 }
      }).setOrigin(0.5)

      if (!unlocked) {
        this.add.text(x + 130, y + 100, `🔒 需要基地 Lv.${machine.requiredLevel}`, {
          fontSize: '13px', color: '#664444'
        }).setOrigin(0.5)
      } else {
        const btn = this.add.text(x + 130, y + 150, machine.action, {
          fontSize: '14px', color: '#ffffff',
          backgroundColor: `#${machine.color.toString(16).padStart(6, '0')}`,
          padding: { x: 16, y: 8 }
        }).setOrigin(0.5).setInteractive()
        btn.on('pointerdown', () => this.runMachine(machine.id))
      }
    })

    // 炼晶流程说明
    this.add.text(40, 475, '📋 正确炼晶流程：矿石 → ⚙️搅碎机 → 🧪提纯槽 → 🔥炼金机 → ✨魔晶', {
      fontSize: '13px', color: '#88cc88',
      backgroundColor: '#0a1a0a88',
      padding: { x: 10, y: 6 }
    })
    this.add.text(40, 515, '⚠️ 跳过提纯槽直接炼金，魔晶会带有副作用（轻微污染 / 腐蚀 / 扭曲 / 爆炸）', {
      fontSize: '12px', color: '#cc7744',
      backgroundColor: '#1a0a0a88',
      padding: { x: 10, y: 6 }
    })
  }

  runMachine(machineId) {
    const save = this.saveData
    const inv = save.inventory

    if (machineId === 'crusher') {
      const ores = Object.entries(inv.ores)
      if (ores.length === 0) {
        this.showToast('没有矿石！先去世界地图挖矿。', '#ff6644')
        return
      }
      // 将所有矿石粉碎
      let total = 0
      for (const [name, count] of ores) {
        const powder = name.replace('矿', '粉').replace('矿脉', '粉')
        if (!inv.powders[powder]) inv.powders[powder] = 0
        inv.powders[powder] += Math.floor(count * 0.7)
        total += count
        inv.ores[name] = 0
      }
      inv.ores = {}
      localStorage.setItem('mojing_save', JSON.stringify(save))
      this.showToast(`粉碎完成！${total} 块矿石 → 矿粉`, '#44ff88')

    } else if (machineId === 'purifier') {
      const powders = Object.entries(inv.powders)
      if (powders.length === 0) {
        this.showToast('没有矿粉！先使用搅碎机。', '#ff6644')
        return
      }
      if ((inv.purifier || 0) < 1) {
        this.showToast('净化剂不足！（商店购买或野外采集草药合成）', '#ff6644')
        return
      }
      let total = 0
      for (const [name, count] of powders) {
        const pure = '纯净' + name
        if (!inv.purifiedPowders[pure]) inv.purifiedPowders[pure] = 0
        inv.purifiedPowders[pure] += count
        total += count
      }
      inv.powders = {}
      inv.purifier--
      localStorage.setItem('mojing_save', JSON.stringify(save))
      this.showToast(`提纯完成！${total} 份矿粉 → 纯净矿粉`, '#44ddff')

    } else if (machineId === 'furnace') {
      const purePowders = Object.entries(inv.purifiedPowders)
      const rawPowders = Object.entries(inv.powders)

      if (purePowders.length === 0 && rawPowders.length === 0) {
        this.showToast('没有矿粉！请先粉碎矿石。', '#ff6644')
        return
      }
      if ((inv.fuel || 0) < 1) {
        this.showToast('炼金燃料不足！', '#ff6644')
        return
      }

      const usingPure = purePowders.length > 0
      inv.fuel--

      if (usingPure) {
        // 正常炼金（无副作用）
        const crystal = this.rollCrystal(false, save.profession)
        if (!save.crystals) save.crystals = []
        save.crystals.push(crystal)
        inv.purifiedPowders = {}
        localStorage.setItem('mojing_save', JSON.stringify(save))
        const grade = { green: '🟢凡晶', blue: '🔵灵晶', purple: '🟣魔晶', gold: '🟡神晶', red: '🔴皇晶', rainbow: '🌈圣晶' }
        this.showToast(`✨ 炼金成功！获得 ${grade[crystal.grade] || crystal.grade}`, '#ffee44')
      } else {
        // 跳过提纯，触发副作用
        const roll = Math.random()
        inv.powders = {}
        if (roll < 0.40) {
          const crystal = this.rollCrystal(true, save.profession)
          crystal.sideEffects.push('light_corruption')
          save.crystals.push(crystal)
          localStorage.setItem('mojing_save', JSON.stringify(save))
          this.showToast('⚠️ 炼金成功，但晶体被轻微污染（数值-15%）！可用净化卷轴修复', '#ffaa44')
        } else if (roll < 0.75) {
          const crystal = this.rollCrystal(true, save.profession)
          crystal.sideEffects.push('medium_corrosion')
          save.crystals.push(crystal)
          localStorage.setItem('mojing_save', JSON.stringify(save))
          this.showToast('🟠 中度腐蚀！魔晶强化上限永久降低5级，不可逆！', '#ff7722')
        } else if (roll < 0.95) {
          const crystal = this.rollCrystal(true, save.profession)
          crystal.sideEffects.push('severe_distortion')
          save.crystals.push(crystal)
          localStorage.setItem('mojing_save', JSON.stringify(save))
          this.showToast('🔴 严重扭曲！魔晶带有随机负面被动，只能丢弃！', '#ff3333')
        } else {
          inv.fuel = Math.max(0, (inv.fuel || 0) - 1)
          localStorage.setItem('mojing_save', JSON.stringify(save))
          this.showToast('💀 炼制爆炸！炼金机损坏，材料全损！（记得先提纯！）', '#ff0000')
        }
      }
    }
  }

  rollCrystal(corrupted, profession) {
    const roll = Math.random()
    let grade = 'green'
    if (roll < 0.50) grade = 'green'
    else if (roll < 0.78) grade = 'blue'
    else if (roll < 0.93) grade = 'purple'
    else if (roll < 0.99) grade = 'gold'
    else grade = 'red'

    const elements = ['fire', 'ice', 'thunder', 'dark', 'holy', 'chaos']
    return {
      id: Date.now().toString(36),
      grade,
      element: elements[Math.floor(Math.random() * elements.length)],
      level: 1,
      corrupted,
      sideEffects: []
    }
  }

  showToast(msg, color = '#ffffff') {
    const { width, height } = this.scale
    const toast = this.add.text(width / 2, height - 80, msg, {
      fontSize: '14px', color, fontStyle: 'bold',
      backgroundColor: '#00000099',
      padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setDepth(100)
    this.tweens.add({
      targets: toast, y: height - 120, alpha: 0,
      delay: 2000, duration: 800,
      onComplete: () => toast.destroy()
    })
  }
}
