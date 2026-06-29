/**
 * HeroData.js — 全 16 英雄共用数据（M11 合并版）
 *
 * 同时服务于：
 *   ProfessionSelectScene — 职业选择卡片
 *   CombatSystem          — 战斗属性初始化
 *   WeaponSystem          — 武器亲和判断
 *
 * 所有 16 英雄已归一化为相同结构，扩展英雄 (HeroData_Ext / HeroData_Warriors)
 * 保留原始数据不变；此处只做规范化映射，不需要在场景层做任何判断。
 */

export const HERO_DATA = {

  // ══════════════════════════════════════════════════════════════════════
  //  原版 8 英雄
  // ══════════════════════════════════════════════════════════════════════

  kane: {
    id: 'kane', name: '铁壁战士·卡恩',
    icon: '🛡️', color: 0xff5500, element: '🔥 火焰晶',
    passive: '最大HP +50%，受到伤害 -20%',
    desc: '坚不可摧的前锋，新手首选',
    difficulty: '★★', beginnerFriendly: true,
    stats: { hp: 220, atk: 18, crit: 0.05, critMul: 1.8, moveInterval: 155 },
  },
  vera: {
    id: 'vera', name: '暗影刺客·薇拉',
    icon: '🗡️', color: 0xffdd00, element: '⚡ 雷电晶',
    passive: '暴击率 +25%，暴击伤害 ×2.5',
    desc: '极速单体爆发，玻璃炮',
    difficulty: '★★★★★', beginnerFriendly: false,
    stats: { hp: 100, atk: 30, crit: 0.32, critMul: 2.5, moveInterval: 120 },
  },
  oren: {
    id: 'oren', name: '星界法师·奥伦',
    icon: '🌟', color: 0x44aaff, element: '❄️ 冰霜晶',
    passive: '冰霜矿采集 ×1.5，攻击可冰冻',
    desc: '范围冰冻输出，需要走位',
    difficulty: '★★★★', beginnerFriendly: false,
    stats: { hp: 120, atk: 34, crit: 0.12, critMul: 2.0, moveInterval: 165 },
  },
  lena: {
    id: 'lena', name: '圣光祭司·莉娜',
    icon: '✨', color: 0xffee88, element: '✨ 神圣晶',
    passive: '每10s回复15HP，副作用 -30%',
    desc: '持久作战，最佳续航',
    difficulty: '★★', beginnerFriendly: true,
    stats: { hp: 170, atk: 15, crit: 0.08, critMul: 1.8, moveInterval: 160 },
  },
  ella: {
    id: 'ella', name: '自然德鲁伊·艾拉',
    icon: '🌿', color: 0x44ff88, element: '🌿 自然晶',
    passive: '植物资源 ×2，食物回血 +50%',
    desc: '资源采集专精，生态亲和',
    difficulty: '★★★', beginnerFriendly: false,
    stats: { hp: 145, atk: 20, crit: 0.10, critMul: 2.0, moveInterval: 155 },
  },
  reg: {
    id: 'reg', name: '龙裔骑士·雷格',
    icon: '🐉', color: 0xff8800, element: '🔥 火焰晶',
    passive: '移速 +15%，攻击附带燃烧',
    desc: '攻守均衡，可解锁坐骑',
    difficulty: '★★★', beginnerFriendly: false,
    stats: { hp: 175, atk: 22, crit: 0.10, critMul: 2.0, moveInterval: 140 },
  },
  mag: {
    id: 'mag', name: '幽冥术士·玛格',
    icon: '💀', color: 0x9900cc, element: '🌑 暗影晶',
    passive: '提纯耗时 -40%，诅咒伤害 ×1.8',
    desc: '战略控场，生产链最快',
    difficulty: '★★★★', beginnerFriendly: false,
    stats: { hp: 115, atk: 28, crit: 0.16, critMul: 2.2, moveInterval: 165 },
  },
  thor: {
    id: 'thor', name: '雷霆游侠·托尔',
    icon: '⚡', color: 0x88ddff, element: '⚡ 雷电晶',
    passive: '攻击范围 +2格，雷电矿 +20%',
    desc: '远程精准输出，保持距离',
    difficulty: '★★★', beginnerFriendly: false,
    stats: { hp: 135, atk: 25, crit: 0.15, critMul: 2.0, moveInterval: 145 },
  },

  // ══════════════════════════════════════════════════════════════════════
  //  扩展 6 英雄（来自 HeroData_Ext.js，规范化格式）
  // ══════════════════════════════════════════════════════════════════════

  runen: {
    id: 'runen', name: '鲁恩·炼金术士',
    icon: '⚗️', color: 0xaacc22, element: '⚗️ 炼金晶',
    passive: '炼金天赋：材料-20%，品质+1阶，每10杀自动合成药剂',
    desc: '炼金生产专精，爆瓶流输出',
    difficulty: '★★★', beginnerFriendly: false,
    stats: { hp: 900, atk: 55, crit: 0.10, critMul: 2.0, moveInterval: 155 },
  },
  saya: {
    id: 'saya', name: '赛亚·元素使',
    icon: '🌀', color: 0x44aaff, element: '🌀 元素晶',
    passive: '元素共鸣：切换元素攻击同一目标最多叠 5 层+75%伤害',
    desc: '三元素轮转，最高爆发潜力',
    difficulty: '★★★★★', beginnerFriendly: false,
    stats: { hp: 750, atk: 70, crit: 0.12, critMul: 2.0, moveInterval: 148 },
  },
  roal: {
    id: 'roal', name: '罗尔·圣骑士',
    icon: '🛡️', color: 0xffee66, element: '✨ 神圣晶',
    passive: '圣盾庇护：HP>60% 正面伤害-25%，高HP下无敌感',
    desc: '最强防御，队伍盾墙首选',
    difficulty: '★★', beginnerFriendly: true,
    stats: { hp: 1600, atk: 45, crit: 0.06, critMul: 1.9, moveInterval: 176 },
  },
  naira: {
    id: 'naira', name: '奈拉·召唤师',
    icon: '✨', color: 0xcc66ff, element: '👁 召唤晶',
    passive: '灵魂契约：召唤物HP+30%/ATK+20%，精灵最多7只',
    desc: '战场控制，从不孤身作战',
    difficulty: '★★★★', beginnerFriendly: false,
    stats: { hp: 800, atk: 40, crit: 0.10, critMul: 2.0, moveInterval: 152 },
  },
  dak: {
    id: 'dak', name: '达克·死灵法师',
    icon: '💀', color: 0x8833cc, element: '💀 死灵晶',
    passive: '死灵亲和：击杀35%概率召唤骷髅盟友（持续20s）',
    desc: '亡灵军团战法，越战越强',
    difficulty: '★★★★', beginnerFriendly: false,
    stats: { hp: 1000, atk: 65, crit: 0.11, critMul: 2.1, moveInterval: 163 },
  },
  yingyue: {
    id: 'yingyue', name: '影月·武僧',
    icon: '👊', color: 0xffaa00, element: '🌙 武道晶',
    passive: '气功修炼：连续命中叠最多10层×+60%攻击力',
    desc: '极速连击，赤手制霸近战',
    difficulty: '★★★★', beginnerFriendly: false,
    stats: { hp: 1100, atk: 50, crit: 0.18, critMul: 2.3, moveInterval: 111 },
  },

  // ══════════════════════════════════════════════════════════════════════
  //  战士扩展 2 英雄（来自 HeroData_Warriors.js，规范化格式）
  // ══════════════════════════════════════════════════════════════════════

  moke: {
    id: 'moke', name: '莫克·狂战士',
    icon: '🪓', color: 0xdd2200, element: '🔥 烈焰晶',
    passive: '嗜血狂暴：HP越低攻击力越高，最多+80%；击杀回5% HP',
    desc: '越打越强，北境蛮荒生存者',
    difficulty: '★★★★', beginnerFriendly: false,
    stats: { hp: 1800, atk: 75, crit: 0.14, critMul: 2.2, moveInterval: 168 },
  },
  aiwei: {
    id: 'aiwei', name: '艾薇·神射手',
    icon: '🏹', color: 0x44bb66, element: '🏹 猎鹰晶',
    passive: '猎鹰标记：攻击过的目标被标记5s，期间暴击率+25%',
    desc: '远程精准输出，鹰眼穿甲',
    difficulty: '★★★', beginnerFriendly: false,
    stats: { hp: 820, atk: 68, crit: 0.22, critMul: 2.4, moveInterval: 124 },
  },
}

/** 全 16 英雄列表（ProfessionSelectScene 直接使用） */
export const PROFESSIONS = Object.values(HERO_DATA)
