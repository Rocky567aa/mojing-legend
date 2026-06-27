/**
 * WeaponData_Ext.js — 扩展武器数据库（新增10类武器）
 *
 * 近战新增 (5类):
 *   长枪 Spear     — 远程近战，突刺穿透
 *   大镰刀 Scythe  — 大范围横扫，收割特效
 *   拳套 Gauntlets — 极速连击，吸血
 *   巨剑 Greatsword— 超高单体，大AOE
 *   鞭 Whip        — 灵活射程，可拉近敌人
 *
 * 远程新增 (5类):
 *   弩机 Crossbow       — 低速高伤，穿甲
 *   投掷飞刀 ThrowKnife — 多刀扇形投掷
 *   魔晶球 CrystalOrb   — 弹跳魔法弹
 *   火铳 Musket         — 超长射程，贯穿
 *   召唤卷轴 Scroll     — 召唤灵体助战
 */

import { RARITY } from './WeaponData.js'

export const WEAPONS_EXT = [

  // ══════════════════════════════════════════════════════════
  // 近战新增 MELEE ADDITIONS
  // ══════════════════════════════════════════════════════════

  // ── 长枪 Spear ─────────────────────────────────────────────────────────
  {
    id: 'spear_green',
    name: '木杆铁尖枪',
    desc: '农夫的自制长枪，枪尖已锈，但刺出的距离让敌人难以近身。',
    type: 'weapon', category: 'spear', rarity: 'green',
    atk: 9, spd: 0.9, crit: 0.06, range: 2.5, aoe: 0,
    effect: null,
    color: 0x998866, icon: '🗡️',
  },
  {
    id: 'spear_blue',
    name: '猎龙银枪',
    desc: '银色枪头锻造精良，突刺时穿透第一个目标直击后排。',
    type: 'weapon', category: 'spear', rarity: 'blue',
    atk: 38, spd: 0.95, crit: 0.08, range: 2.8, aoe: 0,
    effect: 'pierce',       // 贯穿1目标
    color: 0xaaccee, icon: '🗡️',
  },
  {
    id: 'spear_purple',
    name: '魔影长枪',
    desc: '枪体注入暗影精髓，可投掷后瞬间召回，命中留下追踪暗标。',
    type: 'weapon', category: 'spear', rarity: 'purple',
    atk: 110, spd: 1.0, crit: 0.12, range: 3.2, aoe: 0,
    effect: 'shadow_mark',  // 暗影标记 增伤20%
    color: 0x7722bb, icon: '🗡️',
  },
  {
    id: 'spear_gold',
    name: '神圣骑兵枪',
    desc: '圣光附体的骑兵长枪，突刺时带出5米圣光光柱伤害全线。',
    type: 'weapon', category: 'spear', rarity: 'gold',
    atk: 290, spd: 1.05, crit: 0.15, range: 3.5, aoe: 0,
    effect: 'holy_lance',   // 圣光光柱穿透
    color: 0xffdd44, icon: '🗡️',
  },
  {
    id: 'spear_red',
    name: '皇龙破天枪',
    desc: '以龙脊骨为枪身，枪尖是龙心结晶，刺出伴随龙魂追踪。',
    type: 'weapon', category: 'spear', rarity: 'red',
    atk: 920, spd: 1.1, crit: 0.22, range: 4.0, aoe: 0,
    effect: 'dragon_soul',  // 龙魂追踪 二次伤害
    color: 0xff4400, icon: '🗡️',
  },
  {
    id: 'spear_rainbow',
    name: '宇宙万古神枪',
    desc: '宇宙创世时凝聚的神枪，每次刺出都在时空留下无尽回响。',
    type: 'weapon', category: 'spear', rarity: 'rainbow',
    atk: 2400, spd: 1.2, crit: 0.32, range: 5.0, aoe: 1.0,
    effect: 'spacetime_echo', // 时空回响 3次追加
    color: 0xffffff, icon: '🗡️',
  },

  // ── 大镰刀 Scythe ──────────────────────────────────────────────────────
  {
    id: 'scythe_green',
    name: '农夫收割镰',
    desc: '农田里的旧镰刀，意外地适合横扫一片敌人。',
    type: 'weapon', category: 'scythe', rarity: 'green',
    atk: 11, spd: 0.7, crit: 0.07, range: 1.8, aoe: 1.2,
    effect: null,
    color: 0x887755, icon: '⚔️',
  },
  {
    id: 'scythe_blue',
    name: '幽冥引魂镰',
    desc: '死亡低语附体，挥动后被割的敌人速度降低。',
    type: 'weapon', category: 'scythe', rarity: 'blue',
    atk: 42, spd: 0.72, crit: 0.09, range: 2.0, aoe: 1.5,
    effect: 'slow',         // 减速30% 3s
    color: 0x334488, icon: '⚔️',
  },
  {
    id: 'scythe_purple',
    name: '血煞魔镰',
    desc: '魔晶熔铸的镰刀，每次收割都汲取被杀者的生命力。',
    type: 'weapon', category: 'scythe', rarity: 'purple',
    atk: 115, spd: 0.75, crit: 0.11, range: 2.2, aoe: 2.0,
    effect: 'reap_lifesteal', // 收割吸血10%
    color: 0x880022, icon: '⚔️',
  },
  {
    id: 'scythe_gold',
    name: '死神判决镰',
    desc: '传说中死神使用的副本，挥下时召唤幽灵二重镰轨迹。',
    type: 'weapon', category: 'scythe', rarity: 'gold',
    atk: 310, spd: 0.78, crit: 0.14, range: 2.5, aoe: 2.5,
    effect: 'ghost_twin',   // 幽灵镰影二连斩
    color: 0xbb8800, icon: '⚔️',
  },
  {
    id: 'scythe_red',
    name: '皇冥收魂大镰',
    desc: '皇晶铸造，每次横扫都能夺取所有受伤敌人的魂灵碎片回血。',
    type: 'weapon', category: 'scythe', rarity: 'red',
    atk: 980, spd: 0.80, crit: 0.19, range: 3.0, aoe: 3.0,
    effect: 'soul_harvest',  // 全场多目标吸血
    color: 0xdd1133, icon: '⚔️',
  },
  {
    id: 'scythe_rainbow',
    name: '混沌灭世镰',
    desc: '一镰横扫化为混沌漩涡，时空扭曲将敌人卷入虚空。',
    type: 'weapon', category: 'scythe', rarity: 'rainbow',
    atk: 2600, spd: 0.85, crit: 0.28, range: 4.0, aoe: 4.5,
    effect: 'chaos_vortex',  // 时空漩涡吸入+爆炸
    color: 0xffffff, icon: '⚔️',
  },

  // ── 拳套 Gauntlets ────────────────────────────────────────────────────
  {
    id: 'gauntlets_green',
    name: '铁皮拳套',
    desc: '简陋的铁皮护手，出拳速度极快，是格斗者的入门装备。',
    type: 'weapon', category: 'gauntlets', rarity: 'green',
    atk: 6, spd: 1.8, crit: 0.10, range: 0.8, aoe: 0,
    effect: null,
    color: 0x887766, icon: '👊',
  },
  {
    id: 'gauntlets_blue',
    name: '魔力凝拳',
    desc: '魔晶粉末灌注拳套，拳击时带魔力冲击，偶发震荡眩晕。',
    type: 'weapon', category: 'gauntlets', rarity: 'blue',
    atk: 26, spd: 1.9, crit: 0.14, range: 0.8, aoe: 0,
    effect: 'concussion',   // 15%概率眩晕1s
    color: 0x4488cc, icon: '👊',
  },
  {
    id: 'gauntlets_purple',
    name: '暗影铁爪',
    desc: '指尖附有暗影爪钩，连击5次后自动触发暗影爆发。',
    type: 'weapon', category: 'gauntlets', rarity: 'purple',
    atk: 88, spd: 2.1, crit: 0.18, range: 0.9, aoe: 0,
    effect: 'shadow_burst',  // 5连击后爆发
    color: 0x442288, icon: '👊',
  },
  {
    id: 'gauntlets_gold',
    name: '神焰战拳',
    desc: '每拳附带神焰，5连击时引爆一圈圣火，伤害全场。',
    type: 'weapon', category: 'gauntlets', rarity: 'gold',
    atk: 240, spd: 2.3, crit: 0.22, range: 1.0, aoe: 0,
    effect: 'combo_ignite',  // 连击触发圣焰爆
    color: 0xffaa00, icon: '👊',
  },
  {
    id: 'gauntlets_red',
    name: '皇血铁拳',
    desc: '每次命中回复伤害25%生命，暴击时双倍，越战越勇。',
    type: 'weapon', category: 'gauntlets', rarity: 'red',
    atk: 760, spd: 2.5, crit: 0.28, range: 1.0, aoe: 0,
    effect: 'berserker_regen', // 攻速越高回血越多
    color: 0xcc2200, icon: '👊',
  },
  {
    id: 'gauntlets_rainbow',
    name: '宇宙开拳',
    desc: '一拳之力等同宇宙大爆炸，拳风形成的冲击波横扫全屏。',
    type: 'weapon', category: 'gauntlets', rarity: 'rainbow',
    atk: 2100, spd: 2.8, crit: 0.45, range: 1.2, aoe: 2.0,
    effect: 'big_bang_fist', // 拳风冲击波全屏
    color: 0xffffff, icon: '👊',
  },

  // ── 巨剑 Greatsword ───────────────────────────────────────────────────
  {
    id: 'greatsword_green',
    name: '朽木巨剑',
    desc: '笨重的双手大剑，砍下时带动气流，连人带剑威慑周围。',
    type: 'weapon', category: 'greatsword', rarity: 'green',
    atk: 14, spd: 0.55, crit: 0.06, range: 1.5, aoe: 1.8,
    effect: null,
    color: 0x776655, icon: '⚔️',
  },
  {
    id: 'greatsword_blue',
    name: '烈焰巨刃',
    desc: '火焰注入双手刃，每次横扫都点燃周围的一片草地和敌人。',
    type: 'weapon', category: 'greatsword', rarity: 'blue',
    atk: 52, spd: 0.58, crit: 0.07, range: 1.8, aoe: 2.0,
    effect: 'flame_sweep',  // 横扫点燃AOE
    color: 0xee6600, icon: '⚔️',
  },
  {
    id: 'greatsword_purple',
    name: '虚空裂天剑',
    desc: '劈出时撕裂空间，剑气裂缝延伸3格，持续伤害敌人。',
    type: 'weapon', category: 'greatsword', rarity: 'purple',
    atk: 140, spd: 0.62, crit: 0.09, range: 2.0, aoe: 2.5,
    effect: 'void_rift',    // 剑气裂缝持续伤害
    color: 0x220066, icon: '⚔️',
  },
  {
    id: 'greatsword_gold',
    name: '天裂神巨剑',
    desc: '传说中斩下天空的神剑，挥动时大气震荡，连击时剑气叠加。',
    type: 'weapon', category: 'greatsword', rarity: 'gold',
    atk: 360, spd: 0.65, crit: 0.12, range: 2.2, aoe: 3.0,
    effect: 'sky_rend',     // 剑气叠加爆发
    color: 0xffcc22, icon: '⚔️',
  },
  {
    id: 'greatsword_red',
    name: '皇威屠界剑',
    desc: '每一次挥动都形成一道10米长的刃气，横扫整个战场。',
    type: 'weapon', category: 'greatsword', rarity: 'red',
    atk: 1150, spd: 0.70, crit: 0.16, range: 2.5, aoe: 4.0,
    effect: 'world_cleave', // 刃气全场横扫
    color: 0xff2200, icon: '⚔️',
  },
  {
    id: 'greatsword_rainbow',
    name: '混沌创世神剑',
    desc: '宇宙诞生时凝固的神剑，每次劈斩都重现宇宙创生的闪光。',
    type: 'weapon', category: 'greatsword', rarity: 'rainbow',
    atk: 3000, spd: 0.75, crit: 0.22, range: 3.0, aoe: 5.5,
    effect: 'genesis_slash', // 创世光爆全场
    color: 0xffffff, icon: '⚔️',
  },

  // ── 鞭 Whip ───────────────────────────────────────────────────────────
  {
    id: 'whip_green',
    name: '皮革马鞭',
    desc: '普通马夫的皮鞭，抽打时偶尔能震退敌人。',
    type: 'weapon', category: 'whip', rarity: 'green',
    atk: 7, spd: 1.2, crit: 0.07, range: 2.5, aoe: 0,
    effect: null,
    color: 0xaa7744, icon: '🪢',
  },
  {
    id: 'whip_blue',
    name: '电磁链鞭',
    desc: '金属链条鞭，抽到敌人时放出电流，短暂麻痹目标。',
    type: 'weapon', category: 'whip', rarity: 'blue',
    atk: 32, spd: 1.3, crit: 0.09, range: 3.0, aoe: 0,
    effect: 'stun',         // 麻痹0.8s
    color: 0x88aaff, icon: '🪢',
  },
  {
    id: 'whip_purple',
    name: '魔蛇缠绕鞭',
    desc: '鞭梢注入魔蛇毒素，命中后毒素扩散，还能将敌人勾拉过来。',
    type: 'weapon', category: 'whip', rarity: 'purple',
    atk: 90, spd: 1.35, crit: 0.13, range: 3.5, aoe: 0,
    effect: 'poison_pull',  // 中毒+勾拉敌人
    color: 0x228833, icon: '🪢',
  },
  {
    id: 'whip_gold',
    name: '神火缚天鞭',
    desc: '神焰鞭体，抽击后在空中留下燃烧轨迹，再度路过的敌人受创。',
    type: 'weapon', category: 'whip', rarity: 'gold',
    atk: 270, spd: 1.4, crit: 0.17, range: 4.0, aoe: 0,
    effect: 'fire_trail',   // 燃烧轨迹残留
    color: 0xff8800, icon: '🪢',
  },
  {
    id: 'whip_red',
    name: '皇雷霹天鞭',
    desc: '每次挥动都引雷霆随鞭梢降临，鞭到之处雷火交加。',
    type: 'weapon', category: 'whip', rarity: 'red',
    atk: 870, spd: 1.45, crit: 0.23, range: 4.5, aoe: 0,
    effect: 'thunder_crack', // 雷霆随击
    color: 0xffee00, icon: '🪢',
  },
  {
    id: 'whip_rainbow',
    name: '时空束缚圣鞭',
    desc: '鞭梢触碰时空裂缝，被击中的敌人时间暂停0.5秒，无法躲避。',
    type: 'weapon', category: 'whip', rarity: 'rainbow',
    atk: 2100, spd: 1.5, crit: 0.35, range: 6.0, aoe: 0,
    effect: 'time_stop',    // 时停0.5s
    color: 0xffffff, icon: '🪢',
  },

  // ══════════════════════════════════════════════════════════
  // 远程新增 RANGED ADDITIONS
  // ══════════════════════════════════════════════════════════

  // ── 弩机 Crossbow ─────────────────────────────────────────────────────
  {
    id: 'crossbow_green',
    name: '手制木弩',
    desc: '自制木弩，装填慢，但弩矢力道大，能射穿薄甲。',
    type: 'weapon', category: 'crossbow', rarity: 'green',
    atk: 13, spd: 0.6, crit: 0.10, range: 6.0, aoe: 0,
    effect: null,
    color: 0x998855, icon: '🏹',
  },
  {
    id: 'crossbow_blue',
    name: '精钢穿甲弩',
    desc: '钢制箭槽精密，弩矢穿透敌人护甲，减免50%防御。',
    type: 'weapon', category: 'crossbow', rarity: 'blue',
    atk: 55, spd: 0.65, crit: 0.12, range: 7.0, aoe: 0,
    effect: 'armor_break',  // 穿甲−50%防御
    color: 0x668899, icon: '🏹',
  },
  {
    id: 'crossbow_purple',
    name: '影蚀速射弩',
    desc: '暗影魔晶装备的连发弩，可蓄力后同时三连发。',
    type: 'weapon', category: 'crossbow', rarity: 'purple',
    atk: 108, spd: 0.70, crit: 0.14, range: 7.5, aoe: 0,
    effect: 'triple_bolt',  // 蓄力三连射
    color: 0x552288, icon: '🏹',
  },
  {
    id: 'crossbow_gold',
    name: '神裁爆破弩',
    desc: '每一支弩矢落地后延迟0.5s爆炸，无法被躲避。',
    type: 'weapon', category: 'crossbow', rarity: 'gold',
    atk: 300, spd: 0.72, crit: 0.16, range: 8.0, aoe: 1.5,
    effect: 'delay_explode', // 延时爆炸
    color: 0xffaa33, icon: '🏹',
  },
  {
    id: 'crossbow_red',
    name: '皇血穿世弩',
    desc: '弩矢飞行中持续加速，命中时携带全部加速动能爆炸。',
    type: 'weapon', category: 'crossbow', rarity: 'red',
    atk: 1050, spd: 0.75, crit: 0.20, range: 10.0, aoe: 2.0,
    effect: 'kinetic_burst', // 加速动能爆炸
    color: 0xee2200, icon: '🏹',
  },
  {
    id: 'crossbow_rainbow',
    name: '混沌黑洞弩',
    desc: '弩矢落地后形成微型黑洞，吸附附近所有敌人再爆炸。',
    type: 'weapon', category: 'crossbow', rarity: 'rainbow',
    atk: 2700, spd: 0.78, crit: 0.30, range: 12.0, aoe: 5.0,
    effect: 'black_hole',   // 黑洞吸附+爆炸
    color: 0xffffff, icon: '🏹',
  },

  // ── 投掷飞刀 ThrowKnife ───────────────────────────────────────────────
  {
    id: 'throwknife_green',
    name: '厨房飞刀',
    desc: '厨房里顺手带来的刀，一次投出三把，散射覆盖前方。',
    type: 'weapon', category: 'throwknife', rarity: 'green',
    atk: 5, spd: 1.4, crit: 0.12, range: 5.0, aoe: 0,
    effect: 'triple_throw', // 三刀扇形
    color: 0xaabbaa, icon: '🗡️',
  },
  {
    id: 'throwknife_blue',
    name: '暗影投刃',
    desc: '投出后隐于暗中飞行，敌人无法预判轨迹，自带毒素。',
    type: 'weapon', category: 'throwknife', rarity: 'blue',
    atk: 28, spd: 1.5, crit: 0.16, range: 6.0, aoe: 0,
    effect: 'poison',       // 中毒3s
    color: 0x224455, icon: '🗡️',
  },
  {
    id: 'throwknife_purple',
    name: '星陨投刃组',
    desc: '一次投出七把小刀呈星形扩散，覆盖所有方向。',
    type: 'weapon', category: 'throwknife', rarity: 'purple',
    atk: 75, spd: 1.6, crit: 0.20, range: 6.5, aoe: 0,
    effect: 'star_spread',  // 七方向扩散
    color: 0x8855cc, icon: '🗡️',
  },
  {
    id: 'throwknife_gold',
    name: '神圣反弹刃',
    desc: '飞刃命中墙壁或敌人后弹射，最多弹射3次持续伤害。',
    type: 'weapon', category: 'throwknife', rarity: 'gold',
    atk: 220, spd: 1.7, crit: 0.24, range: 7.0, aoe: 0,
    effect: 'ricochet',     // 弹射×3
    color: 0xffdd66, icon: '🗡️',
  },
  {
    id: 'throwknife_red',
    name: '皇血追魂刃',
    desc: '飞刃具有追踪能力，命中目标后瞬间返回玩家手中再投。',
    type: 'weapon', category: 'throwknife', rarity: 'red',
    atk: 820, spd: 1.8, crit: 0.30, range: 8.0, aoe: 0,
    effect: 'homing_return', // 追踪+返回循环
    color: 0xff3300, icon: '🗡️',
  },
  {
    id: 'throwknife_rainbow',
    name: '时空裂刃风暴',
    desc: '抛出后在空中复制为数十把，形成覆盖全场的刃风暴。',
    type: 'weapon', category: 'throwknife', rarity: 'rainbow',
    atk: 1900, spd: 2.0, crit: 0.42, range: 10.0, aoe: 0,
    effect: 'blade_storm',  // 全场刃风暴
    color: 0xffffff, icon: '🗡️',
  },

  // ── 魔晶球 CrystalOrb ─────────────────────────────────────────────────
  {
    id: 'orb_green',
    name: '玻璃魔弹',
    desc: '脆弱的玻璃球内充满不稳定魔力，投出时弹跳2次。',
    type: 'weapon', category: 'orb', rarity: 'green',
    atk: 8, spd: 0.8, crit: 0.09, range: 5.5, aoe: 0.5,
    effect: 'bounce',       // 弹跳×2
    color: 0x88ddcc, icon: '🔮',
  },
  {
    id: 'orb_blue',
    name: '冰魄魔晶球',
    desc: '冻结元素浓缩晶球，弹跳时释放冰冻气体，减速范围目标。',
    type: 'weapon', category: 'orb', rarity: 'blue',
    atk: 36, spd: 0.82, crit: 0.11, range: 6.0, aoe: 1.0,
    effect: 'freeze_bounce', // 弹跳+冻结
    color: 0x88ccff, icon: '🔮',
  },
  {
    id: 'orb_purple',
    name: '幽雷爆裂球',
    desc: '内含被压缩的雷暴能量，弹跳时释放电弧，伤害链目标。',
    type: 'weapon', category: 'orb', rarity: 'purple',
    atk: 95, spd: 0.85, crit: 0.13, range: 6.5, aoe: 1.5,
    effect: 'arc_bounce',   // 弹跳电弧链
    color: 0x9955ee, icon: '🔮',
  },
  {
    id: 'orb_gold',
    name: '星灵圣力球',
    desc: '引入星辰之力，球体弹跳时召唤陨石从天而降增援。',
    type: 'weapon', category: 'orb', rarity: 'gold',
    atk: 265, spd: 0.88, crit: 0.16, range: 7.0, aoe: 2.0,
    effect: 'meteor_bounce', // 弹跳+陨石
    color: 0xddbb44, icon: '🔮',
  },
  {
    id: 'orb_red',
    name: '皇魂爆炸晶球',
    desc: '最终弹跳时巨型爆炸，爆炸半径随弹跳次数叠加。',
    type: 'weapon', category: 'orb', rarity: 'red',
    atk: 900, spd: 0.90, crit: 0.21, range: 8.0, aoe: 2.5,
    effect: 'chain_detonate', // 叠加爆炸
    color: 0xff5500, icon: '🔮',
  },
  {
    id: 'orb_rainbow',
    name: '宇宙奇点晶球',
    desc: '内含宇宙奇点，弹跳时吞噬空间，最终爆炸撕裂虚空。',
    type: 'weapon', category: 'orb', rarity: 'rainbow',
    atk: 2500, spd: 0.95, crit: 0.33, range: 10.0, aoe: 6.0,
    effect: 'singularity',  // 奇点爆炸全场
    color: 0xffffff, icon: '🔮',
  },

  // ── 火铳 Musket ───────────────────────────────────────────────────────
  {
    id: 'musket_green',
    name: '锈铁火铳',
    desc: '老式火枪，装填需要漫长等待，但铅弹打出去威力巨大。',
    type: 'weapon', category: 'musket', rarity: 'green',
    atk: 18, spd: 0.4, crit: 0.15, range: 8.0, aoe: 0,
    effect: null,
    color: 0x887766, icon: '🔫',
  },
  {
    id: 'musket_blue',
    name: '精准银管枪',
    desc: '银管制造，精准度极高，超过10格内命中必定暴击。',
    type: 'weapon', category: 'musket', rarity: 'blue',
    atk: 65, spd: 0.42, crit: 0.20, range: 10.0, aoe: 0,
    effect: 'long_range_crit', // 远程必暴
    color: 0xaabbcc, icon: '🔫',
  },
  {
    id: 'musket_purple',
    name: '魔炸榴弹铳',
    desc: '枪口加装榴弹发射器，可切换单发穿甲或爆炸弹两模式。',
    type: 'weapon', category: 'musket', rarity: 'purple',
    atk: 120, spd: 0.45, crit: 0.17, range: 9.0, aoe: 2.0,
    effect: 'grenade_mode',  // 榴弹/穿甲切换
    color: 0x556622, icon: '🔫',
  },
  {
    id: 'musket_gold',
    name: '神圣量子步枪',
    desc: '神圣晶石能量为弹，子弹飞行时穿透所有障碍直到命中。',
    type: 'weapon', category: 'musket', rarity: 'gold',
    atk: 330, spd: 0.48, crit: 0.22, range: 12.0, aoe: 0,
    effect: 'wall_pierce',   // 穿透障碍
    color: 0xeeddaa, icon: '🔫',
  },
  {
    id: 'musket_red',
    name: '皇血轨道炮',
    desc: '以皇晶驱动的磁轨炮，弹丸速度超光速，命中爆炸范围巨大。',
    type: 'weapon', category: 'musket', rarity: 'red',
    atk: 1200, spd: 0.50, crit: 0.25, range: 15.0, aoe: 3.0,
    effect: 'railgun',      // 超速贯穿爆炸
    color: 0xff4400, icon: '🔫',
  },
  {
    id: 'musket_rainbow',
    name: '宇宙湮灭炮',
    desc: '一发可毁灭一个星系，弹丸飞行时扭曲时空，无法闪避。',
    type: 'weapon', category: 'musket', rarity: 'rainbow',
    atk: 3000, spd: 0.52, crit: 0.35, range: 20.0, aoe: 8.0,
    effect: 'galaxy_destroyer', // 毁星爆炸
    color: 0xffffff, icon: '🔫',
  },

  // ── 召唤卷轴 Scroll ───────────────────────────────────────────────────
  {
    id: 'scroll_green',
    name: '旧羊皮召唤卷',
    desc: '褪色的旧卷轴，展开后召唤一只虚弱的骷髅射手助战3秒。',
    type: 'weapon', category: 'scroll', rarity: 'green',
    atk: 7, spd: 0.5, crit: 0.08, range: 6.0, aoe: 0,
    effect: 'summon_skeleton', // 召唤骷髅弓手×1
    color: 0xccbb88, icon: '📜',
  },
  {
    id: 'scroll_blue',
    name: '幽魂引魂书',
    desc: '召唤两只幽灵游荡，自动攻击附近敌人，持续5秒。',
    type: 'weapon', category: 'scroll', rarity: 'blue',
    atk: 30, spd: 0.52, crit: 0.09, range: 7.0, aoe: 0,
    effect: 'summon_ghost',  // 召唤幽灵×2
    color: 0x8899cc, icon: '📜',
  },
  {
    id: 'scroll_purple',
    name: '魔焰魔族卷轴',
    desc: '召唤魔族守卫，近战护身+远程攻击双模式，持续8秒。',
    type: 'weapon', category: 'scroll', rarity: 'purple',
    atk: 85, spd: 0.55, crit: 0.12, range: 8.0, aoe: 0,
    effect: 'summon_demon',  // 召唤魔族守卫×1
    color: 0xaa3388, icon: '📜',
  },
  {
    id: 'scroll_gold',
    name: '神力天使卷轴',
    desc: '召唤圣光天使持续追击所有敌人，范围治疗玩家，持续10秒。',
    type: 'weapon', category: 'scroll', rarity: 'gold',
    atk: 255, spd: 0.58, crit: 0.14, range: 9.0, aoe: 0,
    effect: 'summon_angel',  // 召唤天使+治疗光环
    color: 0xffeebb, icon: '📜',
  },
  {
    id: 'scroll_red',
    name: '皇龙降临卷轴',
    desc: '召唤巨龙在战场上空盘旋，喷火覆盖全场，持续12秒。',
    type: 'weapon', category: 'scroll', rarity: 'red',
    atk: 950, spd: 0.60, crit: 0.18, range: 10.0, aoe: 4.0,
    effect: 'summon_dragon', // 召唤龙喷火覆盖
    color: 0xff3300, icon: '📜',
  },
  {
    id: 'scroll_rainbow',
    name: '宇宙意志召唤典',
    desc: '召唤宇宙意志化身降临，无敌状态持续攻击，持续15秒。',
    type: 'weapon', category: 'scroll', rarity: 'rainbow',
    atk: 2800, spd: 0.65, crit: 0.28, range: 12.0, aoe: 6.0,
    effect: 'summon_cosmic', // 宇宙意志降临
    color: 0xffffff, icon: '📜',
  },
]

// 合并到主武器库的辅助函数
export function getAllWeapons(baseWeapons) {
  return [...baseWeapons, ...WEAPONS_EXT]
}
