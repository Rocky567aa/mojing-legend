/**
 * HeroStats.js — 全 16 英雄完整战斗属性表
 *
 * 每位英雄拥有独立的物理/魔法攻防 + 血量，覆盖所有职业差异。
 *
 * 属性说明：
 *   hp        — 基础最大生命值
 *   physAtk   — 物理攻击力（刀剑斧拳等物理伤害来源）
 *   magAtk    — 魔法攻击力（法术/元素/神圣/黑暗伤害来源）
 *   physDef   — 物理防御（减少物理伤害承受）
 *   magDef    — 魔法防御（减少魔法伤害承受）
 *   spd       — 移动 & 攻击速度系数（1.0 = 标准）
 *   crit      — 暴击率（0.0–1.0）
 *   critDmg   — 暴击伤害倍率（默认 1.5 = 伤害×1.5）
 *
 * 成长系数（每升一级）：
 *   hpGrow / physAtkGrow / magAtkGrow / physDefGrow / magDefGrow
 *
 * 伤害计算公式（供 CombatSystem 参考）：
 *   物理实际伤害 = MAX(1, physAtk × weaponMult - target.physDef × 0.6)
 *   魔法实际伤害 = MAX(1, magAtk  × spellMult  - target.magDef  × 0.5)
 *   暴击触发后  = 实际伤害 × critDmg
 */

export const HERO_STATS = {

  // ════════════════════════════════════════════════
  //  原版 8 英雄
  // ════════════════════════════════════════════════

  /** 卡恩 · 战士 — 高物攻/中物防/厚血 */
  kain: {
    hp: 1400,
    physAtk: 80,  magAtk: 8,
    physDef: 48,  magDef: 18,
    spd: 0.95, crit: 0.08, critDmg: 1.5,
    hpGrow: 95,   physAtkGrow: 9.0, magAtkGrow: 0.5,
    physDefGrow: 4.5, magDefGrow: 1.2,
    atkType: 'physical',
    desc: '纯物理战士，正面硬刚首选，魔法短板明显',
  },

  /** 薇拉 · 刺客 — 高物攻/高暴击/薄血薄防 */
  vira: {
    hp: 950,
    physAtk: 78,  magAtk: 12,
    physDef: 22,  magDef: 18,
    spd: 1.25, crit: 0.20, critDmg: 2.0,
    hpGrow: 55,   physAtkGrow: 8.5, magAtkGrow: 0.8,
    physDefGrow: 1.8, magDefGrow: 1.5,
    atkType: 'physical',
    desc: '爆发刺杀专家，暴击率全原版最高，但完全不抗打',
  },

  /** 奥伦 · 法师 — 极高魔攻/极薄物防 */
  oren: {
    hp: 700,
    physAtk: 12,  magAtk: 95,
    physDef: 12,  magDef: 38,
    spd: 1.0, crit: 0.12, critDmg: 1.8,
    hpGrow: 42,   physAtkGrow: 0.6, magAtkGrow: 10.5,
    physDefGrow: 1.0, magDefGrow: 3.5,
    atkType: 'magic',
    desc: '魔法输出最强，但物防几乎为零，绕后秒杀即死',
  },

  /** 莉娜 · 牧师 — 高魔攻/高魔防/治疗专精 */
  lina: {
    hp: 820,
    physAtk: 18,  magAtk: 65,
    physDef: 18,  magDef: 52,
    spd: 1.0, crit: 0.08, critDmg: 1.5,
    hpGrow: 52,   physAtkGrow: 1.0, magAtkGrow: 7.0,
    physDefGrow: 1.5, magDefGrow: 4.8,
    atkType: 'magic',
    desc: '治疗核心，魔法防御最高，物理近战接触即危险',
  },

  /** 艾拉 · 德鲁伊 — 物魔均衡/中等属性全面 */
  ella: {
    hp: 980,
    physAtk: 38,  magAtk: 55,
    physDef: 30,  magDef: 33,
    spd: 1.05, crit: 0.10, critDmg: 1.6,
    hpGrow: 62,   physAtkGrow: 3.5, magAtkGrow: 6.0,
    physDefGrow: 2.5, magDefGrow: 3.0,
    atkType: 'hybrid',
    desc: '最均衡英雄，物魔双修，无明显短板也无明显峰值',
  },

  /** 雷格 · 骑士 — 超厚物防/高血/低魔攻 */
  reg: {
    hp: 1650,
    physAtk: 55,  magAtk: 8,
    physDef: 68,  magDef: 28,
    spd: 0.88, crit: 0.06, critDmg: 1.4,
    hpGrow: 110,  physAtkGrow: 5.5, magAtkGrow: 0.5,
    physDefGrow: 6.5, magDefGrow: 2.5,
    atkType: 'physical',
    desc: '最强坦克，物防全英雄最高，但速度最慢，魔防较弱',
  },

  /** 玛格 · 术士 — 黑魔法高输出/薄肉 */
  mag: {
    hp: 760,
    physAtk: 10,  magAtk: 88,
    physDef: 14,  magDef: 32,
    spd: 1.02, crit: 0.13, critDmg: 1.9,
    hpGrow: 44,   physAtkGrow: 0.5, magAtkGrow: 10.0,
    physDefGrow: 1.0, magDefGrow: 3.0,
    atkType: 'magic',
    desc: '黑魔法输出，与奥伦接近但偏控制，诅咒/毒系技能',
  },

  /** 托尔 · 游侠 — 物魔均衡偏物理，远程专精 */
  tor: {
    hp: 920,
    physAtk: 65,  magAtk: 18,
    physDef: 24,  magDef: 22,
    spd: 1.15, crit: 0.15, critDmg: 1.65,
    hpGrow: 58,   physAtkGrow: 7.0, magAtkGrow: 1.5,
    physDefGrow: 2.0, magDefGrow: 2.0,
    atkType: 'physical',
    desc: '远程物理输出，速度快暴击高，中距离最稳',
  },

  // ════════════════════════════════════════════════
  //  扩展 6 英雄 (HeroData_Ext)
  // ════════════════════════════════════════════════

  /** 鲁恩 · 炼金术士 — 魔法爆炸为主，物魔中等偏魔 */
  runen: {
    hp: 900,
    physAtk: 28,  magAtk: 58,
    physDef: 18,  magDef: 24,
    spd: 1.0, crit: 0.10, critDmg: 1.6,
    hpGrow: 58,   physAtkGrow: 2.0, magAtkGrow: 7.0,
    physDefGrow: 1.5, magDefGrow: 2.2,
    atkType: 'magic',
    desc: '药剂爆炸魔法输出，炼金技能让他输出形式独特',
  },

  /** 赛亚 · 元素使 — 纯魔法巅峰输出，三属性切换 */
  saya: {
    hp: 750,
    physAtk: 10,  magAtk: 92,
    physDef: 14,  magDef: 28,
    spd: 1.05, crit: 0.13, critDmg: 1.85,
    hpGrow: 44,   physAtkGrow: 0.5, magAtkGrow: 10.0,
    physDefGrow: 1.0, magDefGrow: 2.5,
    atkType: 'magic',
    desc: '三元素轮转，魔攻极高，暴击伤害仅次于薇拉',
  },

  /** 罗尔 · 圣骑士 — 物魔双防，高HP，全面坦辅 */
  roal: {
    hp: 1620,
    physAtk: 45,  magAtk: 32,
    physDef: 55,  magDef: 45,
    spd: 0.88, crit: 0.06, critDmg: 1.4,
    hpGrow: 108,  physAtkGrow: 4.5, magAtkGrow: 3.0,
    physDefGrow: 5.0, magDefGrow: 4.0,
    atkType: 'hybrid',
    desc: '物魔双防最平衡坦克，圣光技能兼具治疗和对不死系强伤',
  },

  /** 奈拉 · 召唤师 — 低自身属性，靠召唤物输出 */
  naira: {
    hp: 820,
    physAtk: 22,  magAtk: 48,
    physDef: 20,  magDef: 26,
    spd: 1.02, crit: 0.10, critDmg: 1.5,
    hpGrow: 50,   physAtkGrow: 1.8, magAtkGrow: 5.0,
    physDefGrow: 1.8, magDefGrow: 2.2,
    atkType: 'magic',
    desc: '本体最弱但召唤物超强，团战能力全英雄最强',
  },

  /** 达克 · 死灵法师 — 高魔攻/中等血量/暗系生命吸取 */
  dak: {
    hp: 1020,
    physAtk: 15,  magAtk: 82,
    physDef: 16,  magDef: 30,
    spd: 0.95, crit: 0.11, critDmg: 1.75,
    hpGrow: 65,   physAtkGrow: 0.8, magAtkGrow: 8.5,
    physDefGrow: 1.2, magDefGrow: 2.8,
    atkType: 'magic',
    desc: '暗系魔法高输出，生命吸取弥补低防，骷髅军团提供肉盾',
  },

  /** 影月 · 武僧 — 高物攻/高暴击/快速度，气功流 */
  yingyue: {
    hp: 1120,
    physAtk: 65,  magAtk: 28,
    physDef: 28,  magDef: 20,
    spd: 1.40, crit: 0.18, critDmg: 1.8,
    hpGrow: 72,   physAtkGrow: 6.0, magAtkGrow: 2.5,
    physDefGrow: 2.5, magDefGrow: 1.8,
    atkType: 'physical',
    desc: '全英雄最快速度+最高暴击率，气功叠层爆发恐怖',
  },

  // ════════════════════════════════════════════════
  //  新增 2 英雄 (HeroData_Warriors)
  // ════════════════════════════════════════════════

  /** 莫克 · 狂战士 — 极高物攻/极高血量/最低魔防 */
  moke: {
    hp: 1820,
    physAtk: 88,  magAtk: 5,
    physDef: 30,  magDef: 12,
    spd: 0.92, crit: 0.14, critDmg: 1.7,
    hpGrow: 125,  physAtkGrow: 10.0, magAtkGrow: 0.3,
    physDefGrow: 2.8, magDefGrow: 1.0,
    atkType: 'physical',
    desc: '物攻+血量双全英雄最高，但魔防极低，法师克制',
  },

  /** 艾薇 · 神射手 — 高物攻/极高暴击/薄防御 */
  aiwei: {
    hp: 840,
    physAtk: 70,  magAtk: 15,
    physDef: 16,  magDef: 18,
    spd: 1.25, crit: 0.22, critDmg: 1.9,
    hpGrow: 50,   physAtkGrow: 8.0, magAtkGrow: 1.0,
    physDefGrow: 1.4, magDefGrow: 1.6,
    atkType: 'physical',
    desc: '暴击率全英雄最高(22%)，远程+穿透+猎鹰独立攻击',
  },
}

// ── 工具函数 ─────────────────────────────────────────────────────────────

/**
 * 获取英雄当前等级的实际属性
 * @param {string} heroId
 * @param {number} level
 * @returns {object}
 */
export function getHeroStatsAtLevel(heroId, level = 1) {
  const base = HERO_STATS[heroId]
  if (!base) return null
  const lv = Math.max(1, level) - 1
  return {
    hp:      Math.floor(base.hp      + base.hpGrow      * lv),
    physAtk: Math.floor(base.physAtk + base.physAtkGrow * lv),
    magAtk:  Math.floor(base.magAtk  + base.magAtkGrow  * lv),
    physDef: Math.floor(base.physDef + base.physDefGrow * lv),
    magDef:  Math.floor(base.magDef  + base.magDefGrow  * lv),
    spd:     base.spd,
    crit:    Math.min(0.95, base.crit),
    critDmg: base.critDmg,
    atkType: base.atkType,
  }
}

/**
 * 物理伤害计算
 * physDmg = MAX(1, physAtk × weaponMult − target.physDef × 0.6)
 */
export function calcPhysDamage(attackerStats, weaponMult = 1.0, targetPhysDef = 0) {
  const raw = attackerStats.physAtk * weaponMult - targetPhysDef * 0.6
  const isCrit = Math.random() < attackerStats.crit
  const dmg = Math.max(1, Math.floor(raw)) * (isCrit ? attackerStats.critDmg : 1)
  return { dmg: Math.floor(dmg), isCrit }
}

/**
 * 魔法伤害计算
 * magDmg = MAX(1, magAtk × spellMult − target.magDef × 0.5)
 */
export function calcMagDamage(attackerStats, spellMult = 1.0, targetMagDef = 0) {
  const raw = attackerStats.magAtk * spellMult - targetMagDef * 0.5
  const isCrit = Math.random() < attackerStats.crit
  const dmg = Math.max(1, Math.floor(raw)) * (isCrit ? attackerStats.critDmg : 1)
  return { dmg: Math.floor(dmg), isCrit }
}

/** 属性总览（UI展示用，带属性排名） */
export function getHeroStatsSummary() {
  return Object.entries(HERO_STATS).map(([id, s]) => ({
    id,
    hp: s.hp,
    physAtk: s.physAtk,
    magAtk: s.magAtk,
    physDef: s.physDef,
    magDef: s.magDef,
    atkType: s.atkType,
  })).sort((a, b) => (b.hp + b.physAtk + b.magAtk) - (a.hp + a.physAtk + a.magAtk))
}
