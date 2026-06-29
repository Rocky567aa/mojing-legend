/**
 * HeroSkills.js — 全 16 英雄统一技能注册表 (M14)
 *
 * 把散落各处的"被动文字描述 + 扩展英雄主动技能"统一成**带类型的可执行数据**，
 * 供 HeroSkillSystem 解释执行。
 *
 * 结构：
 *   HERO_SKILLS[heroId] = {
 *     passive: { name, desc, effects: PassiveEffect[] },
 *     active:  { id, name, desc, key, cooldown, cast: ActiveCast }
 *   }
 *
 * ── PassiveEffect 类型 ─────────────────────────────────────────────
 *   { type: 'stat_mod',         stat, mul?, add? }      // init 时一次性改属性
 *   { type: 'damage_reduction', pct }                   // onTakeDamage 钩子
 *   { type: 'regen',            interval, amount }       // onTick 钩子
 *   { type: 'lifesteal_on_kill',pct }                    // onKill 钩子
 *   { type: 'burn_on_hit',      dps, dur }               // onAttack 钩子
 *   { type: 'freeze_on_hit',    chance, dur }            // onAttack 钩子
 *   { type: 'hit_stack_atk',    perStack, maxStacks, window } // onAttack 叠层
 *   { type: 'low_hp_atk',       maxBonus }               // 动态攻击（attack 内查询）
 *   { type: 'summon_on_kill',   chance, dur }            // onKill 钩子
 *   { type: 'mark_crit',        bonus, dur }             // onAttack 标记 → 暴击率
 *   { type: 'conditional_dr',   hpAbove, pct }           // onTakeDamage（高血减伤）
 *
 * ── ActiveCast 类型 ────────────────────────────────────────────────
 *   { type: 'aoe_damage',  mul, radius, element?, status? }
 *   { type: 'buff_self',   stat, mul, dur }              // 限时自身增益
 *   { type: 'heal',        pct }
 *   { type: 'dash_damage', mul, status? }                // 冲锋+范围伤害
 *   { type: 'multi_shot',  count, mul }                  // 多重打击
 *   { type: 'summon',      count, dur }                  // 召唤盟友
 *   { type: 'shield',      pct, dur }                    // 限时减伤护盾
 */

export const HERO_SKILLS = {

  // ══ 原版 8 英雄 ══════════════════════════════════════════════════════════
  kane: {
    passive: {
      name: '钢铁之躯', desc: '受到伤害 −20%（HP 加成已计入基础属性）',
      effects: [{ type: 'damage_reduction', pct: 0.20 }],
    },
    active: {
      id: 'iron_bulwark', name: '钢铁壁垒', key: 'SPACE',
      desc: '4 秒内受到伤害 −60%，免疫击退',
      cooldown: 12000, cast: { type: 'shield', pct: 0.60, dur: 4000 },
    },
  },
  vera: {
    passive: {
      name: '致命一击', desc: '暴击率 +25%、暴击伤害 ×2.5（已计入基础属性）',
      effects: [],
    },
    active: {
      id: 'shadow_strike', name: '影袭', key: 'SPACE',
      desc: '瞬步至目标并造成 ATK ×3.0 的必定暴击伤害',
      cooldown: 8000, cast: { type: 'dash_damage', mul: 3.0 },
    },
  },
  oren: {
    passive: {
      name: '寒霜亲和', desc: '攻击有几率冰冻目标 1.2 秒',
      effects: [{ type: 'freeze_on_hit', chance: 0.18, dur: 1200 }],
    },
    active: {
      id: 'frost_nova', name: '冰霜新星', key: 'SPACE',
      desc: '以自身为中心爆发寒冰，ATK ×2.0 范围伤害并冰冻 2 秒',
      cooldown: 10000, cast: { type: 'aoe_damage', mul: 2.0, radius: 130, element: 'ice', status: 'freeze' },
    },
  },
  lena: {
    passive: {
      name: '圣光眷顾', desc: '每 10 秒回复 15 HP',
      effects: [{ type: 'regen', interval: 10000, amount: 15 }],
    },
    active: {
      id: 'holy_light', name: '圣光术', key: 'SPACE',
      desc: '立即回复 40% 最大生命',
      cooldown: 15000, cast: { type: 'heal', pct: 0.40 },
    },
  },
  ella: {
    passive: {
      name: '自然亲和', desc: '食物回血 +50%（由药剂系统处理）',
      effects: [],
    },
    active: {
      id: 'thorn_bind', name: '荆棘缠绕', key: 'SPACE',
      desc: 'ATK ×1.8 范围伤害并使敌人减速',
      cooldown: 9000, cast: { type: 'aoe_damage', mul: 1.8, radius: 120, status: 'slow' },
    },
  },
  reg: {
    passive: {
      name: '龙血沸腾', desc: '移速 +15%，攻击附带燃烧',
      effects: [
        { type: 'stat_mod', stat: 'moveSpeed', mul: 1.15 },
        { type: 'burn_on_hit', dps: 6, dur: 3 },
      ],
    },
    active: {
      id: 'dragon_charge', name: '龙焰冲锋', key: 'SPACE',
      desc: '向前冲锋造成 ATK ×2.5 火属性伤害并点燃',
      cooldown: 9000, cast: { type: 'dash_damage', mul: 2.5, status: 'burn' },
    },
  },
  mag: {
    passive: {
      name: '诅咒精通', desc: '诅咒/暗影伤害 ×1.8',
      effects: [{ type: 'stat_mod', stat: 'atk', mul: 1.0 }], // flavor; curse handled per-element
    },
    active: {
      id: 'sacrifice', name: '献祭', key: 'SPACE',
      desc: 'ATK ×2.2 暗影范围伤害，吸取 30% 伤害回血',
      cooldown: 11000, cast: { type: 'aoe_damage', mul: 2.2, radius: 125, element: 'dark', lifesteal: 0.30 },
    },
  },
  thor: {
    passive: {
      name: '雷电掌控', desc: '攻击范围 +2 格',
      effects: [{ type: 'stat_mod', stat: 'atkRange', add: 2 }],
    },
    active: {
      id: 'thunder_pierce', name: '雷霆贯穿', key: 'SPACE',
      desc: '射出贯穿雷箭，对 4 个目标各造成 ATK ×2.0 伤害',
      cooldown: 8000, cast: { type: 'multi_shot', count: 4, mul: 2.0, element: 'lightning' },
    },
  },

  // ══ 扩展 8 英雄 ══════════════════════════════════════════════════════════
  runen: {
    passive: {
      name: '炼金天赋', desc: '每消灭 10 只怪物自动合成一瓶治疗药剂',
      effects: [{ type: 'auto_potion_on_kill', every: 10 }],
    },
    active: {
      id: 'blast_flask', name: '爆破药剂', key: 'SPACE',
      desc: 'ATK ×2.2 火属性范围伤害（半径 2.5 格）并施加燃烧 3 秒',
      cooldown: 6000, cast: { type: 'aoe_damage', mul: 2.2, radius: 125, element: 'fire', status: 'burn' },
    },
  },
  saya: {
    passive: {
      name: '元素共鸣', desc: '连续命中同一目标叠加伤害（最多 +75%）',
      effects: [{ type: 'hit_stack_atk', perStack: 0.15, maxStacks: 5, window: 3000 }],
    },
    active: {
      id: 'element_rotation', name: '元素轮转', key: 'SPACE',
      desc: 'ATK ×1.8 全属性范围爆发',
      cooldown: 7000, cast: { type: 'aoe_damage', mul: 1.8, radius: 135, element: 'all' },
    },
  },
  roal: {
    passive: {
      name: '圣盾庇护', desc: 'HP > 60% 时受到正面伤害 −25%',
      effects: [{ type: 'conditional_dr', hpAbove: 0.60, pct: 0.25 }],
    },
    active: {
      id: 'divine_aura', name: '神圣光环', key: 'SPACE',
      desc: '回复 25% 生命并获得 6 秒 40% 减伤',
      cooldown: 18000, cast: { type: 'heal', pct: 0.25, thenShield: { pct: 0.40, dur: 6000 } },
    },
  },
  naira: {
    passive: {
      name: '灵魂契约', desc: '召唤物 HP +30% / ATK +20%',
      effects: [{ type: 'summon_buff', hpMul: 1.30, atkMul: 1.20 }],
    },
    active: {
      id: 'summon_familiar', name: '召唤精灵', key: 'SPACE',
      desc: '召唤 3 只精灵协助作战，持续 15 秒',
      cooldown: 12000, cast: { type: 'summon', count: 3, dur: 15000 },
    },
  },
  dak: {
    passive: {
      name: '死灵亲和', desc: '击杀有 35% 概率召唤骷髅盟友（持续 20 秒）',
      effects: [{ type: 'summon_on_kill', chance: 0.35, dur: 20000 }],
    },
    active: {
      id: 'life_drain', name: '生命汲取', key: 'SPACE',
      desc: 'ATK ×2.0 暗影范围伤害，吸取 50% 伤害回血',
      cooldown: 10000, cast: { type: 'aoe_damage', mul: 2.0, radius: 120, element: 'dark', lifesteal: 0.50 },
    },
  },
  yingyue: {
    passive: {
      name: '气功修炼', desc: '连续命中叠加攻击力（最多 10 层 ×+60%）',
      effects: [{ type: 'hit_stack_atk', perStack: 0.06, maxStacks: 10, window: 2500 }],
    },
    active: {
      id: 'chi_blast', name: '气功爆发', key: 'SPACE',
      desc: '消耗全部气功层数，造成 ATK ×(1.5 + 层数 ×0.5) 范围真实伤害',
      cooldown: 8000, cast: { type: 'aoe_damage', mul: 1.5, radius: 120, scaleWithStacks: 0.5 },
    },
  },
  moke: {
    passive: {
      name: '嗜血狂暴', desc: 'HP 越低攻击力越高（最多 +80%）；击杀回 5% HP',
      effects: [
        { type: 'low_hp_atk', maxBonus: 0.80 },
        { type: 'lifesteal_on_kill', pct: 0.05 },
      ],
    },
    active: {
      id: 'blood_charge', name: '血怒冲锋', key: 'SPACE',
      desc: '向前冲锋造成 ATK ×2.8 物理伤害，命中回血',
      cooldown: 9000, cast: { type: 'dash_damage', mul: 2.8, lifesteal: 0.20 },
    },
  },
  aiwei: {
    passive: {
      name: '猎鹰标记', desc: '攻击过的目标被标记 5 秒，期间对其暴击率 +25%',
      effects: [{ type: 'mark_crit', bonus: 0.25, dur: 5000 }],
    },
    active: {
      id: 'triple_shot', name: '三矢齐发', key: 'SPACE',
      desc: '射出 3 支箭，对最多 3 个目标各造成 ATK ×1.6 伤害',
      cooldown: 7000, cast: { type: 'multi_shot', count: 3, mul: 1.6 },
    },
  },
}

/** 安全取技能，未定义英雄回退到 kane */
export function getHeroSkills(heroId) {
  return HERO_SKILLS[heroId] ?? HERO_SKILLS.kane
}
