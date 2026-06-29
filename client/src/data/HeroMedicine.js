/**
 * HeroMedicine.js — 英雄医药属性系统
 *
 * 每位英雄拥有独立的医药相关属性，影响：
 *   potionHeal      — 使用治疗药剂时，回血量倍率（1.0 = 100% 原始效果）
 *   poisonResist    — 中毒伤害抵抗率（0.0 = 无抗性，1.0 = 完全免疫）
 *   poisonAtk       — 施加毒性时，毒伤倍率（近战/投毒时触发）
 *   alchemyBonus    — 炼金/合成药剂时额外产出概率（0.0 = 无加成）
 *   medicineAtk     — 以药剂为武器的攻击加成（炼金术士专属高值；其他职业较低）
 *   medicineDef     — 预防性药剂的防御加成倍率（服用防御药时效果增幅）
 *   healingSkill    — 对他人施放治疗技能时，治疗量倍率（牧师/圣骑最高）
 *   debuffReduce    — 所有负面状态（毒/燃烧/冻结）持续时间缩短率
 *
 * 注意：
 *   - 这些属性在 CombatSystem / ItemSystem 中读取后乘以基础效果
 *   - 成长：每升 5 级，potionHeal / poisonResist 各 +0.02（由 CombatSystem 计算）
 */

// ── 属性默认值（无特殊属性的普通英雄） ────────────────────────────────
const DEFAULT_MED = {
  potionHeal:   1.00,
  poisonResist: 0.10,
  poisonAtk:    0.00,
  alchemyBonus: 0.00,
  medicineAtk:  0.00,
  medicineDef:  1.00,
  healingSkill: 0.00,
  debuffReduce: 0.05,
}

// ── 16 英雄医药属性表 ─────────────────────────────────────────────────
export const HERO_MEDICINE = {

  // ──────────────────────────────────────────────────────────────────────
  //  原版 8 英雄
  // ──────────────────────────────────────────────────────────────────────

  /** 卡恩 · 战士 — 粗糙体质，药效减半但毒性强耐 */
  kane: {
    ...DEFAULT_MED,
    potionHeal:   0.80,  // 皮糙肉厚，药效吸收差，回血仅 80%
    poisonResist: 0.30,  // 战场老兵，有一定毒性抵抗
    medicineDef:  1.20,  // 防御药效果略强
    debuffReduce: 0.15,  // 意志坚韧，负面状态时间缩短
    note: '体质蛮横，但对精细草药无感。防御药最有效。',
  },

  /** 薇拉 · 刺客 — 毒师，中毒免疫 + 施毒专家 */
  vera: {
    ...DEFAULT_MED,
    potionHeal:   0.90,
    poisonResist: 0.65,  // 长期与毒打交道，抵抗力高
    poisonAtk:    1.80,  // 施毒专家，毒伤 ×1.8
    alchemyBonus: 0.12,  // 调配毒剂有经验
    debuffReduce: 0.25,
    note: '施毒高手，自身毒伤减半，自制毒剂效力超强。',
  },

  /** 奥伦 · 法师 — 魔力加持，魔法药剂效果最强 */
  oren: {
    ...DEFAULT_MED,
    potionHeal:   1.10,  // 魔力渗透，药剂吸收效率高
    poisonResist: 0.15,
    alchemyBonus: 0.25,  // 魔法理论加成炼金
    medicineDef:  1.35,  // 魔法防御药效果显著
    debuffReduce: 0.20,  // 魔法知识理解解毒原理
    note: '理解药剂魔法本质，回血药和防御药效果最佳。',
  },

  /** 莉娜 · 牧师 — 医药之神，全方位最强治疗者 */
  lena: {
    ...DEFAULT_MED,
    potionHeal:   1.60,  // 神圣加持，药剂回血 ×1.6
    poisonResist: 0.50,  // 熟知毒理，抵抗中等
    alchemyBonus: 0.30,  // 圣水炼金，产量高
    medicineDef:  1.50,  // 防御药效果 ×1.5
    healingSkill: 1.80,  // 治疗技能效果全英雄最高
    debuffReduce: 0.35,  // 神圣净化，负面状态缩短 35%
    note: '神圣治愈者，全面最强医药属性。',
  },

  /** 艾拉 · 德鲁伊 — 草药专家，自然治愈 */
  ella: {
    ...DEFAULT_MED,
    potionHeal:   1.40,  // 草药知识深厚，天然药剂效果高
    poisonResist: 0.45,  // 与自然共生，毒性适应
    poisonAtk:    0.60,  // 可利用植物毒素
    alchemyBonus: 0.35,  // 草药炼金加成最高（来自自然知识）
    healingSkill: 1.20,  // 自然治愈技能强
    debuffReduce: 0.30,
    note: '草药大师，炼金产量高，自然毒素也擅用。',
  },

  /** 雷格 · 骑士 — 厚甲锁链，毒素从甲缝中过，抵抗力强 */
  reg: {
    ...DEFAULT_MED,
    potionHeal:   0.85,
    poisonResist: 0.40,  // 重甲减少毒素接触
    medicineDef:  1.40,  // 防御型药剂效果好
    debuffReduce: 0.20,
    note: '重甲防护，毒素难渗透，防御药最有效。',
  },

  /** 玛格 · 术士 — 黑魔法体质，治疗药无效但自带暗能量再生 */
  mag: {
    ...DEFAULT_MED,
    potionHeal:   0.60,  // 邪能体质，神圣/草药药剂相斥，回血差
    poisonResist: 0.20,
    poisonAtk:    1.20,  // 邪毒强化
    alchemyBonus: 0.20,  // 黑魔法炼金有一定加成
    debuffReduce: 0.15,
    note: '与神圣医药相斥，治疗效果最差，但毒剂更烈。',
  },

  /** 托尔 · 游侠 — 野外生存，草药使用熟练 */
  thor: {
    ...DEFAULT_MED,
    potionHeal:   1.15,
    poisonResist: 0.35,
    alchemyBonus: 0.15,  // 野外采药经验
    debuffReduce: 0.20,
    note: '野外生存老手，草药回血和采药均高于平均。',
  },

  // ──────────────────────────────────────────────────────────────────────
  //  扩展 6 英雄 (HeroData_Ext)
  // ──────────────────────────────────────────────────────────────────────

  /** 鲁恩 · 炼金术士 — 炼金圣手，药剂攻击 + 产量双高 */
  runen: {
    ...DEFAULT_MED,
    potionHeal:   1.25,  // 自制药剂品质高
    poisonResist: 0.30,
    poisonAtk:    1.40,  // 投毒弹高效
    alchemyBonus: 0.50,  // 全英雄炼金加成最高，药剂产量 ×1.5
    medicineAtk:  2.00,  // 药剂作为武器伤害翻倍（唯一达到 2.0 的英雄）
    medicineDef:  1.30,
    debuffReduce: 0.20,
    note: '炼金巅峰——药剂产量最高，投弹伤害最强，自制药效绝佳。',
  },

  /** 赛亚 · 元素使 — 元素体质，对应元素药效增强 */
  saya: {
    ...DEFAULT_MED,
    potionHeal:   1.05,
    poisonResist: 0.25,
    alchemyBonus: 0.18,  // 元素共鸣辅助炼金
    medicineDef:  1.25,  // 元素防护药效果好
    debuffReduce: 0.22,  // 元素知识帮助解除冻结/燃烧
    note: '元素共鸣加持，冰火雷防御药效果增幅明显。',
  },

  /** 罗尔 · 圣骑士 — 圣光体质，圣水治疗无敌 */
  roal: {
    ...DEFAULT_MED,
    potionHeal:   1.50,  // 圣光加持，回血药 ×1.5
    poisonResist: 0.55,  // 圣盾抵毒
    alchemyBonus: 0.20,  // 圣水炼金
    medicineDef:  1.45,  // 防御药效果高
    healingSkill: 1.40,  // 圣光治疗技能强（仅次于莉娜）
    debuffReduce: 0.30,  // 圣光净化
    note: '圣光守护，回血和治疗技能效果仅次于莉娜。',
  },

  /** 奈拉 · 召唤师 — 精灵亲和，自然药草效果加成 */
  naira: {
    ...DEFAULT_MED,
    potionHeal:   1.20,  // 精灵亲和，草药效果良好
    poisonResist: 0.30,
    alchemyBonus: 0.22,  // 精灵魔法辅助炼金
    healingSkill: 0.80,  // 可对召唤物施加治疗（0表示无，正值表示有效）
    debuffReduce: 0.18,
    note: '精灵亲和力让草药效果高于普通英雄，且可以为召唤物喂药。',
  },

  /** 达克 · 死灵法师 — 死灵体质，普通药无效，生命吸取代替 */
  dak: {
    ...DEFAULT_MED,
    potionHeal:   0.40,  // 半死灵体质，普通草药几乎无效
    poisonResist: 0.80,  // 与死亡亲近，毒性高度抵抗
    poisonAtk:    1.60,  // 死灵诅咒强化毒伤
    alchemyBonus: 0.25,  // 黑暗炼金加成
    medicineDef:  0.70,  // 防御药效果较差（与邪能相斥）
    debuffReduce: 0.40,  // 不死亲和，大多数负面状态缩短
    note: '普通药剂几乎无效，靠生命吸取续命；毒性和诅咒伤害极强。',
  },

  /** 影月 · 武僧 — 气功修炼，体内循环净化毒素 */
  yingyue: {
    ...DEFAULT_MED,
    potionHeal:   1.10,
    poisonResist: 0.50,  // 气功内息可排毒
    alchemyBonus: 0.08,
    medicineDef:  1.15,
    debuffReduce: 0.35,  // 气功冥想大幅缩短负面状态
    note: '气功内息强化毒性抵抗和状态净化，专注武道而非炼金。',
  },

  // ──────────────────────────────────────────────────────────────────────
  //  新增 2 英雄 (HeroData_Warriors)
  // ──────────────────────────────────────────────────────────────────────

  /** 莫克 · 狂战士 — 蛮力体质，药剂效果最差，但痛了自己扛 */
  moke: {
    ...DEFAULT_MED,
    potionHeal:   0.65,  // 蛮荒体质，代谢太快，药剂留不住
    poisonResist: 0.25,  // 经常受伤，但毒性抵抗不高
    medicineDef:  0.90,  // 防御药效果也差
    debuffReduce: 0.10,
    note: '药剂效果最差的英雄——但狂暴状态下靠自身嗜血回复，不需要太多药。',
  },

  /** 艾薇 · 神射手 — 猎人知识，毒箭和草药并用 */
  aiwei: {
    ...DEFAULT_MED,
    potionHeal:   1.10,
    poisonResist: 0.40,  // 猎人经验，识毒能力强
    poisonAtk:    1.30,  // 毒箭涂毒效果高
    alchemyBonus: 0.18,  // 猎人采药经验
    debuffReduce: 0.22,
    note: '猎人知识让毒箭更烈，草药知识也高于平均。',
  },
}

// ── 工具函数 ─────────────────────────────────────────────────────────────

/**
 * 获取英雄医药属性（含等级成长计算）
 * @param {string} heroId
 * @param {number} level  当前英雄等级（默认 1）
 * @returns {object} 计算后的医药属性
 */
export function getHeroMedicine(heroId, level = 1) {
  const base = HERO_MEDICINE[heroId]
  if (!base) return { ...DEFAULT_MED }

  // 每5级 potionHeal +0.02, poisonResist +0.02（上限 potionHeal=2.5, poisonResist=0.95）
  const growthTick = Math.floor(level / 5)
  return {
    ...base,
    potionHeal:   Math.min(2.50, base.potionHeal   + growthTick * 0.02),
    poisonResist: Math.min(0.95, base.poisonResist + growthTick * 0.02),
  }
}

/**
 * 计算实际治疗量
 * @param {string} heroId
 * @param {number} level
 * @param {number} basePotionHeal  药剂基础回血量
 * @returns {number} 实际回血量（向上取整）
 */
export function calcPotionHeal(heroId, level, basePotionHeal) {
  const med = getHeroMedicine(heroId, level)
  return Math.ceil(basePotionHeal * med.potionHeal)
}

/**
 * 计算实际毒性伤害（施加毒后每秒）
 * @param {string} heroId
 * @param {number} level
 * @param {number} basePoisonDps  基础毒伤/秒
 * @returns {number} 实际毒伤/秒
 */
export function calcPoisonAtk(heroId, level, basePoisonDps) {
  const med = getHeroMedicine(heroId, level)
  if (med.poisonAtk === 0) return 0
  return Math.ceil(basePoisonDps * med.poisonAtk)
}

/**
 * 计算受到毒伤（承受方）
 * @param {string} heroId
 * @param {number} level
 * @param {number} incomingPoisonDps  攻击方毒伤/秒
 * @returns {number} 实际受到毒伤/秒
 */
export function calcPoisonReceived(heroId, level, incomingPoisonDps) {
  const med = getHeroMedicine(heroId, level)
  return Math.ceil(incomingPoisonDps * (1 - med.poisonResist))
}

/**
 * 汇总展示用：返回英雄医药属性评级（用于 UI 展示）
 * @param {string} heroId
 * @returns {{ grade: string, stars: number, note: string }}
 */
export function getHeroMedicineGrade(heroId) {
  const med = HERO_MEDICINE[heroId]
  if (!med) return { grade: 'D', stars: 1, note: '无医药专长' }

  const score = (
    med.potionHeal   * 20 +
    med.poisonResist * 15 +
    med.alchemyBonus * 30 +
    med.healingSkill * 25 +
    med.debuffReduce * 10
  )

  if (score >= 60) return { grade: 'S', stars: 5, note: med.note }
  if (score >= 45) return { grade: 'A', stars: 4, note: med.note }
  if (score >= 30) return { grade: 'B', stars: 3, note: med.note }
  if (score >= 15) return { grade: 'C', stars: 2, note: med.note }
  return              { grade: 'D', stars: 1, note: med.note }
}
