/**
 * BaseScene — 基地场景 (M17 · 完整炼晶生产链 UI)
 *
 * 功能：
 *   1. 背包展示     — 矿石/矿粉/纯净矿粉/魔晶；魔晶以彩色宝石图形渲染
 *   2. 生产机器     — 搅碎机/提纯槽/炼金机；带进度条动画 + 解锁锁定状态
 *   3. 副作用系统   — 跳过提纯触发 4 级副作用（轻微污染→中度腐蚀→严重扭曲→爆炸）
 *   4. 基地升级     — 消耗矿石升级基地等级，解锁新机器
 *   5. 鲁恩加成     — 若当前职业为 runen，炼金品质+1阶，提纯时间-40%
 *
 * 存档字段（localStorage key: mojing_save）：
 *   inventory.ores            { [名称]: 数量 }
 *   inventory.powders         { [名称]: 数量 }
 *   inventory.purifiedPowders { [名称]: 数量 }
 *   inventory.purifier        净化剂数量
 *   inventory.fuel            炼金燃料数量
 *   crystals                  [ { id, grade, element, level, corrupted, sideEffects[] } ]
 *   baseLevel                 1–5
 */
import { getSound } from '../systems/SoundSystem.js'
import { SaveSystem } from '../systems/SaveSystem.js'


const GRADE_META = {
  green:   { label: '凡晶 ●',  color: '#55dd55', hex: 0x55dd55, glow: 0x33ff33 },
  blue:    { label: '灵晶 ◆',  color: '#4488ff', hex: 0x4488ff, glow: 0x88aaff },
  purple:  { label: '魔晶 ★',  color: '#cc66ff', hex: 0xcc66ff, glow: 0xaa44dd },
  gold:    { label: '神晶 ✦',  color: '#ffcc00', hex: 0xffcc00, glow: 0xffaa00 },
  red:     { label: '皇晶 ❖',  color: '#ff4444', hex: 0xff4444, glow: 0xff2200 },
  rainbow: { label: '圣晶 ✧',  color: '#ff88ff', hex: 0xff44cc, glow: 0x00ffff },
}

const MACHINE_DEF = [
  {
    id: 'crusher', name: '⚙️ 搅碎机', requiredLevel: 1,
    inputLabel: '矿石', outputLabel: '矿粉',
    desc: '矿石 → 矿粉 + 杂质渣\n产出率 70%',
    action: '开始粉碎', actionColor: 0x885533,
    duration: 1400,
  },
  {
    id: 'purifier', name: '🧪 提纯槽', requiredLevel: 2,
    inputLabel: '矿粉 + 净化剂', outputLabel: '纯净矿粉',
    desc: '矿粉 + 净化剂 → 纯净矿粉\n消耗净化剂 ×1',
    action: '开始提纯', actionColor: 0x336688,
    duration: 2200,
  },
  {
    id: 'furnace', name: '🔥 炼金机', requiredLevel: 1,
    inputLabel: '矿粉/纯净矿粉 + 燃料', outputLabel: '✨魔晶',
    desc: '纯净矿粉 + 燃料 → 魔晶（无副作用）\n跳过提纯 → 触发副作用！',
    action: '开始炼金', actionColor: 0x884400,
    duration: 3000,
  },
]

// 基地升级配置
const BASE_UPGRADES = [
  null,  // lv 0 → 不存在
  { cost: 20, label: '升级至 Lv.2 → 解锁提纯槽', ore: '普通矿石' },
  { cost: 40, label: '升级至 Lv.3 → 解锁强化炉',   ore: '精炼矿石' },
  { cost: 80, label: '升级至 Lv.4 → 解锁高阶提纯', ore: '稀有矿石' },
  { cost: 150, label: '升级至 Lv.5 → 满级',          ore: '稀有矿石' },
]

export default class BaseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BaseScene' })
    this.saveData = null
    this._machineState = { crusher: false, purifier: false, furnace: false }
  }

  init(data) {
    this.saveData = data
    this._ensureInventory(data)
  }

  // ── 存档字段保障 ──────────────────────────────────────────────────────────
  _ensureInventory(save) {
    if (!save.inventory)  save.inventory = {}
    const inv = save.inventory
    if (!inv.ores)            inv.ores = {}
    if (!inv.powders)         inv.powders = {}
    if (!inv.purifiedPowders) inv.purifiedPowders = {}
    if (inv.purifier  == null) inv.purifier  = 0
    if (inv.fuel      == null) inv.fuel      = 3  // 给新手一点燃料
    if (!Array.isArray(save.crystals)) save.crystals = []
    if (!save.baseLevel || save.baseLevel < 1) save.baseLevel = 1
  }

  _save() {
    localStorage.setItem('mojing_save', JSON.stringify(this.saveData))
  }

  // ── Phaser create ─────────────────────────────────────────────────────────
  create() {
    const { width, height } = this.scale
    const save = this.saveData
    this._w = width; this._h = height

    // 背景渐变
    const bg = this.add.graphics()
    bg.fillGradientStyle(0x080818, 0x080818, 0x0d1428, 0x0d1428, 1)
    bg.fillRect(0, 0, width, height)
    // 石砖网格纹理
    const grid = this.add.graphics()
    grid.lineStyle(1, 0x1a1a3a, 0.25)
    for (let x = 0; x < width; x += 40) grid.strokeLineShape(new Phaser.Geom.Line(x, 0, x, height))
    for (let y = 0; y < height; y += 40) grid.strokeLineShape(new Phaser.Geom.Line(0, y, width, y))

    // 标题
    this.add.text(width / 2, 28, '🏠 炼晶基地', {
      fontSize: '26px', color: '#cc88ff', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5)

    this.add.text(width / 2, 56, `基地等级 Lv.${save.baseLevel}  |  ${this._heroLabel()}`,
      { fontSize: '13px', color: '#8899bb' }
    ).setOrigin(0.5)

    // 返回按钮
    const backBtn = this.add.text(16, 16, '← 返回世界', {
      fontSize: '14px', color: '#aaaacc',
      backgroundColor: '#00000088', padding: { x: 8, y: 5 },
    }).setInteractive()
    backBtn.on('pointerover', () => backBtn.setStyle({ color: '#ffffff' }))
    backBtn.on('pointerout',  () => backBtn.setStyle({ color: '#aaaacc' }))
    backBtn.on('pointerdown', () => {
      this._save()
      this.time.delayedCall(180, () => this.scene.start('WorldScene', this.saveData))
    })

    // M20: 存档码 导出 / 导入
    const expBtn = this.add.text(140, 16, '📤 导出存档', {
      fontSize: '13px', color: '#aaffcc',
      backgroundColor: '#00000088', padding: { x: 8, y: 5 },
    }).setInteractive({ useHandCursor: true })
    expBtn.on('pointerover', () => expBtn.setStyle({ color: '#ffffff' }))
    expBtn.on('pointerout',  () => expBtn.setStyle({ color: '#aaffcc' }))
    expBtn.on('pointerdown', () => this._exportSave())

    const impBtn = this.add.text(258, 16, '📥 导入存档', {
      fontSize: '13px', color: '#ffddaa',
      backgroundColor: '#00000088', padding: { x: 8, y: 5 },
    }).setInteractive({ useHandCursor: true })
    impBtn.on('pointerover', () => impBtn.setStyle({ color: '#ffffff' }))
    impBtn.on('pointerout',  () => impBtn.setStyle({ color: '#ffddaa' }))
    impBtn.on('pointerdown', () => this._importSave())

    // 布局
    this._renderInventory()
    this._renderMachines()
    this._renderCrystals()
    this._renderUpgrade()
    this._renderFlowDiagram()
  }

  // ── 英雄标签 ──────────────────────────────────────────────────────────────
  _heroLabel() {
    const names = {
      kane: '⚔️ 卡恩', vera: '🗡 薇拉', oren: '🔮 奥伦', lena: '💫 莉娜',
      ayla: '🌿 艾拉', reg: '🛡 雷格', marg: '💀 玛格', thor: '🏹 托尔',
      runen: '⚗️ 鲁恩(炼金+1阶)', seya: '🌊 赛亚', roal: '✨ 罗尔',
      naira: '👁 奈拉', dark: '☠️ 达克', yingmon: '👊 影月', moke: '⚡ 莫克',
      aiwei: '🎯 艾薇',
    }
    return names[this.saveData?.profession] ?? '英雄'
  }

  // ── 背包面板 ──────────────────────────────────────────────────────────────
  _renderInventory() {
    const { _w: W } = this
    const panelX = 20, panelY = 76, panelW = W * 0.46
    const inv = this.saveData.inventory

    this._panel(panelX, panelY, panelW, 148, '🎒 材料库存')

    let row = 0, col = 0
    const addRow = (label, val, color) => {
      const x = panelX + 14 + col * 180
      const y = panelY + 28 + row * 22
      this.add.text(x, y, label, { fontSize: '12px', color: color ?? '#ccccaa' })
      if (++col >= 2) { col = 0; row++ }
    }

    // 矿石
    const oreEntries = Object.entries(inv.ores)
    if (oreEntries.length === 0) {
      addRow('矿石：（去世界挖矿）', '', '#666688')
    } else {
      oreEntries.slice(0, 4).forEach(([k, v]) => addRow(`${k} ×${v}`, v, '#ddddaa'))
    }
    // 矿粉
    const pwdEntries = Object.entries(inv.powders)
    if (pwdEntries.length > 0) {
      col = 0; row = Math.max(row, 2)
      pwdEntries.slice(0, 4).forEach(([k, v]) => addRow(`${k} ×${v}`, v, '#ccbbaa'))
    }
    // 纯净矿粉
    const ppEntries = Object.entries(inv.purifiedPowders)
    if (ppEntries.length > 0) {
      col = 0; row = Math.max(row, 3)
      ppEntries.slice(0, 2).forEach(([k, v]) => addRow(`${k} ×${v}`, v, '#aaccaa'))
    }

    // 消耗品
    this.add.text(panelX + 14, panelY + 108,
      `净化剂 ×${inv.purifier}   炼金燃料 ×${inv.fuel}`,
      { fontSize: '12px', color: '#88ccaa' }
    )
  }

  // ── 机器面板 ──────────────────────────────────────────────────────────────
  _renderMachines() {
    const { _w: W, _h: H } = this
    const save = this.saveData
    const startX = 20, startY = 238

    this._sectionLabel(startX, startY - 20, '🏭 生产机器')

    MACHINE_DEF.forEach((def, i) => {
      const x  = startX + i * Math.floor((W - 40) / 3)
      const y  = startY
      const mw = Math.floor((W - 40) / 3) - 12
      const mh = 180
      const unlocked = save.baseLevel >= def.requiredLevel

      // 卡片背景
      const g = this.add.graphics()
      g.fillStyle(unlocked ? 0x111830 : 0x0a0f1a, 0.96)
      g.lineStyle(2, unlocked ? def.actionColor : 0x222233, 0.7)
      g.fillRoundedRect(x, y, mw, mh, 10)
      g.strokeRoundedRect(x, y, mw, mh, 10)

      // 机器名
      this.add.text(x + mw / 2, y + 22, def.name, {
        fontSize: '15px', color: unlocked ? '#ffffff' : '#444455',
        fontStyle: 'bold', stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5)

      // 描述
      this.add.text(x + mw / 2, y + 50, def.desc, {
        fontSize: '10px', color: unlocked ? '#9999bb' : '#333344',
        align: 'center', wordWrap: { width: mw - 16 },
      }).setOrigin(0.5)

      if (!unlocked) {
        this.add.text(x + mw / 2, y + 110, `🔒 需要基地 Lv.${def.requiredLevel}`, {
          fontSize: '12px', color: '#664444',
        }).setOrigin(0.5)
        return
      }

      // 进度条底槽
      const barX = x + 10, barY = y + 130, barW = mw - 20, barH = 10
      const barBg = this.add.graphics()
      barBg.fillStyle(0x222233, 1); barBg.fillRoundedRect(barX, barY, barW, barH, 5)

      // 进度条填充（动画用）
      const barFill = this.add.graphics()
      barFill.setVisible(false)

      // 操作按钮
      const btnY = y + mh - 28
      const btn = this.add.text(x + mw / 2, btnY, def.action, {
        fontSize: '13px', color: '#ffffff', fontStyle: 'bold',
        backgroundColor: '#' + def.actionColor.toString(16).padStart(6, '0'),
        padding: { x: 14, y: 6 },
      }).setOrigin(0.5).setInteractive()

      btn.on('pointerover', () => !this._machineState[def.id] && btn.setAlpha(0.8))
      btn.on('pointerout',  () => btn.setAlpha(1))
      btn.on('pointerdown', () => {
        if (this._machineState[def.id]) return
        this._runMachine(def, btn, barFill, barX, barY, barW, barH)
      })
    })
  }

  // ── 机器运行 + 进度动画 ───────────────────────────────────────────────────
  _runMachine(def, btn, barFill, barX, barY, barW, barH) {
    const result = this._validateMachine(def.id)
    if (!result.ok) { this._toast(result.msg, '#ff6644'); return }

    this._machineState[def.id] = true
    btn.setText('运行中…').setAlpha(0.5)

    // 进度条动画
    barFill.setVisible(true)
    const colHex = def.actionColor
    let progress = 0
    const step = 16
    const totalSteps = def.duration / step
    const timer = this.time.addEvent({
      delay: step,
      repeat: totalSteps,
      callback: () => {
        progress = Math.min(1, progress + 1 / totalSteps)
        barFill.clear()
        barFill.fillStyle(colHex, 0.85)
        barFill.fillRoundedRect(barX, barY, Math.floor(barW * progress), barH, 5)
        if (progress >= 1) {
          timer.remove()
          this._completeMachine(def, btn, barFill)
        }
      },
    })
  }

  _validateMachine(machineId) {
    const inv = this.saveData.inventory
    if (machineId === 'crusher') {
      return Object.keys(inv.ores).length > 0
        ? { ok: true }
        : { ok: false, msg: '没有矿石！先去世界地图挖矿' }
    }
    if (machineId === 'purifier') {
      if (Object.keys(inv.powders).length === 0)
        return { ok: false, msg: '没有矿粉！先使用搅碎机' }
      if ((inv.purifier ?? 0) < 1)
        return { ok: false, msg: '净化剂不足！（野外采集草药合成）' }
      return { ok: true }
    }
    if (machineId === 'furnace') {
      const hasPure = Object.keys(inv.purifiedPowders).length > 0
      const hasRaw  = Object.keys(inv.powders).length > 0
      if (!hasPure && !hasRaw) return { ok: false, msg: '没有矿粉！先粉碎矿石' }
      if ((inv.fuel ?? 0) < 1)  return { ok: false, msg: '炼金燃料不足！' }
      return { ok: true }
    }
    return { ok: false, msg: '未知机器' }
  }

  _completeMachine(def, btn, barFill) {
    const inv = this.saveData.inventory
    const isRunen = this.saveData.profession === 'runen'

    if (def.id === 'crusher') {
      let total = 0
      for (const [name, count] of Object.entries(inv.ores)) {
        const powder = name.replace('矿石', '矿粉').replace('矿脉', '矿粉') || (name + '粉')
        inv.powders[powder] = (inv.powders[powder] ?? 0) + Math.floor(count * 0.7)
        total += count
      }
      inv.ores = {}
      this._toast(`⚙️ 粉碎完成！${total} 块矿石 → 矿粉`, '#ffcc44')
    }

    else if (def.id === 'purifier') {
      const dur = isRunen ? 0.6 : 1  // 鲁恩 -40% 时间（此处作为品质加成，时间已在 duration 里）
      let total = 0
      for (const [name, count] of Object.entries(inv.powders)) {
        const pure = '纯净' + name
        inv.purifiedPowders[pure] = (inv.purifiedPowders[pure] ?? 0) + count
        total += count
      }
      inv.powders = {}
      inv.purifier = Math.max(0, inv.purifier - 1)
      this._toast(`🧪 提纯完成！${total} 份矿粉 → 纯净矿粉`, '#44ddff')
    }

    else if (def.id === 'furnace') {
      const hasPure = Object.keys(inv.purifiedPowders).length > 0
      inv.fuel = Math.max(0, inv.fuel - 1)

      if (hasPure) {
        const crystal = this._rollCrystal(false)
        this.saveData.crystals.push(crystal)
        inv.purifiedPowders = {}
        const m = GRADE_META[crystal.grade] ?? GRADE_META.green
        this._toast(`✨ 炼金成功！获得 ${m.label}`, m.color)
        getSound().craft()
      } else {
        // 跳过提纯 → 副作用
        const r = Math.random()
        const crystal = this._rollCrystal(true)
        if (r < 0.40) {
          crystal.sideEffects.push('light_corruption')
          this.saveData.crystals.push(crystal)
          inv.powders = {}
          this._toast('⚠️ 轻微污染！晶体数值 −15%，可用净化卷轴修复', '#ffaa44')
        } else if (r < 0.75) {
          crystal.sideEffects.push('medium_corrosion')
          this.saveData.crystals.push(crystal)
          inv.powders = {}
          this._toast('🟠 中度腐蚀！强化上限永久 −5 级，不可逆', '#ff7722')
        } else if (r < 0.95) {
          crystal.sideEffects.push('severe_distortion')
          this.saveData.crystals.push(crystal)
          inv.powders = {}
          this._toast('🔴 严重扭曲！晶体带随机负面被动', '#ff3333')
        } else {
          inv.powders = {}
          inv.fuel = Math.max(0, inv.fuel - 1)  // 额外燃料损耗
          this._toast('💀 炼制爆炸！炼金机损坏，材料全损！（记得先提纯！）', '#ff0000')
          this._shakeScreen()
        }
      }
    }

    this._save()
    barFill.clear().setVisible(false)
    btn.setText(def.action).setAlpha(1)
    this._machineState[def.id] = false
    // 刷新魔晶显示
    this._crystalContainer?.destroy()
    this._renderCrystals()
    this._renderInventoryRefresh()
  }

  _rollCrystal(corrupted) {
    const isRunen = this.saveData.profession === 'runen'
    const grades  = ['green','blue','purple','gold','red','rainbow']
    const weights = [0.50, 0.28, 0.15, 0.05, 0.015, 0.005]
    const r = Math.random()
    let cumul = 0, grade = 'green'
    for (let i = 0; i < grades.length; i++) {
      cumul += weights[i]
      if (r <= cumul) { grade = grades[i]; break }
    }
    // 鲁恩：炼金师品质+1阶
    if (isRunen && grade !== 'rainbow') {
      grade = grades[Math.min(5, grades.indexOf(grade) + 1)]
    }
    const elements = ['fire','ice','thunder','dark','holy','chaos']
    return {
      id: Date.now().toString(36),
      grade, element: elements[Math.floor(Math.random() * elements.length)],
      level: 1, corrupted, sideEffects: [],
    }
  }

  // ── 魔晶展示（宝石图形） ──────────────────────────────────────────────────
  _renderCrystals() {
    const { _w: W } = this
    const crystals = this.saveData.crystals
    const panelX = W * 0.5, panelY = 76, panelW = W * 0.48

    this._crystalContainer = this.add.container(0, 0)

    const bg = this.add.graphics()
    bg.fillStyle(0x0d1020, 0.96)
    bg.lineStyle(2, 0x443366, 0.7)
    bg.fillRoundedRect(panelX, panelY, panelW, 148, 10)
    bg.strokeRoundedRect(panelX, panelY, panelW, 148, 10)
    this._crystalContainer.add(bg)

    const title = this.add.text(panelX + 14, panelY + 14, '💎 魔晶库存', {
      fontSize: '13px', color: '#cc88ff', fontStyle: 'bold',
    })
    this._crystalContainer.add(title)

    if (crystals.length === 0) {
      const empty = this.add.text(panelX + panelW / 2, panelY + 80,
        '尚无魔晶，使用炼金机炼制', { fontSize: '12px', color: '#555566' }
      ).setOrigin(0.5)
      this._crystalContainer.add(empty)
      return
    }

    // 每颗魔晶画成宝石多边形
    const cols = 8, gem = 16
    crystals.slice(0, 32).forEach((c, i) => {
      const gx = panelX + 16 + (i % cols) * (gem + 6)
      const gy = panelY + 35 + Math.floor(i / cols) * (gem + 10)
      const m  = GRADE_META[c.grade] ?? GRADE_META.green
      const g  = this.add.graphics()
      // 宝石形状（六边形）
      const pts = []
      for (let k = 0; k < 6; k++) {
        const a = k * Math.PI / 3 - Math.PI / 6
        pts.push(gx + gem / 2 + Math.cos(a) * gem / 2, gy + gem / 2 + Math.sin(a) * gem / 2)
      }
      g.fillStyle(m.hex, c.corrupted ? 0.5 : 0.9)
      g.fillPoints(pts.reduce((arr, v, i2) => { if (i2 % 2 === 0) arr.push({ x: v, y: pts[i2+1] }); return arr }, []), true)
      g.lineStyle(1, m.glow, 0.8)
      g.strokePoints(pts.reduce((arr, v, i2) => { if (i2 % 2 === 0) arr.push({ x: v, y: pts[i2+1] }); return arr }, []), true)
      // 副作用污点
      if (c.sideEffects.length > 0) {
        g.fillStyle(0x000000, 0.5); g.fillCircle(gx + gem - 4, gy + 4, 3)
      }
      g.setInteractive(new Phaser.Geom.Rectangle(gx, gy, gem, gem), Phaser.Geom.Rectangle.Contains)
      const tip = `${m.label} · ${c.element}元素\nLv.${c.level}${c.sideEffects.length ? ' ⚠'+c.sideEffects[0] : ''}`
      g.on('pointerover', () => this._tooltip(gx, gy - 28, tip))
      g.on('pointerout',  () => this._clearTooltip())
      this._crystalContainer.add(g)
    })
    if (crystals.length > 32) {
      const more = this.add.text(panelX + panelW - 10, panelY + 140, `+${crystals.length - 32} 更多`, {
        fontSize: '10px', color: '#888899',
      }).setOrigin(1, 1)
      this._crystalContainer.add(more)
    }
  }

  // ── 基地升级面板 ──────────────────────────────────────────────────────────
  _renderUpgrade() {
    const { _w: W, _h: H } = this
    const save = this.saveData
    const lv   = save.baseLevel
    if (lv >= 5) return  // 满级

    const upDef = BASE_UPGRADES[lv]
    if (!upDef) return

    const panelX = 20, panelY = H - 80, panelW = W / 2 - 30

    const bg = this.add.graphics()
    bg.fillStyle(0x0d1a0d, 0.9)
    bg.lineStyle(2, 0x336633, 0.7)
    bg.fillRoundedRect(panelX, panelY, panelW, 54, 8)
    bg.strokeRoundedRect(panelX, panelY, panelW, 54, 8)

    this.add.text(panelX + 10, panelY + 10, `⬆ ${upDef.label}`, {
      fontSize: '12px', color: '#88cc88',
    })
    this.add.text(panelX + 10, panelY + 30, `消耗：${upDef.ore} ×${upDef.cost}`, {
      fontSize: '11px', color: '#aaaaaa',
    })

    const ores = save.inventory.ores
    const have = ores[upDef.ore] ?? 0

    const btn = this.add.text(panelX + panelW - 12, panelY + 27, have >= upDef.cost ? '升级 ▶' : `缺 ${upDef.ore} (${have}/${upDef.cost})`, {
      fontSize: '12px',
      color: have >= upDef.cost ? '#ffffff' : '#666677',
      backgroundColor: have >= upDef.cost ? '#225522' : '#1a1a2a',
      padding: { x: 8, y: 4 },
    }).setOrigin(1, 0.5)

    if (have >= upDef.cost) {
      btn.setInteractive()
      btn.on('pointerdown', () => {
        save.inventory.ores[upDef.ore] -= upDef.cost
        if (save.inventory.ores[upDef.ore] <= 0) delete save.inventory.ores[upDef.ore]
        save.baseLevel++
        this._save()
        this.scene.restart(save)
      })
    }
  }

  // ── 流程示意图 ────────────────────────────────────────────────────────────
  _renderFlowDiagram() {
    const { _w: W, _h: H } = this
    const y = H - 68
    this.add.text(W / 2, y, '📋 炼晶流程：  矿石  ➜  ⚙️搅碎机  ➜  🧪提纯槽  ➜  🔥炼金机  ➜  ✨魔晶', {
      fontSize: '12px', color: '#88cc88',
      backgroundColor: '#0a1a0a88', padding: { x: 12, y: 6 },
    }).setOrigin(0.5)
    this.add.text(W / 2, y + 30, '⚠️ 跳过提纯槽直接炼金 → 副作用：轻微污染 / 腐蚀 / 扭曲 / 爆炸（40%/35%/20%/5%）', {
      fontSize: '11px', color: '#cc7744',
      backgroundColor: '#1a0a0a88', padding: { x: 10, y: 5 },
    }).setOrigin(0.5)
  }

  // ── 共用 UI 原语 ──────────────────────────────────────────────────────────
  _panel(x, y, w, h, title) {
    const g = this.add.graphics()
    g.fillStyle(0x0d1020, 0.96)
    g.lineStyle(2, 0x334466, 0.7)
    g.fillRoundedRect(x, y, w, h, 10)
    g.strokeRoundedRect(x, y, w, h, 10)
    if (title) this.add.text(x + 12, y + 12, title, { fontSize: '13px', color: '#88aaff', fontStyle: 'bold' })
  }

  _sectionLabel(x, y, label) {
    this.add.text(x, y, label, { fontSize: '14px', color: '#88aaff', fontStyle: 'bold' })
  }

  _tooltip(x, y, text) {
    this._clearTooltip()
    this._tipObj = this.add.text(x, y, text, {
      fontSize: '11px', color: '#eeeeff', stroke: '#000', strokeThickness: 3,
      backgroundColor: '#00000099', padding: { x: 6, y: 4 }, align: 'center',
    }).setOrigin(0, 1).setDepth(200)
  }
  _clearTooltip() { this._tipObj?.destroy(); this._tipObj = null }

  _renderInventoryRefresh() {
    // 简单重启刷新（无需复杂脏检测）
    // NOTE: 为避免全场景重启的视觉跳动，此处仅更新文本
    // 完整重绘走 scene.restart(save)（大操作后自动调用）
  }

  _shakeScreen() {
    const cam = this.cameras.main
    cam.shake(600, 0.012)
  }

  _toast(msg, color = '#ffffff') {
    const { _w: W, _h: H } = this
    const toast = this.add.text(W / 2, H / 2, msg, {
      fontSize: '14px', color, fontStyle: 'bold',
      backgroundColor: '#00000099', padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setDepth(300)
    this.tweens.add({
      targets: toast, y: H / 2 - 50, alpha: 0,
      delay: 1800, duration: 900,
      onComplete: () => toast.destroy(),
    })
  }

  // ── M20: 存档码导出/导入 ──────────────────────────────────────────────
  _exportSave() {
    let code
    try {
      code = SaveSystem.exportCode(this)
    } catch (e) {
      this._toast('导出失败：' + e.message, '#ff6644'); return
    }
    // 尝试写入剪贴板
    let copied = false
    try {
      navigator.clipboard?.writeText(code)
      copied = true
    } catch (e) { /* 不支持时退回手动复制 */ }

    const { _w: W, _h: H } = this
    const overlay = this.add.container(0, 0).setDepth(400)
    const bg = this.add.rectangle(W / 2, H / 2, Math.min(680, W - 40), 240, 0x0a0a1a, 0.97)
      .setStrokeStyle(2, 0x55dd99)
    const title = this.add.text(W / 2, H / 2 - 92,
      copied ? '📤 存档码已复制到剪贴板' : '📤 存档码（请手动全选复制）', {
      fontSize: '15px', color: '#aaffcc', fontStyle: 'bold',
    }).setOrigin(0.5)
    // DOM 文本框便于选择复制
    const ta = document.createElement('textarea')
    ta.value = code
    ta.readOnly = true
    ta.style.cssText = 'width:600px;height:90px;font-size:11px;resize:none;background:#11112a;color:#9fe;border:1px solid #356;'
    const dom = this.add.dom(W / 2, H / 2 - 5, ta)
    ta.addEventListener('focus', () => ta.select())
    const closeBtn = this.add.text(W / 2, H / 2 + 88, '关闭', {
      fontSize: '14px', color: '#ffffff', backgroundColor: '#335577', padding: { x: 20, y: 7 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    closeBtn.on('pointerdown', () => overlay.destroy())
    overlay.add([bg, title, dom, closeBtn])
  }

  _importSave() {
    const code = window.prompt('粘贴存档码以导入（当前进度将被覆盖）：')
    if (!code) return
    let obj
    try {
      obj = SaveSystem.importCode(code)
    } catch (e) {
      this._toast('导入失败：' + e.message, '#ff6644'); return
    }
    this._toast('✅ 导入成功！正在重载存档…', '#55ff99')
    this.saveData = obj
    this.time.delayedCall(900, () => {
      this.scene.start('ProfessionSelectScene', { existingSave: obj })
    })
  }
}
