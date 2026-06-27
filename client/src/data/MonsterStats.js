/**
 * MonsterStats.js — 全怪物血量 & 战斗属性
 *
 * 覆盖 MonsterSystem.js 中 18 类基础怪 + M5 扩展的 45 只新怪（共 63 种）
 * 怪物等级由 CombatSystem 动态套用 levelMult 缩放。
 *
 * 属性说明：
 *   hp        — 基础血量（玩家等级1时）
 *   physAtk   — 物理攻击
 *   magAtk    — 魔法攻击（0=纯物理怪）
 *   physDef   — 物理防御
 *   magDef    — 魔法防御
 *   xp        — 击杀经验值（基础）
 *   dropRate  — 掉落武器/道具概率（0.0–1.0）
 *   isElite   — 是否精英怪模板（精英怪属性 ×2.5）
 *   isBoss    — 是否Boss模板（Boss属性 ×8.0）
 *   element   — 属性克制（fire/ice/lightning/dark/holy/poison/physical/wind）
 *   lootTable — 偏好掉落类型
 *
 * 等级缩放公式（CombatSystem 使用）：
 *   actualHp  = hp  × (1 + 0.18 × monsterLevel)
 *   actualAtk = atk × (1 + 0.14 × monsterLevel)
 *   actualXp  = xp  × (1 + 0.10 × monsterLevel)
 */

export const MONSTER_STATS = {

  // ════════════════════════════════════════════════
  //  基础 18 种怪物（草原/森林/洞窟/基础群系）
  // ════════════════════════════════════════════════

  slime: {
    name: '史莱姆', hp: 60,
    physAtk: 8,  magAtk: 0,  physDef: 2,  magDef: 2,
    xp: 8, dropRate: 0.15, element: 'physical',
    lootTable: ['potion_minor', 'ore_common'],
    desc: '最弱小的怪物，适合练级',
  },
  goblin: {
    name: '哥布林', hp: 120,
    physAtk: 18, magAtk: 0,  physDef: 8,  magDef: 4,
    xp: 18, dropRate: 0.25, element: 'physical',
    lootTable: ['dagger', 'coin', 'throwknife'],
    desc: '成群出没，单个不强但数量多',
  },
  wolf: {
    name: '野狼', hp: 160,
    physAtk: 25, magAtk: 0,  physDef: 10, magDef: 5,
    xp: 22, dropRate: 0.20, element: 'physical',
    lootTable: ['fang', 'hide', 'bow'],
    desc: '移速快，喜欢追击落单玩家',
  },
  skeleton: {
    name: '骷髅兵', hp: 140,
    physAtk: 22, magAtk: 5,  physDef: 12, magDef: 8,
    xp: 25, dropRate: 0.30, element: 'dark',
    lootTable: ['sword', 'bone', 'scroll'],
    desc: '不死系，圣光伤害×2；火焰+50%',
  },
  zombie: {
    name: '僵尸', hp: 220,
    physAtk: 20, magAtk: 8,  physDef: 15, magDef: 6,
    xp: 28, dropRate: 0.25, element: 'dark',
    lootTable: ['potion_poison', 'rotten_flesh'],
    desc: '高血低攻，施加缓速debuff',
  },
  orc: {
    name: '兽人战士', hp: 300,
    physAtk: 38, magAtk: 0,  physDef: 22, magDef: 8,
    xp: 40, dropRate: 0.35, element: 'physical',
    lootTable: ['axe', 'hammer', 'ore_iron'],
    desc: '近战强力，经验值高，适合中期练级',
  },
  spider: {
    name: '巨型蜘蛛', hp: 180,
    physAtk: 24, magAtk: 12, physDef: 8,  magDef: 10,
    xp: 30, dropRate: 0.28, element: 'poison',
    lootTable: ['web_silk', 'throwknife', 'dagger'],
    desc: '注射毒素，毒伤持续5秒',
  },
  bat: {
    name: '血蝙蝠', hp: 90,
    physAtk: 14, magAtk: 5,  physDef: 4,  magDef: 8,
    xp: 12, dropRate: 0.18, element: 'dark',
    lootTable: ['bat_wing', 'potion_minor'],
    desc: '飞行单位，攻击吸血回复自身10%伤害',
  },
  troll: {
    name: '山地巨魔', hp: 480,
    physAtk: 55, magAtk: 0,  physDef: 35, magDef: 15,
    xp: 65, dropRate: 0.40, element: 'physical',
    lootTable: ['greatsword', 'hammer', 'ore_rare'],
    desc: '高血厚甲，每8秒自动回血20',
  },
  golem: {
    name: '石头傀儡', hp: 600,
    physAtk: 45, magAtk: 0,  physDef: 55, magDef: 20,
    xp: 80, dropRate: 0.45, element: 'physical',
    lootTable: ['ore_iron', 'ore_rare', 'gauntlets'],
    desc: '物防极高，用魔法攻击效率更高',
  },
  fire_elemental: {
    name: '火焰元素', hp: 260,
    physAtk: 10, magAtk: 50, physDef: 8,  magDef: 30,
    xp: 55, dropRate: 0.38, element: 'fire',
    lootTable: ['fire_core', 'orb', 'ore_fire'],
    desc: '冰系技能造成+80%伤害；火系免疫',
  },
  ice_elemental: {
    name: '冰霜元素', hp: 240,
    physAtk: 8,  magAtk: 45, physDef: 10, magDef: 28,
    xp: 50, dropRate: 0.38, element: 'ice',
    lootTable: ['ice_core', 'orb', 'ore_ice'],
    desc: '命中后施加缓速3秒；火系技能+80%',
  },
  dark_mage: {
    name: '黑暗法师', hp: 200,
    physAtk: 5,  magAtk: 62, physDef: 8,  magDef: 38,
    xp: 70, dropRate: 0.42, element: 'dark',
    lootTable: ['scroll', 'staff', 'ore_dark'],
    desc: '远程魔法攻击，施加诅咒debuff，击杀有奖励卷轴',
  },
  vine_monster: {
    name: '藤蔓怪', hp: 320,
    physAtk: 30, magAtk: 15, physDef: 20, magDef: 10,
    xp: 45, dropRate: 0.32, element: 'poison',
    lootTable: ['vine', 'potion_poison', 'bow'],
    desc: '埋伏地下伸出攻击，会施加毒性和缠绕',
  },
  giant_insect: {
    name: '巨型甲虫', hp: 150,
    physAtk: 20, magAtk: 0,  physDef: 25, magDef: 5,
    xp: 20, dropRate: 0.22, element: 'physical',
    lootTable: ['chitin', 'ore_common'],
    desc: '物防高但移速慢，背部是弱点',
  },
  harpy: {
    name: '哈比女妖', hp: 195,
    physAtk: 28, magAtk: 18, physDef: 10, magDef: 15,
    xp: 35, dropRate: 0.30, element: 'wind',
    lootTable: ['feather', 'dagger', 'crossbow'],
    desc: '飞行单位，风系技能，集群攻击',
  },
  cyclops: {
    name: '独眼巨人', hp: 780,
    physAtk: 75, magAtk: 0,  physDef: 42, magDef: 20,
    xp: 110, dropRate: 0.50, element: 'physical',
    lootTable: ['greatsword', 'ore_rare', 'hammer'],
    desc: '精英级强敌，投掷巨石远程攻击，范围AOE',
  },
  lich: {
    name: '巫妖', hp: 550,
    physAtk: 8,  magAtk: 90, physDef: 15, magDef: 55,
    xp: 150, dropRate: 0.60, element: 'dark',
    lootTable: ['staff', 'scroll', 'ore_rare', 'ore_dark'],
    desc: '稀有精英怪，死灵魔法强大，击杀有小概率掉落稀有卷轴',
  },
  dragon_whelp: {
    name: '幼龙', hp: 900,
    physAtk: 80, magAtk: 60, physDef: 50, magDef: 45,
    xp: 200, dropRate: 0.70, element: 'fire',
    lootTable: ['dragon_scale', 'ore_rare', 'orb', 'greatsword'],
    desc: '小型Boss，物魔双修，火焰喷吐AOE',
  },

  // ════════════════════════════════════════════════
  //  M5 群系怪物（biome 6–20 对应）
  // ════════════════════════════════════════════════

  // ── 群系 6: 腐化沼泽 ─────────────────────────────
  swamp_crawler: {
    name: '沼泽爬行者', hp: 200,
    physAtk: 22, magAtk: 18, physDef: 12, magDef: 8,
    xp: 32, dropRate: 0.28, element: 'poison',
    lootTable: ['potion_poison', 'vine', 'dagger'],
  },
  toxic_frog: {
    name: '剧毒蟾蜍', hp: 140,
    physAtk: 12, magAtk: 25, physDef: 6,  magDef: 12,
    xp: 28, dropRate: 0.24, element: 'poison',
    lootTable: ['poison_gland', 'potion_minor'],
  },
  bog_wraith: {
    name: '沼泽幽灵', hp: 280,
    physAtk: 5,  magAtk: 45, physDef: 5,  magDef: 30,
    xp: 55, dropRate: 0.40, element: 'dark',
    lootTable: ['ectoplasm', 'scroll'],
  },

  // ── 群系 7: 极光冻原 ─────────────────────────────
  frost_wolf: {
    name: '霜雪狼', hp: 220,
    physAtk: 32, magAtk: 8,  physDef: 14, magDef: 18,
    xp: 38, dropRate: 0.28, element: 'ice',
    lootTable: ['ice_fang', 'hide', 'bow'],
  },
  ice_golem: {
    name: '冰晶傀儡', hp: 700,
    physAtk: 48, magAtk: 20, physDef: 48, magDef: 35,
    xp: 90, dropRate: 0.48, element: 'ice',
    lootTable: ['ice_core', 'ore_ice', 'gauntlets'],
  },
  blizzard_sprite: {
    name: '暴雪精灵', hp: 160,
    physAtk: 5,  magAtk: 38, physDef: 6,  magDef: 22,
    xp: 42, dropRate: 0.35, element: 'ice',
    lootTable: ['snowflake_crystal', 'orb'],
  },

  // ── 群系 8: 熔岩矿脉 ─────────────────────────────
  lava_salamander: {
    name: '熔岩蝾螈', hp: 250,
    physAtk: 30, magAtk: 25, physDef: 20, magDef: 18,
    xp: 45, dropRate: 0.32, element: 'fire',
    lootTable: ['fire_core', 'ore_fire'],
  },
  magma_golem: {
    name: '岩浆傀儡', hp: 850,
    physAtk: 65, magAtk: 30, physDef: 60, magDef: 25,
    xp: 115, dropRate: 0.52, element: 'fire',
    lootTable: ['magma_ore', 'fire_core', 'hammer'],
  },
  ember_bat: {
    name: '火焰蝙蝠', hp: 130,
    physAtk: 18, magAtk: 22, physDef: 5,  magDef: 15,
    xp: 30, dropRate: 0.20, element: 'fire',
    lootTable: ['fire_wing', 'potion_minor'],
  },

  // ── 群系 9: 晶岩峡谷 ─────────────────────────────
  crystal_scorpion: {
    name: '水晶蝎子', hp: 190,
    physAtk: 28, magAtk: 10, physDef: 30, magDef: 12,
    xp: 35, dropRate: 0.30, element: 'physical',
    lootTable: ['crystal_shard', 'ore_rare'],
  },
  rock_elemental: {
    name: '岩石元素', hp: 650,
    physAtk: 55, magAtk: 5,  physDef: 65, magDef: 15,
    xp: 85, dropRate: 0.45, element: 'physical',
    lootTable: ['ore_iron', 'ore_rare', 'gauntlets'],
  },

  // ── 群系 10: 雷霆高地 ────────────────────────────
  thunder_hawk: {
    name: '雷鹰', hp: 175,
    physAtk: 22, magAtk: 32, physDef: 8,  magDef: 20,
    xp: 40, dropRate: 0.30, element: 'lightning',
    lootTable: ['thunder_feather', 'crossbow'],
  },
  storm_elemental: {
    name: '风暴元素', hp: 300,
    physAtk: 12, magAtk: 58, physDef: 10, magDef: 35,
    xp: 65, dropRate: 0.42, element: 'lightning',
    lootTable: ['lightning_core', 'orb', 'ore_rare'],
  },

  // ── 群系 11: 暗影密林 ────────────────────────────
  shadow_panther: {
    name: '暗影豹', hp: 240,
    physAtk: 42, magAtk: 8,  physDef: 15, magDef: 20,
    xp: 50, dropRate: 0.35, element: 'dark',
    lootTable: ['shadow_pelt', 'dagger'],
  },
  forest_wraith: {
    name: '林中幽灵', hp: 200,
    physAtk: 5,  magAtk: 50, physDef: 5,  magDef: 32,
    xp: 58, dropRate: 0.40, element: 'dark',
    lootTable: ['ectoplasm', 'scroll', 'staff'],
  },
  dark_elf: {
    name: '暗精灵', hp: 165,
    physAtk: 35, magAtk: 25, physDef: 12, magDef: 18,
    xp: 45, dropRate: 0.38, element: 'dark',
    lootTable: ['dagger', 'bow', 'ore_dark'],
  },

  // ── 群系 12: 幽灵废墟 ────────────────────────────
  ghost: {
    name: '幽灵', hp: 180,
    physAtk: 5,  magAtk: 40, physDef: 2,  magDef: 40,
    xp: 48, dropRate: 0.38, element: 'dark',
    lootTable: ['ectoplasm', 'scroll'],
    desc: '免疫物理伤害的50%',
  },
  ruin_skeleton: {
    name: '废墟骷髅', hp: 165,
    physAtk: 28, magAtk: 8,  physDef: 18, magDef: 10,
    xp: 30, dropRate: 0.28, element: 'dark',
    lootTable: ['bone', 'sword'],
  },
  banshee: {
    name: '女妖精', hp: 220,
    physAtk: 2,  magAtk: 55, physDef: 5,  magDef: 35,
    xp: 65, dropRate: 0.45, element: 'dark',
    lootTable: ['soul_fragment', 'scroll'],
    desc: '嚎叫造成范围恐惧减速',
  },

  // ── 群系 13: 亡灵荒地 ────────────────────────────
  death_knight: {
    name: '死亡骑士', hp: 520,
    physAtk: 65, magAtk: 20, physDef: 45, magDef: 30,
    xp: 95, dropRate: 0.55, element: 'dark',
    lootTable: ['greatsword', 'ore_dark', 'scroll'],
    desc: '精英怪，圣光伤害×3',
  },
  necromancer_mob: {
    name: '小死灵法师', hp: 210,
    physAtk: 5,  magAtk: 58, physDef: 8,  magDef: 35,
    xp: 70, dropRate: 0.50, element: 'dark',
    lootTable: ['scroll', 'staff'],
    desc: '可召唤骷髅，先杀它防止源源不断',
  },

  // ── 群系 14: 虚空裂缝 ────────────────────────────
  void_stalker: {
    name: '虚空追猎者', hp: 380,
    physAtk: 50, magAtk: 45, physDef: 25, magDef: 30,
    xp: 90, dropRate: 0.52, element: 'dark',
    lootTable: ['void_shard', 'orb', 'ore_rare'],
    desc: '物魔双属性，瞬移突进',
  },
  void_crawler: {
    name: '虚空爬行者', hp: 160,
    physAtk: 20, magAtk: 28, physDef: 10, magDef: 15,
    xp: 45, dropRate: 0.30, element: 'dark',
    lootTable: ['void_shard', 'dagger'],
  },

  // ── 群系 15: 星空秘境 ────────────────────────────
  star_guardian: {
    name: '星辰守护者', hp: 480,
    physAtk: 45, magAtk: 55, physDef: 38, magDef: 42,
    xp: 105, dropRate: 0.58, element: 'holy',
    lootTable: ['stardust', 'orb', 'ore_rare'],
    desc: '神圣属性，黑暗系英雄受额外+50%伤害',
  },
  meteor_golem: {
    name: '陨石傀儡', hp: 950,
    physAtk: 80, magAtk: 30, physDef: 70, magDef: 30,
    xp: 160, dropRate: 0.65, element: 'fire',
    lootTable: ['meteor_core', 'ore_rare', 'hammer'],
    desc: '大型精英怪，陨石坠落AOE',
  },

  // ── 群系 16: 漩涡之地 ────────────────────────────
  vortex_elemental: {
    name: '漩涡元素', hp: 320,
    physAtk: 15, magAtk: 60, physDef: 12, magDef: 38,
    xp: 75, dropRate: 0.42, element: 'wind',
    lootTable: ['wind_core', 'orb'],
    desc: '持续吸引玩家向中心，逃离困难',
  },

  // ── 群系 17: 流沙平原 ────────────────────────────
  sand_scorpion: {
    name: '沙漠蝎', hp: 195,
    physAtk: 26, magAtk: 12, physDef: 18, magDef: 10,
    xp: 35, dropRate: 0.28, element: 'poison',
    lootTable: ['scorpion_tail', 'ore_common'],
  },
  sandstorm_djinn: {
    name: '沙暴精灵', hp: 420,
    physAtk: 20, magAtk: 65, physDef: 15, magDef: 40,
    xp: 85, dropRate: 0.48, element: 'wind',
    lootTable: ['sandstorm_core', 'scroll', 'orb'],
    desc: '召唤沙尘暴降低玩家视野',
  },

  // ── 群系 18: 深渊海域 ────────────────────────────
  deep_kraken: {
    name: '深渊克拉肯', hp: 1200,
    physAtk: 95, magAtk: 45, physDef: 55, magDef: 40,
    xp: 220, dropRate: 0.72, element: 'water',
    lootTable: ['kraken_tentacle', 'ore_rare', 'greatsword'],
    desc: 'Boss级怪物，触手攻击AOE',
    isBoss: true,
  },
  sea_serpent: {
    name: '海蛇', hp: 580,
    physAtk: 70, magAtk: 20, physDef: 40, magDef: 25,
    xp: 110, dropRate: 0.52, element: 'water',
    lootTable: ['sea_scale', 'spear', 'ore_rare'],
  },

  // ── 群系 19: 天空浮岛 ────────────────────────────
  cloud_giant: {
    name: '云端巨人', hp: 1100,
    physAtk: 100, magAtk: 20, physDef: 60, magDef: 30,
    xp: 190, dropRate: 0.68, element: 'wind',
    lootTable: ['giant_club', 'ore_rare', 'hammer', 'greatsword'],
    isBoss: true,
  },
  sky_dragon: {
    name: '天空巨龙', hp: 2500,
    physAtk: 140, magAtk: 100, physDef: 90, magDef: 80,
    xp: 500, dropRate: 0.90, element: 'wind',
    lootTable: ['dragon_scale', 'ore_rare', 'orb', 'greatsword'],
    isBoss: true,
    desc: '世界Boss，全地图最强怪，建议组队4人挑战',
  },

  // ── 群系 20: 远古神殿 ────────────────────────────
  temple_guardian: {
    name: '神殿守卫', hp: 680,
    physAtk: 75, magAtk: 40, physDef: 55, magDef: 50,
    xp: 130, dropRate: 0.60, element: 'holy',
    lootTable: ['ancient_relic', 'ore_rare', 'sword'],
  },
  ancient_golem: {
    name: '远古傀儡', hp: 1500,
    physAtk: 110, magAtk: 50, physDef: 85, magDef: 65,
    xp: 280, dropRate: 0.80, element: 'holy',
    lootTable: ['ancient_core', 'ore_rare', 'orb', 'greatsword'],
    isBoss: true,
    desc: '神殿Boss，物魔双高防，先破防再输出',
  },
}

// ── 等级缩放工具函数 ──────────────────────────────────────────────────────

/**
 * 获取指定等级下的怪物实际属性
 * @param {string} monsterId
 * @param {number} level
 * @param {boolean} isElite  是否精英怪（属性×2.5）
 * @param {boolean} isBoss   是否Boss（属性×8.0）
 */
export function getMonsterStatsAtLevel(monsterId, level = 1, isElite = false, isBossOverride = false) {
  const base = MONSTER_STATS[monsterId]
  if (!base) return null

  const lv   = Math.max(1, level) - 1
  const mult = isBossOverride || base.isBoss ? 8.0 : isElite ? 2.5 : 1.0

  return {
    hp:      Math.floor(base.hp      * (1 + 0.18 * lv) * mult),
    physAtk: Math.floor(base.physAtk * (1 + 0.14 * lv) * mult),
    magAtk:  Math.floor(base.magAtk  * (1 + 0.14 * lv) * mult),
    physDef: Math.floor(base.physDef * (1 + 0.08 * lv) * mult),
    magDef:  Math.floor(base.magDef  * (1 + 0.08 * lv) * mult),
    xp:      Math.floor(base.xp      * (1 + 0.10 * lv) * mult),
    dropRate:  Math.min(0.95, base.dropRate * (isElite ? 1.5 : 1.0)),
    lootTable: base.lootTable ?? [],
    element:   base.element ?? 'physical',
    isBoss: isBossOverride || !!base.isBoss,
    isElite,
  }
}

/** 按群系获取可刷新的怪物列表 */
export const BIOME_MONSTER_POOL = {
  0:  ['slime','goblin','wolf','giant_insect'],
  1:  ['wolf','harpy','goblin','vine_monster'],
  2:  ['spider','snake','goblin'],
  3:  ['skeleton','zombie','bat','ruin_skeleton'],
  4:  ['golem','crystal_scorpion','rock_elemental','orc'],
  5:  ['lava_salamander','magma_golem','ember_bat','fire_elemental'],
  6:  ['swamp_crawler','toxic_frog','bog_wraith','vine_monster'],
  7:  ['frost_wolf','ice_golem','blizzard_sprite','ice_elemental'],
  8:  ['thunder_hawk','storm_elemental'],
  9:  ['shadow_panther','forest_wraith','dark_elf'],
  10: ['ghost','ruin_skeleton','banshee'],
  11: ['death_knight','necromancer_mob','zombie','skeleton'],
  12: ['void_stalker','void_crawler'],
  13: ['star_guardian','meteor_golem'],
  14: ['vortex_elemental','harpy'],
  15: ['sand_scorpion','sandstorm_djinn'],
  16: ['deep_kraken','sea_serpent'],
  17: ['cloud_giant','sky_dragon','harpy'],
  18: ['temple_guardian','ancient_golem'],
  19: ['troll','orc','cyclops'],
  20: ['lich','dark_mage','bat'],
}
