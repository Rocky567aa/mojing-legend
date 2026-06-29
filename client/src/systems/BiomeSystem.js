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
   * @param {number} biomeId
   * @param {number} playerLevel
   * @returns {SpawnDesc|null}
   */
  rollSpawn(biomeId, playerLevel) {
    const pool = BIOME_MONSTER_POOL[biomeId]
    if (!pool || pool.length === 0) return null

    const id = pool[Math.floor(Math.random() * pool.length)]
    const base = MONSTER_STATS[id]
    if (!base) return null

    // 判定 Boss / 精英（Boss 优先，且模板本身可能就是 Boss）
    let isBoss  = false
    let isElite = false
    if (base.isBoss) {
      // Boss 模板：按 Boss 概率决定本次是否真的刷新为 Boss，否则降级精英
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
    // 精英/Boss 视觉放大 + 名字前缀
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
