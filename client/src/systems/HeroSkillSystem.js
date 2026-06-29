/**
 * HeroSkillSystem.js — 英雄技能引擎 (M14)
 *
 * 解释执行 HeroSkills.js 的带类型技能数据：
 *   1. init()         — 读取英雄技能，把 stat_mod 类被动一次性应用到 CombatSystem，
 *                       其余被动注册为运行期钩子
 *   2. 战斗钩子        — CombatSystem 在关键时刻回调：
 *        onAttack(target, dmgInfo)  攻击命中 → 燃烧/冰冻/叠层/标记
 *        onKill(target)             击杀     → 吸血/召唤/自动药剂
 *        modifyIncomingDamage(dmg)  受击     → 减伤/条件减伤/护盾
 *        modifyOutgoingAtk(baseAtk, target) 出手 → 低血狂暴/叠层/标记暴击
 *        onTick(delta)              每帧     → 回血/护盾倒计时/叠层过期
 *   3. castActive()   — 主动技能（空格触发）：判 CD → 执行 cast → 进 CD → UI 反馈
 *   4. buildUI()      — 屏幕右下角技能图标 + 冷却遮罩
 *
 * 设计原则：CombatSystem 不再硬编码任何单英雄特例（kane 减伤 / lena 回血已迁移到此）。
 */

import { getHeroSkills } from '../data/HeroSkills.js'

export class HeroSkillSystem {
  constructor(scene, combatSystem) {
    this.scene = scene
    this.combat = combatSystem
    this.heroId = null
    this.skills = null

    // 运行期状态
    this._regenTimer = 0
    this._shieldPct = 0
    this._shieldTimer = 0
    this._buffs = []          // { stat, mul, timer, _applied }
    this._hitStacks = 0
    this._hitStackTimer = 0
    this._lastTarget = null
    this._marks = new Map()   // monsterId → expireAt(ms 倒计时)
    this._killCount = 0
    this._summons = []        // { gfx, hp, atk, timer }

    // 主动 CD
    this._cd = 0
    this._cdMax = 0
  }

  init(heroId) {
    this.heroId = heroId
    this.skills = getHeroSkills(heroId)
    this._cdMax = this.skills.active?.cooldown ?? 8000
    this._cd = 0

    // 一次性 stat_mod 被动
    for (const eff of this.skills.passive?.effects ?? []) {
      if (eff.type === 'stat_mod') this._applyStatMod(eff)
    }
  }

  _applyStatMod(eff) {
    const c = this.combat
    switch (eff.stat) {
      case 'maxHp':
        c.maxHp = Math.round(c.maxHp * (eff.mul ?? 1) + (eff.add ?? 0))
        c.hp = c.maxHp
        break
      case 'atk':
        c.atk = Math.round(c.atk * (eff.mul ?? 1) + (eff.add ?? 0))
        c.baseAtk = Math.round(c.baseAtk * (eff.mul ?? 1) + (eff.add ?? 0))
        break
      case 'crit':      c.crit += (eff.add ?? 0); c.crit *= (eff.mul ?? 1); break
      case 'critMul':   c.critMul *= (eff.mul ?? 1); break
      case 'atkRange':  c.atkRange = (c.atkRange ?? 1.5) + (eff.add ?? 0); break
      case 'moveSpeed':
        // 移速以缩短移动间隔表示（间隔越小越快）
        this.moveSpeedMul = (this.moveSpeedMul ?? 1) * (eff.mul ?? 1)
        break
    }
  }

  // ── 出手攻击力修正（动态被动） ─────────────────────────────────────────
  modifyOutgoingAtk(baseAtk, target) {
    let atk = baseAtk
    for (const eff of this.skills.passive?.effects ?? []) {
      if (eff.type === 'low_hp_atk') {
        const lost = 1 - this.combat.hp / this.combat.maxHp
        atk *= 1 + eff.maxBonus * lost
      }
      if (eff.type === 'hit_stack_atk') {
        atk *= 1 + this._hitStacks * eff.perStack
      }
    }
    return Math.round(atk)
  }

  // ── 暴击率修正（猎鹰标记） ─────────────────────────────────────────────
  modifyCrit(baseCrit, target) {
    let crit = baseCrit
    for (const eff of this.skills.passive?.effects ?? []) {
      if (eff.type === 'mark_crit' && target && this._marks.has(target.id)) {
        crit += eff.bonus
      }
    }
    return crit
  }

  // ── 攻击命中钩子 ───────────────────────────────────────────────────────
  onAttack(target, dmgInfo) {
    for (const eff of this.skills.passive?.effects ?? []) {
      switch (eff.type) {
        case 'burn_on_hit':
          this.scene.monsterSystem?.applyStatus?.(target, 'burn', eff.dps, eff.dur)
          break
        case 'freeze_on_hit':
          if (Math.random() < eff.chance)
            this.scene.monsterSystem?.applyStatus?.(target, 'freeze', 0, eff.dur / 1000)
          break
        case 'hit_stack_atk':
          if (this._lastTarget === target.id) {
            this._hitStacks = Math.min(eff.maxStacks, this._hitStacks + 1)
          } else {
            this._hitStacks = 1
            this._lastTarget = target.id
          }
          this._hitStackTimer = eff.window
          break
        case 'mark_crit':
          this._marks.set(target.id, eff.dur)
          break
      }
    }
  }

  // ── 击杀钩子 ───────────────────────────────────────────────────────────
  onKill(target) {
    for (const eff of this.skills.passive?.effects ?? []) {
      switch (eff.type) {
        case 'lifesteal_on_kill': {
          const heal = Math.round(this.combat.maxHp * eff.pct)
          this.combat.hp = Math.min(this.combat.maxHp, this.combat.hp + heal)
          this.combat.refreshUI()
          break
        }
        case 'summon_on_kill':
          if (Math.random() < eff.chance) this._spawnSummon(eff.dur, target.sx, target.sy)
          break
        case 'auto_potion_on_kill':
          if (++this._killCount >= eff.every) {
            this._killCount = 0
            this.combat.hp = Math.min(this.combat.maxHp, this.combat.hp + Math.round(this.combat.maxHp * 0.15))
            this.combat.refreshUI()
            this._floatText('⚗ 自动药剂', '#aaff44')
          }
          break
      }
    }
  }

  // ── 受击伤害修正 ───────────────────────────────────────────────────────
  modifyIncomingDamage(dmg) {
    let d = dmg
    // 限时护盾
    if (this._shieldTimer > 0) d *= 1 - this._shieldPct
    // 被动减伤
    for (const eff of this.skills.passive?.effects ?? []) {
      if (eff.type === 'damage_reduction') d *= 1 - eff.pct
      if (eff.type === 'conditional_dr' && this.combat.hp / this.combat.maxHp >= eff.hpAbove)
        d *= 1 - eff.pct
    }
    return Math.max(1, Math.round(d))
  }

  // ── 每帧更新 ───────────────────────────────────────────────────────────
  onTick(delta) {
    // 主动 CD
    if (this._cd > 0) this._cd = Math.max(0, this._cd - delta)
    // 被动回血
    for (const eff of this.skills.passive?.effects ?? []) {
      if (eff.type === 'regen') {
        this._regenTimer += delta
        if (this._regenTimer >= eff.interval) {
          this._regenTimer = 0
          this.combat.hp = Math.min(this.combat.maxHp, this.combat.hp + eff.amount)
          this.combat.refreshUI()
        }
      }
    }
    // 护盾倒计时
    if (this._shieldTimer > 0) this._shieldTimer -= delta
    // 叠层过期
    if (this._hitStackTimer > 0) {
      this._hitStackTimer -= delta
      if (this._hitStackTimer <= 0) { this._hitStacks = 0; this._lastTarget = null }
    }
    // 标记过期
    for (const [id, t] of this._marks) {
      const nt = t - delta
      if (nt <= 0) this._marks.delete(id); else this._marks.set(id, nt)
    }
    // 限时增益过期
    for (let i = this._buffs.length - 1; i >= 0; i--) {
      this._buffs[i].timer -= delta
      if (this._buffs[i].timer <= 0) this._revertBuff(this._buffs.splice(i, 1)[0])
    }
    // 召唤物存活倒计时
    for (let i = this._summons.length - 1; i >= 0; i--) {
      this._summons[i].timer -= delta
      if (this._summons[i].timer <= 0) {
        this._summons[i].gfx?.destroy()
        this._summons.splice(i, 1)
      }
    }
    this._refreshCdUI()
  }

  // ── 主动技能释放 ───────────────────────────────────────────────────────
  castActive() {
    if (this.combat.dead) return
    if (this._cd > 0) { this._floatText('技能冷却中', '#ff8888'); return }
    const a = this.skills.active
    if (!a) return
    this._execCast(a.cast, a.name)
    this.scene.sfx?.skill()
    this._cd = this._cdMax
    this._refreshCdUI()
  }

  _execCast(cast, name) {
    const c = this.combat
    const px = this.scene.scale.width / 2
    const py = this.scene.scale.height / 2 - 40

    switch (cast.type) {
      case 'aoe_damage': {
        let mul = cast.mul
        if (cast.scaleWithStacks) { mul += this._hitStacks * cast.scaleWithStacks; this._hitStacks = 0 }
        const dealt = this._aoeHit(mul, cast.radius, cast.element, cast.status)
        if (cast.lifesteal && dealt > 0) {
          c.hp = Math.min(c.maxHp, c.hp + Math.round(dealt * cast.lifesteal)); c.refreshUI()
        }
        this._castFx(px, py, cast.radius, cast.element)
        break
      }
      case 'dash_damage': {
        const dealt = this._aoeHit(cast.mul, 90, cast.element, cast.status)
        if (cast.lifesteal && dealt > 0) {
          c.hp = Math.min(c.maxHp, c.hp + Math.round(dealt * cast.lifesteal)); c.refreshUI()
        }
        this._castFx(px, py, 90, cast.element ?? 'physical')
        break
      }
      case 'multi_shot':
        this._multiShot(cast.count, cast.mul, cast.element)
        break
      case 'heal': {
        const healed = Math.round(c.maxHp * cast.pct)
        c.hp = Math.min(c.maxHp, c.hp + healed); c.refreshUI()
        this._floatText(`+${healed}`, '#66ff99')
        if (cast.thenShield) { this._shieldPct = cast.thenShield.pct; this._shieldTimer = cast.thenShield.dur }
        break
      }
      case 'shield':
        this._shieldPct = cast.pct; this._shieldTimer = cast.dur
        this._floatText('🛡 ' + name, '#88ccff')
        break
      case 'buff_self':
        this._applyBuff(cast.stat, cast.mul, cast.dur)
        this._floatText('⬆ ' + name, '#ffdd66')
        break
      case 'summon':
        for (let i = 0; i < cast.count; i++) this._spawnSummon(cast.dur, c.scene?.scale?.width)
        this._floatText('召唤 ×' + cast.count, '#cc99ff')
        break
    }
  }

  /** 对附近怪物造成范围伤害，返回总伤害 */
  _aoeHit(mul, radiusPx, element, status) {
    const ms = this.scene.monsterSystem
    if (!ms) return 0
    const px = this.scene.scale.width / 2
    const py = this.scene.scale.height / 2 - 40
    const dmg = Math.round(this.combat.atk * mul)
    let total = 0
    for (const m of [...ms.monsters]) {
      if (!m.gfx?.active) continue
      const dx = m.sx - px, dy = m.sy - py
      if (Math.hypot(dx, dy) > (radiusPx ?? 120)) continue
      const dead = ms.damage(m, dmg)
      this.combat._showFloat(m.sx, m.sy, dmg, true)
      total += dmg
      if (status) ms.applyStatus?.(m, status, 5, 3)
      if (dead) this.combat._onKill(m)
    }
    return total
  }

  _multiShot(count, mul, element) {
    const ms = this.scene.monsterSystem
    if (!ms) return
    const px = this.scene.scale.width / 2
    const py = this.scene.scale.height / 2 - 40
    const targets = [...ms.monsters]
      .filter(m => m.gfx?.active)
      .sort((a, b) => Math.hypot(a.sx - px, a.sy - py) - Math.hypot(b.sx - px, b.sy - py))
      .slice(0, count)
    const dmg = Math.round(this.combat.atk * mul)
    for (const m of targets) {
      const dead = ms.damage(m, dmg)
      this.combat._showFloat(m.sx, m.sy, dmg, true)
      if (dead) this.combat._onKill(m)
    }
  }

  _spawnSummon(dur, _x) {
    // 轻量召唤物：跟随玩家、定期对最近怪物造成伤害（视觉小球）
    const s = this.scene
    const buff = (this.skills.passive?.effects ?? []).find(e => e.type === 'summon_buff')
    const atk = Math.round(this.combat.atk * 0.4 * (buff?.atkMul ?? 1))
    const g = s.add.graphics().setDepth(1500).setScrollFactor(0)
    g.fillStyle(0xcc99ff, 0.9); g.fillCircle(0, 0, 6)
    g.x = s.scale.width / 2 + Phaser.Math.Between(-30, 30)
    g.y = s.scale.height / 2 + Phaser.Math.Between(-30, 30)
    this._summons.push({ gfx: g, atk, timer: dur, tick: 0 })
  }

  _applyBuff(stat, mul, dur) {
    if (stat === 'atk') { this.combat.atk = Math.round(this.combat.atk * mul) }
    this._buffs.push({ stat, mul, timer: dur })
  }
  _revertBuff(b) {
    if (b.stat === 'atk') this.combat.atk = Math.round(this.combat.atk / b.mul)
  }

  // ── 视觉反馈 ───────────────────────────────────────────────────────────
  _castFx(x, y, radius, element) {
    const colors = { fire: 0xff5522, ice: 0x88ccff, dark: 0x9955cc, lightning: 0xffff00, all: 0xffffff, physical: 0xffaa44 }
    const col = colors[element] ?? 0xffaa44
    const ring = this.scene.add.graphics().setDepth(1600).setScrollFactor(0)
    ring.lineStyle(4, col, 0.9); ring.strokeCircle(x, y, 10)
    this.scene.tweens.add({
      targets: ring, scale: { from: 1, to: (radius ?? 120) / 10 }, alpha: { from: 0.9, to: 0 },
      duration: 380, onComplete: () => ring.destroy(),
    })
  }

  _floatText(txt, color) {
    const s = this.scene
    const t = s.add.text(s.scale.width / 2, s.scale.height / 2 - 70, txt, {
      fontSize: '14px', color, stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(1700).setScrollFactor(0)
    s.tweens.add({ targets: t, y: '-=24', alpha: 0, duration: 800, onComplete: () => t.destroy() })
  }

  // ── 技能图标 + 冷却 UI ─────────────────────────────────────────────────
  buildUI(width, height) {
    const s = this.scene
    const x = width - 56, y = height - 56, R = 26
    this._skillBg = s.add.graphics().setDepth(220).setScrollFactor(0)
    this._skillBg.fillStyle(0x222244, 0.92); this._skillBg.fillCircle(x, y, R)
    this._skillBg.lineStyle(2, 0x66aaff, 0.8); this._skillBg.strokeCircle(x, y, R)
    this._skillIcon = s.add.text(x, y - 4, this.skills.active?.name ?? '技能', {
      fontSize: '10px', color: '#cceeff', align: 'center', wordWrap: { width: R * 2 },
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(221).setScrollFactor(0)
    this._skillKey = s.add.text(x, y + R - 4, '[空格]', {
      fontSize: '9px', color: '#88aaff', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(221).setScrollFactor(0)
    this._cdMask = s.add.graphics().setDepth(222).setScrollFactor(0)
    this._skillPos = { x, y, R }
  }

  _refreshCdUI() {
    if (!this._cdMask || !this._skillPos) return
    const { x, y, R } = this._skillPos
    this._cdMask.clear()
    if (this._cd > 0) {
      const ratio = this._cd / this._cdMax
      this._cdMask.fillStyle(0x000000, 0.6)
      this._cdMask.slice(x, y, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio, true)
      this._cdMask.fillPath()
      this._skillIcon?.setText(Math.ceil(this._cd / 1000) + 's')
    } else {
      this._skillIcon?.setText(this.skills.active?.name ?? '技能')
    }
  }
}
