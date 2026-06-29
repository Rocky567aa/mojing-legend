/**
 * WeaponSystem.js — 武器装备 · 栏位 · 属性集成
 *
 * 职责：
 *   1. 管理玩家「当前装备」和「武器背包（最多8格）」
 *   2. 读取 HeroWeaponAssignment → 初始给英雄配发起始武器
 *   3. equip / unequip → 通知 CombatSystem 更新 atk / crit / spd
 *   4. 检查武器亲和度 → 亲和加成实时叠加
 *   5. 地面掉落武器（物品容器 + 玩家走到捡起）
 *   6. UI：右下角武器槽 + 8格背包面板
 *
 * 与 CombatSystem 的交互：
 *   combatSystem.baseAtk   — 英雄裸装基础攻击（init 时锁定）
 *   combatSystem.atk       — 实时 = baseAtk + weapon.atk + affinityBonus.physAtk
 *   combatSystem.crit      — 实时 = baseCrit + weapon.crit + affinityBonus.crit
 *   combatSystem.atkSpd    — 攻击速度系数（1.0 = 标准）
 */

import { HERO_WEAPON_CONFIG } from '../data/HeroWeaponAssignment.js'
import { WEAPONS } from '../data/WeaponData.js'
import { WEAPONS as WEAPONS_EXT } from '../data/WeaponData_Ext.js'

// 所有武器合并索引表
const ALL_WEAPONS = [...WEAPONS, ...WEAPONS_EXT]
const WEAPON_BY_ID = {}
for (const w of ALL_WEAPONS) WEAPON_BY_ID[w.id] = w

// 品质掉落权重（越低等级越容易掉）
const DROP_WEIGHT = {
  green:   40,
  blue:    25,
  purple:  15,
  gold:     8,
  red:      2,
  rainbow:  0.5,
}
const RARITY_ORDER = ['green', 'blue', 'purple', 'gold', 'red', 'rainbow']

// 品质颜色
const RARITY_COLOR = {
  green:   0x44cc44,
  blue:    0x4499ff,
  purple:  0xaa44ff,
  gold:    0xffcc00,
  red:     0xff2200,
  rainbow: 0xffffff,
}
const RARITY_TEXT = {
  green:   '#77ee77',
  blue:    '#88bbff',
  purple:  '#cc77ff',
  gold:    '#ffdd44',
  red:     '#ff6644',
  rainbow: '#ffffff',
}
const RARITY_LABEL = {
  green:   '凡晶',
  blue:    '灵晶',
  purple:  '魔晶',
  gold:    '神晶',
  red:     '皇晶',
  rainbow: '圣晶',
  legendary: '神话',
}

export class WeaponSystem {
  constructor(scene, combatSystem) {
    this.scene = scene
    this.combat = combatSystem

    this._heroId = null
    this._heroConfig = null     // 来自 HERO_WEAPON_CONFIG

    this.equipped = null        // 当前装备的武器对象
    this.inventory = []         // 背包：最多8格，weapon 对象数组

    // 地面掉落物
    this.groundDrops = []       // { wx, wy, weapon, container, glow }

    // UI
    this._panel = null
    this._slotBg = null
    this._slotIcon = null
    this._slotName = null
    this._slotAtk  = null
    this._bagSlots = []   // 8个背包格子

    this._bagOpen = false
  }

  // ────────────────────────────────────────────────────────────────────────
  //  初始化
  // ────────────────────────────────────────────────────────────────────────

  /**
   * 在 CombatSystem.init 后调用
   * @param {string} heroId  对应 HERO_WEAPON_CONFIG 中的 key（kain / vira / ...）
   */
  initHeroWeapon(heroId) {
    this._heroId = heroId
    this._heroConfig = HERO_WEAPON_CONFIG[heroId] ?? null

    if (!this._heroConfig) {
      console.warn(`[WeaponSystem] 未找到英雄武器配置: ${heroId}`)
      return
    }

    const sw = this._heroConfig.startingWeapon
    // 构造武器对象（补足属性）
    const weapon = {
      id:       `starting_${heroId}`,
      name:     sw.name,
      type:     'weapon',
      category: sw.type,
      rarity:   sw.rarity === 'common' ? 'green' : sw.rarity === 'uncommon' ? 'blue' : 'green',
      atk:      sw.atk,
      spd:      sw.spd ?? 1.0,
      crit:     sw.crit ?? 0.05,
      range:    sw.range ?? 1.5,
      aoe:      sw.aoe ?? 0,
      effect:   null,
      color:    RARITY_COLOR[sw.rarity === 'common' ? 'green' : sw.rarity === 'uncommon' ? 'blue' : 'green'],
      icon:     this._typeIcon(sw.type),
      desc:     sw.desc ?? '',
      isStartingWeapon: true,
    }
    this.equip(weapon, /* silent */ true)
  }

  // ────────────────────────────────────────────────────────────────────────
  //  装备 / 卸装
  // ────────────────────────────────────────────────────────────────────────

  equip(weapon, silent = false) {
    // 如果有当前装备，移入背包
    if (this.equipped && !silent) {
      this._pushBag(this.equipped)
    }
    this.equipped = weapon
    this._applyCombatStats()
    this.refreshUI()

    if (!silent) {
      this._showEquipNotif(weapon)
    }
  }

  unequip() {
    if (!this.equipped) return
    const prev = this.equipped
    this.equipped = null
    this._revertCombatStats()
    this._pushBag(prev)
    this.refreshUI()
  }

  /**
   * 拾取武器（地面掉落）
   * 若 ATK 高于当前装备则弹出提示；否则直接入包
   */
  pickup(weapon, dropObj) {
    // 清除地面物品
    if (dropObj) {
      dropObj.container?.destroy()
      this.groundDrops = this.groundDrops.filter(d => d !== dropObj)
    }

    const currentAtk = this.equipped?.atk ?? 0
    if (!this.equipped || weapon.atk > currentAtk) {
      // 自动装备更强武器（把旧的挤进背包）
      this.equip(weapon)
      this._showPickupMsg(weapon, true)
    } else {
      // 入背包
      if (this._pushBag(weapon)) {
        this._showPickupMsg(weapon, false)
        this.refreshUI()
      }
      // 背包满了就不拾取（提示）
      else {
        this._showBagFull(weapon)
      }
    }
  }

  _pushBag(weapon) {
    if (this.inventory.length >= 8) return false
    this.inventory.push(weapon)
    return true
  }

  // ────────────────────────────────────────────────────────────────────────
  //  战斗属性应用
  // ────────────────────────────────────────────────────────────────────────

  _applyCombatStats() {
    const c = this.combat
    if (!c) return
    const w = this.equipped
    if (!w) return

    // 亲和加成
    const bonus = this._getAffinityBonus(w.category)

    // atk = baseAtk + weaponAtk + 亲和physAtk
    c.atk = Math.round(c.baseAtk + w.atk + (bonus.physAtk ?? 0) * c.baseAtk)

    // crit = baseCrit + weaponCrit + 亲和crit
    c.crit = Math.min(0.95, (c.baseCrit ?? 0.10) + (w.crit ?? 0) + (bonus.crit ?? 0))

    // critMul += 亲和 critDmg
    c.critMul = (c.baseCritMul ?? 2.0) + (bonus.critDmg ?? 0)

    // 攻击速度
    c.atkSpd = w.spd ?? 1.0

    // 武器射程
    c.atkRange = w.range ?? 1.5
  }

  _revertCombatStats() {
    const c = this.combat
    if (!c) return
    c.atk     = c.baseAtk
    c.crit    = c.baseCrit ?? 0.10
    c.critMul = c.baseCritMul ?? 2.0
    c.atkSpd  = 1.0
    c.atkRange = 1.5
  }

  _getAffinityBonus(weaponCategory) {
    if (!this._heroConfig) return {}
    const affinity = this._heroConfig.weaponAffinity ?? []
    if (affinity.includes(weaponCategory)) {
      return this._heroConfig.affinityBonus ?? {}
    }
    return {}
  }

  // ────────────────────────────────────────────────────────────────────────
  //  武器掉落（由 CombatSystem._onKill 调用）
  // ────────────────────────────────────────────────────────────────────────

  /**
   * 根据玩家等级决定是否掉落武器，并在 wx/wy 处生成地面物品
   */
  rollWeaponDrop(level, sx, sy) {
    // 掉落概率随等级上升（5级以下5%，30级以上20%）
    const dropChance = Math.min(0.20, 0.05 + level * 0.005)
    if (Math.random() > dropChance) return

    // 根据等级决定品质上限
    const maxRarityIdx = Math.min(
      RARITY_ORDER.length - 1,
      Math.floor(level / 5)
    )

    // 加权随机选品质
    const pool = RARITY_ORDER.slice(0, maxRarityIdx + 1)
    const weights = pool.map(r => DROP_WEIGHT[r])
    const total = weights.reduce((a, b) => a + b, 0)
    let rand = Math.random() * total
    let rarity = pool[0]
    for (let i = 0; i < pool.length; i++) {
      rand -= weights[i]
      if (rand <= 0) { rarity = pool[i]; break }
    }

    // 随机选该品质的武器
    const candidates = ALL_WEAPONS.filter(w => w.rarity === rarity)
    if (!candidates.length) return
    const weapon = candidates[Math.floor(Math.random() * candidates.length)]

    // 在地面生成掉落物
    this._spawnGroundDrop(weapon, sx, sy)
  }

  _spawnGroundDrop(weapon, sx, sy) {
    const s = this.scene
    const wc = s.worldContainer

    const px = wc.x + sx
    const py = wc.y + sy - 12

    const col = weapon.color ?? RARITY_COLOR[weapon.rarity] ?? 0xffffff

    // 外发光环
    const glow = s.add.graphics().setDepth(99982).setScrollFactor(0)
    glow.lineStyle(2, col, 0.6)
    glow.strokeCircle(px, py, 14)

    // 武器图标
    const iconTxt = s.add.text(px, py, this._typeIcon(weapon.category), {
      fontSize: '18px',
    }).setOrigin(0.5).setDepth(99983).setScrollFactor(0)

    // 品质色文字
    const nameTxt = s.add.text(px, py + 16, weapon.name, {
      fontSize: '9px',
      color: RARITY_TEXT[weapon.rarity] ?? '#ffffff',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(99984).setScrollFactor(0)

    // 浮动动画
    s.tweens.add({
      targets: [iconTxt, nameTxt, glow],
      y: `+=6`,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    // 发光脉冲
    s.tweens.add({
      targets: glow,
      alpha: 0.2,
      duration: 700,
      yoyo: true,
      repeat: -1,
    })

    const dropObj = { weapon, container: null, sx, sy, iconTxt, nameTxt, glow }
    this.groundDrops.push(dropObj)
    return dropObj
  }

  // ────────────────────────────────────────────────────────────────────────
  //  碰撞拾取（每帧调用）
  // ────────────────────────────────────────────────────────────────────────

  checkPickups(playerSx, playerSy) {
    const PICK_RADIUS = 28
    for (let i = this.groundDrops.length - 1; i >= 0; i--) {
      const d = this.groundDrops[i]
      const dx = d.sx - playerSx
      const dy = d.sy - playerSy
      if (Math.sqrt(dx * dx + dy * dy) < PICK_RADIUS) {
        this._destroyDrop(d)
        this.pickup(d.weapon, null)
        this.groundDrops.splice(i, 1)
      }
    }
  }

  _destroyDrop(d) {
    d.iconTxt?.destroy()
    d.nameTxt?.destroy()
    d.glow?.destroy()
  }

  // ────────────────────────────────────────────────────────────────────────
  //  UI 构建
  // ────────────────────────────────────────────────────────────────────────

  buildUI(width, height) {
    const s = this.scene

    // ── 装备槽（右下角） ─────────────────────────────────────────────────
    const PW = 160, PH = 58
    const px = width - PW - 14
    const py = height - PH - 14

    // 面板背景
    this._panel = s.add.graphics()
    this._panel.fillStyle(0x0a0a1a, 0.88)
    this._panel.fillRoundedRect(px, py, PW, PH, 8)
    this._panel.lineStyle(1, 0x5533aa, 0.7)
    this._panel.strokeRoundedRect(px, py, PW, PH, 8)
    this._panel.setDepth(210).setScrollFactor(0)

    // 武器槽格子（左边36×36）
    const slotX = px + 8, slotY = py + 11
    this._slotBg = s.add.graphics()
    this._slotBg.fillStyle(0x1a1a2e, 0.9)
    this._slotBg.fillRoundedRect(slotX, slotY, 36, 36, 5)
    this._slotBg.lineStyle(1, 0x8855cc, 0.6)
    this._slotBg.strokeRoundedRect(slotX, slotY, 36, 36, 5)
    this._slotBg.setDepth(211).setScrollFactor(0)

    // 武器图标（emoji）
    this._slotIcon = s.add.text(slotX + 18, slotY + 18, '🗡️', {
      fontSize: '20px',
    }).setOrigin(0.5).setDepth(212).setScrollFactor(0)

    // 右侧文字区
    const tx = slotX + 44
    this._slotName = s.add.text(tx, py + 16, '未装备', {
      fontSize: '11px', color: '#aaaaaa',
      stroke: '#000000', strokeThickness: 2,
    }).setDepth(212).setScrollFactor(0)

    this._slotAtk = s.add.text(tx, py + 31, 'ATK —', {
      fontSize: '10px', color: '#ffcc66',
      stroke: '#000000', strokeThickness: 2,
    }).setDepth(212).setScrollFactor(0)

    this._slotRarity = s.add.text(tx, py + 44, '', {
      fontSize: '9px', color: '#888888',
    }).setDepth(212).setScrollFactor(0)

    // ── 切换背包按钮 ─────────────────────────────────────────────────────
    const btnX = px + PW - 20, btnY = py + 6
    this._bagBtn = s.add.text(btnX, btnY, '🎒', {
      fontSize: '14px',
    }).setOrigin(0.5, 0).setDepth(213).setScrollFactor(0)
      .setInteractive({ cursor: 'pointer' })
      .on('pointerdown', () => this._toggleBag())
      .on('pointerover', () => this._bagBtn.setAlpha(0.7))
      .on('pointerout', () => this._bagBtn.setAlpha(1))

    // ── 背包面板（默认隐藏） ─────────────────────────────────────────────
    this._buildBagPanel(px, py - 10)

    this._panelBounds = { x: px, y: py, w: PW, h: PH }
    this.refreshUI()
  }

  _buildBagPanel(px, anchorY) {
    const s = this.scene
    const COLS = 4, ROWS = 2
    const SZ = 38, GAP = 4
    const BPW = COLS * (SZ + GAP) + 8
    const BPH = ROWS * (SZ + GAP) + 30

    const bpx = px + 160 - BPW
    const bpy = anchorY - BPH

    this._bagPanel = s.add.graphics()
    this._bagPanel.fillStyle(0x08081a, 0.92)
    this._bagPanel.fillRoundedRect(bpx, bpy, BPW, BPH, 8)
    this._bagPanel.lineStyle(1, 0x8855cc, 0.6)
    this._bagPanel.strokeRoundedRect(bpx, bpy, BPW, BPH, 8)
    this._bagPanel.setDepth(215).setScrollFactor(0).setVisible(false)

    this._bagTitle = s.add.text(bpx + 8, bpy + 6, '🎒 背包', {
      fontSize: '10px', color: '#aa88ff',
    }).setDepth(216).setScrollFactor(0).setVisible(false)

    this._bagSlots = []
    for (let i = 0; i < 8; i++) {
      const col = i % COLS
      const row = Math.floor(i / COLS)
      const sx = bpx + 4 + col * (SZ + GAP)
      const sy = bpy + 22 + row * (SZ + GAP)

      const bg = s.add.graphics().setDepth(215).setScrollFactor(0).setVisible(false)
      bg.fillStyle(0x1a1a2e, 0.9)
      bg.fillRoundedRect(sx, sy, SZ, SZ, 4)
      bg.lineStyle(1, 0x443366, 0.7)
      bg.strokeRoundedRect(sx, sy, SZ, SZ, 4)

      const icon = s.add.text(sx + SZ / 2, sy + SZ / 2 - 4, '', {
        fontSize: '16px',
      }).setOrigin(0.5).setDepth(217).setScrollFactor(0).setVisible(false)

      const label = s.add.text(sx + SZ / 2, sy + SZ - 6, '', {
        fontSize: '8px', color: '#888888',
      }).setOrigin(0.5).setDepth(217).setScrollFactor(0).setVisible(false)

      // 点击背包格 → 装备该武器
      bg.setInteractive(
        new Phaser.Geom.Rectangle(sx, sy, SZ, SZ),
        Phaser.Geom.Rectangle.Contains
      )
      const idx = i
      bg.on('pointerdown', () => this._equipFromBag(idx))
        .on('pointerover', () => { bg.clear(); bg.fillStyle(0x2a2a4e, 0.9); bg.fillRoundedRect(sx, sy, SZ, SZ, 4) })
        .on('pointerout',  () => { bg.clear(); bg.fillStyle(0x1a1a2e, 0.9); bg.fillRoundedRect(sx, sy, SZ, SZ, 4) })

      this._bagSlots.push({ bg, icon, label, x: sx, y: sy, w: SZ, h: SZ })
    }

    this._bagPanelBounds = { x: bpx, y: bpy, w: BPW, h: BPH }
  }

  _toggleBag() {
    this._bagOpen = !this._bagOpen
    const visible = this._bagOpen
    this._bagPanel.setVisible(visible)
    this._bagTitle.setVisible(visible)
    for (const sl of this._bagSlots) {
      sl.bg.setVisible(visible)
      sl.icon.setVisible(visible)
      sl.label.setVisible(visible)
    }
    if (visible) this.refreshUI()
  }

  _equipFromBag(idx) {
    if (idx >= this.inventory.length) return
    const weapon = this.inventory.splice(idx, 1)[0]
    this.equip(weapon)
  }

  // ────────────────────────────────────────────────────────────────────────
  //  UI 刷新
  // ────────────────────────────────────────────────────────────────────────

  refreshUI() {
    if (!this._slotIcon) return

    const w = this.equipped
    if (w) {
      this._slotIcon.setText(this._typeIcon(w.category))
      this._slotName.setText(w.name).setStyle({ color: RARITY_TEXT[w.rarity] ?? '#ffffff' })
      this._slotAtk.setText(`ATK +${w.atk}`)
      const label = RARITY_LABEL[w.rarity] ?? ''
      const affinityActive = this._getAffinityBonus(w.category).physAtk != null
      this._slotRarity.setText(label + (affinityActive ? ' ✦亲和' : ''))
        .setStyle({ color: RARITY_TEXT[w.rarity] ?? '#888' })

      // 槽框颜色 = 品质色
      this._slotBg.clear()
      const col = w.color ?? RARITY_COLOR[w.rarity] ?? 0x8855cc
      this._slotBg.fillStyle(0x1a1a2e, 0.9)
      this._slotBg.fillRoundedRect(
        this._panelBounds.x + 8, this._panelBounds.y + 11, 36, 36, 5)
      this._slotBg.lineStyle(2, col, 0.9)
      this._slotBg.strokeRoundedRect(
        this._panelBounds.x + 8, this._panelBounds.y + 11, 36, 36, 5)
    } else {
      this._slotIcon.setText('🗡️')
      this._slotName.setText('未装备').setStyle({ color: '#666666' })
      this._slotAtk.setText('ATK —')
      this._slotRarity.setText('')

      this._slotBg.clear()
      this._slotBg.fillStyle(0x1a1a2e, 0.9)
      this._slotBg.fillRoundedRect(
        this._panelBounds.x + 8, this._panelBounds.y + 11, 36, 36, 5)
      this._slotBg.lineStyle(1, 0x8855cc, 0.6)
      this._slotBg.strokeRoundedRect(
        this._panelBounds.x + 8, this._panelBounds.y + 11, 36, 36, 5)
    }

    // 背包格刷新
    if (!this._bagOpen) return
    for (let i = 0; i < 8; i++) {
      const sl = this._bagSlots[i]
      const inv = this.inventory[i]
      if (inv) {
        sl.icon.setText(this._typeIcon(inv.category))
        sl.label.setText(inv.name.slice(0, 4)).setStyle({ color: RARITY_TEXT[inv.rarity] ?? '#888' })
        // 品质边框
        sl.bg.clear()
        sl.bg.fillStyle(0x1a1a2e, 0.9)
        sl.bg.fillRoundedRect(sl.x, sl.y, sl.w, sl.h, 4)
        sl.bg.lineStyle(1, RARITY_COLOR[inv.rarity] ?? 0x443366, 0.9)
        sl.bg.strokeRoundedRect(sl.x, sl.y, sl.w, sl.h, 4)
      } else {
        sl.icon.setText('')
        sl.label.setText('')
        sl.bg.clear()
        sl.bg.fillStyle(0x1a1a2e, 0.9)
        sl.bg.fillRoundedRect(sl.x, sl.y, sl.w, sl.h, 4)
        sl.bg.lineStyle(1, 0x443366, 0.5)
        sl.bg.strokeRoundedRect(sl.x, sl.y, sl.w, sl.h, 4)
      }
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  //  通知 / 提示
  // ────────────────────────────────────────────────────────────────────────

  _showEquipNotif(weapon) {
    const s = this.scene
    const { width } = s.scale
    const col = RARITY_TEXT[weapon.rarity] ?? '#ffffff'
    const icon = this._typeIcon(weapon.category)
    const line1 = s.add.text(width / 2, 80,
      `${icon} 已装备：${weapon.name}`, {
        fontSize: '14px', color: col, fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(500).setScrollFactor(0)

    const line2 = s.add.text(width / 2, 98,
      `ATK +${weapon.atk}   ${RARITY_LABEL[weapon.rarity] ?? ''}`, {
        fontSize: '11px', color: '#ffdd88',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(500).setScrollFactor(0)

    // 亲和提示
    const bonus = this._getAffinityBonus(weapon.category)
    if (bonus.physAtk) {
      const line3 = s.add.text(width / 2, 112,
        `✦ 武器亲和 — 物理攻击 +${Math.round(bonus.physAtk * 100)}%`, {
          fontSize: '10px', color: '#aaffaa',
          stroke: '#000000', strokeThickness: 2,
        }).setOrigin(0.5).setDepth(500).setScrollFactor(0)
      s.tweens.add({ targets: line3, y: '-=20', alpha: 0, duration: 2200, delay: 1000,
        onComplete: () => line3.destroy() })
    }

    s.tweens.add({ targets: [line1, line2], y: '-=20', alpha: 0, duration: 2200, delay: 1200,
      onComplete: () => { line1.destroy(); line2.destroy() } })
  }

  _showPickupMsg(weapon, autoEquipped) {
    const s = this.scene
    const { width } = s.scale
    const col = RARITY_TEXT[weapon.rarity] ?? '#aaaaaa'
    const msg = autoEquipped
      ? `⬆ 自动装备更强武器：${weapon.name}  ATK+${weapon.atk}`
      : `✦ 拾取：${weapon.name}  → 已入背包`
    const txt = s.add.text(width / 2, 70, msg, {
      fontSize: '11px', color: col,
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(499).setScrollFactor(0)
    s.tweens.add({ targets: txt, y: '-=18', alpha: 0, duration: 1800,
      onComplete: () => txt.destroy() })
  }

  _showBagFull(weapon) {
    const s = this.scene
    const { width } = s.scale
    const txt = s.add.text(width / 2, 70, `🎒 背包已满，无法拾取 ${weapon.name}`, {
      fontSize: '11px', color: '#ff8888',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(499).setScrollFactor(0)
    s.tweens.add({ targets: txt, y: '-=18', alpha: 0, duration: 1800,
      onComplete: () => txt.destroy() })
  }

  // ────────────────────────────────────────────────────────────────────────
  //  每帧更新
  // ────────────────────────────────────────────────────────────────────────

  update(playerSx, playerSy) {
    this.checkPickups(playerSx, playerSy)
  }

  // ────────────────────────────────────────────────────────────────────────
  //  工具
  // ────────────────────────────────────────────────────────────────────────

  _typeIcon(category) {
    const MAP = {
      sword:      '⚔️',
      staff:      '🪄',
      axe:        '🪓',
      bow:        '🏹',
      dagger:     '🗡️',
      hammer:     '🔨',
      spear:      '🔱',
      scythe:     '⚙️',
      gauntlets:  '🥊',
      greatsword: '⚔️',
      whip:       '〽️',
      crossbow:   '🏹',
      throwknife: '🗡️',
      orb:        '🔮',
      musket:     '🔫',
      scroll:     '📜',
    }
    return MAP[category] ?? '⚔️'
  }
}
