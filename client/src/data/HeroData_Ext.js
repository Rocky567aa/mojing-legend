/**
 * HeroData_Ext.js — 6 位新英雄数据（职业扩展包）
 *
 * 与原 HeroData.js 中的 8 位英雄并列，共 14 位可选英雄。
 * 每位英雄含：基础属性、成长系数、被动技能、主动技能、偏好武器、群系加成。
 *
 * 职业列表（本文件）：
 *   鲁恩  — 炼金术士 (Alchemist)
 *   赛亚  — 元素使   (Elementalist)
 *   罗尔  — 圣骑士   (Paladin)
 *   奈拉  — 召唤师   (Summoner)
 *   达克  — 死灵法师 (Necromancer)
 *   影月  — 武僧     (Monk)
 */

export const HERO_EXT = [

  // ──────────────────────────────────────────────────────────────────────
  //  鲁恩 · 炼金术士
  // ──────────────────────────────────────────────────────────────────────
  {
    id: 'runen',
    name: '鲁恩',
    class: '炼金术士',
    classEn: 'Alchemist',
    lore: '出身矿山之城的落魄学者，以爆破药剂赚得第一桶金。\n' +
          '背包里永远装着叮叮咚咚的瓶子，手忙脚乱中却从不失误。\n' +
          '"只要配方对，垃圾也能炸出神级伤害！"',
    color: 0xaacc22,
    themeColor: '#99dd00',
    icon: '⚗️',

    // ── 基础属性 ────────────────────────────────────────────────
    baseHp:  900,
    baseAtk: 55,
    baseDef: 20,
    baseSpd: 1.0,
    baseCrit: 0.10,

    // ── 成长系数（每级增量） ─────────────────────────────────────
    hpGrowth:   60,
    atkGrowth:  6.5,
    defGrowth:  1.8,
    critGrowth: 0.003,

    // ── 被动技能 ─────────────────────────────────────────────────
    passive: {
      id: 'alchemy_mastery',
      name: '炼金天赋',
      desc: '炼金/合成道具消耗材料 −20%；魔晶品质产出概率 +1 阶。\n' +
            '另：每消灭 10 只怪物自动合成一瓶随机治疗药剂。',
      trigger: 'craft',
    },

    // ── 主动技能 ─────────────────────────────────────────────────
    active: {
      id: 'blast_flask',
      name: '爆破药剂',
      desc: '向目标位置投掷爆破药剂，命中时造成 (ATK × 2.2) 的火属性范围伤害（半径 2.5 格），' +
            '并对范围内敌人施加 [燃烧] 3 秒。\n' +
            '升级后可切换为：冰冻弹（冰冻 2s）、毒雾弹（中毒 5s）。',
      manaCost: 30,
      cooldown: 6000,
      range: 7,
      aoe: 2.5,
      element: 'fire',
    },

    // ── 偏好武器 ─────────────────────────────────────────────────
    preferredWeapons: ['staff', 'orb', 'throwknife'],
    weaponBonus: { staff: 0.15, orb: 0.20 }, // 使用偏好武器 ATK 加成

    // ── 群系加成 ─────────────────────────────────────────────────
    biomeBonus: {
      5: { atk: 0.20, desc: '熔岩矿脉 — 火元素强化爆破药剂伤害' },
      7: { atk: 0.15, desc: '毒雾沼泽 — 毒性药剂效果时间延长' },
     12: { craft: 0.30, desc: '流星荒野 — 陨石矿加成炼金合成' },
    },
  },

  // ──────────────────────────────────────────────────────────────────────
  //  赛亚 · 元素使
  // ──────────────────────────────────────────────────────────────────────
  {
    id: 'saya',
    name: '赛亚',
    class: '元素使',
    classEn: 'Elementalist',
    lore: '三界元素神殿唯一的女性毕业生，精通火冰雷三元素轮转之道。\n' +
          '看似柔弱，实则每次换手都会引发一次小型自然灾害。\n' +
          '"元素不分强弱，关键在于我的意志。"',
    color: 0x44aaff,
    themeColor: '#22ccff',
    icon: '🌀',

    baseHp:  750,
    baseAtk: 70,
    baseDef: 15,
    baseSpd: 1.05,
    baseCrit: 0.12,

    hpGrowth:   45,
    atkGrowth:  8.5,
    defGrowth:  1.2,
    critGrowth: 0.004,

    passive: {
      id: 'elemental_resonance',
      name: '元素共鸣',
      desc: '连续使用不同元素攻击同一目标，每次切换伤害提升 15%（最多叠 5 层 = +75%）。\n' +
            '三元素轮转一圈后触发"元素爆发"，额外造成 (ATK × 1.5) 全属性伤害并清除所有叠层重新计数。',
      trigger: 'on_hit',
    },

    active: {
      id: 'element_switch',
      name: '元素转换',
      desc: '瞬间切换当前元素（火→冰→雷→火循环）。\n' +
            '火：AOE 爆炸 + 燃烧 | 冰：直线穿刺 + 冻结 | 雷：链式跳跃 3 目标 + 麻痹。\n' +
            '切换时带免伤闪烁 0.3 秒。',
      manaCost: 0,
      cooldown: 1500, // 仅切换无CD消耗
      range: 6,
      aoe: 1.5,
      element: 'cycling',
    },

    preferredWeapons: ['staff', 'orb'],
    weaponBonus: { staff: 0.25, orb: 0.20 },

    biomeBonus: {
      5:  { atk: 0.25, desc: '熔岩矿脉 — 火元素增幅' },
      8:  { atk: 0.20, desc: '极光冻原 — 冰元素增幅' },
      10: { atk: 0.22, desc: '雷霆高地 — 雷元素增幅' },
    },
  },

  // ──────────────────────────────────────────────────────────────────────
  //  罗尔 · 圣骑士
  // ──────────────────────────────────────────────────────────────────────
  {
    id: 'roal',
    name: '罗尔',
    class: '圣骑士',
    classEn: 'Paladin',
    lore: '古老圣光骑士团最后的传承者，以铁甲和信念行走于最黑暗的角落。\n' +
          '从不撤退，也从不独自战斗 — 他的盾牌永远为最需要的人挡在前面。\n' +
          '"只要我还站着，任何人都不会倒下。"',
    color: 0xffee66,
    themeColor: '#ffdd33',
    icon: '🛡️',

    baseHp:  1600,
    baseAtk: 45,
    baseDef: 55,
    baseSpd: 0.88,
    baseCrit: 0.06,

    hpGrowth:   110,
    atkGrowth:  4.5,
    defGrowth:  5.0,
    critGrowth: 0.002,

    passive: {
      id: 'holy_shield',
      name: '圣盾庇护',
      desc: '当 HP > 60% 时，所有来自正面的攻击伤害 −25%。\n' +
            '当 HP < 30% 时，触发"最后圣光"：立即回复 (MaxHP × 15%)，并对周围 2 格敌人造成圣光晕眩 1.5s。\n' +
            '每 60 秒只可触发一次"最后圣光"。',
      trigger: 'on_damage',
    },

    active: {
      id: 'divine_aura',
      name: '神圣光环',
      desc: '激活圣光光环 8 秒：每秒为自身回复 (MaxHP × 2%)；\n' +
            '范围 3 格内所有不死系怪物受到额外 +50% 圣光伤害；\n' +
            '光环期间所有攻击附带 [圣光灼烧] 3s。',
      manaCost: 40,
      cooldown: 18000,
      range: 0,
      aoe: 3,
      element: 'holy',
    },

    preferredWeapons: ['sword', 'hammer', 'greatsword'],
    weaponBonus: { sword: 0.12, hammer: 0.18, greatsword: 0.15 },

    biomeBonus: {
      0:  { def: 0.20, desc: '翠绿草原 — 圣光强化基础防御' },
      15: { atk: 0.30, desc: '亡灵荒地 — 对不死系额外圣光增伤' },
      9:  { def: 0.15, desc: '暗影密林 — 黑暗环境激发圣光抗性' },
    },
  },

  // ──────────────────────────────────────────────────────────────────────
  //  奈拉 · 召唤师
  // ──────────────────────────────────────────────────────────────────────
  {
    id: 'naira',
    name: '奈拉',
    class: '召唤师',
    classEn: 'Summoner',
    lore: '与无数灵魂签订契约的神秘少女，从不孤身作战。\n' +
          '身边总是跟着各种形态的精灵，最多时同时有七只相伴。\n' +
          '"它们是我的伙伴，不是工具——你们侮辱它们，就是侮辱我。"',
    color: 0xcc66ff,
    themeColor: '#bb44ee',
    icon: '✨',

    baseHp:  800,
    baseAtk: 40,
    baseDef: 22,
    baseSpd: 1.02,
    baseCrit: 0.10,

    hpGrowth:   50,
    atkGrowth:  4.0,
    defGrowth:  2.0,
    critGrowth: 0.003,

    passive: {
      id: 'soul_pact',
      name: '灵魂契约',
      desc: '召唤物 HP +30%，攻击力 +20%。\n' +
            '同时存在 3 只召唤物时，触发"群灵共鸣"：所有召唤物攻击速度 +40%，且攻击带溅射伤害。\n' +
            '召唤物死亡时，奈拉获得 5 秒 +15% 攻击速度的"哀嚎之怒"。',
      trigger: 'always',
    },

    active: {
      id: 'summon_familiar',
      name: '召唤魔宠',
      desc: '根据当前群系召唤对应魔宠（最多同时 3 只）。\n' +
            '草原→月狼 | 熔岩→岩火龟 | 冻原→极地熊灵 | 沼泽→毒藤触手 |\n' +
            '暗影→影猫刺客 | 虚空→虚空碎片守卫 | 其他→随机精灵。\n' +
            '召唤物持续 30 秒，死亡或到时后消散。',
      manaCost: 50,
      cooldown: 12000,
      range: 2,
      aoe: 0,
      element: 'summon',
    },

    preferredWeapons: ['scroll', 'staff', 'orb'],
    weaponBonus: { scroll: 0.30, staff: 0.10 },

    biomeBonus: {
      6:  { summonHp: 0.25, desc: '腐化沼泽 — 毒系召唤物强化' },
      11: { summonAtk: 0.30, desc: '幽灵废墟 — 灵魂系召唤物增幅' },
      18: { summonCount: 1, desc: '虚空裂缝 — 召唤上限 +1（最多 4 只）' },
    },
  },

  // ──────────────────────────────────────────────────────────────────────
  //  达克 · 死灵法师
  // ──────────────────────────────────────────────────────────────────────
  {
    id: 'dak',
    name: '达克',
    class: '死灵法师',
    classEn: 'Necromancer',
    lore: '在禁忌古卷中寻找生死秘密的孤独学者，死亡对他来说不过是"换一种形式存在"。\n' +
          '他麾下的骷髅军团是他最忠实的朋友——因为死者不会背叛。\n' +
          '"死亡不是终点，是开始。你会明白的……很快。"',
    color: 0x8833cc,
    themeColor: '#772299',
    icon: '💀',

    baseHp:  1000,
    baseAtk: 65,
    baseDef: 18,
    baseSpd: 0.95,
    baseCrit: 0.11,

    hpGrowth:   65,
    atkGrowth:  7.5,
    defGrowth:  1.5,
    critGrowth: 0.004,

    passive: {
      id: 'undead_affinity',
      name: '死灵亲和',
      desc: '击杀怪物时，有 35% 概率令其以骷髅形态复活为盟友（持续 20 秒）。\n' +
            '控制骷髅上限 = (等级 ÷ 5) 只，超出时最旧的消散。\n' +
            '达克本体处于骷髅围绕时，受到伤害 −10%（每只 −2%，最多 5 只）。',
      trigger: 'on_kill',
    },

    active: {
      id: 'life_drain',
      name: '生命吸取',
      desc: '向目标发射暗影触手，2 秒内持续抽取 (ATK × 0.8/s) 的伤害，\n' +
            '吸取量的 60% 转化为达克的 HP 回复。\n' +
            '同时影响范围 1 格内的所有敌人，每个额外目标减少 20% 效果（最多 5 目标）。',
      manaCost: 35,
      cooldown: 10000,
      range: 5,
      aoe: 1,
      element: 'dark',
    },

    preferredWeapons: ['staff', 'scythe', 'scroll'],
    weaponBonus: { scythe: 0.25, staff: 0.15, scroll: 0.20 },

    biomeBonus: {
     11: { atk: 0.30, desc: '幽灵废墟 — 暗影能量增幅生命吸取' },
     15: { reanimateChance: 0.20, desc: '亡灵荒地 — 复活概率额外 +20%' },
      6: { atk: 0.18, desc: '腐化沼泽 — 腐朽之气强化诅咒伤害' },
    },
  },

  // ──────────────────────────────────────────────────────────────────────
  //  影月 · 武僧
  // ──────────────────────────────────────────────────────────────────────
  {
    id: 'yingyue',
    name: '影月',
    class: '武僧',
    classEn: 'Monk',
    lore: '绝顶山寺的最后一位武僧，以肉身锤炼超越法器极限的战斗力。\n' +
          '行动快到连影子都跟不上，每次出拳都能穿透空间留下残影。\n' +
          '"拳头比任何武器都诚实——你看到它击中你的时候，已经被打中三次了。"',
    color: 0xffaa00,
    themeColor: '#ff9900',
    icon: '👊',

    baseHp:  1100,
    baseAtk: 50,
    baseDef: 28,
    baseSpd: 1.4,   // 最快英雄
    baseCrit: 0.18,

    hpGrowth:   70,
    atkGrowth:  5.5,
    defGrowth:  2.5,
    critGrowth: 0.006, // 暴击成长最高

    passive: {
      id: 'chi_cultivation',
      name: '气功修炼',
      desc: '每次连续命中同一目标，攻击力提升 6%（最多叠 10 层 = +60%）。\n' +
            '叠满 10 层时，下一次普通攻击自动触发"气旋爆击"：\n' +
            '造成 (ATK × 3.5) 单体伤害 + 周围 1 格溅射，并重置叠层。\n' +
            '切换目标时叠层归零。',
      trigger: 'on_hit',
    },

    active: {
      id: 'chi_blast',
      name: '气爆掌',
      desc: '蓄力 0.5 秒后爆发当前所有气功叠层：\n' +
            '基础伤害 (ATK × 2.0) + (每层气功 × ATK × 0.4)，最大 (ATK × 6.0)。\n' +
            '爆发方向形成 3 格锥形气浪，命中敌人击飞并眩晕 1s。\n' +
            '蓄力期间速度 −30%，爆发后 1 秒速度 +50%。',
      manaCost: 20,
      cooldown: 8000,
      range: 3,
      aoe: 1,
      element: 'chi',
    },

    preferredWeapons: ['gauntlets', 'dagger', 'whip'],
    weaponBonus: { gauntlets: 0.30, dagger: 0.15 },

    biomeBonus: {
      0:  { spd: 0.10, desc: '翠绿草原 — 开阔地形加速身法' },
     13: { crit: 0.08, desc: '星空秘境 — 星力加持气功暴击率' },
      4: { atk: 0.15, desc: '晶岩峡谷 — 岩石反弹强化拳劲' },
    },
  },
]

/** 按 id 获取新英雄 */
export function getHeroExt(id) {
  return HERO_EXT.find(h => h.id === id) ?? null
}

/** 获取所有英雄（含原始 8 位）的混合列表入口 */
export function getAllHeroIds() {
  const orig = ['kain','vira','oren','lina','ella','reg','mag','tor']
  const ext  = HERO_EXT.map(h => h.id)
  return [...orig, ...ext]
}
