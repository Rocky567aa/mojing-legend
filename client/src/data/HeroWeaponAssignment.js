/**
 * HeroWeaponAssignment.js — 英雄武器配置
 *
 * 三个维度：
 *   startingWeapon   — 初始携带武器（开局直接可用）
 *   weaponAffinity   — 偏好武器类型（持有时触发专属加成）
 *   legendaryWeapon  — 英雄专属传说神兵（游戏内最强稀有来源）
 *
 * 传说武器属性说明：
 *   rarity: 'legendary' 对应稀有度系统六阶最高阶（×100倍加成）
 *   passiveEffect: 被动效果，装备后持续生效
 *   activeEffect:  主动特效，每次攻击有概率触发
 *
 * 引用武器类型 ID 与 WeaponData.js / WeaponData_Ext.js 保持一致：
 *   sword · staff · axe · bow · dagger · hammer · spear · scythe
 *   gauntlets · greatsword · whip · crossbow · throwknife · orb · musket · scroll
 */

// ────────────────────────────────────────────────────────────────────
//  工具：从 WeaponData 中查找适合该类型 + 稀有度的武器
//  实际运行时由 ItemSystem.js 调用；这里只做静态定义
// ────────────────────────────────────────────────────────────────────

export const HERO_WEAPON_CONFIG = {

  // ══════════════════════════════════════════════
  //  原版 8 英雄
  // ══════════════════════════════════════════════

  /** 卡恩 · 战士 */
  kane: {
    startingWeapon: {
      type: 'sword',
      name: '铁制长剑',
      rarity: 'common',   // 绿色
      atk: 28,
      desc: '标准军团制式长剑，结实耐用',
    },
    weaponAffinity: ['sword', 'greatsword', 'spear'],
    affinityBonus: { physAtk: 0.15, crit: 0.03 },
    legendaryWeapon: {
      name: '裂天斩',
      type: 'greatsword',
      rarity: 'legendary',   // 彩虹
      atk: 2800,
      passiveEffect: '每次普攻对目标附近2格内所有敌人造成40%溅射伤害',
      activeEffect:  '攻击时12%概率「天裂之斩」——垂直劈下造成×4.5伤害并击退4格',
      flavorText: '"这把剑劈开了山，也劈开了他自己的极限。"',
    },
  },

  /** 薇拉 · 刺客 */
  vera: {
    startingWeapon: {
      type: 'dagger',
      name: '暗影匕首',
      rarity: 'uncommon',   // 蓝色
      atk: 22,
      desc: '轻薄锋利，适合背刺瞬杀',
    },
    weaponAffinity: ['dagger', 'throwknife', 'whip'],
    affinityBonus: { crit: 0.10, critDmg: 0.30 },
    legendaryWeapon: {
      name: '虚影双刃',
      type: 'dagger',
      rarity: 'legendary',
      atk: 1800,
      passiveEffect: '暴击时留下「毒影」——目标持续受毒伤(physAtk×0.2/s)，持续8秒',
      activeEffect:  '攻击时18%概率「分身突刺」——同时攻击目标前后两格，各自独立暴击',
      flavorText: '"你以为看见了我，其实你看见的只是我想让你看见的。"',
    },
  },

  /** 奥伦 · 法师 */
  oren: {
    startingWeapon: {
      type: 'staff',
      name: '学徒法杖',
      rarity: 'common',
      atk: 20,
      desc: '初级魔法导体，大学堂标配',
    },
    weaponAffinity: ['staff', 'orb', 'scroll'],
    affinityBonus: { magAtk: 0.18, crit: 0.05 },
    legendaryWeapon: {
      name: '星陨法杖',
      type: 'staff',
      rarity: 'legendary',
      atk: 2600,
      passiveEffect: '所有法术伤害额外穿透目标 30% 魔防；魔法暴击率+15%',
      activeEffect:  '攻击时10%概率「陨星落」——召唤3颗陨石连续砸击，各自独立暴击',
      flavorText: '"他研究了一生的星象，最终发现宇宙本身就是武器。"',
    },
  },

  /** 莉娜 · 牧师 */
  lena: {
    startingWeapon: {
      type: 'scroll',
      name: '圣光卷轴',
      rarity: 'uncommon',
      atk: 18,
      desc: '内含基础治愈咒文，攻守两用',
    },
    weaponAffinity: ['scroll', 'staff', 'orb'],
    affinityBonus: { magAtk: 0.12, healingSkill: 0.20 },
    legendaryWeapon: {
      name: '神谕圣典',
      type: 'scroll',
      rarity: 'legendary',
      atk: 1500,
      passiveEffect: '每次治疗技能额外为目标回复释放量的 25% 护盾（持续5秒）',
      activeEffect:  '攻击时15%概率「神圣审判」——对不死系造成×5真实伤害；对友方则施加5秒无敌护盾',
      flavorText: '"这本书的每一页都是一个奇迹，每一个字都是神的呼吸。"',
    },
  },

  /** 艾拉 · 德鲁伊 */
  ella: {
    startingWeapon: {
      type: 'staff',
      name: '天然藤杖',
      rarity: 'common',
      atk: 24,
      desc: '由老树根自然弯曲而成，蕴含自然之力',
    },
    weaponAffinity: ['staff', 'spear', 'orb'],
    affinityBonus: { magAtk: 0.10, physAtk: 0.08, poisonAtk: 0.15 },
    legendaryWeapon: {
      name: '世界树之枝',
      type: 'staff',
      rarity: 'legendary',
      atk: 2100,
      passiveEffect: '所有攻击附带「自然毒」效果（目标受毒伤5s）；草地上移速+20%',
      activeEffect:  '攻击时14%概率「根须缠绕」——从地面伸出藤蔓缚住3格内所有敌人3秒并造成持续伤害',
      flavorText: '"她折下这根枝条时，世界树叹了口气，但随即又长出了新的。"',
    },
  },

  /** 雷格 · 骑士 */
  reg: {
    startingWeapon: {
      type: 'sword',
      name: '骑士团佩剑',
      rarity: 'uncommon',
      atk: 32,
      desc: '精钢铸造，骑士团标配，攻守兼备',
    },
    weaponAffinity: ['sword', 'hammer', 'spear'],
    affinityBonus: { physDef: 0.15, physAtk: 0.08 },
    legendaryWeapon: {
      name: '黑铁盾矛',
      type: 'spear',
      rarity: 'legendary',
      atk: 2200,
      passiveEffect: '受到攻击时10%概率自动格挡（伤害归零），格挡后下次攻击伤害×2',
      activeEffect:  '攻击时12%概率「铁壁突刺」——贯穿直线上所有敌人，每穿透一个伤害递增×1.2',
      flavorText: '"一道铁墙，一柄长矛——他既是盾，也是刃。"',
    },
  },

  /** 玛格 · 术士 */
  mag: {
    startingWeapon: {
      type: 'orb',
      name: '黑曜魔晶球',
      rarity: 'uncommon',
      atk: 22,
      desc: '黑暗能量核心，施咒时自动聚焦',
    },
    weaponAffinity: ['orb', 'staff', 'scroll'],
    affinityBonus: { magAtk: 0.15, poisonAtk: 0.12 },
    legendaryWeapon: {
      name: '噬魂黑晶',
      type: 'orb',
      rarity: 'legendary',
      atk: 2400,
      passiveEffect: '每次击杀吸取目标灵魂，永久叠加 +5 magAtk（上限 +500）',
      activeEffect:  '攻击时16%概率「诅咒之眼」——目标进入15秒诅咒状态，受所有伤害+50%',
      flavorText: '"这颗球里住着一千个灵魂，每一个都在哭泣。"',
    },
  },

  /** 托尔 · 游侠 */
  thor: {
    startingWeapon: {
      type: 'bow',
      name: '猎人长弓',
      rarity: 'common',
      atk: 26,
      desc: '手工制作，轻便且射程远',
    },
    weaponAffinity: ['bow', 'crossbow', 'throwknife'],
    affinityBonus: { physAtk: 0.12, crit: 0.08 },
    legendaryWeapon: {
      name: '疾风猎弓',
      type: 'bow',
      rarity: 'legendary',
      atk: 2300,
      passiveEffect: '射程+3格；移动中射击无精度惩罚；箭矢自动追踪目标',
      activeEffect:  '攻击时20%概率「连珠三箭」——连续射出3支箭，每支独立暴击判定',
      flavorText: '"他从未瞄准，却从未射偏——因为风本身就是他的眼睛。"',
    },
  },

  // ══════════════════════════════════════════════
  //  扩展 6 英雄
  // ══════════════════════════════════════════════

  /** 鲁恩 · 炼金术士 */
  runen: {
    startingWeapon: {
      type: 'orb',
      name: '炼金反应炉',
      rarity: 'uncommon',
      atk: 24,
      desc: '小型实验炉，可充当近战武器，也能引爆药剂',
    },
    weaponAffinity: ['orb', 'staff', 'throwknife'],
    affinityBonus: { magAtk: 0.15, alchemyBonus: 0.20 },
    legendaryWeapon: {
      name: '万能炼金炮',
      type: 'orb',
      rarity: 'legendary',
      atk: 2500,
      passiveEffect: '投出的药剂爆炸范围+1格；炼金产出数量×1.5',
      activeEffect:  '攻击时13%概率「哲学家之石」——随机释放火爆/冰冻/毒雾三选一AOE，覆盖3格范围',
      flavorText: '"他说只要材料充足，他能炼出任何东西——包括奇迹。"',
    },
  },

  /** 赛亚 · 元素使 */
  saya: {
    startingWeapon: {
      type: 'staff',
      name: '三元素导杖',
      rarity: 'uncommon',
      atk: 22,
      desc: '内嵌三色魔石，自动切换元素共鸣',
    },
    weaponAffinity: ['staff', 'orb'],
    affinityBonus: { magAtk: 0.20, crit: 0.06 },
    legendaryWeapon: {
      name: '混沌元素核',
      type: 'orb',
      rarity: 'legendary',
      atk: 2700,
      passiveEffect: '三元素叠层满时自动触发「元素共鸣爆发」（伤害×3，冷却10秒）',
      activeEffect:  '攻击时15%概率「元素洪流」——同时释放火/冰/雷三种元素攻击目标',
      flavorText: '"世界由元素构成，她是那个能同时与三者对话的人。"',
    },
  },

  /** 罗尔 · 圣骑士 */
  roal: {
    startingWeapon: {
      type: 'hammer',
      name: '圣战战锤',
      rarity: 'uncommon',
      atk: 36,
      desc: '神殿铸造，镌刻圣纹，击打时释放光焰',
    },
    weaponAffinity: ['hammer', 'sword', 'greatsword'],
    affinityBonus: { physAtk: 0.12, physDef: 0.10, healingSkill: 0.10 },
    legendaryWeapon: {
      name: '正义天罚锤',
      type: 'hammer',
      rarity: 'legendary',
      atk: 2600,
      passiveEffect: '对不死系/黑暗系目标伤害×2；每次攻击为自身回复 30 HP',
      activeEffect:  '攻击时11%概率「天罚下凡」——圣光从天而降砸击目标，范围AOE + 3秒晕眩',
      flavorText: '"不是他在挥动这把锤，是正义本身选择了他的手。"',
    },
  },

  /** 奈拉 · 召唤师 */
  naira: {
    startingWeapon: {
      type: 'scroll',
      name: '基础召唤卷轴',
      rarity: 'common',
      atk: 15,
      desc: '内含最基础的生灵召唤术，可唤出小狼灵',
    },
    weaponAffinity: ['scroll', 'staff', 'orb'],
    affinityBonus: { magAtk: 0.10, summonHpBonus: 0.25 },
    legendaryWeapon: {
      name: '太古契约书',
      type: 'scroll',
      rarity: 'legendary',
      atk: 1600,
      passiveEffect: '召唤生物上限+2（最高7只）；所有召唤物攻击力+40%、血量+50%',
      activeEffect:  '攻击时12%概率「万兽共鸣」——所有召唤物同时发动一次全力攻击',
      flavorText: '"这本合同的另一方签字方是整个野生界。"',
    },
  },

  /** 达克 · 死灵法师 */
  dak: {
    startingWeapon: {
      type: 'scythe',
      name: '腐朽镰刀',
      rarity: 'uncommon',
      atk: 30,
      desc: '由墓地老铁锻造，每次挥动都带着腐气',
    },
    weaponAffinity: ['scythe', 'staff', 'scroll'],
    affinityBonus: { magAtk: 0.15, poisonAtk: 0.15, lifeSteal: 0.10 },
    legendaryWeapon: {
      name: '死神之镰',
      type: 'scythe',
      rarity: 'legendary',
      atk: 2900,
      passiveEffect: '每次击杀回复自身最大HP的 8%；击杀目标有 40% 概率变为骷髅盟友',
      activeEffect:  '攻击时14%概率「灵魂收割」——无视目标所有防御，造成目标当前HP 35% 的真实伤害',
      flavorText: '"死亡不是终点，只是换了个主人。"',
    },
  },

  /** 影月 · 武僧 */
  yingyue: {
    startingWeapon: {
      type: 'gauntlets',
      name: '铁拳护手',
      rarity: 'common',
      atk: 20,
      desc: '铸铁护臂，强化每一拳的冲击力',
    },
    weaponAffinity: ['gauntlets', 'dagger'],
    affinityBonus: { physAtk: 0.18, spd: 0.12, crit: 0.05 },
    legendaryWeapon: {
      name: '气破乾坤掌',
      type: 'gauntlets',
      rarity: 'legendary',
      atk: 2400,
      passiveEffect: '连击层数叠加上限提升至15层；第10层以上每次攻击自动暴击',
      activeEffect:  '攻击时17%概率「气爆冲击」——以自身为中心释放气旋，2格内所有敌人被击飞+晕眩2秒',
      flavorText: '"他不需要武器——他的整个身体就是一件传说级武器。"',
    },
  },

  // ══════════════════════════════════════════════
  //  新增 2 英雄
  // ══════════════════════════════════════════════

  /** 莫克 · 狂战士 */
  moke: {
    startingWeapon: {
      type: 'axe',
      name: '战场双斧',
      rarity: 'uncommon',
      atk: 40,
      desc: '一对重斧，普通人双手都拿不稳，他单手一把',
    },
    weaponAffinity: ['axe', 'greatsword', 'hammer'],
    affinityBonus: { physAtk: 0.20, critDmg: 0.25 },
    legendaryWeapon: {
      name: '血咆哮斧王',
      type: 'axe',
      rarity: 'legendary',
      atk: 3000,  // 全英雄最高物攻传说武器
      passiveEffect: 'HP每降低10% → ATK额外+5%（与嗜血狂暴叠加）；受到致命伤时一次免死（60秒CD）',
      activeEffect:  '攻击时20%概率「狂血暴走」——进入5秒无敌状态，攻速×2，所有攻击必定暴击',
      flavorText: '"这把斧头喝过的血比河流里的水还多——它已经记得了血的味道。"',
    },
  },

  /** 艾薇 · 神射手 */
  aiwei: {
    startingWeapon: {
      type: 'bow',
      name: '精灵猎弓',
      rarity: 'uncommon',
      atk: 32,
      desc: '精灵工艺制作，弦声如鹰鸣，射速极快',
    },
    weaponAffinity: ['bow', 'crossbow'],
    affinityBonus: { physAtk: 0.15, crit: 0.10, critDmg: 0.20 },
    legendaryWeapon: {
      name: '穿星神弓·烬羽',
      type: 'bow',
      rarity: 'legendary',
      atk: 2500,
      passiveEffect: '射程+5格（全英雄最远）；猎鹰「烬」攻击冷却−5秒，伤害×2',
      activeEffect:  '攻击时22%概率「天启穿云矢」——一箭穿透地图上所有敌人，每穿透一个伤害+20%',
      flavorText: '"烬看见了，艾薇射出了，远方的敌人倒下了——中间没有任何停顿。"',
    },
  },
}

// ────────────────────────────────────────────────────────────────────
//  工具函数
// ────────────────────────────────────────────────────────────────────

/**
 * 获取英雄的起始武器
 * @param {string} heroId
 * @returns {object} startingWeapon
 */
export function getStartingWeapon(heroId) {
  return HERO_WEAPON_CONFIG[heroId]?.startingWeapon ?? null
}

/**
 * 判断英雄是否对某武器类型有亲和力（持有时触发加成）
 * @param {string} heroId
 * @param {string} weaponType
 * @returns {{ hasAffinity: boolean, bonus: object }}
 */
export function checkWeaponAffinity(heroId, weaponType) {
  const cfg = HERO_WEAPON_CONFIG[heroId]
  if (!cfg) return { hasAffinity: false, bonus: {} }
  const hasAffinity = cfg.weaponAffinity.includes(weaponType)
  return { hasAffinity, bonus: hasAffinity ? cfg.affinityBonus : {} }
}

/**
 * 获取英雄传说武器数据（用于展示 / 掉落系统）
 * @param {string} heroId
 * @returns {object} legendaryWeapon
 */
export function getLegendaryWeapon(heroId) {
  return HERO_WEAPON_CONFIG[heroId]?.legendaryWeapon ?? null
}

/** 汇总所有传说武器（用于图鉴 / UI 展示） */
export function getAllLegendaryWeapons() {
  return Object.entries(HERO_WEAPON_CONFIG).map(([heroId, cfg]) => ({
    heroId,
    ...cfg.legendaryWeapon,
  }))
}
