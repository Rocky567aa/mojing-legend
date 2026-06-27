/**
 * BiomeContentMap_A.js — 群系 0-6 内容配置
 * (自动生成；与 BiomeContentMap_B.js / _C.js 合并使用)
 */

export const BIOME_CONTENT_A = {
  // ══════════════════════════════════════════════════
  // Biome 0 — 青翠草原
  // ══════════════════════════════════════════════════
  0: {
    name: '青翠草原',
    element: 'physical',

    mushrooms: [
      { id: '0_morning_dew', name: '晨露菌', type: 'edible', rarity: 'common', hpRestore: 50, effect: null, desc: '清晨凝露浸润，口感清甜' },
      { id: '0_sweet_cap', name: '甜草菌', type: 'edible', rarity: 'common', hpRestore: 80, effect: "speed_8s", desc: '蜜糖香气，食后脚步轻快8秒' },
      { id: '0_prairie_orange', name: '草原橙伞', type: 'edible', rarity: 'uncommon', hpRestore: 120, effect: "atk_up_10s", desc: '橙色菌盖，激活战斗力' },
      { id: '0_white_fairy', name: '白仙菇', type: 'edible', rarity: 'rare', hpRestore: 200, effect: "def_up_15s", desc: '德鲁伊视为圣物，防御大增' },
      { id: '0_clover_shroom', name: '幸运菌', type: 'edible', rarity: 'uncommon', hpRestore: 60, effect: "luckup_30s", desc: '四叶草纹路，提升掉落率' },
      { id: '0_bitter_tox', name: '苦味毒菌', type: 'toxic', rarity: 'common', hpRestore: -40, effect: "slow_5s", desc: '极苦，令人迟缓' },
      { id: '0_dark_spot', name: '暗斑毒菌', type: 'toxic', rarity: 'common', hpRestore: -80, effect: "poison_8s", desc: '黑色斑点是危险警告' },
      { id: '0_red_death', name: '红点死帽', type: 'toxic', rarity: 'uncommon', hpRestore: -120, effect: "poison_15s", desc: '漂亮的红色，却是致命的' },
    ],

    plants: [
      { id: '0_wild_strawberry', name: '野草莓', type: 'edible', hpRestore: 25, effect: null, desc: '酸甜可口' },
      { id: '0_dandelion', name: '蒲公英', type: 'medicine', hpRestore: 15, effect: "poison_cure", desc: '制作解毒药的基础材料' },
      { id: '0_yellow_flower', name: '大黄花', type: 'edible', hpRestore: 40, effect: null, desc: '花蜜可食用' },
      { id: '0_lavender', name: '薰衣草', type: 'medicine', hpRestore: 0, effect: "calm_aura", desc: '周围3格怪物攻击欲望降低' },
      { id: '0_thornbush', name: '荆棘丛', type: 'hazard', hpRestore: -10, effect: "bleed_3s", desc: '穿越时划伤并流血' },
      { id: '0_four_leaf', name: '四叶草', type: 'rare', hpRestore: 0, effect: "perm_luck_5", desc: '极稀少，永久提升幸运值' },
      { id: '0_wild_onion', name: '野葱', type: 'edible', hpRestore: 20, effect: null, desc: '可做料理材料' },
      { id: '0_vine_creeper', name: '蔓藤草', type: 'hazard', hpRestore: 0, effect: "slow_3s", desc: '缠住双脚减速' },
    ],

    smallMonsters: ['slime', 'goblin', 'wolf', 'giant_insect'],

    disguisedMonsters: [
      { id: '0_grass_mimic', name: '草丛拟态兽', disguisedAs: '普通草丛', hp: 180, physAtk: 28, magAtk: 0, physDef: 10, magDef: 5, special: '突袭+眩晕1s', revealTrigger: 'approach', xp: 38, dropRate: 0.3 },
      { id: '0_shroom_mimic', name: '毒菇拟态精', disguisedAs: '蘑菇', hp: 140, physAtk: 15, magAtk: 22, physDef: 6, magDef: 18, special: '孢子喷射+中毒5s', revealTrigger: 'hit', xp: 32, dropRate: 0.28 },
      { id: '0_flower_trap', name: '黄花食虫草', disguisedAs: '大黄花', hp: 120, physAtk: 20, magAtk: 5, physDef: 5, magDef: 8, special: '咬合+出血3s', revealTrigger: 'approach', xp: 28, dropRate: 0.25 },
      { id: '0_bush_stalker', name: '灌木潜伏狼', disguisedAs: '灌木丛', hp: 220, physAtk: 35, magAtk: 0, physDef: 14, magDef: 8, special: '出其不意暴击率+30%', revealTrigger: 'approach', xp: 45, dropRate: 0.32 },
    ],

    bosses: [
      { id: '0_alpha_boar', name: '草原霸主·巨野猪', tier: 'field', hp: 600, physAtk: 65, magAtk: 0, physDef: 30, magDef: 10, skills: ['横冲直撞', '愤怒嘶吼', '震地踏击'], xp: 120, dropRate: 0.6, lootTable: ['sword', 'ore_common', 'axe'] },
      { id: '0_queen_ant', name: '草原女王蚁', tier: 'area', hp: 1200, physAtk: 55, magAtk: 20, physDef: 40, magDef: 25, skills: ['召唤蚁兵', '毒液喷射', '地底突袭', '包围陷阱'], xp: 280, dropRate: 0.72, lootTable: ['dagger', 'ore_rare', 'scroll'] },
      { id: '0_granite_titan', name: '永恒守护·花岗巨人', tier: 'zone', hp: 3500, physAtk: 100, magAtk: 10, physDef: 80, magDef: 30, skills: ['大地震颤', '巨石投掷', '铁壁护盾', '山崩地裂'], xp: 800, dropRate: 0.85, lootTable: ['greatsword', 'ore_rare', 'gauntlets'] },
    ],
  },

  // ══════════════════════════════════════════════════
  // Biome 1 — 幽深森林
  // ══════════════════════════════════════════════════
  1: {
    name: '幽深森林',
    element: 'poison',

    mushrooms: [
      { id: '1_forest_glow', name: '森林荧光菇', type: 'edible', rarity: 'uncommon', hpRestore: 90, effect: "vision_up_20s", desc: '夜晚发光，食后视野扩大' },
      { id: '1_bark_shroom', name: '树皮灰菌', type: 'edible', rarity: 'common', hpRestore: 55, effect: null, desc: '生长于枯木，朴实无华' },
      { id: '1_red_berry_cap', name: '红浆菌', type: 'edible', rarity: 'common', hpRestore: 70, effect: null, desc: '菌盖有果浆味' },
      { id: '1_ancient_wood', name: '古木灵菌', type: 'edible', rarity: 'rare', hpRestore: 180, effect: "perm_hp_30", desc: '寄生千年古木，蕴含生命力' },
      { id: '1_vine_cap', name: '藤蔓帽菌', type: 'edible', rarity: 'common', hpRestore: 45, effect: "regen_10s", desc: '森林气息，持续回血' },
      { id: '1_death_cap', name: '死亡伞菌', type: 'toxic', rarity: 'common', hpRestore: -90, effect: "poison_12s", desc: '最常见的致命蘑菇' },
      { id: '1_web_shroom', name: '蛛网孢菌', type: 'toxic', rarity: 'uncommon', hpRestore: -60, effect: "paralyze_3s", desc: '喷出蛛网状孢子令人麻痹' },
      { id: '1_black_rot', name: '黑腐菌', type: 'toxic', rarity: 'rare', hpRestore: -150, effect: "curse_10s", desc: '腐化之气，降低全属性' },
    ],

    plants: [
      { id: '1_forest_berry', name: '林间浆果', type: 'edible', hpRestore: 35, effect: null, desc: '酸甜多汁' },
      { id: '1_healing_herb', name: '愈合草', type: 'medicine', hpRestore: 60, effect: "bleed_cure", desc: '止血效果卓越' },
      { id: '1_giant_leaf', name: '巨型阔叶', type: 'decorative', hpRestore: 0, effect: "weather_reduce", desc: '覆盖区域降低天气效果' },
      { id: '1_poison_ivy', name: '毒蔓藤', type: 'hazard', hpRestore: -20, effect: "poison_6s", desc: '触碰即中毒' },
      { id: '1_spore_plant', name: '孢子爆发草', type: 'hazard', hpRestore: -15, effect: "blind_3s", desc: '被踩时释放孢子云致盲' },
      { id: '1_moon_blossom', name: '月华花', type: 'medicine', hpRestore: 30, effect: "magAtk_up", desc: '夜晚盛开，提升技能威力' },
      { id: '1_thick_vine', name: '粗壮藤蔓', type: 'hazard', hpRestore: 0, effect: "entangle_5s", desc: '缠住双脚无法移动' },
      { id: '1_forest_apple', name: '野苹果', type: 'edible', hpRestore: 50, effect: null, desc: '挂在树上的果实' },
    ],

    smallMonsters: ['wolf', 'harpy', 'goblin', 'vine_monster'],

    disguisedMonsters: [
      { id: '1_log_mimic', name: '枯木伪装虫', disguisedAs: '枯木段', hp: 200, physAtk: 30, magAtk: 0, physDef: 20, magDef: 5, special: '外壳初段免疫物理30%', revealTrigger: 'hit', xp: 42, dropRate: 0.32 },
      { id: '1_stump_golem', name: '树桩石魔', disguisedAs: '老树桩', hp: 380, physAtk: 45, magAtk: 0, physDef: 40, magDef: 15, special: '根须绑缚3s', revealTrigger: 'approach', xp: 70, dropRate: 0.4 },
      { id: '1_berry_mimic', name: '毒浆果蔓精', disguisedAs: '浆果丛', hp: 160, physAtk: 12, magAtk: 35, physDef: 5, magDef: 20, special: '毒液溅射范围1格', revealTrigger: 'hit', xp: 36, dropRate: 0.3 },
      { id: '1_leaf_predator', name: '阔叶捕食者', disguisedAs: '大型阔叶植物', hp: 280, physAtk: 38, magAtk: 10, physDef: 12, magDef: 15, special: '吞噬+禁锢目标2s', revealTrigger: 'approach', xp: 55, dropRate: 0.38 },
    ],

    bosses: [
      { id: '1_forest_bear', name: '幽林守护熊', tier: 'field', hp: 800, physAtk: 80, magAtk: 0, physDef: 45, magDef: 20, skills: ['熊吼震慑', '爪击三连', '狂怒'], xp: 160, dropRate: 0.65, lootTable: ['axe', 'hide', 'ore_common'] },
      { id: '1_ancient_treant', name: '千年古树精', tier: 'area', hp: 1800, physAtk: 70, magAtk: 55, physDef: 60, magDef: 40, skills: ['根须海啸', '自然之怒', '召唤藤蔓', '树精护甲'], xp: 420, dropRate: 0.75, lootTable: ['staff', 'vine', 'ore_rare'] },
      { id: '1_forest_witch', name: '幽林巫后·凡妮莎', tier: 'zone', hp: 4200, physAtk: 30, magAtk: 120, physDef: 35, magDef: 75, skills: ['魔法森林', '毒云笼罩', '树精召唤', '死亡缠绕', '相位穿越'], xp: 1000, dropRate: 0.88, lootTable: ['staff', 'scroll', 'ore_rare', 'orb'] },
    ],
  },

  // ══════════════════════════════════════════════════
  // Biome 2 — 地下洞穴
  // ══════════════════════════════════════════════════
  2: {
    name: '地下洞穴',
    element: 'dark',

    mushrooms: [
      { id: '2_cave_glow', name: '洞穴荧光菇', type: 'edible', rarity: 'common', hpRestore: 65, effect: "darkvision_30s", desc: '暗中发光，视野+2格' },
      { id: '2_cave_cap', name: '石窟灰菌', type: 'edible', rarity: 'common', hpRestore: 50, effect: null, desc: '洞穴常见食用菌' },
      { id: '2_crystal_shroom', name: '水晶蘑菇', type: 'edible', rarity: 'uncommon', hpRestore: 100, effect: "physDef_up_15s", desc: '晶体附着，强化防御' },
      { id: '2_damp_truffle', name: '潮湿松露', type: 'edible', rarity: 'rare', hpRestore: 160, effect: "perm_physDef_5", desc: '炼金必备材料' },
      { id: '2_blind_spore', name: '盲目孢子菇', type: 'toxic', rarity: 'common', hpRestore: -50, effect: "blind_8s", desc: '孢子导致短暂失明' },
      { id: '2_bat_tox', name: '蝙蝠粪毒菌', type: 'toxic', rarity: 'common', hpRestore: -70, effect: "disease_10s", desc: '腐臭难当，引发疾病' },
      { id: '2_cave_rot', name: '洞穴腐菌', type: 'toxic', rarity: 'uncommon', hpRestore: -110, effect: "atk_down_15s", desc: '分解腐殖质，侵蚀战斗力' },
      { id: '2_shadow_cap', name: '暗影帽', type: 'toxic', rarity: 'rare', hpRestore: -40, effect: "invisible_15s", desc: '有毒但能短暂隐身' },
    ],

    plants: [
      { id: '2_cave_moss', name: '洞穴苔藓', type: 'edible', hpRestore: 20, effect: null, desc: '潮湿清新，补充水分' },
      { id: '2_crystal_fern', name: '水晶蕨', type: 'medicine', hpRestore: 0, effect: "paralyz_cure", desc: '解除麻痹状态' },
      { id: '2_dark_flower', name: '暗境之花', type: 'medicine', hpRestore: 45, effect: "magDef_up_10s", desc: '吸收黑暗能量盛开' },
      { id: '2_spider_lily', name: '蛛网百合', type: 'hazard', hpRestore: -25, effect: "entangle_4s", desc: '花丝如蛛网缠住靠近者' },
      { id: '2_echo_plant', name: '回声草', type: 'decorative', hpRestore: 0, effect: "enemy_reveal", desc: '显示附近隐形怪物位置' },
      { id: '2_pale_light', name: '苍白磷火草', type: 'hazard', hpRestore: 0, effect: "fear_3s", desc: '磷火般光芒造成短暂恐惧' },
      { id: '2_ore_sprout', name: '矿脉嫩芽', type: 'rare', hpRestore: 0, effect: "ore_detect", desc: '标记附近矿脉位置' },
      { id: '2_cave_berry', name: '洞穴浆果', type: 'edible', hpRestore: 30, effect: null, desc: '透明果肉，微甜' },
    ],

    smallMonsters: ['spider', 'bat', 'goblin', 'giant_insect'],

    disguisedMonsters: [
      { id: '2_stalactite_golem', name: '钟乳石傀儡', disguisedAs: '钟乳石', hp: 450, physAtk: 50, magAtk: 0, physDef: 55, magDef: 10, special: '坠落攻击+晕眩2s', revealTrigger: 'approach', xp: 80, dropRate: 0.42 },
      { id: '2_rock_pile_lurker', name: '碎石潜伏者', disguisedAs: '碎石堆', hp: 260, physAtk: 38, magAtk: 0, physDef: 38, magDef: 8, special: '飞石投掷+击退2格', revealTrigger: 'approach', xp: 55, dropRate: 0.36 },
      { id: '2_crystal_mimic', name: '水晶花拟态', disguisedAs: '水晶花', hp: 200, physAtk: 10, magAtk: 45, physDef: 15, magDef: 30, special: '水晶碎片爆炸范围1格', revealTrigger: 'hit', xp: 48, dropRate: 0.35 },
      { id: '2_cave_moss_crab', name: '苔藓甲蟹', disguisedAs: '洞穴苔藓', hp: 190, physAtk: 32, magAtk: 0, physDef: 28, magDef: 6, special: '钳夹+出血5s', revealTrigger: 'approach', xp: 40, dropRate: 0.3 },
    ],

    bosses: [
      { id: '2_cave_spider_q', name: '洞穴蜘蛛女王', tier: 'field', hp: 900, physAtk: 75, magAtk: 30, physDef: 40, magDef: 30, skills: ['蛛网覆盖', '毒液喷射', '召唤蛛卵'], xp: 180, dropRate: 0.68, lootTable: ['web_silk', 'dagger', 'ore_common'] },
      { id: '2_rock_king', name: '岩石之王', tier: 'area', hp: 2200, physAtk: 90, magAtk: 0, physDef: 90, magDef: 25, skills: ['碎岩猛击', '石壁护盾', '山崩地裂', '岩石再生'], xp: 520, dropRate: 0.78, lootTable: ['hammer', 'ore_iron', 'ore_rare'] },
      { id: '2_deep_earth_wyrm', name: '深地巨虫·奥鲁格', tier: 'zone', hp: 5000, physAtk: 130, magAtk: 40, physDef: 100, magDef: 40, skills: ['地底穿行', '毒液海啸', '岩石崩裂', '吞噬', '地底王者'], xp: 1200, dropRate: 0.9, lootTable: ['greatsword', 'ore_rare', 'chitin', 'ore_iron'] },
    ],
  },

  // ══════════════════════════════════════════════════
  // Biome 3 — 亡灵墓地
  // ══════════════════════════════════════════════════
  3: {
    name: '亡灵墓地',
    element: 'dark',

    mushrooms: [
      { id: '3_bone_shroom', name: '白骨菌', type: 'edible', rarity: 'common', hpRestore: 60, effect: null, desc: '骨白色，长于墓碑旁' },
      { id: '3_grave_moss', name: '墓碑苔菇', type: 'edible', rarity: 'common', hpRestore: 45, effect: null, desc: '墓碑上常见，吸收阴气滋养' },
      { id: '3_soul_cap', name: '魂灯菌', type: 'edible', rarity: 'uncommon', hpRestore: 80, effect: "undead_resist_15s", desc: '对不死系增加10%伤害' },
      { id: '3_dark_truffle', name: '暗影松露', type: 'edible', rarity: 'rare', hpRestore: 140, effect: "perm_magAtk_5", desc: '汲取灵气，永久增强魔攻' },
      { id: '3_wither_cap', name: '枯萎腐菌', type: 'toxic', rarity: 'common', hpRestore: -60, effect: "curse_8s", desc: '受诅咒生长，含腐化毒素' },
      { id: '3_death_bloom', name: '死亡花菌', type: 'toxic', rarity: 'common', hpRestore: -100, effect: "necrotic_10s", desc: '暗属性毒，持续侵蚀生命' },
      { id: '3_ghost_spore', name: '幽灵孢菇', type: 'toxic', rarity: 'uncommon', hpRestore: -70, effect: "slow_10s", desc: '孢子内含恐惧能量' },
      { id: '3_lich_cap', name: '巫妖帽', type: 'toxic', rarity: 'rare', hpRestore: -30, effect: "perm_magAtk_8", desc: '吃下受150伤害但魔攻永久+8' },
    ],

    plants: [
      { id: '3_grave_weed', name: '墓地杂草', type: 'decorative', hpRestore: 0, effect: null, desc: '随处可见，营造氛围' },
      { id: '3_soul_flower', name: '魂魄花', type: 'rare', hpRestore: 0, effect: "revive_once", desc: '死亡时自动复活一次' },
      { id: '3_dead_rose', name: '枯萎玫瑰', type: 'hazard', hpRestore: -15, effect: "curse_5s", desc: '带刺划伤后受诅咒' },
      { id: '3_night_bloom', name: '夜间绽放花', type: 'medicine', hpRestore: 40, effect: "night_only", desc: '仅夜晚可采，恢复血量' },
      { id: '3_bone_vine', name: '骨刺藤', type: 'hazard', hpRestore: -20, effect: "bleed_6s", desc: '刺入皮肤并缠绕出血' },
      { id: '3_phantom_grass', name: '幻影草', type: 'rare', hpRestore: 0, effect: "invisible_30s", desc: '隐身效果持续最长' },
      { id: '3_ash_herb', name: '灰烬草', type: 'medicine', hpRestore: 0, effect: "fire_resist_20s", desc: '灰中重生，提供火焰抗性' },
      { id: '3_grave_lily', name: '墓园百合', type: 'decorative', hpRestore: 0, effect: "safe_zone", desc: '旁边站立时亡灵不会攻击' },
    ],

    smallMonsters: ['skeleton', 'zombie', 'bat', 'ruin_skeleton'],

    disguisedMonsters: [
      { id: '3_grave_mimic', name: '墓碑拟态鬼', disguisedAs: '普通墓碑', hp: 220, physAtk: 5, magAtk: 50, physDef: 5, magDef: 40, special: '死亡凝视+麻痹3s', revealTrigger: 'approach', xp: 55, dropRate: 0.4 },
      { id: '3_bone_pile_golem', name: '骨堆傀儡', disguisedAs: '骨头堆', hp: 350, physAtk: 45, magAtk: 8, physDef: 30, magDef: 20, special: '自爆成骨片AOE', revealTrigger: 'hit', xp: 68, dropRate: 0.42 },
      { id: '3_dead_rose_trap', name: '食人玫瑰', disguisedAs: '枯萎玫瑰', hp: 160, physAtk: 25, magAtk: 20, physDef: 8, magDef: 15, special: '毒刺+出血+诅咒三连', revealTrigger: 'approach', xp: 40, dropRate: 0.32 },
      { id: '3_soul_flower_fake', name: '魂花拟态魔', disguisedAs: '魂魄花', hp: 180, physAtk: 5, magAtk: 60, physDef: 5, magDef: 45, special: '魂魄吸取回复自身HP20%', revealTrigger: 'hit', xp: 50, dropRate: 0.38 },
    ],

    bosses: [
      { id: '3_grave_keeper', name: '墓地看守者', tier: 'field', hp: 750, physAtk: 60, magAtk: 25, physDef: 35, magDef: 35, skills: ['幽灵召唤', '骷髅军团', '诅咒凝视'], xp: 150, dropRate: 0.65, lootTable: ['bone', 'scroll', 'sword'] },
      { id: '3_dk_captain', name: '死亡骑士队长', tier: 'area', hp: 1800, physAtk: 95, magAtk: 35, physDef: 65, magDef: 45, skills: ['死亡冲锋', '暗影爆发', '不死复活×1', '骑士冲锋'], xp: 440, dropRate: 0.78, lootTable: ['greatsword', 'ore_dark', 'ore_rare'] },
      { id: '3_lich_king', name: '万古巫妖王·诺法尔', tier: 'zone', hp: 6000, physAtk: 40, magAtk: 160, physDef: 30, magDef: 100, skills: ['死亡领域', '冰霜新星', '亡灵军团', '魂魄风暴', '不死复活×3'], xp: 1500, dropRate: 0.92, lootTable: ['staff', 'scroll', 'ore_dark', 'ore_rare'] },
    ],
  },

  // ══════════════════════════════════════════════════
  // Biome 4 — 晶岩峡谷
  // ══════════════════════════════════════════════════
  4: {
    name: '晶岩峡谷',
    element: 'physical',

    mushrooms: [
      { id: '4_crystal_cap', name: '晶岩菌', type: 'edible', rarity: 'common', hpRestore: 55, effect: null, desc: '晶体碎片围绕，质地特殊' },
      { id: '4_quartz_shroom', name: '石英蘑菇', type: 'edible', rarity: 'common', hpRestore: 70, effect: "physDef_up_12s", desc: '石英质感，强化物防' },
      { id: '4_gem_cap', name: '宝石菇', type: 'edible', rarity: 'uncommon', hpRestore: 110, effect: "armor_buff_20s", desc: '如宝石般坚硬，防御大幅提升' },
      { id: '4_ore_shroom', name: '矿脉菌', type: 'edible', rarity: 'rare', hpRestore: 90, effect: "perm_physDef_8", desc: '矿脉中生长，永久提升物防' },
      { id: '4_sharp_tox', name: '刺锋毒菌', type: 'toxic', rarity: 'common', hpRestore: -55, effect: "bleed_8s", desc: '锋利棱角划破皮肤' },
      { id: '4_dust_shroom', name: '粉尘菌', type: 'toxic', rarity: 'common', hpRestore: -40, effect: "blind_5s", desc: '石粉孢子致盲' },
      { id: '4_iron_cap', name: '铁锈毒菌', type: 'toxic', rarity: 'uncommon', hpRestore: -80, effect: "atk_down_12s", desc: '铁锈气味腐蚀攻击力' },
      { id: '4_cave_coral', name: '洞穴珊瑚菇', type: 'edible', rarity: 'uncommon', hpRestore: 85, effect: "regen_12s", desc: '珊瑚状菌体，持续回血' },
    ],

    plants: [
      { id: '4_crystal_flower', name: '水晶花', type: 'medicine', hpRestore: 0, effect: "shield_50hp", desc: '提供50HP护盾' },
      { id: '4_rock_cactus', name: '岩石仙人掌', type: 'hazard', hpRestore: -20, effect: "poison_5s", desc: '坚硬刺扎入皮肤' },
      { id: '4_iron_weed', name: '铁质杂草', type: 'decorative', hpRestore: 0, effect: "craft_material", desc: '质地坚硬，可作铸造材料' },
      { id: '4_geode_sprout', name: '晶洞嫩苗', type: 'rare', hpRestore: 0, effect: "ore_drop_up_25", desc: '附近矿石掉落率+25%' },
      { id: '4_stone_rose', name: '石化玫瑰', type: 'hazard', hpRestore: -30, effect: "petrify_2s", desc: '触碰后短暂石化' },
      { id: '4_crystal_herb', name: '晶石草', type: 'medicine', hpRestore: 35, effect: "physDef_up_8s", desc: '磨碎可做物防药水' },
      { id: '4_mineral_vine', name: '矿物藤蔓', type: 'hazard', hpRestore: 0, effect: "slow_4s", desc: '坚硬如铁，减速效果强' },
      { id: '4_iron_sprout', name: '铁矿嫩芽', type: 'edible', hpRestore: 25, effect: "physAtk_tiny", desc: '高铁含量，略微提升物攻' },
    ],

    smallMonsters: ['golem', 'crystal_scorpion', 'rock_elemental', 'orc'],

    disguisedMonsters: [
      { id: '4_crystal_mimic2', name: '水晶花伪装精', disguisedAs: '水晶花', hp: 300, physAtk: 15, magAtk: 55, physDef: 25, magDef: 30, special: '水晶爆炸AOE伤害', revealTrigger: 'hit', xp: 65, dropRate: 0.4 },
      { id: '4_rock_slime', name: '岩石堆史莱姆', disguisedAs: '岩石碎堆', hp: 200, physAtk: 30, magAtk: 0, physDef: 35, magDef: 8, special: '分裂成两只小史莱姆', revealTrigger: 'approach', xp: 45, dropRate: 0.35 },
      { id: '4_iron_weed_golem', name: '铁质杂草魔', disguisedAs: '铁质杂草', hp: 280, physAtk: 42, magAtk: 0, physDef: 45, magDef: 10, special: '铁棘刺击+出血4s', revealTrigger: 'approach', xp: 58, dropRate: 0.38 },
      { id: '4_stone_rose_golem', name: '石化玫瑰魔', disguisedAs: '石化玫瑰', hp: 240, physAtk: 35, magAtk: 15, physDef: 32, magDef: 18, special: '石化凝视2s', revealTrigger: 'approach', xp: 52, dropRate: 0.36 },
    ],

    bosses: [
      { id: '4_ore_goliath', name: '矿道巨人', tier: 'field', hp: 900, physAtk: 85, magAtk: 0, physDef: 80, magDef: 20, skills: ['岩石轰击', '矿石护甲', '碎岩波'], xp: 180, dropRate: 0.68, lootTable: ['hammer', 'ore_iron', 'gauntlets'] },
      { id: '4_crystal_king', name: '水晶峡谷王', tier: 'area', hp: 2000, physAtk: 80, magAtk: 60, physDef: 75, magDef: 50, skills: ['水晶风暴', '宝石护盾', '折射光束', '水晶再生'], xp: 480, dropRate: 0.8, lootTable: ['ore_rare', 'crystal_shard', 'ore_iron'] },
      { id: '4_earth_titan', name: '大地泰坦·格鲁姆', tier: 'zone', hp: 5500, physAtk: 140, magAtk: 20, physDef: 120, magDef: 40, skills: ['大地震颤', '陨石坠落', '岩石巨拳', '地裂天崩', '铁甲护盾'], xp: 1300, dropRate: 0.91, lootTable: ['greatsword', 'ore_rare', 'hammer', 'gauntlets'] },
    ],
  },

  // ══════════════════════════════════════════════════
  // Biome 5 — 熔岩矿脉
  // ══════════════════════════════════════════════════
  5: {
    name: '熔岩矿脉',
    element: 'fire',

    mushrooms: [
      { id: '5_fire_cap', name: '火焰菌', type: 'edible', rarity: 'common', hpRestore: 70, effect: "fire_resist_10s", desc: '食后获得短暂火焰抗性' },
      { id: '5_lava_bloom', name: '熔岩绽放菇', type: 'edible', rarity: 'uncommon', hpRestore: 95, effect: "atk_fire_15s", desc: '浸透岩浆，释放火焰攻击加成' },
      { id: '5_ember_shroom', name: '余烬菌', type: 'edible', rarity: 'common', hpRestore: 60, effect: null, desc: '黑炭外皮保护内里菌肉' },
      { id: '5_magma_truffle', name: '岩浆松露', type: 'edible', rarity: 'rare', hpRestore: 200, effect: "perm_fire_atk_10", desc: '岩浆中孕育，永久火焰强化' },
      { id: '5_scorch_tox', name: '焦灼毒菌', type: 'toxic', rarity: 'common', hpRestore: -65, effect: "burn_8s", desc: '灼烧内脏，持续燃烧' },
      { id: '5_smoke_spore', name: '烟雾孢子菌', type: 'toxic', rarity: 'common', hpRestore: -45, effect: "blind_6s", desc: '烟雾弥漫致盲' },
      { id: '5_sulfur_cap', name: '硫磺毒菌', type: 'toxic', rarity: 'uncommon', hpRestore: -90, effect: "poison_12s", desc: '硫磺气体令人窒息' },
      { id: '5_ash_shroom', name: '灰烬蘑菇', type: 'toxic', rarity: 'rare', hpRestore: -150, effect: "burn_20s", desc: '全身灼烧，但火系技能+30%' },
    ],

    plants: [
      { id: '5_fire_fern', name: '火焰蕨', type: 'medicine', hpRestore: 0, effect: "fire_resist_15s", desc: '蕨类结构耐热，提供火焰抗性' },
      { id: '5_lava_lily', name: '熔岩百合', type: 'rare', hpRestore: 0, effect: "perm_fire_dmg_5", desc: '永久火焰伤害+5' },
      { id: '5_ember_grass', name: '余烬草', type: 'hazard', hpRestore: -25, effect: "burn_5s", desc: '踩踏引燃，灼烧' },
      { id: '5_smoke_vine', name: '烟雾藤', type: 'hazard', hpRestore: 0, effect: "blind_5s", desc: '烟雾缭绕致盲' },
      { id: '5_heat_cactus', name: '高温仙人掌', type: 'edible', hpRestore: 20, effect: "heat_resist_10s", desc: '蓄积热量，抵抗高温' },
      { id: '5_obsidian_flower', name: '黑曜石花', type: 'decorative', hpRestore: 0, effect: "ore_fire_reveal", desc: '标记附近火焰矿石位置' },
      { id: '5_magma_creeper', name: '岩浆蔓藤', type: 'hazard', hpRestore: -35, effect: "burn_8s", desc: '接触即燃，持续灼烧' },
      { id: '5_sulfur_bloom', name: '硫磺花', type: 'hazard', hpRestore: -15, effect: "poison_6s", desc: '硫磺气体腐蚀皮肤' },
    ],

    smallMonsters: ['lava_salamander', 'ember_bat', 'fire_elemental', 'orc'],

    disguisedMonsters: [
      { id: '5_lava_lily_trap', name: '熔岩百合陷阱', disguisedAs: '熔岩百合', hp: 260, physAtk: 20, magAtk: 55, physDef: 15, magDef: 35, special: '岩浆喷射范围1格灼烧', revealTrigger: 'approach', xp: 58, dropRate: 0.38 },
      { id: '5_ember_bush', name: '余烬灌木怪', disguisedAs: '炭化灌木', hp: 320, physAtk: 50, magAtk: 0, physDef: 30, magDef: 10, special: '燃烧攻击+点火debuff', revealTrigger: 'approach', xp: 62, dropRate: 0.38 },
      { id: '5_sulfur_bloom_mo', name: '硫磺花魔', disguisedAs: '硫磺花', hp: 180, physAtk: 10, magAtk: 45, physDef: 10, magDef: 28, special: '毒气云AOE范围2格', revealTrigger: 'hit', xp: 45, dropRate: 0.34 },
      { id: '5_obsidian_mimic', name: '黑曜石花拟态', disguisedAs: '黑曜石花', hp: 400, physAtk: 60, magAtk: 0, physDef: 60, magDef: 15, special: '外壳最硬，物攻时反弹20%', revealTrigger: 'hit', xp: 75, dropRate: 0.44 },
    ],

    bosses: [
      { id: '5_lava_golem_l', name: '熔岩守卫', tier: 'field', hp: 950, physAtk: 80, magAtk: 40, physDef: 60, magDef: 25, skills: ['熔岩掌击', '火焰护甲', '熔岩溅射'], xp: 190, dropRate: 0.7, lootTable: ['fire_core', 'ore_fire', 'hammer'] },
      { id: '5_magma_dragon', name: '岩浆幼龙', tier: 'area', hp: 2200, physAtk: 95, magAtk: 80, physDef: 65, magDef: 45, skills: ['火焰喷吐', '岩浆冲击', '熔岩护盾', '龙息'], xp: 520, dropRate: 0.8, lootTable: ['dragon_scale', 'fire_core', 'ore_rare'] },
      { id: '5_volcano_lord', name: '火山领主·伊格尼斯', tier: 'zone', hp: 5800, physAtk: 120, magAtk: 150, physDef: 80, magDef: 65, skills: ['火山爆发', '岩浆洪流', '烈焰领域', '焚世之炎', '不灭火心'], xp: 1400, dropRate: 0.93, lootTable: ['greatsword', 'fire_core', 'ore_rare', 'orb'] },
    ],
  },

  // ══════════════════════════════════════════════════
  // Biome 6 — 腐化沼泽
  // ══════════════════════════════════════════════════
  6: {
    name: '腐化沼泽',
    element: 'poison',

    mushrooms: [
      { id: '6_bog_cap', name: '沼泽帽菌', type: 'edible', rarity: 'common', hpRestore: 55, effect: null, desc: '沼泽水汽滋润，略带泥土香' },
      { id: '6_toad_stool', name: '毒蟾菌', type: 'edible', rarity: 'common', hpRestore: 70, effect: "poison_resist_10s", desc: '蟾蜍常食，获得毒素抵抗' },
      { id: '6_swamp_truffle', name: '泥沼松露', type: 'edible', rarity: 'uncommon', hpRestore: 90, effect: "move_in_swamp", desc: '沼泽中移速不再降低' },
      { id: '6_lily_shroom', name: '莲花菌', type: 'edible', rarity: 'rare', hpRestore: 160, effect: "perm_poison_resist", desc: '永久提升毒素抵抗力' },
      { id: '6_decay_cap', name: '腐烂毒菌', type: 'toxic', rarity: 'common', hpRestore: -55, effect: "poison_10s", desc: '腐败气息，强烈毒素' },
      { id: '6_mold_bloom', name: '霉菌花', type: 'toxic', rarity: 'common', hpRestore: -70, effect: "disease_8s", desc: '霉菌孢子引发疾病' },
      { id: '6_leech_shroom', name: '水蛭菌', type: 'toxic', rarity: 'uncommon', hpRestore: -80, effect: "lifeSteal_rev_5s", desc: '食者被持续吸血' },
      { id: '6_swamp_death', name: '沼泽死亡菌', type: 'toxic', rarity: 'rare', hpRestore: -130, effect: "poison_20s", desc: '沼泽最毒，20秒剧毒' },
    ],

    plants: [
      { id: '6_swamp_lotus', name: '沼泽莲花', type: 'medicine', hpRestore: 50, effect: "poison_cure", desc: '沼泽解毒圣药' },
      { id: '6_bog_reed', name: '沼泽芦苇', type: 'decorative', hpRestore: 0, effect: "swamp_nav", desc: '指示安全通道' },
      { id: '6_toad_lily', name: '蟾蜍百合', type: 'edible', hpRestore: 35, effect: "poison_resist_8s", desc: '短暂毒素抵抗' },
      { id: '6_mire_vine', name: '泥沼藤', type: 'hazard', hpRestore: 0, effect: "sink_3s", desc: '踩上如陷流沙' },
      { id: '6_algae_bloom', name: '水藻丛生', type: 'hazard', hpRestore: -10, effect: "slow_5s", desc: '黏滑减速' },
      { id: '6_poison_lily', name: '毒百合', type: 'hazard', hpRestore: -25, effect: "poison_8s", desc: '接触剧毒' },
      { id: '6_swamp_herb', name: '沼泽草药', type: 'medicine', hpRestore: 0, effect: "disease_cure", desc: '治愈疾病状态' },
      { id: '6_muddy_sprout', name: '泥泞嫩芽', type: 'edible', hpRestore: 15, effect: null, desc: '泥土味重但可果腹' },
    ],

    smallMonsters: ['swamp_crawler', 'toxic_frog', 'bog_wraith', 'vine_monster'],

    disguisedMonsters: [
      { id: '6_swamp_lotus_trap', name: '沼泽莲陷阱', disguisedAs: '沼泽莲花', hp: 200, physAtk: 12, magAtk: 40, physDef: 8, magDef: 25, special: '毒液喷射+减速5s', revealTrigger: 'approach', xp: 48, dropRate: 0.34 },
      { id: '6_bog_reed_eel', name: '芦苇水蛭', disguisedAs: '沼泽芦苇', hp: 160, physAtk: 25, magAtk: 8, physDef: 12, magDef: 10, special: '吸血5s回复自身HP', revealTrigger: 'approach', xp: 38, dropRate: 0.3 },
      { id: '6_algae_monster', name: '水藻怪', disguisedAs: '水藻丛生', hp: 220, physAtk: 18, magAtk: 30, physDef: 10, magDef: 20, special: '缠绕3s+持续中毒', revealTrigger: 'approach', xp: 52, dropRate: 0.36 },
      { id: '6_mire_vine_beast', name: '泥沼藤兽', disguisedAs: '泥沼藤', hp: 300, physAtk: 35, magAtk: 5, physDef: 25, magDef: 12, special: '深陷流沙4s无法移动', revealTrigger: 'approach', xp: 65, dropRate: 0.4 },
    ],

    bosses: [
      { id: '6_swamp_hydra', name: '沼泽九头水蛇', tier: 'field', hp: 850, physAtk: 70, magAtk: 30, physDef: 35, magDef: 25, skills: ['九头噬咬', '毒液溅射', '断头再生'], xp: 170, dropRate: 0.67, lootTable: ['spear', 'poison_gland', 'ore_common'] },
      { id: '6_bog_kraken', name: '沼泽克拉肯', tier: 'area', hp: 2000, physAtk: 85, magAtk: 50, physDef: 50, magDef: 35, skills: ['触手环绕', '深陷流沙', '毒液喷射', '黑暗之吸'], xp: 480, dropRate: 0.78, lootTable: ['ore_rare', 'vine', 'spear'] },
      { id: '6_swamp_witch', name: '腐化沼泽女巫·毒茹', tier: 'zone', hp: 4500, physAtk: 25, magAtk: 140, physDef: 25, magDef: 80, skills: ['瘟疫蔓延', '毒雾领域', '腐化召唤', '沼泽大召唤', '不死毒体'], xp: 1100, dropRate: 0.9, lootTable: ['staff', 'scroll', 'poison_gland', 'ore_rare'] },
    ],
  }
};
