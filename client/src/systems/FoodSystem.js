/**
 * FoodSystem.js — 食物 · 蘑菇 · 植物交互系统 (M12)
 *
 * 职责：
 *   1. 根据 BiomeContentMap 在当前可视区块内生成蘑菇 / 植物地面物品
 *   2. 玩家走近自动拾取 → 调用 CombatSystem.applyFood()
 *   3. 管理 buff/debuff 状态效果计时器（速度、攻击力、防御、中毒等）
 *   4. 在屏幕左上角显示活跃效果图标及倒计时
 *
 * 效果 ID 规范（与 BiomeContentMap 对齐）：
 *   speed_Ns       移动速度 +40%  N 秒
 *   atk_up_Ns      攻击力  +25%  N 秒
 *   def_up_Ns      物防    +30%  N 秒（WorldScene 的 takeDamage 查询）
 *   regen_Ns       每秒回 1% 最大 HP  N 秒
 *   luckup_Ns      掉落率  +30%  N 秒
 *   vision_up_Ns   视野扩大（stub）
 *   darkvision_Ns  暗视（stub）
 *   calm_aura      怪物攻击欲望降低（stub）
 *   perm_hp_N      永久 HP +N（一次性）
 *   perm_luck_N    永久幸运+N（stub）
 *   perm_physDef_N 永久物防+N（stub）
 *   poison_Ns      中毒 N 秒，每秒扣血（调 CombatSystem.applyPoison）
 *   slow_Ns        移动减速 50%  N 秒
 *   blind_Ns       致盲（画面变暗，stub）
 *   paralyze_Ns    麻痹（不可移动，stub）
 *   disease_Ns     疾病（攻击力 -20%  N 秒）
 *   atk_down_Ns    攻击力 -20%  N 秒
 *   curse_Ns       诅咒（全属性 -15% N 秒）
 *   bleed_Ns       流血（中毒类，调 applyPoison）
 *   invisible_Ns   短暂隐身（stub）
 *   bleed_cure     解除流血
 *   poison_cure    解除中毒
 *   magAtk_up      魔攻提升（stub）
 *   weather_reduce 降低天气效果（stub）
 */

import { BIOME_CONTENT } from '../data/BiomeContentMap.js'

// ── 常量 ────────────────────────────────────────────────────────────────────
const TILE_W = 64
const TILE_H = 32
const CHUNK_SIZE = 32

// 每区块最多生成的蘑菇 / 植物数量
const MAX_MUSHROOMS_PER_CHUNK = 4
const MAX_PLANTS_PER_CHUNK    = 5

// 拾取半径（像素）
const PICKUP_RADIUS = 30

// 图标映射
const ITEM_ICON = {
  edible:    '🍄',
  toxic:     '☠️',
  medicine:  '🌿',
  hazard:    '🌵',
  decorative:'🌸',
  rare:      '⭐',
  plant:     '🌿',
}
const ITEM_COLOR = {
  edible:    '#88ffaa',
  toxic:     '#ff6666',
  medicine:  '#44ff88',
  hazard:    '#ffaa44',
  decorative:'#ffddff',
  rare:      '#ffee00',
}

export class FoodSystem {
  constructor(scene, combatSystem) {
    this.scene  = scene
    this.combat = combatSystem

    /** @type {Array<GroundItem>} */
    this.groundItems = []

    /**
     * Active status effects
     * key = effectId (e.g. 'speed'), value = { timer:ms, label, icon, textObj }
     */
    this.activeEffects = {}

    // Permanent bonuses accumulated
    this.permHpBonus      = 0
    this.permLuckBonus    = 0
    this.permPhysDefBonus = 0

    // Movement speed multiplier (queried by WorldScene)
    this.speedMul = 1.0

    // ATK multiplier offset (applied on top of WeaponSystem)
    this.atkMul = 1.0

    // Physical defense multiplier (queried by CombatSystem.takeDamage)
    this.physDefMul = 1.0

    // Chunks already seeded (prevent respawn on re-enter)
    this._seededChunks = new Set()

    // UI
    this._effectBar = null
    this._effectSlots = []
  }

  // ── Chunk seeding ─────────────────────────────────────────────────────────

  /**
   * WorldScene が새 区块载入时调用。
   * @param {number} cx  区块 X（tile / CHUNK_SIZE）
   * @param {number} cy  区块 Y
   * @param {number} biomeId  该区块的群系 ID (0–20)
   */
  seedChunk(cx, cy, biomeId) {
    const key = `${cx},${cy}`
    if (this._seededChunks.has(key)) return
    this._seededChunks.add(key)

    const content = BIOME_CONTENT[biomeId]
    if (!content) return

    const rng = mulberry32(cx * 73856093 ^ cy * 19349663)

    // 蘑菇
    const mushrooms = content.mushrooms ?? []
    const mCount = Math.floor(rng() * (MAX_MUSHROOMS_PER_CHUNK + 1))
    for (let i = 0; i < mCount; i++) {
      const m = mushrooms[Math.floor(rng() * mushrooms.length)]
      if (!m) continue
      const tx = cx * CHUNK_SIZE + Math.floor(rng() * CHUNK_SIZE)
      const ty = cy * CHUNK_SIZE + Math.floor(rng() * CHUNK_SIZE)
      const [sx, sy] = tileToScreen(tx, ty)
      this._spawnItem({ ...m, category: 'mushroom' }, sx, sy)
    }

    // 植物
    const plants = (content.plants ?? []).filter(p => p.hpRestore !== 0 || p.effect)
    const pCount = Math.floor(rng() * (MAX_PLANTS_PER_CHUNK + 1))
    for (let i = 0; i < pCount; i++) {
      const p = plants[Math.floor(rng() * plants.length)]
      if (!p) continue
      const tx = cx * CHUNK_SIZE + Math.floor(rng() * CHUNK_SIZE)
      const ty = cy * CHUNK_SIZE + Math.floor(rng() * CHUNK_SIZE)
      const [sx, sy] = tileToScreen(tx, ty)
      this._spawnItem({ ...p, category: 'plant' }, sx, sy)
    }
  }

  _spawnItem(data, sx, sy) {
    const s = this.scene
    const wc = s.worldContainer
    if (!wc) return

    const isToxic  = data.type === 'toxic' || data.type === 'hazard'
    const icon     = ITEM_ICON[data.type] ?? '🍄'
    const textCol  = ITEM_COLOR[data.type] ?? '#ffffff'

    // World-space position (relative to worldContainer)
    const wx = sx
    const wy = sy - 10

    // 外发光（品质色）
    const glowCol = isToxic ? 0xff4444 : 0x44ff88
    const glow = s.add.graphics()
    glow.lineStyle(1.5, glowCol, 0.5)
    glow.strokeCircle(wx, wy, 10)
    wc.add(glow)

    // 图标
    const iconTxt = s.add.text(wx, wy, icon, {
      fontSize: '14px',
    }).setOrigin(0.5)
    wc.add(iconTxt)

    // 名字（小号浮字）
    const nameTxt = s.add.text(wx, wy + 12, data.name, {
      fontSize: '8px',
      color: textCol,
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5)
    wc.add(nameTxt)

    // 浮动动画
    s.tweens.add({
      targets: [iconTxt, nameTxt, glow],
      y: `+=4`,
      duration: 1200 + Math.random() * 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    /** @type {GroundItem} */
    const item = { data, sx, sy, glow, iconTxt, nameTxt, alive: true }
    this.groundItems.push(item)
    return item
  }

  // ── Pickup detection (每帧调用) ────────────────────────────────────────────

  update(delta, playerSx, playerSy) {
    // 拾取检测
    for (let i = this.groundItems.length - 1; i >= 0; i--) {
      const item = this.groundItems[i]
      if (!item.alive) continue
      const dx = item.sx - playerSx
      const dy = item.sy - playerSy
      if (Math.sqrt(dx * dx + dy * dy) < PICKUP_RADIUS) {
        this._collect(item)
        this.groundItems.splice(i, 1)
      }
    }

    // Tick 活跃 buff/debuff 倒计时
    let needRefreshUI = false
    for (const [key, eff] of Object.entries(this.activeEffects)) {
      eff.timer -= delta
      if (eff.timer <= 0) {
        this._expireEffect(key)
        delete this.activeEffects[key]
        needRefreshUI = true
      }
    }
    if (needRefreshUI) this._refreshEffectUI()

    // Regen tick
    const regen = this.activeEffects['regen']
    if (regen) {
      regen._regenAcc = (regen._regenAcc ?? 0) + delta
      if (regen._regenAcc >= 1000) {
        regen._regenAcc -= 1000
        const heal = Math.round(this.combat.maxHp * 0.01)
        this.combat.hp = Math.min(this.combat.maxHp, this.combat.hp + heal)
        this.combat.refreshUI()
      }
    }
  }

  // ── Collect & apply ───────────────────────────────────────────────────────

  _collect(item) {
    // 销毁图形
    item.alive = false
    item.glow?.destroy()
    item.iconTxt?.destroy()
    item.nameTxt?.destroy()

    const d = item.data

    // ── 有毒植物 / 蘑菇 → 直接中毒，不经 applyFood
    if (d.type === 'toxic' || d.type === 'hazard') {
      const dmg = Math.abs(d.hpRestore ?? 0)
      if (dmg > 0) {
        // 转化为 dps (持续5s)
        this.combat.applyPoison(dmg / 5, 5)
      }
      if (d.effect) this._applyEffect(d.effect, d)
      this._showPickupMsg(d, true)
      return
    }

    // ── 可食用 / 药用
    const healPct = (d.hpRestore ?? 0) / (this.combat.maxHp || 200)
    this.combat.applyFood({
      healPct:   Math.max(0, healPct),
      poisonDps: 0,
    })

    if (d.effect) this._applyEffect(d.effect, d)
    this._showPickupMsg(d, false)
  }

  _applyEffect(effectId, itemData) {
    if (!effectId) return
    const [type, rawN] = effectId.split('_')
    const n = parseInt(rawN) || 0

    // 解毒 / 止血
    if (effectId === 'poison_cure' || effectId === 'bleed_cure') {
      if (this.combat._poisonTimer > 0) {
        this.combat._poisonTimer = 0
        this.combat._poisonDps   = 0
        this._showMsg('✓ 中毒已解除', '#44ff88')
      }
      return
    }

    const dur = n * 1000  // ms

    switch (type) {
      case 'speed': {
        this.speedMul = 1.4
        this._addEffect('speed', dur, `⚡ 移速+40%`, '#88ffff')
        break
      }
      case 'atk': {
        if (rawN === 'up') {
          const ns = parseInt(effectId.split('_')[2]) || 10
          const prevAtk = this.combat.atk
          this.combat.atk = Math.round(prevAtk * 1.25)
          this.atkMul = 1.25
          this._addEffect('atk', ns * 1000, `⚔️ 攻击+25%`, '#ffdd44')
        } else if (rawN === 'down') {
          const ns = parseInt(effectId.split('_')[2]) || 10
          this.atkMul = 0.80
          this.combat.atk = Math.round(this.combat.atk * 0.80)
          this._addEffect('atk_debuff', ns * 1000, `⚔️ 攻击-20%`, '#ff8888')
        }
        break
      }
      case 'def': {
        // def_up_Ns
        const ns = parseInt(effectId.split('_')[2]) || 15
        this.physDefMul = 1.30
        this._addEffect('def', ns * 1000, `🛡 物防+30%`, '#88aaff')
        break
      }
      case 'regen': {
        this._addEffect('regen', dur, `♥ 持续回血`, '#ff88aa')
        break
      }
      case 'poison': {
        this.combat.applyPoison(15, n)
        break
      }
      case 'slow': {
        this.speedMul = 0.5
        this._addEffect('slow', dur, `❄ 减速50%`, '#aaddff')
        break
      }
      case 'luckup': {
        this._addEffect('luck', dur, `🍀 幸运+30%`, '#aaff44')
        break
      }
      case 'disease': {
        const ns = parseInt(effectId.split('_')[1]) || 10
        this.atkMul = 0.80
        this.combat.atk = Math.round(this.combat.atk * 0.80)
        this._addEffect('disease', ns * 1000, `🤢 疾病-20%ATK`, '#aa8844')
        break
      }
      case 'curse': {
        this.atkMul  = 0.85
        this.physDefMul = 0.85
        this.combat.atk = Math.round(this.combat.atk * 0.85)
        this._addEffect('curse', dur, `💀 诅咒-15%全属性`, '#9933cc')
        break
      }
      case 'bleed': {
        this.combat.applyPoison(8, n)
        break
      }
      case 'perm': {
        const subType = effectId.split('_')[1]
        const val = parseInt(effectId.split('_')[2]) || 0
        if (subType === 'hp') {
          this.permHpBonus += val
          this.combat.maxHp += val
          this.combat.hp = Math.min(this.combat.maxHp, this.combat.hp + val)
          this.combat.refreshUI()
          this._showMsg(`♥ 最大HP永久 +${val}`, '#ff88aa')
        } else if (subType === 'luck') {
          this.permLuckBonus += val
          this._showMsg(`🍀 幸运永久 +${val}`, '#aaff44')
        } else if (subType === 'physDef') {
          this.permPhysDefBonus += val
          this._showMsg(`🛡 物防永久 +${val}`, '#88aaff')
        }
        break
      }
      default:
        // vision_up, darkvision, calm_aura, invisible, blind, paralyze, magAtk_up: stub
        break
    }
  }

  _addEffect(key, durationMs, label, color) {
    this.activeEffects[key] = {
      timer: durationMs,
      label,
      color,
      _regenAcc: 0,
    }
    this._refreshEffectUI()
  }

  _expireEffect(key) {
    // revert stats on expiry
    switch (key) {
      case 'speed':
      case 'slow':
        this.speedMul = 1.0
        break
      case 'atk':
      case 'disease':
      case 'curse':
        if (this.atkMul !== 1.0) {
          this.combat.atk = Math.round(this.combat.atk / this.atkMul)
          this.atkMul = 1.0
        }
        break
      case 'atk_debuff':
        if (this.atkMul < 1.0) {
          this.combat.atk = Math.round(this.combat.atk / this.atkMul)
          this.atkMul = 1.0
        }
        break
      case 'def':
        this.physDefMul = 1.0
        break
    }
    if (key === 'curse') {
      this.physDefMul = 1.0
    }
  }

  // ── Effect bar UI ─────────────────────────────────────────────────────────

  buildUI(width, height) {
    // Effect slots 在 HP 条上方
    this._effectBarY = height - 80
    this._effectBarX = 14
    this._effectSlots = []
  }

  _refreshEffectUI() {
    const s = this.scene
    if (!s) return

    // Clear old slot text objects
    for (const slot of this._effectSlots) {
      slot.txt?.destroy()
      slot.timer?.destroy()
    }
    this._effectSlots = []

    let x = this._effectBarX ?? 14
    const y = this._effectBarY ?? 60

    for (const [, eff] of Object.entries(this.activeEffects)) {
      const secs = Math.ceil(eff.timer / 1000)
      const txt = s.add.text(x, y, eff.label, {
        fontSize: '9px',
        color: eff.color ?? '#ffffff',
        stroke: '#000000', strokeThickness: 2,
        backgroundColor: '#00000099',
        padding: { x: 3, y: 2 },
      }).setDepth(220).setScrollFactor(0)

      const timer = s.add.text(x + txt.width / 2, y + 13, `${secs}s`, {
        fontSize: '8px', color: '#aaaaaa',
        stroke: '#000000', strokeThickness: 1,
      }).setOrigin(0.5).setDepth(220).setScrollFactor(0)

      this._effectSlots.push({ txt, timer })
      x += txt.width + 5
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  _showPickupMsg(data, isToxic) {
    const s = this.scene
    const { width, height } = s.scale
    const col   = isToxic ? '#ff6666' : '#88ffaa'
    const icon  = ITEM_ICON[data.type] ?? '🍄'
    const label = isToxic
      ? `${icon} 有毒！${data.name}  ${data.hpRestore ?? 0}HP`
      : `${icon} 获得：${data.name}  +${data.hpRestore ?? 0}HP`
    const txt = s.add.text(width / 2, height - 100, label, {
      fontSize: '12px', color: col,
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(499).setScrollFactor(0)
    s.tweens.add({ targets: txt, y: '-=20', alpha: 0, duration: 1800,
      onComplete: () => txt.destroy() })
  }

  _showMsg(label, color) {
    const s = this.scene
    const { width, height } = s.scale
    const txt = s.add.text(width / 2, height - 110, label, {
      fontSize: '12px', color: color ?? '#ffffff',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(499).setScrollFactor(0)
    s.tweens.add({ targets: txt, y: '-=24', alpha: 0, duration: 2000,
      onComplete: () => txt.destroy() })
  }
}

// ── Utility functions ────────────────────────────────────────────────────────

/** 伪随机数生成器（mulberry32，基于种子），避免地图生成不一致 */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 等距 tile → 世界容器坐标（与 WorldScene 保持一致） */
function tileToScreen(tx, ty) {
  const HALF_W = TILE_W / 2   // 32
  const HALF_H = TILE_H / 2   // 16
  return [
    (tx - ty) * HALF_W,
    (tx + ty) * HALF_H,
  ]
}
