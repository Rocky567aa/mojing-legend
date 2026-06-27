/**
 * CombatSystem — 战斗管理
 * 职责：玩家属性、攻击计算、受伤处理、HP 显示、浮动数字
 */
import { HERO_DATA } from '../data/HeroData.js'

export class CombatSystem {
  constructor(scene) {
    this.scene = scene
    this.hp = 100; this.maxHp = 100
    this.atk = 15; this.crit = 0.10; this.critMul = 2.0
    this.xp = 0; this.level = 1
    this.dead = false
    // UI elements (created in buildUI)
    this.hpBar = null; this.hpBarFill = null; this.hpText = null
    this.xpBar = null; this.xpBarFill = null; this.levelText = null
    // Regen timer for 莉娜
    this._regenTimer = 0
    this._heroId = null
  }

  init(professionId) {
    const hero = HERO_DATA[professionId] || HERO_DATA.kane
    const s = hero.stats
    this._heroId = hero.id
    this.maxHp = s.hp; this.hp = s.hp
    this.atk   = s.atk
    this.crit  = s.crit
    this.critMul = s.critMul ?? 2.0
    this.dead  = false
    this.xp = 0; this.level = 1
    this._xpToNext = 30
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
    const isCrit = Math.random() < this.crit
    const base = this.atk * (0.85 + Math.random() * 0.30)
    const dmg = Math.round(isCrit ? base * this.critMul : base)
    const dead = monster.type && this.scene.monsterSystem?.damage(monster, dmg)
    this._showFloat(monster.sx, monster.sy, dmg, isCrit)
    if (dead) this._onKill(monster)
    return { dmg, isCrit, killed: dead }
  }

  _onKill(m) {
    const xpGain = m.type?.xp ?? 5
    this.xp += xpGain
    while (this.xp >= this._xpToNext) {
      this.xp -= this._xpToNext
      this.level++
      this._xpToNext = Math.round(this._xpToNext * 1.45)
      this.atk  = Math.round(this.atk * 1.12)
      this.maxHp = Math.round(this.maxHp * 1.08)
      this.hp = Math.min(this.hp + 20, this.maxHp)
      this._showLevelUp()
    }
    this.refreshUI()
    // Loot drops
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
  }

  // ── Monster → Player ─────────────────────────────────────────────────────
  takeDamage(dmg) {
    if (this.dead) return
    // Kane damage reduction
    const reduced = this._heroId === 'kane' ? Math.round(dmg * 0.8) : dmg
    this.hp = Math.max(0, this.hp - reduced)
    this.refreshUI()

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
    s.cameras.main.shake(400, 0.015)
    // Overlay
    const { width, height } = s.scale
    const overlay = s.add.graphics().setDepth(500).setScrollFactor(0)
    overlay.fillStyle(0x880000, 0)
    overlay.fillRect(0, 0, width, height)
    s.tweens.add({ targets: overlay, alpha: 0.6, duration: 600 })
    s.add.text(width/2, height/2 - 30, '⚔ 你已阵亡', {
      fontSize: '28px', color: '#ff4444',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(510).setScrollFactor(0)
    // Revive after 3s
    s.time.delayedCall(3000, () => {
      this.hp = Math.round(this.maxHp * 0.4)
      this.dead = false
      this.refreshUI()
      s.tweens.add({ targets: overlay, alpha: 0, duration: 800,
        onComplete: () => overlay.destroy() })
    })
  }

  // ── Regen (Lena passive) ─────────────────────────────────────────────────
  update(delta) {
    if (this._heroId !== 'lena' || this.dead) return
    this._regenTimer += delta
    if (this._regenTimer >= 10000) {
      this._regenTimer = 0
      this.hp = Math.min(this.maxHp, this.hp + 15)
      this.refreshUI()
    }
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
