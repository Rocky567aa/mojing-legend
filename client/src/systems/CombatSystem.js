/**
 * CombatSystem — 战斗管理 (M11)
 * 职责：玩家属性、攻击计算、受伤处理、HP 显示、浮动数字
 *
 * M11 新增：
 *   - HeroMedicine 接入 → 英雄专属回血倍率 / 毒素抗性 / 炼金加成
 *   - 全 16 英雄 stats 统一走 HERO_DATA（已包含扩展英雄）
 *   - applyFood(item) / applyPoison(src, power) / alchemyBonus() 公开 API
 */
import { HERO_DATA } from '../data/HeroData.js'
import { HERO_MEDICINE } from '../data/HeroMedicine.js'
import { HeroSkillSystem } from '../systems/HeroSkillSystem.js'

export class CombatSystem {
  constructor(scene) {
    this.scene = scene
    this.hp = 100; this.maxHp = 100
    this.atk = 15; this.crit = 0.10; this.critMul = 2.0
    this.xp = 0; this.level = 1
    this.dead = false
    // Base stats (set in init, never modified by weapon equip)
    this.baseAtk = 15; this.baseCrit = 0.10; this.baseCritMul = 2.0
    // Weapon runtime modifiers
    this.atkSpd = 1.0       // attack speed multiplier
    this.atkRange = 1.5     // weapon reach in tiles
    // UI elements (created in buildUI)
    this.hpBar = null; this.hpBarFill = null; this.hpText = null
    this.xpBar = null; this.xpBarFill = null; this.levelText = null
    // Regen timer for 莉娜
    this._regenTimer = 0
    this._heroId = null
    // Weapon system reference (set externally after construction)
    this.weaponSystem = null
    // Medicine attributes (from HeroMedicine.js)
    this._med = null        // HERO_MEDICINE[heroId]
    // Active poison/debuff state
    this._poisonTimer = 0
    this._poisonDps   = 0   // raw dps before resist
  }

  init(professionId) {
    const hero = HERO_DATA[professionId] || HERO_DATA.kane
    const s = hero.stats
    this._heroId = hero.id
    this.maxHp = s.hp; this.hp = s.hp
    this.atk      = s.atk
    this.baseAtk  = s.atk    // locked — weapon equip reads this
    this.crit     = s.crit
    this.baseCrit = s.crit
    this.critMul    = s.critMul ?? 2.0
    this.baseCritMul = s.critMul ?? 2.0
    this.atkSpd  = 1.0
    this.atkRange = 1.5
    this.dead  = false
    this.xp = 0; this.level = 1
    this._xpToNext = 30
    // Load medicine attributes
    this._med = HERO_MEDICINE[hero.id] ?? HERO_MEDICINE['kane']
    this._poisonTimer = 0
    this._poisonDps   = 0

    // M14: 英雄技能引擎 — 创建后 init() 把被动 stat_mod 应用到上面的属性
    this.skillSystem = new HeroSkillSystem(this.scene, this)
    this.skillSystem.init(hero.id)
  }

  buildUI(width, height) {
    const s = this.scene
    const BAR_W = 160, BAR_H = 14
    const bx = 14, by = height - 50

    // ── HP ──────────────────────────────────────────────────────────────────
    // background
    this.hpBar = s.add.graphics()
    this.hpBar.fillStyle(0x1a0000, 0.9)
    this.hpBar.fillRoundedRect(bx - 2, by - 2, BAR_W + 4, BAR_H + 4, 4)
    this.hpBar.lineStyle(1, 0xff3300, 0.5)
    this.hpBar.strokeRoundedRect(bx - 2, by - 2, BAR_W + 4, BAR_H + 4, 4)
    this.hpBar.setDepth(210).setScrollFactor(0)

    this.hpBarFill = s.add.graphics()
    this.hpBarFill.setDepth(211).setScrollFactor(0)

    this.hpText = s.add.text(bx + BAR_W / 2, by + BAR_H / 2, '', {
      fontSize: '10px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(212).setScrollFactor(0)

    // ── XP ──────────────────────────────────────────────────────────────────
    const ex = bx, ey = by + BAR_H + 5, EW = BAR_W, EH = 6
    this.xpBar = s.add.graphics()
    this.xpBar.fillStyle(0x000a1a, 0.9)
    this.xpBar.fillRect(ex, ey, EW, EH)
    this.xpBar.setDepth(210).setScrollFactor(0)

    this.xpBarFill = s.add.graphics()
    this.xpBarFill.setDepth(211).setScrollFactor(0)
    this._xpBarBounds = { x: ex, y: ey, w: EW, h: EH }

    this.levelText = s.add.text(bx, by - 16, '', {
      fontSize: '11px', color: '#aaddff',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0, 1).setDepth(212).setScrollFactor(0)

    this._barBounds = { x: bx, y: by, w: BAR_W, h: BAR_H }
    this.refreshUI()

    // M14: 主动技能图标 + 冷却环
    this.skillSystem?.buildUI(width, height)
  }

  /** M14: 释放当前英雄主动技能（WorldScene 空格键触发） */
  castSkill() {
    this.skillSystem?.castActive()
  }

  refreshUI() {
    const { x, y, w, h } = this._barBounds
    const ratio = Math.max(0, this.hp / this.maxHp)
    const col = ratio > 0.5 ? 0x22cc44 : ratio > 0.25 ? 0xffaa00 : 0xff2200

    this.hpBarFill.clear()
    this.hpBarFill.fillStyle(col, 0.95)
    this.hpBarFill.fillRoundedRect(x, y, Math.max(2, w * ratio), h, 3)

    this.hpText.setText(`♥  ${this.hp} / ${this.maxHp}`)

    // XP bar
    const { x: ex, y: ey, w: ew, h: eh } = this._xpBarBounds
    const xpRatio = this.xp / this._xpToNext
    this.xpBarFill.clear()
    this.xpBarFill.fillStyle(0x4499ff, 0.85)
    this.xpBarFill.fillRect(ex, ey, ew * Math.min(1, xpRatio), eh)

    this.levelText.setText(`Lv.${this.level}`)
  }

  // ── Player → Monster ─────────────────────────────────────────────────────
  attack(monster) {
    if (this.dead) return null
    // M14: 被动修正出手攻击力 + 暴击率（低血狂暴/叠层/猎鹰标记）
    const effAtk  = this.skillSystem?.modifyOutgoingAtk(this.atk, monster) ?? this.atk
    const effCrit = this.skillSystem?.modifyCrit(this.crit, monster) ?? this.crit
    const isCrit = Math.random() < effCrit
    const base = effAtk * (0.85 + Math.random() * 0.30)
    const dmg = Math.round(isCrit ? base * this.critMul : base)
    const dead = monster.type && this.scene.monsterSystem?.damage(monster, dmg)
    this._showFloat(monster.sx, monster.sy, dmg, isCrit)
    this.scene.sfx?.hit()
    // M14: 命中钩子（燃烧/冰冻/叠层/标记）
    this.skillSystem?.onAttack(monster, { dmg, isCrit })
    if (dead) this._onKill(monster)
    return { dmg, isCrit, killed: dead }
  }

  _onKill(m) {
    // ── 怪物死亡特效 ─────────────────────────────────────────────────────
    this._showMonsterDeath(m.sx, m.sy, m.type?.color ?? 0xff4400)
    this.scene.sfx?.monsterDeath()

    const xpGain = m.type?.xp ?? 5
    this.xp += xpGain
    while (this.xp >= this._xpToNext) {
      this.xp -= this._xpToNext
      this.level++
      this._xpToNext = Math.round(this._xpToNext * 1.45)
      this.atk      = Math.round(this.atk * 1.12)
      this.baseAtk  = Math.round(this.baseAtk * 1.12)  // level up grows base too
      this.maxHp = Math.round(this.maxHp * 1.08)
      this.hp = Math.min(this.hp + 20, this.maxHp)
      this._showLevelUp()
      this.scene.sfx?.levelUp()
      // 升级后重新应用武器加成
      if (this.weaponSystem?.equipped) {
        this.weaponSystem._applyCombatStats()
        this.weaponSystem.refreshUI()
      }
    }
    this.refreshUI()
    // ── 武器掉落 ────────────────────────────────────────────────────────
    if (this.weaponSystem) {
      this.weaponSystem.rollWeaponDrop(this.level, m.sx, m.sy)
    }
    // ── 物品掉落 ─────────────────────────────────────────────────────────
    const drops = m.type?.drops ?? []
    for (const d of drops) {
      if (Math.random() < d.chance) {
        const cnt = Array.isArray(d.count)
          ? Phaser.Math.Between(d.count[0], d.count[1]) : d.count
        this._showLoot(m.sx, m.sy, d.itemName, d.color, cnt)
        // Save to inventory
        if (this.scene.saveData) {
          if (!this.scene.saveData.inventory) this.scene.saveData.inventory = { ores: {} }
          if (!this.scene.saveData.inventory.ores) this.scene.saveData.inventory.ores = {}
          this.scene.saveData.inventory.ores[d.item] =
            (this.scene.saveData.inventory.ores[d.item] || 0) + cnt
          localStorage.setItem('mojing_save', JSON.stringify(this.scene.saveData))
        }
        if (this.scene.pickupNotif) this.scene.pickupNotif.show(d.item, cnt)
      }
    }
    // M14: 击杀钩子（吸血/召唤/自动药剂）
    this.skillSystem?.onKill(m)
  }

  // ── Monster → Player ─────────────────────────────────────────────────────
  takeDamage(dmg) {
    if (this.dead) return
    // M14: 被动减伤（kane 钢铁之躯 / roal 圣盾 / 限时护盾）经技能引擎统一处理
    let reduced = this.skillSystem?.modifyIncomingDamage(dmg) ?? dmg
    // physDef multiplier from FoodSystem (def_up buff)
    const physDefMul = this.scene.foodSystem?.physDefMul ?? 1.0
    reduced = Math.round(reduced / physDefMul)
    this.hp = Math.max(0, this.hp - reduced)
    this.refreshUI()
    this.scene.sfx?.hurt()

    // Flash red on player graphic
    const pg = this.scene.playerGraphic
    if (pg) {
      this.scene.tweens.add({ targets: pg, alpha: 0.2, duration: 100, yoyo: true })
    }

    if (this.hp <= 0 && !this.dead) this._onDeath()
  }

  _onDeath() {
    this.dead = true
    const s = this.scene
    s.sfx?.playerDeath()
    s.cameras.main.shake(600, 0.025)

    const { width, height } = s.scale

    // ── 玩家死亡粒子爆炸 ─────────────────────────────────────────────────
    const px = width / 2, py = height / 2 - 40
    for (let i = 0; i < 18; i++) {
      const angle = (Math.PI * 2 / 18) * i + Math.random() * 0.3
      const speed = 50 + Math.random() * 80
      const dot = s.add.graphics().setDepth(510).setScrollFactor(0)
      const col = [0xff2200, 0xff6600, 0xffaa00, 0xffffff][Math.floor(Math.random() * 4)]
      dot.fillStyle(col, 0.9)
      dot.fillCircle(px, py, 4 + Math.random() * 4)
      s.tweens.add({
        targets: dot,
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
        alpha: 0,
        scaleX: 0.1, scaleY: 0.1,
        duration: 700 + Math.random() * 400,
        ease: 'Power2',
        onComplete: () => dot.destroy(),
      })
    }

    // ── 爆闪光环 ─────────────────────────────────────────────────────────
    const burst = s.add.graphics().setDepth(511).setScrollFactor(0)
    burst.lineStyle(3, 0xff3300, 1)
    burst.strokeCircle(px, py, 20)
    s.tweens.add({ targets: burst, alpha: 0, scaleX: 4, scaleY: 4, duration: 500,
      onComplete: () => burst.destroy() })

    // ── 死亡红屏 ─────────────────────────────────────────────────────────
    const overlay = s.add.graphics().setDepth(508).setScrollFactor(0)
    overlay.fillStyle(0x880000, 0)
    overlay.fillRect(0, 0, width, height)
    s.tweens.add({ targets: overlay, alpha: 0.65, duration: 500 })

    const deathTxt = s.add.text(width/2, height/2 - 30, '⚔ 你已阵亡', {
      fontSize: '28px', color: '#ff4444',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(512).setScrollFactor(0)
    const reviveTxt = s.add.text(width/2, height/2 + 12, '3 秒后复活...', {
      fontSize: '14px', color: '#ffaaaa',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(512).setScrollFactor(0)

    s.time.delayedCall(3000, () => {
      this.hp = Math.round(this.maxHp * 0.4)
      this.dead = false
      this.refreshUI()
      s.tweens.add({ targets: overlay, alpha: 0, duration: 800,
        onComplete: () => overlay.destroy() })
      deathTxt.destroy()
      reviveTxt.destroy()
    })
  }

  // ── Regen (Lena passive) ─────────────────────────────────────────────────
  update(delta) {
    if (this.dead) return
    // M14: 英雄技能引擎每帧更新（回血/护盾倒计时/叠层/CD/召唤物）
    this.skillSystem?.onTick(delta)
    // 中毒 tick（来自有毒蘑菇 / 植物 / 怪物攻击）
    if (this._poisonTimer > 0) {
      this._poisonTimer -= delta
      const resist = this._med?.poisonResist ?? 0.30
      const dps    = this._poisonDps * (1 - resist)
      const dmg    = Math.round(dps * delta / 1000)
      if (dmg > 0) {
        this.hp = Math.max(1, this.hp - dmg)
        this.refreshUI()
        // 显示绿色毒伤数字（小号）
        const s = this.scene
        const { width, height } = s.scale
        const txt = s.add.text(width / 2 + 20, height / 2 - 30, `☠ -${dmg}`, {
          fontSize: '10px', color: '#44ff88',
          stroke: '#000000', strokeThickness: 2,
        }).setOrigin(0.5).setDepth(498).setScrollFactor(0)
        s.tweens.add({ targets: txt, y: '-=14', alpha: 0, duration: 900,
          onComplete: () => txt.destroy() })
      }
      if (this._poisonTimer <= 0) {
        this._poisonDps = 0
        this._showStatusEnd('中毒', '#44ff88')
      }
    }

    // ── M22: 出血 DoT ───────────────────────────────────────────────────────
    if ((this._bleedTimer ?? 0) > 0) {
      this._bleedTimer -= delta
      this._bleedTick = (this._bleedTick ?? 0) + delta
      if (this._bleedTick >= 500) {
        this._bleedTick = 0
        const d = Math.max(1, Math.round((this._bleedDps ?? 0) * 0.5))
        this.hp = Math.max(0, this.hp - d)
        this.refreshUI()
        const s = this.scene
        const { width, height } = s.scale
        const txt = s.add.text(width / 2 - 20, height / 2 - 30, `🩸 -${d}`, {
          fontSize: '10px', color: '#ff6666',
          stroke: '#000000', strokeThickness: 2,
        }).setOrigin(0.5).setDepth(498).setScrollFactor(0)
        s.tweens.add({ targets: txt, y: '-=14', alpha: 0, duration: 900,
          onComplete: () => txt.destroy() })
        if (this.hp <= 0 && !this.dead) this._onDeath()
      }
      if (this._bleedTimer <= 0) { this._bleedDps = 0; this._showStatusEnd('出血', '#ff4444') }
    }
  }

  // ── Medicine / Food API ───────────────────────────────────────────────────

  /**
   * 玩家食用食物或药水时调用。
   * @param {{ healPct: number, poisonDps?: number, poisonDur?: number }} item
   */
  applyFood(item) {
    if (this.dead) return
    const m = this._med ?? {}

    if (item.healPct > 0) {
      const mul   = m.potionHeal ?? 1.0
      const healed = Math.round(this.maxHp * item.healPct * mul)
      this.hp = Math.min(this.maxHp, this.hp + healed)
      this.refreshUI()
      this._showHeal(healed)
    }

    if (item.poisonDps > 0) {
      // 中毒：有中毒攻击（毒素植物/毒蘑菇）时用该 hero 的 poisonResist
      const resist = m.poisonResist ?? 0.30
      const dur    = (item.poisonDur ?? 5) * 1000
      this._poisonDps   = item.poisonDps
      this._poisonTimer = dur
      this._showStatusStart(`☠ 中毒 (${item.poisonDur ?? 5}s)`, '#44ff88')
    }
  }

  /**
   * 怪物/环境造成中毒时调用（流沙、毒雾等）
   * @param {number} dps   每秒毒伤（原始值，抗性在 update 内扣除）
   * @param {number} dur   持续时间（秒）
   */
  applyPoison(dps, dur = 5) {
    if (this.dead) return
    // 叠加取最大值
    this._poisonDps   = Math.max(this._poisonDps, dps)
    this._poisonTimer = Math.max(this._poisonTimer, dur * 1000)
    this._showStatusStart(`☠ 中毒 (${dur}s)`, '#44ff88')
  }

  /** M22: 出血（无视抗性，直接 DoT） */
  applyBleed(dps, dur = 3) {
    if (this.dead) return
    this._bleedDps   = Math.max(this._bleedDps ?? 0, dps)
    this._bleedTimer = Math.max(this._bleedTimer ?? 0, dur * 1000)
    this._showStatusStart(`🩸 出血 (${dur}s)`, '#ff4444')
  }

  /**
   * 返回当前英雄的炼金加成系数（供 AlchemySystem 使用）
   */
  get alchemyBonus() {
    return this._med?.alchemyBonus ?? 0
  }

  /**
   * 返回当前英雄的治疗技能系数（供技能系统使用）
   */
  get healingSkill() {
    return this._med?.healingSkill ?? 1.0
  }

  _showHeal(hp) {
    const s = this.scene
    const { width, height } = s.scale
    const txt = s.add.text(width / 2, height / 2 - 40, `♥ +${hp}`, {
      fontSize: '14px', color: '#ff88aa', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(499).setScrollFactor(0)
    s.tweens.add({ targets: txt, y: '-=30', alpha: 0, duration: 1400, ease: 'Power2',
      onComplete: () => txt.destroy() })
  }

  _showStatusStart(label, color) {
    const s = this.scene
    const { width } = s.scale
    const txt = s.add.text(width / 2, 60, label, {
      fontSize: '12px', color,
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(499).setScrollFactor(0)
    s.tweens.add({ targets: txt, y: '-=20', alpha: 0, duration: 1800,
      onComplete: () => txt.destroy() })
  }

  _showStatusEnd(label, color) {
    const s = this.scene
    const { width } = s.scale
    const txt = s.add.text(width / 2, 60, `✓ ${label}已解除`, {
      fontSize: '10px', color,
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(499).setScrollFactor(0)
    s.tweens.add({ targets: txt, y: '-=16', alpha: 0, duration: 1200,
      onComplete: () => txt.destroy() })
  }

  // ── Monster death FX ────────────────────────────────────────────────────
  _showMonsterDeath(sx, sy, color) {
    const s = this.scene
    const wc = s.worldContainer
    const px = wc.x + sx, py = wc.y + sy

    // 粒子爆炸（12 颗，带主色调）
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i
      const speed = 30 + Math.random() * 50
      const dot = s.add.graphics().setDepth(99990).setScrollFactor(0)
      dot.fillStyle(color, 0.95)
      dot.fillCircle(px, py, 3 + Math.random() * 3)
      s.tweens.add({
        targets: dot,
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed - 10,
        alpha: 0,
        scaleX: 0.2, scaleY: 0.2,
        duration: 500 + Math.random() * 300,
        ease: 'Power2',
        onComplete: () => dot.destroy(),
      })
    }

    // 爆炸光环（双圆）
    for (const [r, col] of [[22, color], [38, 0xffffff]]) {
      const ring = s.add.graphics().setDepth(99989).setScrollFactor(0)
      ring.lineStyle(2, col, 0.85)
      ring.strokeCircle(px, py, r)
      s.tweens.add({
        targets: ring, alpha: 0, scaleX: 2.2, scaleY: 2.2,
        duration: 400, ease: 'Power3',
        onComplete: () => ring.destroy(),
      })
    }

    // 消散竖烟（3条上升粒子）
    for (let k = 0; k < 3; k++) {
      const smoke = s.add.graphics().setDepth(99988).setScrollFactor(0)
      smoke.fillStyle(color, 0.45)
      smoke.fillCircle(px + (k-1)*10, py, 5 + k*2)
      s.tweens.add({
        targets: smoke,
        y: py - 40 - k * 15,
        alpha: 0,
        scaleX: 2, scaleY: 2,
        duration: 700 + k * 150,
        ease: 'Sine.easeOut',
        onComplete: () => smoke.destroy(),
      })
    }

    // "消灭" 浮字
    const col = '#' + color.toString(16).padStart(6, '0')
    const txt = s.add.text(px, py - 14, '✦ 击杀!', {
      fontSize: '12px', color: col, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(99991).setScrollFactor(0)
    s.tweens.add({
      targets: txt, y: py - 55, alpha: 0,
      duration: 1200, ease: 'Power2',
      onComplete: () => txt.destroy(),
    })
  }

  // ── Floating text ────────────────────────────────────────────────────────
  _showFloat(sx, sy, dmg, isCrit) {
    const s = this.scene
    const wc = s.worldContainer
    const px = wc.x + sx, py = wc.y + sy - 10
    const col = isCrit ? '#ff4400' : '#ffdd44'
    const size = isCrit ? '17px' : '13px'
    const txt = s.add.text(px, py, isCrit ? `💥 ${dmg}!` : `-${dmg}`, {
      fontSize: size, color: col,
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(99998).setScrollFactor(0)
    s.tweens.add({
      targets: txt, y: py - 55, alpha: 0, duration: 1400, ease: 'Power2',
      onComplete: () => txt.destroy(),
    })
    if (isCrit) {
      const burst = s.add.graphics().setDepth(99997).setScrollFactor(0)
      burst.lineStyle(2, 0xff4400, 0.9); burst.strokeCircle(px, py, 16)
      s.tweens.add({ targets: burst, alpha: 0, scaleX: 2.5, scaleY: 2.5,
        duration: 400, onComplete: () => burst.destroy() })
    }
  }

  _showLoot(sx, sy, name, color, cnt) {
    const s = this.scene
    const wc = s.worldContainer
    const px = wc.x + sx, py = wc.y + sy - 25
    const hex = '#' + color.toString(16).padStart(6, '0')
    const txt = s.add.text(px, py, `✦ ${name} ×${cnt}`, {
      fontSize: '11px', color: hex, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(99997).setScrollFactor(0)
    s.tweens.add({ targets: txt, y: py - 45, alpha: 0, duration: 1800, ease: 'Power2',
      onComplete: () => txt.destroy() })
  }

  _showLevelUp() {
    const s = this.scene
    const { width, height } = s.scale
    const txt = s.add.text(width/2, height/2 - 70, `⬆ LEVEL UP  Lv.${this.level}`, {
      fontSize: '22px', color: '#ffff44',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(500).setScrollFactor(0)
    s.tweens.add({ targets: txt, y: height/2 - 130, alpha: 0, duration: 2000, ease: 'Power2',
      onComplete: () => txt.destroy() })
  }
}
