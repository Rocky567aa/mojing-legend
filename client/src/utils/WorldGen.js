/**
 * WorldGen.js — 魔晶传说世界生成器
 *
 * 世界规模：1.3亿 m² / 2850×2850 格 / 6大生物群系
 *
 * 算法分层：
 * 1. Voronoi 生物群系划分（带域扩散权重）
 *    → 每个群系有多个种子点，用带噪扰的距离计算决定边界
 *    → 种子点布局经过人工调整，确保 30/15/15/15/15/10% 面积比
 *
 * 2. Simplex Noise（两用途）
 *    a. 边界扰动（Domain Warping）：柔化群系边界，消除硬边
 *    b. 地形高度图（±3格 Z轴起伏）
 *    c. 矿脉/矿巢分布（独立高频噪声）
 *
 * 3. 矿巢系统（Ore Vein Clusters）
 *    → 每个群系有专属矿石类型和密度参数
 *    → 矿巢呈高斯分布团状，而非均匀随机
 *    → 神圣遗迹的混沌原石极低概率，约 0.2%
 *
 * 生物群系 ID：
 *   0=草原  1=火焰峡谷  2=永冻峡湾  3=裂空高地  4=幽暗地穴  5=神圣遗迹
 *
 * 瓦片类型 ID（对应 WorldScene.TILE）：
 *   地面：GRASS=0, COBBLE=1, OBSIDIAN=2, LAVA_CRACK=3, ICE=4, FROST_STONE=5,
 *         SCORCHED=6, LIGHTNING=7, VOID=8, DARK_CRYSTAL=9, MARBLE=10, RUNE=11
 *   矿石：FIRE=12, ICE=13, THUNDER=14, DARK=15, HOLY=16, CHAOS=17
 */

import { SimplexNoise } from './SimplexNoise.js'

// ── 世界常量 ────────────────────────────────────────────────────────────────
export const WORLD_CONFIG = {
  TILES: 2850,         // 世界网格宽高（格）
  TILE_METERS: 4,      // 每格 = 4m × 4m
  CHUNK_SIZE: 32,      // 区块大小（格）
  CHUNKS: 89,          // 总区块数（宽/高）
  VISIBLE_CHUNKS: 7,   // 可见区块范围（7×7）
  SPAWN: { x: 1425, y: 1425 }, // 出生点（中心）
}

// ── 生物群系定义 ──────────────────────────────────────────────────────────────
export const BIOME = {
  GRASSLAND: 0,
  FIRE_VALLEY: 1,
  FROST_FJORD: 2,
  THUNDER_HIGHLAND: 3,
  DARK_CAVERN: 4,
  HOLY_RUINS: 5,
}

const BIOME_NAMES = {
  0: '🌿 中央草原',
  1: '🌋 火焰峡谷',
  2: '🏔️ 永冻峡湾',
  3: '⛈️ 裂空高地',
  4: '🌑 幽暗地穴',
  5: '🏛️ 神圣遗迹',
}

// 每个群系有多个 Voronoi 种子点（归一化坐标 0-1）
// 多个种子 = 自然延展的区域形状，而非单一圆形
// 草原种子多 → 覆盖中央 30%；其他区域靠近边缘 15% 各；神圣遗迹最远 10%
const BIOME_SEEDS = [
  // GRASSLAND (目标 30%，中心密集)
  { biome: 0, x: 0.50, y: 0.50 },
  { biome: 0, x: 0.45, y: 0.55 },
  { biome: 0, x: 0.55, y: 0.45 },
  { biome: 0, x: 0.48, y: 0.42 },
  { biome: 0, x: 0.52, y: 0.58 },

  // FIRE_VALLEY (目标 15%，右下区)
  { biome: 1, x: 0.78, y: 0.72 },
  { biome: 1, x: 0.88, y: 0.65 },
  { biome: 1, x: 0.82, y: 0.82 },

  // FROST_FJORD (目标 15%，左上区)
  { biome: 2, x: 0.18, y: 0.22 },
  { biome: 2, x: 0.12, y: 0.32 },
  { biome: 2, x: 0.28, y: 0.18 },

  // THUNDER_HIGHLAND (目标 15%，右上区)
  { biome: 3, x: 0.82, y: 0.22 },
  { biome: 3, x: 0.72, y: 0.15 },
  { biome: 3, x: 0.92, y: 0.30 },

  // DARK_CAVERN (目标 15%，左下区)
  { biome: 4, x: 0.18, y: 0.78 },
  { biome: 4, x: 0.12, y: 0.68 },
  { biome: 4, x: 0.28, y: 0.88 },

  // HOLY_RUINS (目标 10%，散布角落，最远 + 最少)
  { biome: 5, x: 0.92, y: 0.08 },
  { biome: 5, x: 0.08, y: 0.92 },
]

// ── 瓦片系统 ──────────────────────────────────────────────────────────────────
export const TILE = {
  // 静态地面
  GRASS: 0, COBBLESTONE: 1,
  OBSIDIAN: 2, LAVA_CRACK: 3,
  ICE: 4, FROST_STONE: 5,
  SCORCHED_ROCK: 6, LIGHTNING_SCAR: 7,
  VOID_STONE: 8, DARK_CRYSTAL_FLOOR: 9,
  MARBLE: 10, RUNE_STONE: 11,
  // 矿石
  FIRE_ORE: 12, ICE_ORE: 13,
  THUNDER_ORE: 14, DARK_ORE: 15,
  HOLY_ORE: 16, CHAOS_ORE: 17,
  // 动态地面（有动画效果）
  LAVA_FLOW: 18,        // 熔岩流（脉冲橙红）
  FROST_GLOW: 19,       // 冰霜发光地（闪烁）
  THUNDER_STONE: 20,    // 雷电石（电弧闪）
  MUSHROOM_GLOW: 21,    // 发光菌落地（慢脉冲）
  RUNE_GLOW: 22,        // 发光符文地（金色波纹）
  STREAM: 23,           // 溪流（蓝色涌动）
  // 装饰地面
  MOSSY_STONE: 24,      // 苔藓石（草原变体）
  CRACKED_GROUND: 25,   // 龟裂地面（火焰区变体）
  SNOW_PATCH: 26,       // 积雪地面（冰原变体）
  DARK_SLIME: 27,       // 暗影地浆（地穴变体）
}

// 每个生物群系的地面瓦片配置（含动态瓦片权重 + 装饰物规则）
const BIOME_TILES = {
  [BIOME.GRASSLAND]: {
    // 基础地面：5种变体（含动态溪流和苔藓石）
    base: [TILE.GRASS, TILE.GRASS, TILE.GRASS, TILE.COBBLESTONE, TILE.MOSSY_STONE],
    animated: [TILE.STREAM],         // 动态地面（低概率出现）
    animatedThreshold: 0.72,         // Noise > 阈值时出现动态地面
    ore: TILE.FIRE_ORE,
    oreDensity: 0.018,
    oreVeinScale: 0.06,
    oreVeinThreshold: 0.55,
    // 装饰物规则：[DECO类型, 出现概率]
    decoRules: [
      { deco: 0,  prob: 0.008 },   // TORCH 火把
      { deco: 1,  prob: 0.005 },   // MAGIC_LANTERN 灯笼
      { deco: 2,  prob: 0.004 },   // BANNER 旗帜
      { deco: 3,  prob: 0.010 },   // BARREL 木桶
      { deco: 5,  prob: 0.012 },   // MAGIC_HERB 草药（草原最多）
      { deco: 14, prob: 0.004 },   // MAGIC_WELL 水井
    ],
  },
  [BIOME.FIRE_VALLEY]: {
    base: [TILE.OBSIDIAN, TILE.OBSIDIAN, TILE.LAVA_CRACK, TILE.COBBLESTONE, TILE.CRACKED_GROUND],
    animated: [TILE.LAVA_FLOW],
    animatedThreshold: 0.55,
    ore: TILE.FIRE_ORE,
    oreDensity: 0.055,
    oreVeinScale: 0.08,
    oreVeinThreshold: 0.45,
    decoRules: [
      { deco: 0,  prob: 0.010 },   // TORCH（火把，火焰区多）
      { deco: 9,  prob: 0.015 },   // LAVA_VENT 岩浆喷口
      { deco: 6,  prob: 0.007 },   // IRON_HOOK
      { deco: 7,  prob: 0.006 },   // SKULL_POLE
    ],
  },
  [BIOME.FROST_FJORD]: {
    base: [TILE.ICE, TILE.ICE, TILE.FROST_STONE, TILE.COBBLESTONE, TILE.SNOW_PATCH],
    animated: [TILE.FROST_GLOW],
    animatedThreshold: 0.60,
    ore: TILE.ICE_ORE,
    oreDensity: 0.05,
    oreVeinScale: 0.07,
    oreVeinThreshold: 0.48,
    decoRules: [
      { deco: 10, prob: 0.018 },   // ICE_SPIKE 冰刺（最多）
      { deco: 1,  prob: 0.006 },   // MAGIC_LANTERN
      { deco: 4,  prob: 0.005 },   // CRYSTAL_PILLAR
    ],
  },
  [BIOME.THUNDER_HIGHLAND]: {
    base: [TILE.SCORCHED_ROCK, TILE.SCORCHED_ROCK, TILE.LIGHTNING_SCAR, TILE.COBBLESTONE, TILE.CRACKED_GROUND],
    animated: [TILE.THUNDER_STONE],
    animatedThreshold: 0.58,
    ore: TILE.THUNDER_ORE,
    oreDensity: 0.05,
    oreVeinScale: 0.075,
    oreVeinThreshold: 0.48,
    decoRules: [
      { deco: 11, prob: 0.016 },   // THUNDER_ROD 雷电柱（最多）
      { deco: 6,  prob: 0.008 },   // IRON_HOOK
      { deco: 8,  prob: 0.006 },   // RUNE_STONE
      { deco: 7,  prob: 0.005 },   // SKULL_POLE
    ],
  },
  [BIOME.DARK_CAVERN]: {
    base: [TILE.VOID_STONE, TILE.VOID_STONE, TILE.DARK_CRYSTAL_FLOOR, TILE.VOID_STONE, TILE.DARK_SLIME],
    animated: [TILE.MUSHROOM_GLOW],
    animatedThreshold: 0.52,
    ore: TILE.DARK_ORE,
    oreDensity: 0.052,
    oreVeinScale: 0.07,
    oreVeinThreshold: 0.47,
    decoRules: [
      { deco: 12, prob: 0.020 },   // DARK_MUSHROOM 暗影菌（最多）
      { deco: 7,  prob: 0.010 },   // SKULL_POLE
      { deco: 1,  prob: 0.006 },   // MAGIC_LANTERN（紫色）
      { deco: 4,  prob: 0.005 },   // CRYSTAL_PILLAR
    ],
  },
  [BIOME.HOLY_RUINS]: {
    base: [TILE.MARBLE, TILE.MARBLE, TILE.RUNE_STONE, TILE.COBBLESTONE, TILE.RUNE_GLOW],
    animated: [TILE.RUNE_GLOW],
    animatedThreshold: 0.65,
    ore: TILE.HOLY_ORE,
    oreDensity: 0.045,
    oreVeinScale: 0.09,
    oreVeinThreshold: 0.50,
    rareOre: TILE.CHAOS_ORE,
    rareDensity: 0.002,
    rareVeinScale: 0.12,
    rareVeinThreshold: 0.72,
    decoRules: [
      { deco: 13, prob: 0.012 },   // HOLY_PILLAR 圣光石柱
      { deco: 8,  prob: 0.015 },   // RUNE_STONE 古代石碑
      { deco: 4,  prob: 0.008 },   // CRYSTAL_PILLAR
      { deco: 1,  prob: 0.008 },   // MAGIC_LANTERN（金色）
      { deco: 2,  prob: 0.006 },   // BANNER 旗帜
    ],
  },
}

// ── 西方魔法配色 ─────────────────────────────────────────────────────────────
export const TILE_COLORS = {
  [TILE.GRASS]:           { top: 0x2d5a1b, left: 0x1a3a0f, right: 0x3d7a25 },
  [TILE.COBBLESTONE]:     { top: 0x555566, left: 0x333344, right: 0x666677 },
  [TILE.OBSIDIAN]:        { top: 0x1a1a2e, left: 0x0a0a1a, right: 0x2a2a40 },
  [TILE.LAVA_CRACK]:      { top: 0x3d1100, left: 0x1a0500, right: 0x5a1a00 },
  [TILE.ICE]:             { top: 0x99ccee, left: 0x6699bb, right: 0xaaddff },
  [TILE.FROST_STONE]:     { top: 0x7799aa, left: 0x556677, right: 0x88aacc },
  [TILE.SCORCHED_ROCK]:   { top: 0x3a3a2a, left: 0x222215, right: 0x4a4a35 },
  [TILE.LIGHTNING_SCAR]:  { top: 0x4a3a0a, left: 0x2a2005, right: 0x5a4a15 },
  [TILE.VOID_STONE]:      { top: 0x0e0a1e, left: 0x060410, right: 0x160a2e },
  [TILE.DARK_CRYSTAL_FLOOR]: { top: 0x200a35, left: 0x100520, right: 0x300a4a },
  [TILE.MARBLE]:          { top: 0xddddd0, left: 0xaaaaaa, right: 0xeeeeee },
  [TILE.RUNE_STONE]:      { top: 0xbbaa88, left: 0x887766, right: 0xccbb99 },
  // 矿石：颜色更鲜艳
  [TILE.FIRE_ORE]:        { top: 0xcc3300, left: 0x881100, right: 0xff4400 },
  [TILE.ICE_ORE]:         { top: 0x2299cc, left: 0x115588, right: 0x44aaee },
  [TILE.THUNDER_ORE]:     { top: 0xddbb00, left: 0x997700, right: 0xffdd22 },
  [TILE.DARK_ORE]:        { top: 0x550077, left: 0x330055, right: 0x7700aa },
  [TILE.HOLY_ORE]:        { top: 0xddcc66, left: 0x998833, right: 0xffee88 },
  [TILE.CHAOS_ORE]:       { top: 0x9966ff, left: 0x6633cc, right: 0xcc99ff },
  // 动态地面（base 颜色，动画层叠加）
  [TILE.LAVA_FLOW]:       { top: 0x551100, left: 0x330800, right: 0x772200, animated: true, animColor: 0xff4400 },
  [TILE.FROST_GLOW]:      { top: 0x88aacc, left: 0x6688aa, right: 0x99bbdd, animated: true, animColor: 0xaaddff },
  [TILE.THUNDER_STONE]:   { top: 0x3a3020, left: 0x221810, right: 0x4a4030, animated: true, animColor: 0xffdd22 },
  [TILE.MUSHROOM_GLOW]:   { top: 0x180a28, left: 0x0a0518, right: 0x220a38, animated: true, animColor: 0x8800cc },
  [TILE.RUNE_GLOW]:       { top: 0xccccbb, left: 0x999988, right: 0xddddcc, animated: true, animColor: 0xffcc00 },
  [TILE.STREAM]:          { top: 0x1a4a6a, left: 0x0d2a3d, right: 0x2a6a8a, animated: true, animColor: 0x44aaee },
  // 装饰地面变体
  [TILE.MOSSY_STONE]:     { top: 0x3a5a2a, left: 0x223318, right: 0x4a6a3a },
  [TILE.CRACKED_GROUND]:  { top: 0x2a2010, left: 0x180c08, right: 0x3a2a18 },
  [TILE.SNOW_PATCH]:      { top: 0xddddee, left: 0xaaaacc, right: 0xeeeeff },
  [TILE.DARK_SLIME]:      { top: 0x0a1a10, left: 0x050c08, right: 0x102218 },
}

// 矿石信息（名称、发光色、图标、区域标签）
export const ORE_INFO = {
  [TILE.FIRE_ORE]:   { name: '火玄矿',   glow: 0xff4400, icon: '🔴', drops: 'fire_ore' },
  [TILE.ICE_ORE]:    { name: '寒冰晶矿', glow: 0x44aaee, icon: '🔵', drops: 'ice_ore' },
  [TILE.THUNDER_ORE]:{ name: '雷纹矿',   glow: 0xffdd22, icon: '⚡', drops: 'thunder_ore' },
  [TILE.DARK_ORE]:   { name: '暗影矿脉', glow: 0x7700aa, icon: '🌑', drops: 'dark_ore' },
  [TILE.HOLY_ORE]:   { name: '圣光矿',   glow: 0xffee88, icon: '✨', drops: 'holy_ore' },
  [TILE.CHAOS_ORE]:  { name: '混沌原石', glow: 0xcc99ff, icon: '🌈', drops: 'chaos_ore' },
}

// ── WorldGen 主类 ─────────────────────────────────────────────────────────────
export class WorldGen {
  /**
   * @param {number} seed - 世界种子（服务器下发，同种子 = 同地形）
   */
  constructor(seed) {
    this.seed = seed
    // 四个独立噪声实例，用途不同，避免相关性
    this.biomeWarpNoise = new SimplexNoise(seed ^ 0xdeadbeef)   // Voronoi 边界扰动
    this.heightNoise    = new SimplexNoise(seed ^ 0xcafebabe)   // 地形高度
    this.oreNoise       = new SimplexNoise(seed ^ 0xbabaf00d)   // 主矿脉分布
    this.rareOreNoise   = new SimplexNoise(seed ^ 0x1337c0de)   // 稀有矿石（混沌原石）
    this.detailNoise    = new SimplexNoise(seed ^ 0xf00dcafe)   // 地面细节变体

    // 预计算 Voronoi 种子的绝对坐标
    const T = WORLD_CONFIG.TILES
    this.voronoiSeeds = BIOME_SEEDS.map(s => ({
      biome: s.biome,
      x: s.x * T,
      y: s.y * T,
    }))
  }

  // ── 生物群系 ──────────────────────────────────────────────────────────────

  /**
   * 获取指定格子的生物群系 ID
   * 使用 Domain Warping（噪声扰动坐标）软化群系边界
   *
   * @param {number} wx - 世界格坐标 X
   * @param {number} wy - 世界格坐标 Y
   * @returns {number} BIOME ID
   */
  getBiome(wx, wy) {
    // Domain Warping：用噪声偏移查询坐标，让边界不再是直线
    const warpScale = 0.003   // 扰动频率（低 = 大范围扭曲）
    const warpAmplitude = 120 // 扰动强度（格数）
    const warpX = this.biomeWarpNoise.noise2D(wx * warpScale, wy * warpScale) * warpAmplitude
    const warpY = this.biomeWarpNoise.noise2D(wx * warpScale + 4.2, wy * warpScale + 1.7) * warpAmplitude

    const qx = wx + warpX
    const qy = wy + warpY

    // 找最近的 Voronoi 种子
    let minDist = Infinity, nearest = 0
    for (const seed of this.voronoiSeeds) {
      const dx = qx - seed.x
      const dy = qy - seed.y
      const dist = dx * dx + dy * dy // 用平方距离，避免 sqrt 开销
      if (dist < minDist) {
        minDist = dist
        nearest = seed.biome
      }
    }
    return nearest
  }

  /**
   * 获取生物群系名称
   */
  getBiomeName(biome) {
    return BIOME_NAMES[biome] || '未知区域'
  }

  // ── 地形高度 ──────────────────────────────────────────────────────────────

  /**
   * 获取地形高度偏移（-3 ~ +3 格，Z轴起伏）
   * 用于等距渲染中的视觉高度差
   *
   * @returns {number} -3 ~ 3 整数
   */
  getHeight(wx, wy) {
    const raw = this.heightNoise.fbm(wx * 0.002, wy * 0.002, 4, 2.0, 0.5)
    return Math.round(raw * 3) // 归一化到 [-3, 3]
  }

  // ── 瓦片生成 ──────────────────────────────────────────────────────────────

  /**
   * 生成单个格子的瓦片类型（含动态瓦片 + 装饰物）
   *
   * @returns {{ tile, biome, height, deco: number|null, animated: boolean }}
   */
  generateTile(wx, wy) {
    const biome = this.getBiome(wx, wy)
    const cfg = BIOME_TILES[biome]
    const height = this.getHeight(wx, wy)

    // 1. 稀有矿石（混沌原石，仅神圣遗迹）
    if (cfg.rareOre !== undefined) {
      const rareVein = this.rareOreNoise.noise2D(wx * cfg.rareVeinScale, wy * cfg.rareVeinScale)
      if (rareVein > cfg.rareVeinThreshold) {
        const r = this._hash(wx, wy, 0x9999)
        if (r < cfg.rareDensity / 0.3) {
          return { tile: cfg.rareOre, biome, height, deco: null, animated: false }
        }
      }
    }

    // 2. 普通矿脉
    const oreVein = this.oreNoise.noise2D(wx * cfg.oreVeinScale, wy * cfg.oreVeinScale)
    if (oreVein > cfg.oreVeinThreshold) {
      const r = this._hash(wx, wy, 0x7777)
      const veinStrength = (oreVein - cfg.oreVeinThreshold) / (1 - cfg.oreVeinThreshold)
      const effectiveDensity = cfg.oreDensity * (0.4 + 0.6 * veinStrength)
      if (r < effectiveDensity) {
        return { tile: cfg.ore, biome, height, deco: null, animated: false }
      }
    }

    // 3. 装饰物（在地面瓦片上叠加）
    let deco = null
    if (cfg.decoRules) {
      const decoHash = this._hash(wx, wy, 0xdec0)
      const decoNoise = this.detailNoise.noise2D(wx * 0.05, wy * 0.05)
      // 装饰物不能生成在矿脉中心（避免重叠）
      if (oreVein < cfg.oreVeinThreshold - 0.1) {
        let cumulative = 0
        for (const rule of cfg.decoRules) {
          cumulative += rule.prob
          if (decoHash < cumulative) {
            deco = rule.deco
            break
          }
        }
      }
    }

    // 4. 动态地面（在噪声高值区域出现）
    let tileType
    let animated = false
    if (cfg.animated) {
      const animNoise = this.detailNoise.noise2D(wx * 0.04, wy * 0.04)
      if (animNoise > cfg.animatedThreshold && !deco) {
        tileType = cfg.animated[0]
        animated = true
        return { tile: tileType, biome, height, deco: null, animated: true }
      }
    }

    // 5. 基础地面（细节变体）
    const detail = this.detailNoise.noise2D(wx * 0.1, wy * 0.1)
    const detailNorm = (detail + 1) / 2
    const baseArr = cfg.base
    const idx = Math.floor(detailNorm * baseArr.length)
    tileType = baseArr[Math.min(idx, baseArr.length - 1)]

    return { tile: tileType, biome, height, deco, animated: false }
  }

  /**
   * 生成完整区块（32×32 格）
   *
   * @param {number} cx - 区块坐标 X
   * @param {number} cy - 区块坐标 Y
   * @returns {Array<Array<{tile, biome, height}>>} 32×32 二维数组
   */
  generateChunk(cx, cy) {
    const CHUNK = WORLD_CONFIG.CHUNK_SIZE
    const tiles = []
    for (let r = 0; r < CHUNK; r++) {
      tiles[r] = []
      for (let c = 0; c < CHUNK; c++) {
        const wx = cx * CHUNK + c
        const wy = cy * CHUNK + r
        tiles[r][c] = this.generateTile(wx, wy)
      }
    }
    return tiles
  }

  // ── 工具函数 ──────────────────────────────────────────────────────────────

  /**
   * 快速确定性哈希 [0, 1)
   * 用于矿石密度随机，避免 Math.random()（不可复现）
   */
  _hash(x, y, salt = 0) {
    let h = (x * 374761393 + y * 1120397291 + salt + this.seed) >>> 0
    h ^= h >>> 13
    h = Math.imul(h, 0x45d9f3b) >>> 0
    h ^= h >>> 16
    return (h >>> 0) / 0xffffffff
  }

  /**
   * 检查某格是否为矿石（方便交互系统调用）
   */
  isOre(tile) {
    return tile >= TILE.FIRE_ORE && tile <= TILE.CHAOS_ORE
  }
}

// 导出辅助常量（方便其他文件引用）
export { BIOME_NAMES }
