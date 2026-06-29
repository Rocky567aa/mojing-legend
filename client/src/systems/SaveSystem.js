/**
 * SaveSystem.js — M20 完整存档 + 导出/导入存档码
 *
 * localStorage key: `mojing_save`
 *
 * 统一收集分散在各系统里的运行期状态，写回同一份存档；
 * 并提供 Base64 存档码导出/导入，便于跨设备 / 备份。
 *
 * 存档结构 v2：
 * {
 *   version, savedAt,
 *   profession, worldSeed,
 *   player:    { level, xp, xpToNext, hp, maxHp, atk, baseAtk },
 *   playerTile:{ x, y },
 *   inventory: { ores, powders, purifiedPowders, purifier, fuel },
 *   crystals:  [ ... ],
 *   baseLevel,
 *   weapons:   { equipped, bag[] },
 *   settings:  { muted }
 * }
 */

const SAVE_KEY = 'mojing_save'
const SAVE_VERSION = 2

// ── Base64（Unicode 安全）────────────────────────────────────────────────
function utf8ToB64(str) {
  return btoa(unescape(encodeURIComponent(str)))
}
function b64ToUtf8(b64) {
  return decodeURIComponent(escape(atob(b64)))
}

export const SaveSystem = {
  KEY: SAVE_KEY,
  VERSION: SAVE_VERSION,

  /** 从存活的场景系统里收集完整存档对象 */
  collect(scene) {
    const prev = scene.saveData || {}
    const cs = scene.combatSystem
    const ws = scene.weaponSystem

    const save = {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      profession: prev.profession ?? cs?._heroId ?? 'kane',
      worldSeed: prev.worldSeed ?? scene.worldGen?.seed ?? 54321,

      player: cs ? {
        level: cs.level, xp: cs.xp, xpToNext: cs._xpToNext,
        hp: cs.hp, maxHp: cs.maxHp, atk: cs.atk, baseAtk: cs.baseAtk,
      } : (prev.player ?? null),

      playerTile: scene.playerTile ? { x: scene.playerTile.x, y: scene.playerTile.y }
                                   : (prev.playerTile ?? null),

      inventory: prev.inventory ?? {},
      crystals: Array.isArray(prev.crystals) ? prev.crystals : [],
      baseLevel: prev.baseLevel ?? 1,

      weapons: ws ? {
        equipped: ws.equipped ?? null,
        bag: Array.isArray(ws.inventory) ? ws.inventory : [],
      } : (prev.weapons ?? { equipped: null, bag: [] }),

      settings: {
        muted: scene.sfx?.muted ?? prev.settings?.muted ?? false,
      },
    }
    return save
  },

  /** 收集并写入 localStorage；返回保存的对象 */
  save(scene) {
    const data = this.collect(scene)
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('[Save] 写入失败', e)
    }
    // 同步回 scene.saveData，保持后续读取一致
    scene.saveData = data
    return data
  },

  /** 读取原始存档（可能为 null / 旧版本） */
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      console.warn('[Save] 存档损坏', e)
      return null
    }
  },

  clear() {
    localStorage.removeItem(SAVE_KEY)
  },

  /** 导出 Base64 存档码 */
  exportCode(scene) {
    const data = this.save(scene)
    return 'MJL2-' + utf8ToB64(JSON.stringify(data))
  },

  /**
   * 导入存档码：校验 → 写 localStorage → 返回解析对象
   * 失败抛出带中文原因的 Error。
   */
  importCode(code) {
    if (!code || typeof code !== 'string') throw new Error('存档码为空')
    const trimmed = code.trim()
    const payload = trimmed.startsWith('MJL2-') ? trimmed.slice(5) : trimmed
    let obj
    try {
      obj = JSON.parse(b64ToUtf8(payload))
    } catch (e) {
      throw new Error('存档码格式错误，无法解析')
    }
    if (!obj || typeof obj !== 'object') throw new Error('存档码内容无效')
    if (!obj.profession) throw new Error('存档码缺少英雄信息')
    // 升级旧字段（容错）
    if (!obj.inventory) obj.inventory = {}
    if (!Array.isArray(obj.crystals)) obj.crystals = []
    obj.version = SAVE_VERSION
    localStorage.setItem(SAVE_KEY, JSON.stringify(obj))
    return obj
  },

  /** init() 之后，把存档里的等级/经验/血量/攻击恢复到 CombatSystem */
  applyToCombat(scene, save) {
    const cs = scene.combatSystem
    const p = save?.player
    if (!cs || !p) return
    cs.level = p.level ?? cs.level
    cs.xp = p.xp ?? cs.xp
    cs._xpToNext = p.xpToNext ?? cs._xpToNext
    cs.maxHp = p.maxHp ?? cs.maxHp
    cs.hp = Math.min(p.hp ?? cs.hp, cs.maxHp)
    cs.atk = p.atk ?? cs.atk
    cs.baseAtk = p.baseAtk ?? cs.baseAtk
    cs.refreshUI?.()
  },

  /** initHeroWeapon() 之后，恢复装备 + 武器背包 */
  applyToWeapons(scene, save) {
    const ws = scene.weaponSystem
    const w = save?.weapons
    if (!ws || !w) return
    if (Array.isArray(w.bag)) ws.inventory = w.bag.slice(0, 8)
    if (w.equipped) {
      ws.equipped = w.equipped
      ws._applyCombatStats?.()
    }
    ws.refreshUI?.()
  },

  /** 在 WorldScene 里挂一个自动存档定时器（默认 30s） */
  startAutoSave(scene, intervalMs = 30000) {
    if (scene._autoSaveTimer) scene._autoSaveTimer.remove()
    scene._autoSaveTimer = scene.time.addEvent({
      delay: intervalMs, loop: true,
      callback: () => this.save(scene),
    })
  },
}
