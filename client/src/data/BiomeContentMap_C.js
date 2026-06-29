/**
 * BiomeContentMap_C.js — 群系 14-20 内容配置
 * (自动生成；与 BiomeContentMap_B.js / _C.js 合并使用)
 */

export const BIOME_CONTENT_C = {
  // ══════════════════════════════════════════════════
  // Biome 14 — 漩涡之地
  // ══════════════════════════════════════════════════
  14: {
    name: '漩涡之地',
    element: 'wind',

    mushrooms: [
      { id: '14_vortex_cap', name: '漩涡菌', type: 'edible', rarity: 'common', hpRestore: 65, effect: "wind_resist_10s", desc: '风系抗性' },
      { id: '14_spiral_shroom', name: '螺旋蘑菇', type: 'edible', rarity: 'common', hpRestore: 55, effect: "spd_up_10s", desc: '旋转气流，加速移动' },
      { id: '14_cyclone_truffle', name: '旋风松露', type: 'edible', rarity: 'uncommon', hpRestore: 100, effect: "dodge_up_12s", desc: '回避率+15%' },
      { id: '14_eye_cap', name: '风眼菌', type: 'edible', rarity: 'rare', hpRestore: 180, effect: "perm_spd_0.15", desc: '永久移速+0.15' },
      { id: '14_whirl_tox', name: '旋转毒菌', type: 'toxic', rarity: 'common', hpRestore: -55, effect: "confusion_5s", desc: '旋转晕眩' },
      { id: '14_gale_spore', name: '疾风孢子菌', type: 'toxic', rarity: 'common', hpRestore: -65, effect: "knockback_4tiles", desc: '强风击退4格' },
      { id: '14_tornado_cap', name: '龙卷毒帽', type: 'toxic', rarity: 'uncommon', hpRestore: -85, effect: "spin_3s", desc: '高速旋转无法操控' },
      { id: '14_maelstrom_rot', name: '大漩涡腐菌', type: 'toxic', rarity: 'rare', hpRestore: -120, effect: "pull_vortex_5s", desc: '持续拉向中心5秒' },
    ],

    plants: [
      { id: '14_vortex_fern', name: '漩涡蕨', type: 'medicine', hpRestore: 0, effect: "confusion_cure", desc: '解除混乱状态' },
      { id: '14_spiral_bloom', name: '螺旋花', type: 'edible', hpRestore: 40, effect: "spd_up_10s", desc: '旋风加速' },
      { id: '14_wind_vine', name: '疾风藤', type: 'hazard', hpRestore: 0, effect: "knockback_3tiles", desc: '强风击退' },
      { id: '14_eye_flower', name: '风眼花', type: 'rare', hpRestore: 0, effect: "perm_dodge_5pct", desc: '永久回避率+5%' },
      { id: '14_cyclone_herb', name: '旋风草药', type: 'medicine', hpRestore: 50, effect: "all_up_10s", desc: '风力全属性提升' },
      { id: '14_maelstrom_weed', name: '漩涡杂草', type: 'hazard', hpRestore: -15, effect: "slow_4s", desc: '漩涡气流减速' },
      { id: '14_gale_sprout2', name: '旋风嫩芽', type: 'edible', hpRestore: 20, effect: null, desc: '风味独特' },
      { id: '14_vortex_lily', name: '漩涡百合', type: 'decorative', hpRestore: 0, effect: "pull_effect", desc: '周围敌人轻微被拉向中心' },
    ],

    smallMonsters: ['vortex_elemental', 'harpy', 'goblin', 'bat'],

    disguisedMonsters: [
      { id: '14_vortex_fern_mon', name: '漩涡蕨怪', disguisedAs: '漩涡蕨', hp: 240, physAtk: 12, magAtk: 55, physDef: 10, magDef: 38, special: '持续吸引玩家向中心5s', revealTrigger: 'approach', xp: 55, dropRate: 0.38 },
      { id: '14_spiral_bloom_m', name: '螺旋花怪', disguisedAs: '螺旋花', hp: 180, physAtk: 22, magAtk: 35, physDef: 12, magDef: 25, special: '旋转攻击AOE1格', revealTrigger: 'approach', xp: 45, dropRate: 0.34 },
      { id: '14_eye_flower_mon', name: '风眼花怪', disguisedAs: '风眼花', hp: 280, physAtk: 18, magAtk: 55, physDef: 12, magDef: 42, special: '龙卷风禁锢4s', revealTrigger: 'approach', xp: 62, dropRate: 0.4 },
      { id: '14_wind_vine_mon', name: '疾风藤怪', disguisedAs: '疾风藤', hp: 200, physAtk: 35, magAtk: 10, physDef: 18, magDef: 12, special: '连续击退3次各2格', revealTrigger: 'approach', xp: 48, dropRate: 0.36 },
    ],

    bosses: [
      { id: '14_vortex_dragon', name: '漩涡幼龙', tier: 'field', hp: 850, physAtk: 75, magAtk: 55, physDef: 40, magDef: 40, skills: ['龙卷风', '旋转攻击', '吸引漩涡'], xp: 170, dropRate: 0.68, lootTable: ['wind_core', 'ore_rare', 'spear'] },
      { id: '14_gale_titan', name: '飓风泰坦', tier: 'area', hp: 2000, physAtk: 80, magAtk: 80, physDef: 45, magDef: 58, skills: ['暴风护甲', '飓风轰击', '吸引领域', '龙卷爆炸'], xp: 480, dropRate: 0.8, lootTable: ['wind_core', 'orb', 'ore_rare'] },
      { id: '14_maelstrom_god', name: '大漩涡神·科里', tier: 'zone', hp: 5500, physAtk: 60, magAtk: 160, physDef: 42, magDef: 92, skills: ['超级漩涡', '飓风领域', '天地之眼', '吸引一切', '风神之怒'], xp: 1380, dropRate: 0.92, lootTable: ['orb', 'wind_core', 'ore_rare', 'greatsword'] },
    ],
  },

  // ══════════════════════════════════════════════════
  // Biome 15 — 流沙平原
  // ══════════════════════════════════════════════════
  15: {
    name: '流沙平原',
    element: 'wind',

    mushrooms: [
      { id: '15_sand_cap', name: '沙漠菌', type: 'edible', rarity: 'common', hpRestore: 60, effect: "heat_resist_10s", desc: '抵抗沙漠高温' },
      { id: '15_cactus_shroom', name: '仙人掌菇', type: 'edible', rarity: 'uncommon', hpRestore: 85, effect: "poison_atk_10s", desc: '仙人掌毒素加成攻击' },
      { id: '15_dune_truffle', name: '沙丘松露', type: 'edible', rarity: 'rare', hpRestore: 170, effect: "perm_spd_in_sand", desc: '永久沙地移速不降低' },
      { id: '15_mirage_cap', name: '海市蜃楼菌', type: 'edible', rarity: 'uncommon', hpRestore: 75, effect: "decoy_15s", desc: '释放一个虚假分身吸引攻击' },
      { id: '15_sand_tox', name: '沙毒菌', type: 'toxic', rarity: 'common', hpRestore: -55, effect: "poison_8s", desc: '沙漠毒素' },
      { id: '15_scorpion_spore', name: '蝎毒孢子菌', type: 'toxic', rarity: 'common', hpRestore: -80, effect: "slow_10s", desc: '蝎毒减速' },
      { id: '15_quicksand_cap', name: '流沙毒帽', type: 'toxic', rarity: 'uncommon', hpRestore: -70, effect: "sink_3s", desc: '如陷入流沙，3秒无法移动' },
      { id: '15_desert_rot', name: '沙漠死帽', type: 'toxic', rarity: 'rare', hpRestore: -130, effect: "burn_15s", desc: '极端高温，持续灼烧' },
    ],

    plants: [
      { id: '15_sand_rose', name: '沙漠玫瑰', type: 'edible', hpRestore: 35, effect: "heat_resist_12s", desc: '耐热，适合沙漠生存' },
      { id: '15_cactus_fruit', name: '仙人掌果', type: 'edible', hpRestore: 60, effect: "water_replenish", desc: '补充水分，沙漠必备' },
      { id: '15_oasis_fern', name: '绿洲蕨', type: 'medicine', hpRestore: 80, effect: "heat_cure", desc: '治愈中暑状态' },
      { id: '15_sand_vine', name: '沙漠藤蔓', type: 'hazard', hpRestore: 0, effect: "slow_in_sand", desc: '沙漠中移速大幅降低' },
      { id: '15_mirage_flower', name: '海市蜃楼花', type: 'rare', hpRestore: 0, effect: "perm_dodge_3pct", desc: '永久回避率+3%' },
      { id: '15_scorpion_plant', name: '蝎子草', type: 'hazard', hpRestore: -20, effect: "poison_8s", desc: '蝎毒刺伤' },
      { id: '15_dust_lily', name: '尘埃百合', type: 'hazard', hpRestore: 0, effect: "blind_5s", desc: '扬起尘土致盲' },
      { id: '15_desert_herb', name: '沙漠草药', type: 'medicine', hpRestore: 0, effect: "stamina_up_15s", desc: '沙地行走不耗耐力' },
    ],

    smallMonsters: ['sand_scorpion', 'sandstorm_djinn', 'goblin', 'giant_insect'],

    disguisedMonsters: [
      { id: '15_sand_rose_mon', name: '沙漠玫瑰怪', disguisedAs: '沙漠玫瑰', hp: 220, physAtk: 28, magAtk: 18, physDef: 20, magDef: 14, special: '流沙陷阱3s+中毒', revealTrigger: 'approach', xp: 50, dropRate: 0.36 },
      { id: '15_cactus_mimic', name: '仙人掌拟态怪', disguisedAs: '仙人掌', hp: 300, physAtk: 38, magAtk: 5, physDef: 30, magDef: 10, special: '全方位刺击范围1格', revealTrigger: 'approach', xp: 65, dropRate: 0.4 },
      { id: '15_mirage_flower_m', name: '海市蜃楼花怪', disguisedAs: '海市蜃楼花', hp: 200, physAtk: 15, magAtk: 45, physDef: 10, magDef: 30, special: '幻觉迷阵4s方向乱', revealTrigger: 'approach', xp: 50, dropRate: 0.36 },
      { id: '15_scorpion_plant_m', name: '蝎子草怪', disguisedAs: '蝎子草', hp: 180, physAtk: 32, magAtk: 12, physDef: 15, magDef: 10, special: '蝎尾刺击+剧毒10s', revealTrigger: 'approach', xp: 45, dropRate: 0.34 },
    ],

    bosses: [
      { id: '15_sand_titan', name: '沙漠泰坦', tier: 'field', hp: 950, physAtk: 90, magAtk: 5, physDef: 55, magDef: 15, skills: ['沙尘暴', '流沙陷阱', '砂石投掷'], xp: 190, dropRate: 0.7, lootTable: ['sand_scorpion', 'ore_common', 'spear'] },
      { id: '15_djinn_lord', name: '沙暴精灵领主', tier: 'area', hp: 2100, physAtk: 60, magAtk: 95, physDef: 35, magDef: 68, skills: ['沙尘暴领域', '海市蜃楼', '魔法沙漠', '神灯束缚'], xp: 500, dropRate: 0.8, lootTable: ['sandstorm_core', 'scroll', 'ore_rare'] },
      { id: '15_desert_wyrm', name: '沙漠古龙·雷克萨', tier: 'zone', hp: 5800, physAtk: 110, magAtk: 80, physDef: 85, magDef: 45, skills: ['沙海翻涌', '沙尘龙息', '埋没领域', '沙漠地震', '无尽沙海'], xp: 1420, dropRate: 0.92, lootTable: ['dragon_scale', 'ore_rare', 'sandstorm_core', 'spear'] },
    ],
  },

  // ══════════════════════════════════════════════════
  // Biome 16 — 深渊海域
  // ══════════════════════════════════════════════════
  16: {
    name: '深渊海域',
    element: 'water',

    mushrooms: [
      { id: '16_sea_cap', name: '海洋菌', type: 'edible', rarity: 'common', hpRestore: 65, effect: "water_breathe_30s", desc: '短暂水下呼吸加成' },
      { id: '16_coral_shroom', name: '珊瑚蘑菇', type: 'edible', rarity: 'uncommon', hpRestore: 90, effect: "swim_spd_up", desc: '水中移速提升' },
      { id: '16_abyss_truffle', name: '深渊松露', type: 'edible', rarity: 'rare', hpRestore: 200, effect: "perm_magDef_8", desc: '深海压力强化魔防' },
      { id: '16_kelp_cap', name: '海藻菌', type: 'edible', rarity: 'common', hpRestore: 50, effect: null, desc: '海藻香气，补充矿物质' },
      { id: '16_jellyfish_tox', name: '水母毒菌', type: 'toxic', rarity: 'common', hpRestore: -60, effect: "sting_8s", desc: '水母刺毒，持续刺痛' },
      { id: '16_ink_spore', name: '墨汁孢子菌', type: 'toxic', rarity: 'common', hpRestore: -45, effect: "blind_8s", desc: '墨汁般孢子致盲' },
      { id: '16_deep_rot', name: '深海腐菌', type: 'toxic', rarity: 'uncommon', hpRestore: -100, effect: "pressure_5s", desc: '深水压力压缩生命' },
      { id: '16_kraken_cap', name: '克拉肯毒帽', type: 'toxic', rarity: 'rare', hpRestore: -150, effect: "tentacle_bind_5s", desc: '触手缠绕，5秒无法移动' },
    ],

    plants: [
      { id: '16_sea_weed', name: '海藻', type: 'edible', hpRestore: 25, effect: null, desc: '海洋常见，富含矿物质' },
      { id: '16_coral_flower', name: '珊瑚花', type: 'medicine', hpRestore: 60, effect: "water_breathe_60s", desc: '延长水下时间' },
      { id: '16_abyss_fern', name: '深渊蕨', type: 'medicine', hpRestore: 0, effect: "pressure_resist", desc: '抵抗深海压力伤害' },
      { id: '16_kelp_vine', name: '海带藤', type: 'hazard', hpRestore: 0, effect: "entangle_5s", desc: '海带缠绕无法移动' },
      { id: '16_biolum_flower', name: '生物荧光花', type: 'decorative', hpRestore: 0, effect: "underwater_light", desc: '深海照明，视野+3' },
      { id: '16_poisonfish_plant', name: '毒鱼草', type: 'hazard', hpRestore: -25, effect: "poison_10s", desc: '接触剧毒鱼毒' },
      { id: '16_tide_herb', name: '潮汐草药', type: 'medicine', hpRestore: 40, effect: "all_res_8s", desc: '潮汐力量，全属性抗性' },
      { id: '16_pearl_sprout', name: '珍珠嫩芽', type: 'rare', hpRestore: 0, effect: "perm_magDef_5", desc: '珍珠质感，永久魔防+5' },
    ],

    smallMonsters: ['deep_kraken', 'sea_serpent', 'bat', 'goblin'],

    disguisedMonsters: [
      { id: '16_coral_flower_m', name: '珊瑚花怪', disguisedAs: '珊瑚花', hp: 280, physAtk: 20, magAtk: 50, physDef: 15, magDef: 38, special: '珊瑚刺AOE1格+减速', revealTrigger: 'approach', xp: 62, dropRate: 0.4 },
      { id: '16_kelp_vine_mon', name: '海带藤怪', disguisedAs: '海带藤', hp: 240, physAtk: 15, magAtk: 30, physDef: 12, magDef: 22, special: '海带缠绕6s无法移动', revealTrigger: 'approach', xp: 55, dropRate: 0.36 },
      { id: '16_biolum_trap', name: '生物荧光花陷阱', disguisedAs: '生物荧光花', hp: 200, physAtk: 10, magAtk: 55, physDef: 8, magDef: 42, special: '光脉冲AOE致盲5s', revealTrigger: 'hit', xp: 50, dropRate: 0.36 },
      { id: '16_pearl_sprout_m', name: '珍珠嫩芽怪', disguisedAs: '珍珠嫩芽', hp: 180, physAtk: 25, magAtk: 20, physDef: 18, magDef: 18, special: '珍珠爆炸伤害AOE1格', revealTrigger: 'hit', xp: 42, dropRate: 0.32 },
    ],

    bosses: [
      { id: '16_sea_giant', name: '深海巨人', tier: 'field', hp: 1000, physAtk: 100, magAtk: 20, physDef: 60, magDef: 30, skills: ['海浪猛击', '深海吼啸', '巨型触手'], xp: 200, dropRate: 0.72, lootTable: ['kraken_tentacle', 'hammer', 'ore_rare'] },
      { id: '16_abyss_dragon', name: '深渊海龙', tier: 'area', hp: 2400, physAtk: 100, magAtk: 75, physDef: 65, magDef: 50, skills: ['潮汐冲击', '深渊喷吐', '海洋领域', '龙尾横扫'], xp: 580, dropRate: 0.83, lootTable: ['dragon_scale', 'sea_scale', 'ore_rare'] },
      { id: '16_ocean_god', name: '海洋之神·波塞冬', tier: 'zone', hp: 7000, physAtk: 120, magAtk: 160, physDef: 85, magDef: 90, skills: ['海洋领域', '潮汐灭世', '深渊之门', '海神三叉戟', '海啸'], xp: 1800, dropRate: 0.95, lootTable: ['spear', 'ore_rare', 'sea_scale', 'orb'] },
    ],
  },

  // ══════════════════════════════════════════════════
  // Biome 17 — 天空浮岛
  // ══════════════════════════════════════════════════
  17: {
    name: '天空浮岛',
    element: 'lightning',

    mushrooms: [
      { id: '17_cloud_cap', name: '云端菌', type: 'edible', rarity: 'common', hpRestore: 70, effect: "fall_resist_30s", desc: '跌落伤害免疫' },
      { id: '17_sky_shroom', name: '天空蘑菇', type: 'edible', rarity: 'uncommon', hpRestore: 95, effect: "jump_boost_15s", desc: '跳跃高度+50%' },
      { id: '17_storm_truffle', name: '风暴松露', type: 'edible', rarity: 'rare', hpRestore: 190, effect: "perm_lightning_5", desc: '永久雷电攻击+5' },
      { id: '17_nimbus_cap', name: '积雨云菌', type: 'edible', rarity: 'common', hpRestore: 55, effect: null, desc: '蓬松如云，略甜' },
      { id: '17_thunder_tox', name: '雷击毒菌', type: 'toxic', rarity: 'common', hpRestore: -65, effect: "stun_2s", desc: '雷电晕眩' },
      { id: '17_wind_spore', name: '风切孢子菌', type: 'toxic', rarity: 'common', hpRestore: -50, effect: "knockback_5tiles", desc: '强风大幅击退' },
      { id: '17_gale_rot', name: '飓风腐菌', type: 'toxic', rarity: 'uncommon', hpRestore: -90, effect: "confusion_6s", desc: '旋风迷乱方向' },
      { id: '17_sky_death', name: '坠天毒帽', type: 'toxic', rarity: 'rare', hpRestore: -140, effect: "fall_damage_100", desc: '受重力引发坠落伤害' },
    ],

    plants: [
      { id: '17_cloud_flower', name: '云朵花', type: 'edible', hpRestore: 45, effect: "fall_immune_20s", desc: '跌落伤害免疫' },
      { id: '17_sky_herb', name: '天空草药', type: 'medicine', hpRestore: 70, effect: "lightning_cure", desc: '治愈雷击状态' },
      { id: '17_wind_fern', name: '风之蕨', type: 'medicine', hpRestore: 0, effect: "stun_cure", desc: '解除晕眩' },
      { id: '17_storm_vine', name: '风暴藤', type: 'hazard', hpRestore: 0, effect: "knockback_5tiles", desc: '强风大击退' },
      { id: '17_nimbus_bloom', name: '积雨云花', type: 'edible', hpRestore: 35, effect: "spd_up_10s", desc: '云中闪电加速' },
      { id: '17_lightning_herb', name: '闪电草药', type: 'medicine', hpRestore: 0, effect: "lightning_atk_12s", desc: '雷电攻击加成' },
      { id: '17_sky_lily', name: '天空百合', type: 'rare', hpRestore: 0, effect: "perm_spd_0.12", desc: '永久速度+0.12' },
      { id: '17_gale_root', name: '疾风草根', type: 'edible', hpRestore: 20, effect: null, desc: '风味清新' },
    ],

    smallMonsters: ['cloud_giant', 'harpy', 'thunder_hawk', 'goblin'],

    disguisedMonsters: [
      { id: '17_cloud_flower_m', name: '云朵花怪', disguisedAs: '云朵花', hp: 220, physAtk: 15, magAtk: 50, physDef: 10, magDef: 38, special: '雷电云AOE范围2格', revealTrigger: 'approach', xp: 52, dropRate: 0.38 },
      { id: '17_nimbus_monster', name: '积雨云怪', disguisedAs: '积雨云花', hp: 280, physAtk: 20, magAtk: 60, physDef: 12, magDef: 45, special: '落雷攻击+晕眩2s', revealTrigger: 'approach', xp: 65, dropRate: 0.42 },
      { id: '17_wind_fern_mon', name: '风之蕨怪', disguisedAs: '风之蕨', hp: 200, physAtk: 30, magAtk: 25, physDef: 15, magDef: 20, special: '飓风击退6格', revealTrigger: 'approach', xp: 48, dropRate: 0.36 },
      { id: '17_sky_lily_mon', name: '天空百合怪', disguisedAs: '天空百合', hp: 180, physAtk: 18, magAtk: 38, physDef: 10, magDef: 30, special: '高空坠物AOE', revealTrigger: 'hit', xp: 45, dropRate: 0.34 },
    ],

    bosses: [
      { id: '17_sky_giant', name: '天空巨人', tier: 'field', hp: 1050, physAtk: 105, magAtk: 15, physDef: 62, magDef: 28, skills: ['巨石投掷', '天空踏击', '落雷'], xp: 210, dropRate: 0.72, lootTable: ['giant_club', 'ore_rare', 'hammer'] },
      { id: '17_cloud_dragon', name: '云端巨龙', tier: 'area', hp: 2600, physAtk: 110, magAtk: 85, physDef: 70, magDef: 55, skills: ['闪电喷吐', '云端冲击', '天空领域', '雷霆爪击'], xp: 620, dropRate: 0.84, lootTable: ['dragon_scale', 'lightning_core', 'ore_rare'] },
      { id: '17_sky_emperor', name: '天空帝·齐普斯', tier: 'zone', hp: 7500, physAtk: 130, magAtk: 170, physDef: 90, magDef: 92, skills: ['天空领域', '雷神之怒', '云端崩塌', '天帝降临', '万雷轰鸣'], xp: 1900, dropRate: 0.96, lootTable: ['greatsword', 'lightning_core', 'ore_rare', 'orb'] },
    ],
  },

  // ══════════════════════════════════════════════════
  // Biome 18 — 远古神殿
  // ══════════════════════════════════════════════════
  18: {
    name: '远古神殿',
    element: 'holy',

    mushrooms: [
      { id: '18_ancient_cap', name: '远古菌', type: 'edible', rarity: 'common', hpRestore: 80, effect: "relic_find_up", desc: '提升远古遗物发现率' },
      { id: '18_temple_shroom', name: '神殿蘑菇', type: 'edible', rarity: 'uncommon', hpRestore: 110, effect: "holy_shield_10s", desc: '圣光护盾50HP' },
      { id: '18_relic_truffle', name: '遗迹松露', type: 'edible', rarity: 'rare', hpRestore: 250, effect: "perm_all_3", desc: '永久全属性+3' },
      { id: '18_altar_cap', name: '祭坛菌', type: 'edible', rarity: 'common', hpRestore: 65, effect: "xp_boost_30s", desc: '30秒内经验值+25%' },
      { id: '18_curse_stone_tox', name: '诅咒石毒菌', type: 'toxic', rarity: 'common', hpRestore: -70, effect: "curse_10s", desc: '古老诅咒' },
      { id: '18_idol_spore', name: '神像孢子菌', type: 'toxic', rarity: 'common', hpRestore: -60, effect: "petrify_3s", desc: '古神之力，石化3秒' },
      { id: '18_ruin_rot', name: '废墟腐菌', type: 'toxic', rarity: 'uncommon', hpRestore: -100, effect: "all_down_12s", desc: '远古腐朽，全属性下降' },
      { id: '18_forbidden_cap', name: '禁忌神帽', type: 'toxic', rarity: 'rare', hpRestore: -180, effect: "doom_8s", desc: '受神罚，8秒内受伤害+50%' },
    ],

    plants: [
      { id: '18_ancient_herb', name: '远古草药', type: 'medicine', hpRestore: 80, effect: "all_cure", desc: '解除所有负面状态' },
      { id: '18_temple_bloom', name: '神殿圣花', type: 'rare', hpRestore: 0, effect: "perm_all_5", desc: '永久全属性+5' },
      { id: '18_relic_fern', name: '遗迹蕨', type: 'medicine', hpRestore: 60, effect: "holy_buff_20s", desc: '圣光护佑' },
      { id: '18_idol_vine', name: '神像藤', type: 'hazard', hpRestore: -30, effect: "petrify_4s", desc: '古神之力，较长石化' },
      { id: '18_altar_flower', name: '祭坛花', type: 'decorative', hpRestore: 0, effect: "xp_up_30s", desc: 'XP获取+20%' },
      { id: '18_curse_stone_pl', name: '诅咒石植物', type: 'hazard', hpRestore: -20, effect: "curse_8s", desc: '古老诅咒效果' },
      { id: '18_holy_grass', name: '圣光草', type: 'medicine', hpRestore: 0, effect: "undead_holy_20s", desc: '对亡灵系伤害+30%' },
      { id: '18_eternal_root', name: '永恒之根', type: 'edible', hpRestore: 50, effect: "perm_hp_15", desc: '永久最大HP+15' },
    ],

    smallMonsters: ['temple_guardian', 'ancient_golem', 'skeleton', 'zombie'],

    disguisedMonsters: [
      { id: '18_temple_bloom_m', name: '神殿圣花怪', disguisedAs: '神殿圣花', hp: 320, physAtk: 20, magAtk: 70, physDef: 15, magDef: 55, special: '圣光爆炸AOE圣属性伤害', revealTrigger: 'hit', xp: 72, dropRate: 0.44 },
      { id: '18_altar_flower_m', name: '祭坛花怪', disguisedAs: '祭坛花', hp: 280, physAtk: 10, magAtk: 65, physDef: 10, magDef: 50, special: '召唤古代守卫1只', revealTrigger: 'approach', xp: 65, dropRate: 0.42 },
      { id: '18_idol_vine_mon', name: '神像藤怪', disguisedAs: '神像藤', hp: 380, physAtk: 45, magAtk: 10, physDef: 40, magDef: 20, special: '石化凝视5s', revealTrigger: 'approach', xp: 78, dropRate: 0.45 },
      { id: '18_eternal_root_m', name: '永恒之根怪', disguisedAs: '永恒之根', hp: 250, physAtk: 35, magAtk: 20, physDef: 28, magDef: 18, special: '深根固地10s不可击退', revealTrigger: 'approach', xp: 58, dropRate: 0.38 },
    ],

    bosses: [
      { id: '18_temple_golem', name: '神殿傀儡王', tier: 'field', hp: 1000, physAtk: 95, magAtk: 30, physDef: 85, magDef: 55, skills: ['圣光冲击', '神圣护盾', '远古惩罚'], xp: 200, dropRate: 0.72, lootTable: ['ancient_relic', 'hammer', 'ore_rare'] },
      { id: '18_ancient_wyrm', name: '远古神殿龙', tier: 'area', hp: 2700, physAtk: 100, magAtk: 90, physDef: 80, magDef: 65, skills: ['圣光龙息', '神圣领域', '龙鳞护甲', '远古审判'], xp: 650, dropRate: 0.85, lootTable: ['dragon_scale', 'ancient_core', 'ore_rare'] },
      { id: '18_god_avatar', name: '古神化身·阿图姆', tier: 'zone', hp: 8000, physAtk: 80, magAtk: 180, physDef: 80, magDef: 120, skills: ['神圣领域', '天罚降临', '远古之怒', '神迹', '时间停止'], xp: 2000, dropRate: 0.96, lootTable: ['orb', 'ancient_core', 'ore_rare', 'scroll'] },
    ],
  },

  // ══════════════════════════════════════════════════
  // Biome 19 — 巨人山地
  // ══════════════════════════════════════════════════
  19: {
    name: '巨人山地',
    element: 'physical',

    mushrooms: [
      { id: '19_mountain_cap', name: '山岳菌', type: 'edible', rarity: 'common', hpRestore: 75, effect: "physDef_up_15s", desc: '山岩坚韧，强化物防' },
      { id: '19_giant_shroom', name: '巨人蘑菇', type: 'edible', rarity: 'uncommon', hpRestore: 120, effect: "size_up_10s", desc: '体型变大，物攻+15%' },
      { id: '19_peak_truffle', name: '山顶松露', type: 'edible', rarity: 'rare', hpRestore: 210, effect: "perm_physAtk_8", desc: '永久物攻+8' },
      { id: '19_rock_cap', name: '岩石菌', type: 'edible', rarity: 'common', hpRestore: 60, effect: null, desc: '坚硬外壳，耐嚼' },
      { id: '19_cliff_tox', name: '绝壁毒菌', type: 'toxic', rarity: 'common', hpRestore: -60, effect: "fall_stun_3s", desc: '重力冲击晕眩' },
      { id: '19_avalanche_spore', name: '雪崩孢子菌', type: 'toxic', rarity: 'common', hpRestore: -80, effect: "knockback_4tiles", desc: '雪崩式击退' },
      { id: '19_glacier_rot', name: '冰川腐菌', type: 'toxic', rarity: 'uncommon', hpRestore: -100, effect: "freeze_6s", desc: '山地冰冻，冻结时间更长' },
      { id: '19_summit_death', name: '山顶死帽', type: 'toxic', rarity: 'rare', hpRestore: -160, effect: "physAtk_down_20s", desc: '极寒导致肌肉僵硬' },
    ],

    plants: [
      { id: '19_mountain_herb', name: '山岳草药', type: 'medicine', hpRestore: 70, effect: "physDef_up_20s", desc: '山岩守护，物防大增' },
      { id: '19_giant_flower', name: '巨人之花', type: 'edible', hpRestore: 55, effect: "physAtk_up_15s", desc: '巨人力量，物攻提升' },
      { id: '19_peak_fern', name: '山顶蕨', type: 'medicine', hpRestore: 0, effect: "freeze_cure", desc: '解除冰冻' },
      { id: '19_cliff_vine', name: '绝壁藤', type: 'hazard', hpRestore: 0, effect: "knockback_3tiles", desc: '悬崖风击退' },
      { id: '19_avalanche_bloom', name: '雪崩花', type: 'hazard', hpRestore: -20, effect: "stun_3s", desc: '雪崩冲击晕眩' },
      { id: '19_summit_herb', name: '山顶草药', type: 'rare', hpRestore: 0, effect: "perm_physAtk_6", desc: '永久物攻+6' },
      { id: '19_rock_sprout', name: '岩石嫩芽', type: 'edible', hpRestore: 30, effect: null, desc: '坚硬外皮下嫩芽可食' },
      { id: '19_glacier_lily', name: '冰川百合', type: 'medicine', hpRestore: 45, effect: "cold_resist_15s", desc: '冰川保护，寒冷抗性' },
    ],

    smallMonsters: ['troll', 'orc', 'cyclops', 'goblin'],

    disguisedMonsters: [
      { id: '19_giant_flower_m', name: '巨人之花怪', disguisedAs: '巨人之花', hp: 380, physAtk: 55, magAtk: 5, physDef: 40, magDef: 12, special: '巨拳AOE范围2格+击退4格', revealTrigger: 'approach', xp: 78, dropRate: 0.45 },
      { id: '19_rock_sprout_mon', name: '岩石嫩芽怪', disguisedAs: '岩石嫩芽', hp: 260, physAtk: 42, magAtk: 0, physDef: 50, magDef: 10, special: '岩石护甲免疫首次攻击', revealTrigger: 'approach', xp: 58, dropRate: 0.38 },
      { id: '19_cliff_vine_mon', name: '绝壁藤怪', disguisedAs: '绝壁藤', hp: 200, physAtk: 32, magAtk: 5, physDef: 22, magDef: 10, special: '悬崖拉扯+坠落伤害', revealTrigger: 'approach', xp: 48, dropRate: 0.35 },
      { id: '19_summit_herb_m', name: '山顶草药怪', disguisedAs: '山顶草药', hp: 180, physAtk: 25, magAtk: 15, physDef: 18, magDef: 12, special: '高山寒气减速+冻结3s', revealTrigger: 'approach', xp: 45, dropRate: 0.32 },
    ],

    bosses: [
      { id: '19_mountain_giant', name: '山岳巨人', tier: 'field', hp: 1100, physAtk: 110, magAtk: 5, physDef: 70, magDef: 20, skills: ['碎山巨拳', '雪崩攻击', '岩石滚落'], xp: 220, dropRate: 0.73, lootTable: ['giant_club', 'ore_iron', 'hammer'] },
      { id: '19_rock_dragon', name: '岩石巨龙', tier: 'area', hp: 2800, physAtk: 120, magAtk: 30, physDef: 95, magDef: 38, skills: ['岩石龙息', '山体崩裂', '龙鳞护甲', '巨石投掷'], xp: 670, dropRate: 0.85, lootTable: ['dragon_scale', 'ore_rare', 'hammer', 'gauntlets'] },
      { id: '19_titan_king', name: '泰坦山王·戈隆', tier: 'zone', hp: 8500, physAtk: 155, magAtk: 30, physDef: 130, magDef: 45, skills: ['泰坦冲锋', '山崩地裂', '岩石护甲', '大地震', '泰坦之怒'], xp: 2100, dropRate: 0.96, lootTable: ['greatsword', 'ore_rare', 'gauntlets', 'hammer'] },
    ],
  },

  // ══════════════════════════════════════════════════
  // Biome 20 — 暗魔禁地
  // ══════════════════════════════════════════════════
  20: {
    name: '暗魔禁地',
    element: 'dark',

    mushrooms: [
      { id: '20_dark_magic_cap', name: '暗魔菌', type: 'edible', rarity: 'common', hpRestore: 70, effect: "dark_atk_12s", desc: '吸收暗魔之气，暗系加成' },
      { id: '20_forbidden_shroom', name: '禁忌蘑菇', type: 'edible', rarity: 'uncommon', hpRestore: 100, effect: "all_skills_up_10s", desc: '所有技能伤害+15%' },
      { id: '20_rift_truffle2', name: '禁地松露', type: 'edible', rarity: 'rare', hpRestore: 240, effect: "perm_crit_dmg_0.2", desc: '永久暴击伤害倍率+0.2' },
      { id: '20_arcane_cap', name: '奥术菌', type: 'edible', rarity: 'common', hpRestore: 60, effect: "magAtk_up_15s", desc: '奥术能量，魔攻大幅提升' },
      { id: '20_hex_tox', name: '妖术毒菌', type: 'toxic', rarity: 'common', hpRestore: -65, effect: "hex_8s", desc: '妖术控制，随机负面效果' },
      { id: '20_void_spore', name: '虚空孢子菌', type: 'toxic', rarity: 'common', hpRestore: -85, effect: "void_burn_8s", desc: '虚空灼伤无视防御' },
      { id: '20_chaos_rot2', name: '混沌腐菌', type: 'toxic', rarity: 'uncommon', hpRestore: -110, effect: "all_debuff_3", desc: '随机3种负面状态叠加' },
      { id: '20_forbidden_death', name: '禁忌死帽', type: 'toxic', rarity: 'rare', hpRestore: -200, effect: "instant_kill_20pct", desc: '20%概率即死，否则-200HP' },
    ],

    plants: [
      { id: '20_dark_herb', name: '暗魔草药', type: 'medicine', hpRestore: 65, effect: "curse_cure", desc: '净化暗魔诅咒' },
      { id: '20_forbidden_bloom', name: '禁忌之花', type: 'rare', hpRestore: 0, effect: "perm_crit_dmg_0.3", desc: '永久暴击伤害+0.3' },
      { id: '20_arcane_fern', name: '奥术蕨', type: 'medicine', hpRestore: 0, effect: "all_res_12s", desc: '全属性抗性大幅提升' },
      { id: '20_void_vine', name: '虚空藤', type: 'hazard', hpRestore: -30, effect: "void_burn_6s", desc: '虚空灼伤无视防御' },
      { id: '20_chaos_bloom', name: '混沌花', type: 'hazard', hpRestore: -15, effect: "random_debuff_2", desc: '随机2个负面状态' },
      { id: '20_dark_lily', name: '暗魔百合', type: 'edible', hpRestore: 40, effect: "dark_atk_15s", desc: '暗属性攻击加成' },
      { id: '20_hex_herb', name: '妖术草药', type: 'medicine', hpRestore: 0, effect: "hex_cure", desc: '解除妖术诅咒' },
      { id: '20_forbidden_root', name: '禁忌之根', type: 'edible', hpRestore: 60, effect: "perm_magAtk_6", desc: '永久魔攻+6，但有10%中毒概率' },
    ],

    smallMonsters: ['lich', 'dark_mage', 'bat', 'void_crawler'],

    disguisedMonsters: [
      { id: '20_forbidden_bloom_m', name: '禁忌之花怪', disguisedAs: '禁忌之花', hp: 340, physAtk: 15, magAtk: 75, physDef: 12, magDef: 58, special: '禁忌爆炸AOE无视防御', revealTrigger: 'hit', xp: 75, dropRate: 0.45 },
      { id: '20_dark_lily_trap', name: '暗魔百合陷阱', disguisedAs: '暗魔百合', hp: 260, physAtk: 20, magAtk: 60, physDef: 10, magDef: 45, special: '暗魔诅咒+全属性降8s', revealTrigger: 'approach', xp: 60, dropRate: 0.4 },
      { id: '20_void_vine_mon', name: '虚空藤怪', disguisedAs: '虚空藤', hp: 300, physAtk: 35, magAtk: 35, physDef: 20, magDef: 28, special: '次元切割+虚空灼伤', revealTrigger: 'approach', xp: 68, dropRate: 0.42 },
      { id: '20_chaos_bloom_mon', name: '混沌花怪', disguisedAs: '混沌花', hp: 220, physAtk: 25, magAtk: 45, physDef: 12, magDef: 35, special: '随机3种负面状态爆发', revealTrigger: 'approach', xp: 55, dropRate: 0.38 },
    ],

    bosses: [
      { id: '20_dark_archmage', name: '暗魔大法师', tier: 'field', hp: 920, physAtk: 20, magAtk: 130, physDef: 20, magDef: 90, skills: ['禁忌爆炸', '暗魔护盾', '混沌召唤'], xp: 185, dropRate: 0.72, lootTable: ['staff', 'ore_dark', 'scroll'] },
      { id: '20_chaos_dragon', name: '混沌巨龙', tier: 'area', hp: 2500, physAtk: 80, magAtk: 120, physDef: 55, magDef: 75, skills: ['混沌龙息', '暗魔领域', '龙鳞护盾', '禁忌火球'], xp: 600, dropRate: 0.85, lootTable: ['dragon_scale', 'ore_dark', 'ore_rare'] },
      { id: '20_dark_god', name: '暗魔之神·玛拉克', tier: 'zone', hp: 9000, physAtk: 60, magAtk: 200, physDef: 45, magDef: 130, skills: ['禁忌领域', '暗魔湮灭', '混沌裂变', '黑暗审判', '世界末日'], xp: 2500, dropRate: 0.97, lootTable: ['orb', 'ore_dark', 'ore_rare', 'staff', 'scroll'] },
    ],
  },

}

