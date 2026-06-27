/**
 * BiomeContentMap_B.js — 群系 7-13 内容配置
 * (自动生成；与 BiomeContentMap_B.js / _C.js 合并使用)
 */

export const BIOME_CONTENT_B = {
  // ══════════════════════════════════════════════════
  // Biome 7 — 极光冻原
  // ══════════════════════════════════════════════════
  7: {
    name: '极光冻原',
    element: 'ice',

    mushrooms: [
      { id: '7_frost_cap', name: '霜雪菌', type: 'edible', rarity: 'common', hpRestore: 65, effect: "ice_resist_10s", desc: '食后获得冰霜抗性' },
      { id: '7_snowbell', name: '雪铃菇', type: 'edible', rarity: 'common', hpRestore: 50, effect: null, desc: '雪花般洁白，清凉可口' },
      { id: '7_ice_truffle', name: '冰晶松露', type: 'edible', rarity: 'uncommon', hpRestore: 95, effect: "crit_up_12s", desc: '低温提升专注力，暴击率+10%' },
      { id: '7_aurora_shroom', name: '极光菌', type: 'edible', rarity: 'rare', hpRestore: 180, effect: "perm_magAtk_6", desc: '北极光滋养，永久魔攻+6' },
      { id: '7_frostbite_cap', name: '冻伤毒菌', type: 'toxic', rarity: 'common', hpRestore: -50, effect: "freeze_3s", desc: '触碰即冻伤' },
      { id: '7_blizzard_spore', name: '暴雪孢子菌', type: 'toxic', rarity: 'common', hpRestore: -70, effect: "slow_10s", desc: '冰晶孢子大幅减速' },
      { id: '7_ice_poison', name: '冰毒菌', type: 'toxic', rarity: 'uncommon', hpRestore: -90, effect: "freeze_5s", desc: '冰冻持续更久' },
      { id: '7_permafrost_cap', name: '永冻毒帽', type: 'toxic', rarity: 'rare', hpRestore: -140, effect: "freeze_8s", desc: '完全冻结，8秒无法行动' },
    ],

    plants: [
      { id: '7_snow_berry', name: '雪地浆果', type: 'edible', hpRestore: 30, effect: "ice_resist_8s", desc: '低温保存，清凉甘甜' },
      { id: '7_frost_fern', name: '霜雪蕨', type: 'medicine', hpRestore: 0, effect: "freeze_cure", desc: '解除冰冻状态' },
      { id: '7_ice_flower', name: '冰晶花', type: 'decorative', hpRestore: 0, effect: "freeze_aura_3s", desc: '靠近有冰冻敌人效果' },
      { id: '7_frozen_vine', name: '冻结藤蔓', type: 'hazard', hpRestore: 0, effect: "freeze_3s", desc: '触碰即冻结' },
      { id: '7_blizzard_grass', name: '暴雪草', type: 'hazard', hpRestore: -15, effect: "slow_8s", desc: '冰晶刺入减速' },
      { id: '7_tundra_herb', name: '冻原草药', type: 'medicine', hpRestore: 40, effect: "cold_heal", desc: '寒地特有，回血效果好' },
      { id: '7_aurora_bloom', name: '极光花', type: 'rare', hpRestore: 0, effect: "perm_magAtk_3", desc: '极光染色，永久魔攻+3' },
      { id: '7_permafrost_root', name: '永冻草根', type: 'edible', hpRestore: 25, effect: null, desc: '解冻后可食，营养丰富' },
    ],

    smallMonsters: ['frost_wolf', 'blizzard_sprite', 'ice_elemental', 'ice_golem'],

    disguisedMonsters: [
      { id: '7_snow_bush_golem', name: '雪地灌木傀儡', disguisedAs: '雪地灌木', hp: 350, physAtk: 42, magAtk: 8, physDef: 40, magDef: 28, special: '冰晶爆炸AOE+冻结2s', revealTrigger: 'hit', xp: 70, dropRate: 0.42 },
      { id: '7_frozen_vine_ser', name: '冻结藤蛇', disguisedAs: '冻结藤蔓', hp: 180, physAtk: 30, magAtk: 18, physDef: 12, magDef: 22, special: '缠绕+冰冻4s', revealTrigger: 'approach', xp: 45, dropRate: 0.34 },
      { id: '7_ice_flower_trap', name: '冰晶花陷阱', disguisedAs: '冰晶花', hp: 200, physAtk: 8, magAtk: 48, physDef: 10, magDef: 35, special: '冰冻凝视3s', revealTrigger: 'approach', xp: 50, dropRate: 0.36 },
      { id: '7_tundra_mimic', name: '冻原草药拟态', disguisedAs: '冻原草药', hp: 160, physAtk: 20, magAtk: 25, physDef: 15, magDef: 20, special: '寒气喷射减速8s', revealTrigger: 'hit', xp: 42, dropRate: 0.32 },
    ],

    bosses: [
      { id: '7_frost_yeti', name: '冰原雪人', tier: 'field', hp: 900, physAtk: 85, magAtk: 10, physDef: 50, magDef: 30, skills: ['冰拳猛击', '寒气吐息', '雪球轰炸'], xp: 180, dropRate: 0.68, lootTable: ['hammer', 'ice_fang', 'hide'] },
      { id: '7_glacier_golem', name: '冰川傀儡', tier: 'area', hp: 2300, physAtk: 90, magAtk: 30, physDef: 85, magDef: 55, skills: ['冰壁护盾', '冰晶爆炸', '寒冰领域', '冻结光线'], xp: 550, dropRate: 0.8, lootTable: ['ore_ice', 'ice_core', 'ore_rare'] },
      { id: '7_frost_queen', name: '极光女王·伊萨菲', tier: 'zone', hp: 5500, physAtk: 50, magAtk: 150, physDef: 40, magDef: 95, skills: ['永冻领域', '极光炮', '冰晶风暴', '冬日降临', '绝对零度'], xp: 1350, dropRate: 0.92, lootTable: ['staff', 'ice_core', 'ore_rare', 'orb'] },
    ],
  },

  // ══════════════════════════════════════════════════
  // Biome 8 — 雷霆高地
  // ══════════════════════════════════════════════════
  8: {
    name: '雷霆高地',
    element: 'lightning',

    mushrooms: [
      { id: '8_thunder_cap', name: '雷霆菌', type: 'edible', rarity: 'common', hpRestore: 70, effect: "lightning_resist_10s", desc: '食后获得雷电抗性' },
      { id: '8_static_shroom', name: '静电蘑菇', type: 'edible', rarity: 'common', hpRestore: 55, effect: "spd_up_8s", desc: '充电后速度加快' },
      { id: '8_storm_truffle', name: '风暴松露', type: 'edible', rarity: 'uncommon', hpRestore: 100, effect: "atk_lightning_15s", desc: '雷系攻击加成' },
      { id: '8_lightning_cap', name: '闪电帽', type: 'edible', rarity: 'rare', hpRestore: 170, effect: "perm_crit_3pct", desc: '永久暴击率+3%' },
      { id: '8_shock_tox', name: '电击毒菌', type: 'toxic', rarity: 'common', hpRestore: -60, effect: "stun_2s", desc: '电流穿体，短暂晕眩' },
      { id: '8_storm_spore', name: '风暴孢子菌', type: 'toxic', rarity: 'common', hpRestore: -50, effect: "knockback_3tiles", desc: '爆炸气浪击退' },
      { id: '8_thunder_rot', name: '雷腐菌', type: 'toxic', rarity: 'uncommon', hpRestore: -85, effect: "paralyz_4s", desc: '高压电流麻痹' },
      { id: '8_arc_cap', name: '弧电死帽', type: 'toxic', rarity: 'rare', hpRestore: -120, effect: "chain_lightning_3", desc: '连锁闪电伤害周围3人' },
    ],

    plants: [
      { id: '8_thunder_grass', name: '雷霆草', type: 'medicine', hpRestore: 0, effect: "lightning_resist", desc: '雷电抵抗' },
      { id: '8_storm_fern', name: '风暴蕨', type: 'medicine', hpRestore: 35, effect: "stun_cure", desc: '解除晕眩状态' },
      { id: '8_lightning_rod', name: '避雷针草', type: 'decorative', hpRestore: 0, effect: "lightning_attract", desc: '吸引雷击，保护周围玩家' },
      { id: '8_static_vine', name: '静电藤', type: 'hazard', hpRestore: -20, effect: "stun_2s", desc: '接触触电晕眩' },
      { id: '8_storm_bloom', name: '风暴花', type: 'edible', hpRestore: 45, effect: "spd_up_8s", desc: '风能加速' },
      { id: '8_cloud_grass', name: '云端草', type: 'rare', hpRestore: 0, effect: "perm_crit_2pct", desc: '永久暴击率+2%' },
      { id: '8_thunder_herb', name: '雷鸣草', type: 'medicine', hpRestore: 0, effect: "all_up_8s", desc: '雷力全属性短暂提升' },
      { id: '8_gale_sprout', name: '疾风嫩芽', type: 'edible', hpRestore: 20, effect: "spd_tiny", desc: '风能轻微提升速度' },
    ],

    smallMonsters: ['thunder_hawk', 'storm_elemental', 'harpy', 'goblin'],

    disguisedMonsters: [
      { id: '8_thunder_cloud', name: '雷云草拟态', disguisedAs: '雷霆草', hp: 240, physAtk: 10, magAtk: 60, physDef: 10, magDef: 40, special: '闪电链攻击3目标', revealTrigger: 'approach', xp: 58, dropRate: 0.38 },
      { id: '8_static_vine_el', name: '静电藤元素', disguisedAs: '静电藤', hp: 200, physAtk: 18, magAtk: 42, physDef: 12, magDef: 30, special: '触碰晕眩2s', revealTrigger: 'approach', xp: 48, dropRate: 0.34 },
      { id: '8_storm_fern_harm', name: '风暴蕨怪物', disguisedAs: '风暴蕨', hp: 280, physAtk: 35, magAtk: 20, physDef: 20, magDef: 22, special: '暴风击退5格', revealTrigger: 'hit', xp: 60, dropRate: 0.38 },
      { id: '8_lightning_herb_m', name: '闪电草药魔', disguisedAs: '闪电草药', hp: 160, physAtk: 12, magAtk: 55, physDef: 8, magDef: 38, special: '连锁闪电伤害随机2目标', revealTrigger: 'approach', xp: 45, dropRate: 0.35 },
    ],

    bosses: [
      { id: '8_thunder_eagle', name: '雷霆苍鹰', tier: 'field', hp: 750, physAtk: 75, magAtk: 50, physDef: 30, magDef: 35, skills: ['俯冲攻击', '雷电爪击', '风暴羽毛'], xp: 150, dropRate: 0.65, lootTable: ['thunder_feather', 'crossbow', 'ore_common'] },
      { id: '8_storm_golem', name: '风暴傀儡', tier: 'area', hp: 1900, physAtk: 70, magAtk: 90, physDef: 40, magDef: 65, skills: ['风暴护甲', '雷电链', '暴风眼', '连锁闪电'], xp: 460, dropRate: 0.78, lootTable: ['lightning_core', 'ore_rare', 'orb'] },
      { id: '8_thunder_god', name: '雷神化身·托恩', tier: 'zone', hp: 5200, physAtk: 80, magAtk: 160, physDef: 50, magDef: 90, skills: ['雷神之锤', '闪电风暴', '天雷召唤', '雷霆领域', '神雷下凡'], xp: 1300, dropRate: 0.92, lootTable: ['greatsword', 'lightning_core', 'ore_rare', 'orb'] },
    ],
  },

  // ══════════════════════════════════════════════════
  // Biome 9 — 暗影密林
  // ══════════════════════════════════════════════════
  9: {
    name: '暗影密林',
    element: 'dark',

    mushrooms: [
      { id: '9_shadow_cap', name: '暗影菌', type: 'edible', rarity: 'common', hpRestore: 65, effect: "invisible_10s", desc: '隐身效果，适合刺客' },
      { id: '9_dark_truffle2', name: '黑色松露', type: 'edible', rarity: 'uncommon', hpRestore: 85, effect: "dark_atk_12s", desc: '暗属性攻击加成' },
      { id: '9_moonshroom', name: '月影菇', type: 'edible', rarity: 'common', hpRestore: 55, effect: null, desc: '夜晚才出现，日出即消失' },
      { id: '9_nightbloom_cap', name: '夜盛菌', type: 'edible', rarity: 'rare', hpRestore: 190, effect: "perm_spd_0.1", desc: '永久速度+0.1' },
      { id: '9_curse_spore', name: '诅咒孢子菇', type: 'toxic', rarity: 'common', hpRestore: -60, effect: "curse_8s", desc: '孢子诅咒，降低全属性' },
      { id: '9_drain_cap', name: '吸魂毒菌', type: 'toxic', rarity: 'common', hpRestore: -75, effect: "mana_drain_8s", desc: '持续消耗魔法能量' },
      { id: '9_fear_shroom', name: '恐惧菇', type: 'toxic', rarity: 'uncommon', hpRestore: -50, effect: "fear_6s", desc: '引发恐惧，无法战斗' },
      { id: '9_void_shroom', name: '虚空毒帽', type: 'toxic', rarity: 'rare', hpRestore: -110, effect: "confusion_8s", desc: '迷乱方向感，随机移动' },
    ],

    plants: [
      { id: '9_shadow_fern', name: '暗影蕨', type: 'medicine', hpRestore: 45, effect: "curse_cure", desc: '解除诅咒状态' },
      { id: '9_dark_berry', name: '黑暗浆果', type: 'edible', hpRestore: 30, effect: "invisible_8s", desc: '食后短暂隐身' },
      { id: '9_night_flower', name: '黑夜之花', type: 'decorative', hpRestore: 0, effect: "dark_see_15s", desc: '夜晚视野大幅提升' },
      { id: '9_shadow_vine', name: '暗影藤', type: 'hazard', hpRestore: 0, effect: "confusion_4s", desc: '暗影迷乱方向感' },
      { id: '9_dark_thorn', name: '黑暗荆棘', type: 'hazard', hpRestore: -20, effect: "curse_4s", desc: '带诅咒的刺' },
      { id: '9_phantom_flower', name: '幻影花', type: 'rare', hpRestore: 0, effect: "decoy_20s", desc: '释放持久分身吸引攻击' },
      { id: '9_moonshade', name: '月影草', type: 'medicine', hpRestore: 55, effect: "night_only", desc: '仅夜晚采集，效果强' },
      { id: '9_void_sprout', name: '虚空嫩芽', type: 'edible', hpRestore: 20, effect: "dark_res_5s", desc: '轻微暗属性抗性' },
    ],

    smallMonsters: ['shadow_panther', 'forest_wraith', 'dark_elf', 'bat'],

    disguisedMonsters: [
      { id: '9_shadow_fern_sp', name: '暗影蕨幽灵', disguisedAs: '暗影蕨', hp: 200, physAtk: 5, magAtk: 52, physDef: 5, magDef: 42, special: '消失+背刺暴击×2', revealTrigger: 'hit', xp: 52, dropRate: 0.38 },
      { id: '9_dark_berry_trap', name: '黑暗浆果陷阱', disguisedAs: '黑暗浆果', hp: 160, physAtk: 18, magAtk: 35, physDef: 8, magDef: 25, special: '食用幻觉4s方向混乱', revealTrigger: 'approach', xp: 40, dropRate: 0.32 },
      { id: '9_void_sprout_mon', name: '虚空嫩芽怪', disguisedAs: '虚空嫩芽', hp: 220, physAtk: 22, magAtk: 45, physDef: 10, magDef: 30, special: '虚空爆炸无视防御', revealTrigger: 'hit', xp: 55, dropRate: 0.38 },
      { id: '9_phantom_pred', name: '幻影花捕食者', disguisedAs: '幻影花', hp: 280, physAtk: 30, magAtk: 25, physDef: 15, magDef: 20, special: '分身×2混淆目标', revealTrigger: 'approach', xp: 62, dropRate: 0.4 },
    ],

    bosses: [
      { id: '9_shadow_wolf', name: '暗影狼王', tier: 'field', hp: 800, physAtk: 85, magAtk: 20, physDef: 35, magDef: 28, skills: ['暗影突袭', '黑暗嗥叫', '影分身×2'], xp: 160, dropRate: 0.66, lootTable: ['shadow_pelt', 'dagger', 'ore_common'] },
      { id: '9_dark_elf_lord', name: '暗精灵领主', tier: 'area', hp: 1750, physAtk: 80, magAtk: 65, physDef: 45, magDef: 55, skills: ['暗影弹幕', '黑暗护盾', '暗夜领域', '影分身×3'], xp: 420, dropRate: 0.77, lootTable: ['bow', 'ore_dark', 'ore_rare'] },
      { id: '9_void_shadow', name: '虚空暗影·乌尔加', tier: 'zone', hp: 5000, physAtk: 60, magAtk: 150, physDef: 35, magDef: 95, skills: ['虚空侵噬', '暗影领域', '黑暗凝视', '影分身×5', '次元穿梭'], xp: 1250, dropRate: 0.91, lootTable: ['dagger', 'ore_dark', 'ore_rare', 'orb'] },
    ],
  },

  // ══════════════════════════════════════════════════
  // Biome 10 — 幽灵废墟
  // ══════════════════════════════════════════════════
  10: {
    name: '幽灵废墟',
    element: 'dark',

    mushrooms: [
      { id: '10_ghost_cap', name: '幽灵菌', type: 'edible', rarity: 'common', hpRestore: 60, effect: "ghost_resist_10s", desc: '减少幽灵伤害' },
      { id: '10_holy_shroom', name: '圣光蘑菇', type: 'edible', rarity: 'uncommon', hpRestore: 90, effect: "holy_atk_12s", desc: '圣光能量加成，克制不死系' },
      { id: '10_ruin_truffle', name: '废墟松露', type: 'edible', rarity: 'rare', hpRestore: 150, effect: "perm_magDef_6", desc: '永久魔防+6' },
      { id: '10_pale_cap', name: '苍白菌', type: 'edible', rarity: 'common', hpRestore: 45, effect: null, desc: '几乎透明，废墟中常见' },
      { id: '10_haunted_tox', name: '鬼魂毒菌', type: 'toxic', rarity: 'common', hpRestore: -55, effect: "fear_5s", desc: '鬼气萦绕，引发恐惧' },
      { id: '10_spirit_spore', name: '灵魂孢子菌', type: 'toxic', rarity: 'common', hpRestore: -70, effect: "paralyz_3s", desc: '灵魂孢子令人僵立' },
      { id: '10_void_rot', name: '虚空腐菌', type: 'toxic', rarity: 'uncommon', hpRestore: -90, effect: "curse_10s", desc: '虚空污染，诅咒效果' },
      { id: '10_banshee_cap', name: '女妖帽', type: 'toxic', rarity: 'rare', hpRestore: -130, effect: "scream_aoe_2tiles", desc: '释放女妖尖叫AOE恐惧' },
    ],

    plants: [
      { id: '10_ghost_orchid', name: '幽灵兰花', type: 'medicine', hpRestore: 0, effect: "fear_cure", desc: '解除恐惧状态' },
      { id: '10_ruin_weed', name: '废墟杂草', type: 'decorative', hpRestore: 0, effect: null, desc: '古老废墟遗留植物' },
      { id: '10_holy_herb', name: '圣光草', type: 'medicine', hpRestore: 55, effect: "holy_buff_10s", desc: '圣光加持，对不死系+20%' },
      { id: '10_spectral_vine', name: '幽灵藤', type: 'hazard', hpRestore: 0, effect: "fear_4s", desc: '幽灵缠绕，引发恐惧' },
      { id: '10_grave_flower', name: '墓碑花', type: 'decorative', hpRestore: 0, effect: "safe_zone", desc: '附近幽灵攻击欲望降低' },
      { id: '10_echo_bloom', name: '回音花', type: 'rare', hpRestore: 0, effect: "perm_magDef_4", desc: '永久魔防+4' },
      { id: '10_pale_herb', name: '苍白草药', type: 'medicine', hpRestore: 30, effect: "paralyz_cure", desc: '解除麻痹' },
      { id: '10_wisp_grass', name: '鬼火草', type: 'hazard', hpRestore: -15, effect: "mana_drain_5s", desc: '消耗魔法能量' },
    ],

    smallMonsters: ['ghost', 'ruin_skeleton', 'banshee', 'zombie'],

    disguisedMonsters: [
      { id: '10_ghost_orchid_m', name: '幽灵兰花魔', disguisedAs: '幽灵兰花', hp: 180, physAtk: 2, magAtk: 58, physDef: 2, magDef: 48, special: '幽灵攻击穿透物防50%', revealTrigger: 'approach', xp: 50, dropRate: 0.38 },
      { id: '10_ruin_statue', name: '废墟石像拟态', disguisedAs: '废墟石像', hp: 420, physAtk: 52, magAtk: 5, physDef: 55, magDef: 20, special: '突然复活攻击+晕眩2s', revealTrigger: 'approach', xp: 78, dropRate: 0.44 },
      { id: '10_spectral_vine_m', name: '幽灵藤精', disguisedAs: '幽灵藤', hp: 200, physAtk: 10, magAtk: 45, physDef: 5, magDef: 38, special: '灵魂缠绕+恐惧4s', revealTrigger: 'approach', xp: 48, dropRate: 0.36 },
      { id: '10_wisp_grass_mon', name: '鬼火草怪', disguisedAs: '鬼火草', hp: 160, physAtk: 15, magAtk: 40, physDef: 10, magDef: 32, special: '鬼火AOE范围1格', revealTrigger: 'hit', xp: 42, dropRate: 0.32 },
    ],

    bosses: [
      { id: '10_ruins_guardian', name: '废墟守护石像', tier: 'field', hp: 850, physAtk: 70, magAtk: 20, physDef: 65, magDef: 30, skills: ['石像复活', '岩石重击', '古法阵'], xp: 170, dropRate: 0.67, lootTable: ['sword', 'ore_common', 'scroll'] },
      { id: '10_specter_lord', name: '幽灵领主', tier: 'area', hp: 1800, physAtk: 10, magAtk: 95, physDef: 10, magDef: 80, skills: ['魂魄攻势', '恐惧领域', '不死特性', '灵魂侵蚀'], xp: 440, dropRate: 0.78, lootTable: ['scroll', 'ectoplasm', 'ore_rare'] },
      { id: '10_arch_lich', name: '大巫妖·维尔纳斯', tier: 'zone', hp: 5500, physAtk: 20, magAtk: 170, physDef: 20, magDef: 110, skills: ['死亡祭坛', '灵魂风暴', '亡灵领域', '恐惧凝视', '不死复活×5'], xp: 1350, dropRate: 0.92, lootTable: ['staff', 'ore_dark', 'ore_rare', 'scroll'] },
    ],
  },

  // ══════════════════════════════════════════════════
  // Biome 11 — 亡灵荒地
  // ══════════════════════════════════════════════════
  11: {
    name: '亡灵荒地',
    element: 'dark',

    mushrooms: [
      { id: '11_death_truffle', name: '死亡松露', type: 'edible', rarity: 'uncommon', hpRestore: 100, effect: "undead_slayer_15s", desc: '对亡灵系造成额外20%伤害' },
      { id: '11_bone_meal_cap', name: '骨粉菌', type: 'edible', rarity: 'common', hpRestore: 55, effect: null, desc: '骨粉滋养，补充矿物质' },
      { id: '11_gray_shroom', name: '灰蘑菇', type: 'edible', rarity: 'common', hpRestore: 45, effect: null, desc: '荒地随处可见' },
      { id: '11_revival_cap', name: '复苏菌', type: 'edible', rarity: 'rare', hpRestore: 220, effect: "revive_half_hp", desc: '死亡时以50%HP复活一次' },
      { id: '11_plague_tox', name: '瘟疫毒菌', type: 'toxic', rarity: 'common', hpRestore: -65, effect: "disease_12s", desc: '亡灵荒地特有瘟疫' },
      { id: '11_rot_spore', name: '腐烂孢子菌', type: 'toxic', rarity: 'common', hpRestore: -80, effect: "atk_down_10s", desc: '腐烂孢子侵蚀攻击力' },
      { id: '11_corpse_cap', name: '尸体腐菌', type: 'toxic', rarity: 'uncommon', hpRestore: -100, effect: "poison_15s", desc: '尸腐之气，剧毒' },
      { id: '11_grave_rot', name: '墓穴烂菌', type: 'toxic', rarity: 'rare', hpRestore: -160, effect: "necrotic_15s", desc: '荒地最强毒，暗伤持续' },
    ],

    plants: [
      { id: '11_bone_flower', name: '骨头花', type: 'medicine', hpRestore: 0, effect: "undead_resist_12s", desc: '短暂亡灵伤害抗性' },
      { id: '11_ash_weed', name: '灰烬杂草', type: 'decorative', hpRestore: 0, effect: null, desc: '荒地到处都是' },
      { id: '11_death_lily', name: '死亡百合', type: 'hazard', hpRestore: -30, effect: "necrotic_5s", desc: '暗伤持续蚀命' },
      { id: '11_plague_vine', name: '瘟疫藤蔓', type: 'hazard', hpRestore: -25, effect: "disease_6s", desc: '瘟疫传播，引发疾病' },
      { id: '11_gray_herb', name: '灰色草药', type: 'medicine', hpRestore: 40, effect: "death_resist_8s", desc: '抵抗死亡效果' },
      { id: '11_dust_flower', name: '尘埃花', type: 'decorative', hpRestore: 0, effect: "dust_cloud_5s", desc: '被踩时扬起尘埃致盲' },
      { id: '11_wither_root', name: '枯萎根', type: 'edible', hpRestore: 15, effect: null, desc: '荒地少有食物，聊胜于无' },
      { id: '11_corpse_bloom', name: '尸花', type: 'hazard', hpRestore: -20, effect: "stench_5s", desc: '腐臭气体降低精准度' },
    ],

    smallMonsters: ['death_knight', 'necromancer_mob', 'zombie', 'skeleton'],

    disguisedMonsters: [
      { id: '11_bone_flower_mon', name: '骨头花怪', disguisedAs: '骨头花', hp: 250, physAtk: 35, magAtk: 20, physDef: 20, magDef: 15, special: '骨针射击+出血5s', revealTrigger: 'approach', xp: 55, dropRate: 0.36 },
      { id: '11_death_lily_trap', name: '死亡百合陷阱', disguisedAs: '死亡百合', hp: 200, physAtk: 10, magAtk: 50, physDef: 8, magDef: 35, special: '暗伤AOE范围1格', revealTrigger: 'approach', xp: 50, dropRate: 0.36 },
      { id: '11_plague_vine_mon', name: '瘟疫藤怪', disguisedAs: '瘟疫藤蔓', hp: 280, physAtk: 30, magAtk: 15, physDef: 18, magDef: 12, special: '瘟疫感染周围3格', revealTrigger: 'approach', xp: 62, dropRate: 0.38 },
      { id: '11_corpse_bloom_m', name: '尸花怪', disguisedAs: '尸花', hp: 220, physAtk: 20, magAtk: 40, physDef: 10, magDef: 28, special: '腐臭气体降低精准+诅咒', revealTrigger: 'hit', xp: 52, dropRate: 0.36 },
    ],

    bosses: [
      { id: '11_death_lord', name: '死亡领主', tier: 'field', hp: 880, physAtk: 90, magAtk: 30, physDef: 50, magDef: 35, skills: ['死亡骑士召唤', '暗影冲锋', '生命吸取'], xp: 175, dropRate: 0.68, lootTable: ['greatsword', 'ore_dark', 'scroll'] },
      { id: '11_plague_dragon', name: '瘟疫幼龙', tier: 'area', hp: 2100, physAtk: 85, magAtk: 65, physDef: 55, magDef: 45, skills: ['瘟疫喷吐', '腐化领域', '亡灵呼唤', '死亡波动'], xp: 500, dropRate: 0.8, lootTable: ['dragon_scale', 'ore_dark', 'ore_rare'] },
      { id: '11_necro_emperor', name: '死灵帝王·塞罗斯', tier: 'zone', hp: 6500, physAtk: 50, magAtk: 170, physDef: 35, magDef: 105, skills: ['死亡领域', '亡灵大军', '灵魂收割', '瘟疫风暴', '不死帝王'], xp: 1600, dropRate: 0.93, lootTable: ['staff', 'ore_dark', 'ore_rare', 'scroll'] },
    ],
  },

  // ══════════════════════════════════════════════════
  // Biome 12 — 虚空裂缝
  // ══════════════════════════════════════════════════
  12: {
    name: '虚空裂缝',
    element: 'void',

    mushrooms: [
      { id: '12_void_cap', name: '虚空菌', type: 'edible', rarity: 'common', hpRestore: 70, effect: "void_resist_10s", desc: '虚空抗性，减少虚空伤害' },
      { id: '12_dark_matter_sh', name: '暗物质菇', type: 'edible', rarity: 'uncommon', hpRestore: 100, effect: "teleport_3tiles", desc: '食后可瞬移3格' },
      { id: '12_rift_truffle', name: '裂缝松露', type: 'edible', rarity: 'rare', hpRestore: 200, effect: "perm_all_atk_5", desc: '永久物攻+5+魔攻+5' },
      { id: '12_chaos_shroom', name: '混沌菌', type: 'edible', rarity: 'uncommon', hpRestore: 80, effect: "random_buff_15s", desc: '随机获得一个增益效果' },
      { id: '12_null_tox', name: '虚无毒菌', type: 'toxic', rarity: 'common', hpRestore: -70, effect: "all_down_8s", desc: '全属性下降' },
      { id: '12_rift_spore', name: '裂缝孢子菌', type: 'toxic', rarity: 'common', hpRestore: -90, effect: "displace_3tiles", desc: '随机位移3格' },
      { id: '12_abyss_cap', name: '深渊毒帽', type: 'toxic', rarity: 'uncommon', hpRestore: -110, effect: "void_burn_10s", desc: '虚空灼伤，无视防御' },
      { id: '12_chaos_rot', name: '混沌腐菌', type: 'toxic', rarity: 'rare', hpRestore: -140, effect: "random_debuff_3", desc: '随机施加3个负面效果' },
    ],

    plants: [
      { id: '12_void_fern', name: '虚空蕨', type: 'medicine', hpRestore: 60, effect: "void_resist_10s", desc: '虚空侵蚀抵抗' },
      { id: '12_rift_bloom', name: '裂缝花', type: 'rare', hpRestore: 0, effect: "perm_all_2", desc: '永久全属性+2' },
      { id: '12_chaos_vine', name: '混沌藤', type: 'hazard', hpRestore: 0, effect: "random_teleport", desc: '触碰随机传送' },
      { id: '12_null_weed', name: '虚无杂草', type: 'decorative', hpRestore: 0, effect: "debuff_reduce", desc: '周围减益效果持续-20%' },
      { id: '12_abyss_flower', name: '深渊花', type: 'medicine', hpRestore: 0, effect: "all_cure", desc: '解除所有负面状态' },
      { id: '12_dark_matter_vine', name: '暗物质藤', type: 'hazard', hpRestore: -25, effect: "void_burn_4s", desc: '虚空灼伤无视防御' },
      { id: '12_dimension_herb', name: '次元草药', type: 'medicine', hpRestore: 80, effect: "all_res_12s", desc: '全属性抗性提升' },
      { id: '12_chaos_sprout', name: '混沌嫩芽', type: 'edible', hpRestore: 35, effect: "random_effect", desc: '随机获得一个效果' },
    ],

    smallMonsters: ['void_stalker', 'void_crawler', 'bat', 'goblin'],

    disguisedMonsters: [
      { id: '12_rift_bloom_trap', name: '裂缝花陷阱', disguisedAs: '裂缝花', hp: 280, physAtk: 20, magAtk: 60, physDef: 12, magDef: 45, special: '次元裂缝AOE无视防御', revealTrigger: 'hit', xp: 65, dropRate: 0.42 },
      { id: '12_void_fern_mon', name: '虚空蕨怪', disguisedAs: '虚空蕨', hp: 220, physAtk: 15, magAtk: 55, physDef: 10, magDef: 40, special: '传送玩家至随机位置', revealTrigger: 'approach', xp: 55, dropRate: 0.38 },
      { id: '12_chaos_vine_mon', name: '混沌藤怪', disguisedAs: '混沌藤', hp: 300, physAtk: 35, magAtk: 25, physDef: 20, magDef: 22, special: '随机传送+随机debuff', revealTrigger: 'approach', xp: 68, dropRate: 0.42 },
      { id: '12_abyss_flower_m', name: '深渊花魔', disguisedAs: '深渊花', hp: 240, physAtk: 10, magAtk: 65, physDef: 8, magDef: 50, special: '吸取技能能量30%', revealTrigger: 'approach', xp: 58, dropRate: 0.4 },
    ],

    bosses: [
      { id: '12_void_guardian', name: '虚空守卫', tier: 'field', hp: 900, physAtk: 70, magAtk: 60, physDef: 35, magDef: 50, skills: ['虚空刺击', '次元护盾', '空间撕裂'], xp: 180, dropRate: 0.7, lootTable: ['void_shard', 'ore_rare', 'dagger'] },
      { id: '12_rift_horror', name: '裂缝恐怖', tier: 'area', hp: 2000, physAtk: 55, magAtk: 90, physDef: 30, magDef: 70, skills: ['次元崩解', '虚空领域', '相位攻击', '时空扭曲'], xp: 480, dropRate: 0.82, lootTable: ['void_shard', 'orb', 'ore_rare'] },
      { id: '12_void_titan', name: '虚空泰坦·纳尔加', tier: 'zone', hp: 5800, physAtk: 90, magAtk: 165, physDef: 55, magDef: 98, skills: ['虚空爆炸', '次元湮灭', '空间崩塌', '虚空领域', '宇宙湮灭'], xp: 1450, dropRate: 0.93, lootTable: ['ore_rare', 'void_shard', 'orb', 'greatsword'] },
    ],
  },

  // ══════════════════════════════════════════════════
  // Biome 13 — 星空秘境
  // ══════════════════════════════════════════════════
  13: {
    name: '星空秘境',
    element: 'holy',

    mushrooms: [
      { id: '13_star_cap', name: '星辰菌', type: 'edible', rarity: 'common', hpRestore: 75, effect: "holy_atk_10s", desc: '星光神圣加成' },
      { id: '13_cosmic_shroom', name: '宇宙蘑菇', type: 'edible', rarity: 'uncommon', hpRestore: 110, effect: "all_up_10s", desc: '全属性短暂提升' },
      { id: '13_nebula_truffle', name: '星云松露', type: 'edible', rarity: 'rare', hpRestore: 230, effect: "perm_crit_5pct", desc: '永久暴击率+5%' },
      { id: '13_moonbeam_cap', name: '月光菌', type: 'edible', rarity: 'common', hpRestore: 60, effect: "magAtk_up_12s", desc: '月光魔攻加成' },
      { id: '13_meteor_tox', name: '陨石毒菌', type: 'toxic', rarity: 'common', hpRestore: -60, effect: "burn_6s", desc: '陨石撞击般的灼烧感' },
      { id: '13_starfall_spore', name: '星落孢子菌', type: 'toxic', rarity: 'common', hpRestore: -80, effect: "blind_8s", desc: '星尘致盲' },
      { id: '13_void_star', name: '虚星毒帽', type: 'toxic', rarity: 'uncommon', hpRestore: -100, effect: "slow_12s", desc: '星力减缓速度' },
      { id: '13_black_hole_cap', name: '黑洞毒菌', type: 'toxic', rarity: 'rare', hpRestore: -170, effect: "pull_3tiles_3s", desc: '引力场吸引周围怪物' },
    ],

    plants: [
      { id: '13_star_flower', name: '星辰花', type: 'medicine', hpRestore: 70, effect: "holy_buff_15s", desc: '神圣加持，全身发光' },
      { id: '13_nebula_fern', name: '星云蕨', type: 'medicine', hpRestore: 0, effect: "curse_cure", desc: '星光净化，解除诅咒' },
      { id: '13_cosmic_vine', name: '宇宙藤', type: 'decorative', hpRestore: 0, effect: "star_map", desc: '显示附近资源位置' },
      { id: '13_moonpetal', name: '月花瓣', type: 'edible', hpRestore: 55, effect: "magAtk_up_15s", desc: '月光能量，魔攻大增' },
      { id: '13_meteor_thorn', name: '陨石荆棘', type: 'hazard', hpRestore: -30, effect: "burn_stun", desc: '灼烧并晕眩' },
      { id: '13_aurora_vine', name: '极光藤', type: 'rare', hpRestore: 0, effect: "perm_crit_4pct", desc: '永久暴击率+4%' },
      { id: '13_starfall_herb', name: '星落草药', type: 'medicine', hpRestore: 90, effect: "full_restore_once", desc: '一次性完全恢复效果' },
      { id: '13_comet_sprout', name: '彗星嫩芽', type: 'edible', hpRestore: 40, effect: "spd_up_12s", desc: '彗星速度加成' },
    ],

    smallMonsters: ['star_guardian', 'harpy', 'goblin', 'giant_insect'],

    disguisedMonsters: [
      { id: '13_star_flower_trap', name: '星辰花陷阱', disguisedAs: '星辰花', hp: 260, physAtk: 15, magAtk: 65, physDef: 12, magDef: 50, special: '星光爆炸AOE圣伤', revealTrigger: 'hit', xp: 62, dropRate: 0.42 },
      { id: '13_cosmic_vine_mon', name: '宇宙藤怪', disguisedAs: '宇宙藤', hp: 300, physAtk: 20, magAtk: 55, physDef: 15, magDef: 42, special: '引力场拉近3格', revealTrigger: 'approach', xp: 68, dropRate: 0.42 },
      { id: '13_moonpetal_trap', name: '月花瓣陷阱', disguisedAs: '月花瓣', hp: 200, physAtk: 10, magAtk: 50, physDef: 8, magDef: 38, special: '月光迷惑4s', revealTrigger: 'approach', xp: 50, dropRate: 0.36 },
      { id: '13_comet_sprout_m', name: '彗星嫩芽怪', disguisedAs: '彗星嫩芽', hp: 180, physAtk: 25, magAtk: 35, physDef: 12, magDef: 25, special: '高速突进+击退4格', revealTrigger: 'approach', xp: 45, dropRate: 0.34 },
    ],

    bosses: [
      { id: '13_star_warden', name: '星辰守护者长', tier: 'field', hp: 1000, physAtk: 65, magAtk: 70, physDef: 55, magDef: 60, skills: ['星光爆炸', '圣光护盾', '星辰审判'], xp: 200, dropRate: 0.72, lootTable: ['stardust', 'orb', 'ore_rare'] },
      { id: '13_comet_dragon', name: '彗星巨龙', tier: 'area', hp: 2500, physAtk: 90, magAtk: 95, physDef: 60, magDef: 65, skills: ['彗星冲撞', '星光喷吐', '宇宙护甲', '星辰链'], xp: 600, dropRate: 0.83, lootTable: ['dragon_scale', 'stardust', 'ore_rare'] },
      { id: '13_celestial_god', name: '天星神·奥苏曼', tier: 'zone', hp: 6500, physAtk: 70, magAtk: 180, physDef: 50, magDef: 110, skills: ['星辰审判', '宇宙崩塌', '天星领域', '神圣炮', '星际归一'], xp: 1700, dropRate: 0.95, lootTable: ['orb', 'stardust', 'ore_rare', 'scroll'] },
    ],
  }
};
