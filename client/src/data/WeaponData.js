/**
 * WeaponData.js — 武器道具数据库
 *
 * 六阶品质 × 6 大武器类型 = 36 种基础武器
 *
 * 品质等级映射（与魔晶品质体系一致）：
 *   green  🟢凡晶 ×1    ATK  5–15
 *   blue   🔵灵晶 ×2.5  ATK 25–50
 *   purple 🟣魔晶 ×6    ATK 80–150
 *   gold   🟡神晶 ×15   ATK 250–400
 *   red    🔴皇晶 ×40   ATK 800–1200
 *   rainbow🌈圣晶 ×100  ATK 2000–3000
 *
 * 武器属性说明：
 *   type        weapon | 未来可扩展 armor / ring / trinket
 *   category    sword / staff / axe / bow / dagger / hammer
 *   rarity      green / blue / purple / gold / red / rainbow
 *   atk         基础攻击加成
 *   spd         攻击速度修正（1.0 = 标准，<1 慢，>1 快）
 *   crit        暴击率加成（0–1）
 *   range       攻击射程（格数）
 *   effect      特殊效果 ID（对应 StatusEffect 系统）
 *   aoe         AOE 半径（格数，0 = 单体）
 *   color       道具发光颜色（hex）
 *   icon        Emoji 占位图标（替换为精灵图时删除）
 */

export const RARITY = {
  green:   { label: '凡晶·普通', color: 0x44cc44, textColor: '#77ee77', multi: 1    },
  blue:    { label: '灵晶·优质', color: 0x4499ff, textColor: '#88bbff', multi: 2.5  },
  purple:  { label: '魔晶·稀有', color: 0xaa44ff, textColor: '#cc77ff', multi: 6    },
  gold:    { label: '神晶·史诗', color: 0xffcc00, textColor: '#ffdd44', multi: 15   },
  red:     { label: '皇晶·传说', color: 0xff2200, textColor: '#ff6644', multi: 40   },
  rainbow: { label: '圣晶·神话', color: 0xffffff, textColor: '#ffffff', multi: 100  },
}

export const WEAPONS = [

  // ── 长剑 Sword ─────────────────────────────────────────────────────────
  {
    id: 'sword_green',
    name: '锈铁长剑',
    desc: '被时间侵蚀的铁剑，刃口已钝，但仍是冒险者的第一步。',
    type: 'weapon', category: 'sword', rarity: 'green',
    atk: 8, spd: 1.0, crit: 0.05, range: 1.5, aoe: 0,
    effect: null,
    color: 0x88aa66, icon: '⚔️',
  },
  {
    id: 'sword_blue',
    name: '月光刃',
    desc: '在月圆之夜锻造，刀刃散发淡蓝光晕，能斩断恐惧。',
    type: 'weapon', category: 'sword', rarity: 'blue',
    atk: 35, spd: 1.05, crit: 0.08, range: 1.5, aoe: 0,
    effect: 'chill',        // 冰凉减速 15%
    color: 0x88ccff, icon: '⚔️',
  },
  {
    id: 'sword_purple',
    name: '暗影裂刃',
    desc: '由幽暗地穴深处的黑晶铸成，斩击带有暗影侵蚀。',
    type: 'weapon', category: 'sword', rarity: 'purple',
    atk: 120, spd: 1.1, crit: 0.12, range: 1.5, aoe: 0,
    effect: 'shadow_shred', // 减防 20% 3s
    color: 0x9933cc, icon: '⚔️',
  },
  {
    id: 'sword_gold',
    name: '神裁圣剑',
    desc: '神圣遗迹的祭坛之剑，挥动时发出低沉的神圣轰鸣。',
    type: 'weapon', category: 'sword', rarity: 'gold',
    atk: 320, spd: 1.15, crit: 0.15, range: 2.0, aoe: 0,
    effect: 'holy_burn',    // 神圣灼烧 5s
    color: 0xffcc00, icon: '⚔️',
  },
  {
    id: 'sword_red',
    name: '皇焰屠龙刀',
    desc: '以龙骨脉矿石为核心，刀气可斩裂山脉。',
    type: 'weapon', category: 'sword', rarity: 'red',
    atk: 1000, spd: 1.2, crit: 0.20, range: 2.5, aoe: 0.5,
    effect: 'dragon_fire',  // 龙焰 DOT 8s
    color: 0xff2200, icon: '⚔️',
  },
  {
    id: 'sword_rainbow',
    name: '混沌圣裁刃',
    desc: '宇宙意志所凝，斩下时空间撕裂七彩裂缝。斩击带全属性破甲。',
    type: 'weapon', category: 'sword', rarity: 'rainbow',
    atk: 2500, spd: 1.3, crit: 0.30, range: 3.0, aoe: 1.0,
    effect: 'chaos_rend',   // 七色撕裂 所有抗性−50%
    color: 0xffffff, icon: '⚔️',
  },

  // ── 法杖 Staff ─────────────────────────────────────────────────────────
  {
    id: 'staff_green',
    name: '木纹法杖',
    desc: '普通橡木制成，仅能聚拢微弱的魔法余晖。',
    type: 'weapon', category: 'staff', rarity: 'green',
    atk: 10, spd: 0.85, crit: 0.10, range: 4.0, aoe: 1.0,
    effect: null,
    color: 0x88aa44, icon: '🪄',
  },
  {
    id: 'staff_blue',
    name: '寒露魔典',
    desc: '封印了冰元素的典籍法杖，每次吟唱都吐出冰霜之气。',
    type: 'weapon', category: 'staff', rarity: 'blue',
    atk: 45, spd: 0.9, crit: 0.12, range: 4.5, aoe: 1.5,
    effect: 'freeze',       // 冻结 2s
    color: 0x66aaff, icon: '🪄',
  },
  {
    id: 'staff_purple',
    name: '雷纹权杖',
    desc: '雷霆高地的电菇精华注入杖心，击中即雷链跳跃三目标。',
    type: 'weapon', category: 'staff', rarity: 'purple',
    atk: 100, spd: 0.92, crit: 0.14, range: 5.0, aoe: 2.0,
    effect: 'chain_lightning', // 雷链跳 3 目标
    color: 0xaacc00, icon: '🪄',
  },
  {
    id: 'staff_gold',
    name: '星辰奥杖',
    desc: '星空秘境的流星物质铸成，每次施法召唤陨石坠落。',
    type: 'weapon', category: 'staff', rarity: 'gold',
    atk: 280, spd: 0.95, crit: 0.17, range: 6.0, aoe: 2.5,
    effect: 'meteor',       // 陨石冲击 范围伤害
    color: 0x8855ff, icon: '🪄',
  },
  {
    id: 'staff_red',
    name: '灵魂烈焰杖',
    desc: '以皇晶为核，杖顶熊熊燃烧不灭的灵魂之火，范围爆炸。',
    type: 'weapon', category: 'staff', rarity: 'red',
    atk: 950, spd: 0.98, crit: 0.22, range: 7.0, aoe: 3.0,
    effect: 'soul_blaze',   // 灵魂焚烧 全体灼烧 5s
    color: 0xff5500, icon: '🪄',
  },
  {
    id: 'staff_rainbow',
    name: '宇宙洪荒杖',
    desc: '汇聚宇宙诞生之力，每次释放都像一次小宇宙爆炸。',
    type: 'weapon', category: 'staff', rarity: 'rainbow',
    atk: 2800, spd: 1.0, crit: 0.35, range: 9.0, aoe: 5.0,
    effect: 'big_bang',     // 大爆炸 全屏伤害
    color: 0xffffff, icon: '🪄',
  },

  // ── 战斧 Axe ───────────────────────────────────────────────────────────
  {
    id: 'axe_green',
    name: '石刃战斧',
    desc: '粗糙打磨的石斧，沉重却有效，新手伐木必备。',
    type: 'weapon', category: 'axe', rarity: 'green',
    atk: 12, spd: 0.75, crit: 0.07, range: 1.0, aoe: 0.5,
    effect: null,
    color: 0x888866, icon: '🪓',
  },
  {
    id: 'axe_blue',
    name: '烈火战斧',
    desc: '斧刃淬火淬岩，劈砍后留下灼热裂缝。',
    type: 'weapon', category: 'axe', rarity: 'blue',
    atk: 50, spd: 0.78, crit: 0.08, range: 1.2, aoe: 0.8,
    effect: 'ignite',       // 点燃 3s
    color: 0xff6600, icon: '🪓',
  },
  {
    id: 'axe_purple',
    name: '黑钢狂斧',
    desc: '铸造时注入了狂暴魔晶，命中时有概率触发二连砍。',
    type: 'weapon', category: 'axe', rarity: 'purple',
    atk: 145, spd: 0.82, crit: 0.10, range: 1.2, aoe: 1.0,
    effect: 'berserk_slash', // 20% 触发双斩
    color: 0x333366, icon: '🪓',
  },
  {
    id: 'axe_gold',
    name: '炎神裂山斧',
    desc: '传说中能劈裂山脉的斧头，挥动时引起火焰风暴。',
    type: 'weapon', category: 'axe', rarity: 'gold',
    atk: 380, spd: 0.85, crit: 0.12, range: 1.5, aoe: 1.5,
    effect: 'flame_quake',  // 地面震裂火焰
    color: 0xff8800, icon: '🪓',
  },
  {
    id: 'axe_red',
    name: '血月毁灭斧',
    desc: '血月荒原的诅咒之斧，每次暴击回复攻击伤害 15% 的生命。',
    type: 'weapon', category: 'axe', rarity: 'red',
    atk: 1100, spd: 0.88, crit: 0.18, range: 1.5, aoe: 2.0,
    effect: 'lifesteal',    // 暴击吸血 15%
    color: 0xcc0022, icon: '🪓',
  },
  {
    id: 'axe_rainbow',
    name: '混沌劈世斧',
    desc: '斧锋蕴含开天辟地之力，劈下时撕裂维度，无视所有护甲。',
    type: 'weapon', category: 'axe', rarity: 'rainbow',
    atk: 2200, spd: 0.92, crit: 0.25, range: 2.0, aoe: 3.0,
    effect: 'dimension_rift', // 维度撕裂 穿透
    color: 0xffffff, icon: '🪓',
  },

  // ── 弓弩 Bow ───────────────────────────────────────────────────────────
  {
    id: 'bow_green',
    name: '朴木短弓',
    desc: '普通橡木弓，轻便好携带，适合初入野外的探险者。',
    type: 'weapon', category: 'bow', rarity: 'green',
    atk: 6, spd: 1.2, crit: 0.08, range: 5.0, aoe: 0,
    effect: null,
    color: 0xaaaa66, icon: '🏹',
  },
  {
    id: 'bow_blue',
    name: '猎风弯弓',
    desc: '弓弦灌注风元素，箭矢飞行速度提升，命中后减速。',
    type: 'weapon', category: 'bow', rarity: 'blue',
    atk: 30, spd: 1.3, crit: 0.12, range: 6.0, aoe: 0,
    effect: 'slow',         // 减速 25% 2s
    color: 0x88ddff, icon: '🏹',
  },
  {
    id: 'bow_purple',
    name: '幽影穿云弓',
    desc: '暗影矿脉锻造，箭矢能穿透障碍直中目标，携带暗毒。',
    type: 'weapon', category: 'bow', rarity: 'purple',
    atk: 95, spd: 1.35, crit: 0.16, range: 7.0, aoe: 0,
    effect: 'poison',       // 中毒 5s
    color: 0x6600aa, icon: '🏹',
  },
  {
    id: 'bow_gold',
    name: '神射天弓',
    desc: '神圣遗迹的弓匠之作，每第三支箭带圣光穿甲效果。',
    type: 'weapon', category: 'bow', rarity: 'gold',
    atk: 260, spd: 1.4, crit: 0.20, range: 8.0, aoe: 0,
    effect: 'holy_pierce',  // 每3箭穿甲
    color: 0xffeeaa, icon: '🏹',
  },
  {
    id: 'bow_red',
    name: '皇血战弓',
    desc: '以皇晶箭矢配对，可同时射出五矢扇形覆盖区域。',
    type: 'weapon', category: 'bow', rarity: 'red',
    atk: 850, spd: 1.45, crit: 0.25, range: 9.0, aoe: 0,
    effect: 'volley',       // 五矢同发扇形
    color: 0xff1100, icon: '🏹',
  },
  {
    id: 'bow_rainbow',
    name: '圣光万箭弓',
    desc: '一发射出化为千箭雨落，覆盖整个战场，无一可逃。',
    type: 'weapon', category: 'bow', rarity: 'rainbow',
    atk: 2000, spd: 1.5, crit: 0.40, range: 12.0, aoe: 0,
    effect: 'arrow_rain',   // 千箭雨全屏
    color: 0xffffff, icon: '🏹',
  },

  // ── 匕首 Dagger ────────────────────────────────────────────────────────
  {
    id: 'dagger_green',
    name: '碎铁匕首',
    desc: '简陋的铁匕首，刃短但出手极快，擅长背刺。',
    type: 'weapon', category: 'dagger', rarity: 'green',
    atk: 5, spd: 1.5, crit: 0.15, range: 1.0, aoe: 0,
    effect: null,
    color: 0x99bbaa, icon: '🗡️',
  },
  {
    id: 'dagger_blue',
    name: '影刺锋刃',
    desc: '暗影精华淬炼，近身暗袭有概率触发眩晕。',
    type: 'weapon', category: 'dagger', rarity: 'blue',
    atk: 25, spd: 1.6, crit: 0.20, range: 1.0, aoe: 0,
    effect: 'stun_chance',  // 10% 眩晕 1.5s
    color: 0x224488, icon: '🗡️',
  },
  {
    id: 'dagger_purple',
    name: '魔毒双刃',
    desc: '成对持有，每秒可各攻击一次，沾上魔毒持续掉血。',
    type: 'weapon', category: 'dagger', rarity: 'purple',
    atk: 80, spd: 1.8, crit: 0.25, range: 1.0, aoe: 0,
    effect: 'dual_wield',   // 双持 每秒2次
    color: 0x882299, icon: '🗡️',
  },
  {
    id: 'dagger_gold',
    name: '神速鬼影刃',
    desc: '施展时产生残影，1秒内连刺五下，敌人防不胜防。',
    type: 'weapon', category: 'dagger', rarity: 'gold',
    atk: 250, spd: 2.0, crit: 0.30, range: 1.0, aoe: 0,
    effect: 'shadow_step',  // 残影连刺 ×5
    color: 0xffaa22, icon: '🗡️',
  },
  {
    id: 'dagger_red',
    name: '血晶刺骨刀',
    desc: '每次刺入都汲取敌人血气，攻速越高回血越多。',
    type: 'weapon', category: 'dagger', rarity: 'red',
    atk: 800, spd: 2.2, crit: 0.35, range: 1.0, aoe: 0,
    effect: 'vampiric_stab', // 吸血 20% + 攻速×回血
    color: 0xdd0033, icon: '🗡️',
  },
  {
    id: 'dagger_rainbow',
    name: '时空穿刺刃',
    desc: '刺入时在时空中留下裂缝，击中后爆发时空能量伤害。',
    type: 'weapon', category: 'dagger', rarity: 'rainbow',
    atk: 2000, spd: 2.5, crit: 0.50, range: 1.0, aoe: 0,
    effect: 'timerift_stab', // 时空爆发 延迟追加
    color: 0xffffff, icon: '🗡️',
  },

  // ── 战锤 Hammer ────────────────────────────────────────────────────────
  {
    id: 'hammer_green',
    name: '沉铁重锤',
    desc: '笨重的大铁锤，每次砸击都会震动地面，命中必晕。',
    type: 'weapon', category: 'hammer', rarity: 'green',
    atk: 15, spd: 0.6, crit: 0.05, range: 1.0, aoe: 1.0,
    effect: 'stun',         // 必晕 0.8s
    color: 0x666666, icon: '🔨',
  },
  {
    id: 'hammer_blue',
    name: '冻岩战锤',
    desc: '以永冻峡湾的岩冰铸成，砸地后释放冰晶破碎。',
    type: 'weapon', category: 'hammer', rarity: 'blue',
    atk: 48, spd: 0.65, crit: 0.07, range: 1.2, aoe: 1.5,
    effect: 'frost_shatter', // 冰晶范围 1.5格
    color: 0x88ccee, icon: '🔨',
  },
  {
    id: 'hammer_purple',
    name: '雷震神锤',
    desc: '每次砸击都引雷入地，命中时周围3格雷电群爆。',
    type: 'weapon', category: 'hammer', rarity: 'purple',
    atk: 130, spd: 0.68, crit: 0.08, range: 1.2, aoe: 2.0,
    effect: 'thunder_crash', // 落雷 3格
    color: 0xccee00, icon: '🔨',
  },
  {
    id: 'hammer_gold',
    name: '圣裂大地锤',
    desc: '举起砸下时天地变色，圣光从地缝涌出伤害连片。',
    type: 'weapon', category: 'hammer', rarity: 'gold',
    atk: 350, spd: 0.70, crit: 0.10, range: 1.5, aoe: 2.5,
    effect: 'holy_quake',   // 圣光地裂
    color: 0xffee66, icon: '🔨',
  },
  {
    id: 'hammer_red',
    name: '皇威震天锤',
    desc: '皇晶锤心重达万吨，砸地后产生冲击波向四周扩散。',
    type: 'weapon', category: 'hammer', rarity: 'red',
    atk: 1200, spd: 0.72, crit: 0.13, range: 1.5, aoe: 3.5,
    effect: 'shockwave',    // 冲击波全屏
    color: 0xff3300, icon: '🔨',
  },
  {
    id: 'hammer_rainbow',
    name: '宇宙湮灭锤',
    desc: '一锤之力可毁灭一颗星球，每次砸击触发小型宇宙爆炸。',
    type: 'weapon', category: 'hammer', rarity: 'rainbow',
    atk: 3000, spd: 0.75, crit: 0.20, range: 2.0, aoe: 5.0,
    effect: 'cosmic_annihilation', // 宇宙爆炸 全屏
    color: 0xffffff, icon: '🔨',
  },
]

/** 按 id 查找武器 */
export function getWeapon(id) {
  return WEAPONS.find(w => w.id === id) ?? null
}

/** 按品质筛选 */
export function getWeaponsByRarity(rarity) {
  return WEAPONS.filter(w => w.rarity === rarity)
}

/** 按类型筛选 */
export function getWeaponsByCategory(category) {
  return WEAPONS.filter(w => w.category === category)
}

/**
 * 随机掉落 — 根据怪物等级/群系给出权重
 * @param {number} monsterLevel  怪物等级 (1-50+)
 * @param {string} [category]    指定类型（可选）
 */
export function rollWeaponDrop(monsterLevel, category = null) {
  // 品质权重随等级提高
  const lvl = monsterLevel
  const weights = {
    green:   Math.max(0, 60 - lvl * 1.5),
    blue:    Math.max(0, 25 + lvl * 0.5 - lvl * 0.8),
    purple:  lvl >= 5  ? Math.min(20, lvl * 0.4) : 0,
    gold:    lvl >= 15 ? Math.min(15, (lvl-15) * 0.3) : 0,
    red:     lvl >= 30 ? Math.min(8,  (lvl-30) * 0.15) : 0,
    rainbow: lvl >= 50 ? 2 : 0,
  }
  const pool = WEAPONS.filter(w => (!category || w.category === category))
  let total = 0
  const buckets = Object.entries(weights).map(([r, w]) => {
    total += w
    return { rarity: r, cumWeight: total }
  })
  const roll = Math.random() * total
  const chosenRarity = buckets.find(b => roll <= b.cumWeight)?.rarity ?? 'green'
  const candidates = pool.filter(w => w.rarity === chosenRarity)
  if (!candidates.length) return null
  return candidates[Math.floor(Math.random() * candidates.length)]
}
