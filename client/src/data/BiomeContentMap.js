/**
 * BiomeContentMap.js — 索引文件，合并三部分群系配置
 */
import { BIOME_CONTENT_A } from './BiomeContentMap_A.js'
import { BIOME_CONTENT_B } from './BiomeContentMap_B.js'
import { BIOME_CONTENT_C } from './BiomeContentMap_C.js'

export const BIOME_CONTENT = {
  ...BIOME_CONTENT_A,
  ...BIOME_CONTENT_B,
  ...BIOME_CONTENT_C,
}

export { BIOME_CONTENT_A, BIOME_CONTENT_B, BIOME_CONTENT_C }

/**
 * 获取指定群系的完整内容配置
 * @param {number} biomeId  0-20
 */
export function getBiomeContent(biomeId) {
  return BIOME_CONTENT[biomeId] ?? null
}

/**
 * 获取指定群系的所有可食用蘑菇
 */
export function getEdibleMushrooms(biomeId) {
  return (BIOME_CONTENT[biomeId]?.mushrooms ?? []).filter(m => m.type === 'edible')
}

/**
 * 获取指定群系的所有有毒蘑菇
 */
export function getToxicMushrooms(biomeId) {
  return (BIOME_CONTENT[biomeId]?.mushrooms ?? []).filter(m => m.type === 'toxic')
}

/**
 * 获取指定群系的所有伪装怪物
 */
export function getDisguisedMonsters(biomeId) {
  return BIOME_CONTENT[biomeId]?.disguisedMonsters ?? []
}

/**
 * 获取指定群系的所有Boss
 * @param {string} tier 'field'|'area'|'zone'|undefined (undefined = all)
 */
export function getBosses(biomeId, tier) {
  const bosses = BIOME_CONTENT[biomeId]?.bosses ?? []
  return tier ? bosses.filter(b => b.tier === tier) : bosses
}
