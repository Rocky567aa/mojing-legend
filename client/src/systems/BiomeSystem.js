/**
 * BiomeSystem.js — 群系中枢 & 怪物生成总监 (M13)
 *
 * 把分散的群系数据真正"跑"起来：
 *   1. BIOME_REGISTRY — 每群系的展示名 / 环境色调 / 危害标记（流沙·龙卷·拉拽）
 *   2. MONSTER_RENDER  — 为 MonsterStats.js 的全部 53 种怪物补齐渲染描述
 *                        （形状 + 元素配色），让基于 BIOME_MONSTER_POOL 的
 *                        分等级生成能被 MonsterSystem 直接画出来
 *   3. 难度缩放总监（接 M8 设计）：
 *        getDensityForLevel(level)  — 屏上怪物上限（lv1–5=6 … lv31+=30）
 *        getEliteChance(level)      — 精英刷新率（随等级上升）
 *        getBossChance(level)       — Boss 刷新率
 *        rollSpawn(biomeId, lvl, isNight) — 抽一只怪：选种 → 判精英/Boss
 *                                           → 用 getMonsterStatsAtLevel 缩放属性
 *                                           → 附渲染描述，返回完整 spawn 描述
 *
 * MonsterSystem 调 rollSpawn() 拿到 { id, name, isElite, isBoss, stats, render }
 * 即可生成；密度上限、夜间 ×1.5 也由本系统统一裁决，场景层不再硬编码。
 */

import {
  MONSTER_STATS,
  BIOME_MONSTER_POOL,
  getMonsterStatsAtLevel,
} from '../data/MonsterStats.js'
import { BIOME_NAMES } from '../utils/WorldGen.js'
import { getBiomeContent } from '../data/BiomeContentMap.js'

// ── 群系危害标记（接 Quicksand / Tornado 设计） ──────────────────────────────
// hazard: 'quicksand' | 'tornado' | 'pull' | null
export const BIOME_REGISTRY = {
  0:  { name: BIOME_NAMES[0],  tint: 0x88bb55, hazard: null,        ambientDanger: 1.0 },
  1:  { name: BIOME_NAMES[1],  tint: 0xff5522, hazard: null,        ambientDanger: 1.3 },
  2:  { name: BIOME_NAMES[2],  tint: 0xaaddff, hazard: null,        ambientDanger: 1.2 },
  3:  { name: BIOME_NAMES[3],  tint: 0xddcc44, hazard: 'tornado',   ambientDanger: 1.4 },
  4:  { name: BIOME_NAMES[4],  tint: 0x553377, hazard: null,        ambientDanger: 1.5 },
  5:  { name: BIOME_NAMES[5],  tint: 0xffeeaa, hazard: null,        ambientDanger: 1.6 },
  6:  { name: BIOME_NAMES[6],  tint: 0x668844, hazard: 'quicksand', ambientDanger: 1.4 },
  7:  { name: BIOME_NAMES[7],  tint: 0x88ffee, hazard: null,        ambientDanger: 1.5 },
  8:  { name: BIOME_NAMES[8],  tint: 0xff6622, hazard: null,        ambientDanger: 1.7 },
  9:  { name: BIOME_NAMES[9],  tint: 0xaaffdd, hazard: null,        ambientDanger: 1.5 },
  10: { name: BIOME_NAMES[10], tint: 0x7799bb, hazard: null,        ambientDanger: 1.6 },
  11: { name: BIOME_NAMES[11], tint: 0x55aa44, hazard: null,        ambientDanger: 1.7 },
  12: { name: BIOME_NAMES[12], tint: 0xccbb99, hazard: 'quicksand', ambientDanger: 1.8 },
  13: { name: BIOME_NAMES[13], tint: 0x998877, hazard: null,        ambientDanger: 1.8 },
  14: { name: BIOME_NAMES[14], tint: 0xaa6644, hazard: 'tornado',   ambientDanger: 1.9 },
  15: { name: BIOME_NAMES[15], tint: 0x442266, hazard: 'pull',      ambientDanger: 2.2 },
  16: { name: BIOME_NAMES[16], tint: 0xcc88ff, hazard: null,        ambientDanger: 1.3 },
  17: { name: BIOME_NAMES[17], tint: 0xffdd88, hazard: 'quicksand', ambientDanger: 1.5 },
  18: { name: BIOME_NAMES[18], tint: 0xddeeff, hazard: null,        ambientDanger: 1.7 },
  19: { name: BIOME_NAMES[19], tint: 0x887744, hazard: null,        ambientDanger: 1.8 },
  20: { name: BIOME_NAMES[20], tint: 0xff8844, hazard: 'tornado',   ambientDanger: 2.0 },
}

// ── 元素 → 配色（渲染用） ─────────────────────────────────────────────────────
const ELEMENT_COLORS = {
  physical:  { color: 0x999988, glow: 0xccccaa },
  fire:      { color: 0xff4400, glow: 0xff8800 },
  ice:       { color: 0x88ccff, glow: 0xaaddff },
  dark:      { color: 0x6633aa, glow: 0x9955cc },
  holy:      { color: 0xffee88, glow: 0xffffaa },
  lightning: { color: 0xeedd44, glow: 0xffff00 },
  poison:    { color: 0x44bb44, glow: 0x66ff66 },
  water:     { color: 0x3388cc, glow: 0x55aaee },
  wind:      { color: 0xaaddcc, glow: 0xccffee },
}

// ── 怪物 ID → 形状（MonsterSystem._drawShape 支持的几何体） ───────────────────
const MONSTER_SHAPE = {
  // 基础 18
  slime: 'sprite', goblin: 'goblin', wolf: 'wolf', skeleton: 'undead',
  zombie: 'undead', orc: 'demon', spider: 'sprite', bat: 'bat',
  troll: 'bear', golem: 'golem', fire_elemental: 'sprite', ice_elemental: 'sprite',
  dark_mage: 'ghost', vine_monster: 'sprite', giant_insect: 'sprite', harpy: 'bird',
  cyclops: 'bear', lich: 'undead', dragon_whelp: 'lizard',
  // 扩展群系
  swamp_crawler: 'snake', toxic_frog: 'sprite', bog_wraith: 'ghost',
  frost_wolf: 'wolf', ice_golem: 'golem', blizzard_sprite: 'sprite',
  lava_salamander: 'lizard', magma_golem: 'golem', ember_bat: 'bat',
  crystal_scorpion: 'snake', rock_elemental: 'golem',
  thunder_hawk: 'bird', storm_elemental: 'sprite',
  shadow_panther: 'wolf', forest_wraith: 'ghost', dark_elf: 'goblin',
  ghost: 'ghost', ruin_skeleton: 'undead', banshee: 'ghost',
  death_knight: 'undead', necromancer_mob: 'ghost',
  void_stalker: 'demon', void_crawler: 'snake',
  star_guardian: 'angel', meteor_golem: 'golem',
  vortex_elemental: 'sprite', sand_scorpion: 'snake', sandstorm_djinn: 'sprite',
  deep_kraken: 'snake', sea_serpent: 'snake',
  cloud_giant: 'bear', sky_dragon: 'lizard',
  temple_guardian: 'golem', ancient_golem: 'golem',
}

/** 怪物 ID → 渲染描述 { shape, color, glowColor } */
export function getMonsterRender(monsterId) {
  const base = MONSTER_STATS[monsterId]
  if (!base) return { shape: 'default', color: 0x888888, glowColor: 0xaaaaaa }
  const elem = ELEMENT_COLORS[base.element] ?? ELEMENT_COLORS.physical
  return {
    shape: MONSTER_SHAPE[monsterId] ?? 'default',
    color: elem.color,
    glowColor: elem.glow,
  }
}

// ── M19：BiomeContentMap 生物（拟态怪 + Boss）渲染接入 ───────────────────────
//
// BiomeContentMap 的 disguisedMonsters / bosses 是完整数值对象，但没有形状字段。
// 用中文名称关键字推断 MonsterSystem._drawShape 支持的几何体，让 147 个生物
// 都能被实时画出来。优先级从具体到泛化。

const SHAPE_KEYWORDS = [
  [/巨龙|古龙|海龙|幼龙|龙|蜥/,                        'lizard'],
  [/九头|克拉肯|水蛭|蛭|水蛇|海蛇|蛇/,                'snake'],
  [/狼|豹/,                                            'wolf'],
  [/熊|野猪|巨兽|猛兽|犀|象/,                          'bear'],
  [/苍鹰|雄鹰|鹰|苍|隼|雕|飞鸟|鸟/,                    'bird'],
  [/蝙蝠|蝠/,                                          'bat'],
  [/巫妖|死灵|亡灵|骸|骨堆|骨|尸|墓|僵|看守者|领主.*亡|死亡(领主|骑士|百合)/, 'undead'],
  [/幽灵|鬼|魂|女巫|巫后|怨|幻影|裂缝恐怖/,            'ghost'],
  [/神·|·诺法尔|·阿图姆|·波塞冬|·托恩|·科里|·齐普斯|·奥苏曼|星辰守护|天星神|守护者长|圣|化身|天使/, 'angel'],
  [/泰坦|巨人|傀儡|石魔|石像|守护石|岩石|矿道|钟乳|雪人|守卫|傀|巨虫/, 'golem'],
  [/暗魔|魔法师|大法师|恶魔|哥布林|暗精灵|暗影|领主|妖/, 'demon'],
  [/精灵|元素|史莱姆|嫩芽|嫩苗|嫩|精|虫|玫瑰|百合|仙人掌|灌木|根|芦苇|水藻|海藻|荆棘|蛛|蟾|苗/, 'sprite'],
]

/** 按中文名推断渲染形状 */
export function inferShape(name) {
  for (const [re, shape] of SHAPE_KEYWORDS) {
    if (re.test(name)) return shape
  }
  return 'sprite'
}

/** BiomeContentMap 元素 → 群系级 element（用于配色） */
function biomeElement(biomeId) {
  return getBiomeContent(biomeId)?.element ?? 'physical'
}

/** 给一个 BiomeContentMap 生物对象生成渲染描述 */
function creatureRender(creature, biomeId) {
  // 名字含元素暗示则覆盖，否则用群系元素
  const name = creature.name ?? ''
  let elemKey = biomeElement(biomeId)
  if (/火|熔岩|余烬|炎/.test(name)) elemKey = 'fire'
  else if (/冰|霜|雪|极光|寒/.test(name)) elemKey = 'ice'
  else if (/雷|电|风暴|飓风|闪/.test(name)) elemKey = 'lightning'
  else if (/毒|沼泽|腐|瘟疫/.test(name)) elemKey = 'poison'
  else if (/暗|虚空|死|幽|亡/.test(name)) elemKey = 'dark'
  else if (/圣|星|神|光|天使/.test(name)) elemKey = 'holy'
  else if (/海|水|漩涡|深渊|浪/.test(name)) elemKey = 'water'
  const elem = ELEMENT_COLORS[elemKey] ?? ELEMENT_COLORS.physical
  return { shape: inferShape(name), color: elem.color, glowColor: elem.glow }
}

/** Boss tier → 视觉/行为参数 */
const BOSS_TIER_META = {
  field: { sizeScale: 1.7, minLevel: 1,  prefix: '【BOSS】' },
  area:  { sizeScale: 2.1, minLevel: 8,  prefix: '【区域BOSS】' },
  zone:  { sizeScale: 2.6, minLevel: 18, prefix: '【领主BOSS】' },
}

// ── 难度缩放总监（M8） ───────────────────────────────────────────────────────

/** 屏上怪物上限：随玩家等级递增 */
export function getDensityForLevel(level) {
  if (level <= 5)  return 6
  if (level <= 10) return 10
  if (level <= 20) return 16
  if (level <= 30) return 22
  return 30
}

/** 精英怪刷新概率：lv1=4% → lv50≈30% */
export function getEliteChance(level) {
  return Math.min(0.30, 0.04 + level * 0.005)
}

/** Boss 刷新概率：lv10 起出现，lv50≈8% */
export function getBossChance(level) {
  if (level < 10) return 0
  return Math.min(0.08, (level - 10) * 0.002)
}

export class BiomeSystem {
  /**
   * @param {WorldGen} worldGen
   * @param {DayNightSystem|null} dayNight  用于夜间密度加成判定
   */
  constructor(worldGen, dayNight = null) {
    this.worldGen = worldGen
    this.dayNight = dayNight
  }

  /** 当前是否夜晚（夜间密度 ×1.5） */
  isNight() {
    if (!this.dayNight) return false
    return typeof this.dayNight.isDay === 'function' ? !this.dayNight.isDay() : false
  }

  /** 群系元数据 */
  getBiomeInfo(biomeId) {
    return BIOME_REGISTRY[biomeId] ?? BIOME_REGISTRY[0]
  }

  /** 群系危害类型（'quicksand'|'tornado'|'pull'|null） */
  getHazard(biomeId) {
    return this.getBiomeInfo(biomeId).hazard
  }

  /** 当前等级 + 昼夜下的屏上怪物上限 */
  getMaxMonsters(playerLevel) {
    const base = getDensityForLevel(playerLevel)
    return this.isNight() ? Math.round(base * 1.5) : base
  }

  /**
   * 抽取一只怪物的完整生成描述。
   * M19：三类来源 — Boss（领域/区域/领主）/ 拟态怪 / 普通小怪。
   * @param {number} biomeId
   * @param {number} playerLevel
   * @returns {SpawnDesc|null}
   */
  rollSpawn(biomeId, playerLevel) {
    const content = getBiomeContent(biomeId)

    // ── 1) Boss 抽取（按等级门槛 + 概率）──────────────────────────────────
    if (content?.bosses?.length) {
      const bossChance = Math.max(getBossChance(playerLevel), playerLevel >= 10 ? 0.015 : 0)
      if (bossChance > 0 && Math.random() < bossChance) {
        const desc = this._rollBoss(content.bosses, biomeId, playerLevel)
        if (desc) return desc
      }
    }

    // ── 2) 拟态怪抽取（~16%）─────────────────────────────────────────────
    if (content?.disguisedMonsters?.length && Math.random() < 0.16) {
      const desc = this._rollDisguised(content.disguisedMonsters, biomeId, playerLevel)
      if (desc) return desc
    }

    // ── 3) 普通小怪（沿用 MonsterStats / BIOME_MONSTER_POOL）─────────────
    return this._rollSmall(biomeId, playerLevel)
  }

  /** M19：从 BiomeContentMap bosses 构建 Boss spawn 描述 */
  _rollBoss(bosses, biomeId, playerLevel) {
    // 仅取等级允许的 tier，越高 tier 越稀有
    const eligible = bosses.filter(b => {
      const meta = BOSS_TIER_META[b.tier] ?? BOSS_TIER_META.field
      return playerLevel >= meta.minLevel
    })
    if (eligible.length === 0) return null
    // 加权：field 多、zone 少
    const tierWeight = { field: 0.6, area: 0.3, zone: 0.1 }
    const weighted = []
    for (const b of eligible) weighted.push(...Array(Math.round((tierWeight[b.tier] ?? 0.3) * 10)).fill(b))
    const boss = weighted[Math.floor(Math.random() * weighted.length)] ?? eligible[0]
    const meta = BOSS_TIER_META[boss.tier] ?? BOSS_TIER_META.field

    const lvMul = 1 + (playerLevel - 1) * 0.05
    return {
      id: boss.id,
      name: meta.prefix + boss.name,
      isElite: false,
      isBoss: true,
      stats: {
        hp:      Math.round(boss.hp * lvMul),
        physAtk: Math.round((boss.physAtk ?? 0) * lvMul),
        magAtk:  Math.round((boss.magAtk ?? 0) * lvMul),
        physDef: boss.physDef ?? 0,
        magDef:  boss.magDef ?? 0,
        xp:      Math.round((boss.xp ?? 100) * lvMul),
        dropRate: boss.dropRate ?? 0.6,
        lootTable: boss.lootTable ?? ['ore_rare'],
      },
      render: creatureRender(boss, biomeId),
      sizeScale: meta.sizeScale,
      element: biomeElement(biomeId),
      skills: boss.skills ?? [],
    }
  }

  /** M19：从 BiomeContentMap disguisedMonsters 构建拟态怪 spawn 描述 */
  _rollDisguised(disguised, biomeId, playerLevel) {
    const c = disguised[Math.floor(Math.random() * disguised.length)]
    if (!c) return null
    const lvMul = 1 + (playerLevel - 1) * 0.05
    return {
      id: c.id,
      name: '拟态·' + c.name,
      isElite: true,        // 拟态怪视作精英级（值得打）
      isBoss: false,
      stats: {
        hp:      Math.round(c.hp * lvMul),
        physAtk: Math.round((c.physAtk ?? 0) * lvMul),
        magAtk:  Math.round((c.magAtk ?? 0) * lvMul),
        physDef: c.physDef ?? 0,
        magDef:  c.magDef ?? 0,
        xp:      Math.round((c.xp ?? 30) * lvMul),
        dropRate: c.dropRate ?? 0.28,
        lootTable: ['ore_common'],
      },
      render: creatureRender(c, biomeId),
      sizeScale: 1.25,
      element: biomeElement(biomeId),
      special: c.special ?? null,
    }
  }

  /** 普通小怪：原 M13 路径 */
  _rollSmall(biomeId, playerLevel) {
    const pool = BIOME_MONSTER_POOL[biomeId]
    if (!pool || pool.length === 0) return null

    const id = pool[Math.floor(Math.random() * pool.length)]
    const base = MONSTER_STATS[id]
    if (!base) return null

    // 判定 Boss / 精英（Boss 优先，且模板本身可能就是 Boss）
    let isBoss  = false
    let isElite = false
    if (base.isBoss) {
      isBoss = Math.random() < Math.max(getBossChance(playerLevel), 0.02)
      isElite = !isBoss
    } else {
      if (Math.random() < getBossChance(playerLevel)) {
        isBoss = true
      } else if (Math.random() < getEliteChance(playerLevel)) {
        isElite = true
      }
    }

    const stats = getMonsterStatsAtLevel(id, playerLevel, isElite, isBoss)
    if (!stats) return null

    const render = getMonsterRender(id)
    const sizeScale = isBoss ? 1.8 : isElite ? 1.3 : 1.0
    const namePrefix = isBoss ? '【BOSS】' : isElite ? '★精英 ' : ''

    return {
      id,
      name: namePrefix + base.name,
      isElite,
      isBoss,
      stats,
      render,
      sizeScale,
      element: base.element,
    }
  }

  /** 环境危险系数（影响刷新积极度，可选用于场景层调参） */
  getDangerFactor(biomeId) {
    return this.getBiomeInfo(biomeId).ambientDanger ?? 1.0
  }
}
