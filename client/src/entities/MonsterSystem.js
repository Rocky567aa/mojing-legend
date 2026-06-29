/**
 * MonsterSystem — 怪物生成与 AI
 * 6个群系 × 3种怪物；AI：游荡 → 仇恨 → 攻击
 * 坐标系：worldContainer-local（与 tileToScreen 输出一致）
 */
import { BIOME } from '../utils/WorldGen.js'

const M = (id, name, shape, color, glow, hp, atk, spd, aggro, atkR, cd, density, xp, drops) =>
  ({ id, name, shape, color, glowColor: glow, hp, atk, speed: spd, aggroRange: aggro,
     attackRange: atkR, attackCooldown: cd, density, xp, drops })

const D = (item, itemName, color, chance, count = 1) => ({ item, itemName, color, chance, count })

export const BIOME_MONSTERS = {
  [BIOME.GRASSLAND]: [
    M('wolf','草原狼','wolf', 0x778866,0xaabb55, 40, 6,55,160,42,1800,0.007,5,
      [D('grass_ore','草地晶',0x88cc44,0.65), D('herb','草药',0x44ff44,0.4)]),
    M('thorn','荆棘精灵','sprite',0x33bb44,0x44ff44, 28, 9,38,130,36,1500,0.005,4,
      [D('herb','草药',0x44ff44,0.75)]),
    M('golem_e','土元素傀儡','golem', 0x886644,0xcc9955,110,14,26,120,50,2800,0.003,14,
      [D('stone_ore','碎石晶',0x998877,0.8), D('grass_ore','草地晶',0x88cc44,0.3)]),
  ],
  [BIOME.FIRE_VALLEY]: [
    M('lizard','熔岩蜥蜴','lizard',0xff4400,0xff8800, 55,11,60,150,40,1600,0.006,8,
      [D('fire_ore','火焰晶',0xff4400,0.70)]),
    M('goblin','火焰地精','goblin',0xcc2200,0xff3300, 35,13,50,165,36,1400,0.007,7,
      [D('fire_ore','火焰晶',0xff4400,0.5), D('coal','黑煤晶',0x444444,0.6)]),
    M('demon_f','炎魔使者','demon', 0xee1100,0xff6600,150,20,35,190,50,2200,0.003,20,
      [D('fire_ore','火焰晶',0xff4400,0.9), D('rare_gem','火焰魔晶',0xff0066,0.2)]),
  ],
  [BIOME.FROST_FJORD]: [
    M('ice_sprite','霜冰精灵','sprite',0x88ccff,0xaaddff, 35, 8,48,140,38,1700,0.006,5,
      [D('frost_ore','冰霜晶',0x88ccff,0.65)]),
    M('frost_bear','冰熊魂灵','bear',  0xbbddff,0xddeeff,130,16,30,135,50,2400,0.004,16,
      [D('frost_ore','冰霜晶',0x88ccff,0.8), D('ice_shard','冰晶碎片',0xccffff,0.4)]),
    M('undead_f','永冻亡灵','undead', 0x4466aa,0x6688cc, 75,12,38,170,42,2000,0.005,11,
      [D('frost_ore','冰霜晶',0x88ccff,0.55)]),
  ],
  [BIOME.THUNDER_HIGHLAND]: [
    M('eagle','风暴鹰','bird',  0xeedd44,0xffff00, 50,10,75,200,36,1300,0.005,9,
      [D('thunder_ore','雷电晶',0xffff00,0.6)]),
    M('t_golem','雷石傀儡','golem', 0x999944,0xdddd44,160,18,22,110,52,3000,0.003,18,
      [D('thunder_ore','雷电晶',0xffff00,0.85), D('rare_gem','雷霆魔晶',0xffee00,0.15)]),
    M('serpent','电弧蛇精','snake', 0xaaee44,0xddff44, 65,13,65,180,38,1500,0.005,10,
      [D('thunder_ore','雷电晶',0xffff00,0.65)]),
  ],
  [BIOME.DARK_CAVERN]: [
    M('bat','暗影蝙蝠','bat',   0x660088,0x9900cc, 30, 8,80,200,32,1200,0.008,5,
      [D('dark_ore','暗影晶',0x9900cc,0.55)]),
    M('ghost','幽魂战士','ghost', 0x8844aa,0xaa66cc, 80,15,40,220,45,2000,0.005,13,
      [D('dark_ore','暗影晶',0x9900cc,0.7), D('soul_shard','灵魂碎片',0xcc44ff,0.35)]),
    M('dark_demon','黑暗恶魔','demon', 0x440022,0x880044,200,24,30,180,52,2500,0.002,25,
      [D('dark_ore','暗影晶',0x9900cc,0.9), D('rare_gem','暗影魔晶',0xcc00ff,0.25)]),
  ],
  [BIOME.HOLY_RUINS]: [
    M('guardian','遗迹守卫','golem', 0xddcc88,0xffeeaa, 90,13,32,145,48,2200,0.005,12,
      [D('holy_ore','神圣晶',0xffee88,0.7)]),
    M('angel_c','腐化天使','angel', 0xffaaaa,0xff8888,120,18,45,200,44,1800,0.004,17,
      [D('holy_ore','神圣晶',0xffee88,0.75), D('rare_gem','堕落圣晶',0xff88cc,0.2)]),
    M('colossus','远古魔像','golem', 0xbbaa66,0xddcc88,280,28,18,130,55,3200,0.0015,30,
      [D('holy_ore','神圣晶',0xffee88,0.9), D('rare_gem','神器碎片',0xffffff,0.3)]),
  ],

  // ── 15 new biomes ────────────────────────────────────────────────────────
  [BIOME.CORRUPT_SWAMP]: [
    M('swamp_slug','腐化蛞蝓','snake', 0x2d4a1a,0x44cc22, 55,9,38,140,40,1800,0.006,6,
      [D('dark_ore','暗影矿',0x9900cc,0.6), D('toxic_ore','毒素矿',0x44cc44,0.45)]),
    M('bog_ghost','沼泽幽灵','ghost', 0x1a3322,0x22aa44, 70,12,42,180,42,2000,0.005,10,
      [D('toxic_ore','毒素矿',0x44cc44,0.65)]),
    M('swamp_titan','腐木巨兽','golem', 0x1a2a10,0x2a5520,200,22,24,150,52,2800,0.002,22,
      [D('toxic_ore','毒素矿',0x44cc44,0.8), D('dark_ore','暗影矿',0x9900cc,0.4)]),
  ],
  [BIOME.CRYSTAL_CAVES]: [
    M('gem_sprite','宝石精灵','sprite',0x00eeff,0x44ffff, 40,10,55,155,36,1500,0.006,7,
      [D('crystal_ore','水晶矿',0x00eeff,0.70)]),
    M('crystal_golem','水晶傀儡','golem', 0x0d3344,0x00ddee,160,19,26,130,52,2600,0.003,18,
      [D('crystal_ore','水晶矿',0x00eeff,0.85)]),
    M('refract','折光幻影','ghost', 0x22ccee,0x44eeff, 80,14,50,200,44,1800,0.004,12,
      [D('crystal_ore','水晶矿',0x00eeff,0.60), D('aurora_ore','极光矿',0x8844ff,0.25)]),
  ],
  [BIOME.LAVA_PLATEAU]: [
    M('magma_lizard','熔岩巨蜥','lizard',0xff5500,0xff7700, 65,13,58,155,42,1600,0.005,9,
      [D('fire_ore','火焰矿',0xff4400,0.70)]),
    M('lava_giant','熔岩巨人','golem', 0xff3300,0xff6600,220,26,22,130,55,3000,0.002,25,
      [D('fire_ore','火焰矿',0xff4400,0.90), D('chaos_ore','混沌原石',0xcc99ff,0.15)]),
    M('fire_imp','地狱炎妖','demon', 0xff2200,0xff4400, 45,15,68,170,38,1400,0.006,11,
      [D('fire_ore','火焰矿',0xff4400,0.65)]),
  ],
  [BIOME.AURORA_TUNDRA]: [
    M('aurora_deer','极光鹿','bird',  0x44aaff,0x66ccff, 55,8,70,190,38,1400,0.005,8,
      [D('frost_ore','冰霜晶',0x88ccff,0.60), D('aurora_ore','极光矿',0x8844ff,0.35)]),
    M('ice_crystal','冰晶巨人','golem', 0x88ccff,0xaaddff,170,20,28,135,52,2600,0.003,20,
      [D('aurora_ore','极光矿',0x8844ff,0.80)]),
    M('frost_wisp','极光灵','ghost', 0x8844ff,0xaa66ff, 45,10,60,200,38,1500,0.006,7,
      [D('aurora_ore','极光矿',0x8844ff,0.60)]),
  ],
  [BIOME.GHOST_BAY]: [
    M('drowned','溺亡幽灵','undead',0x8899bb,0x99aacc, 60,10,44,185,42,1800,0.006,8,
      [D('ghost_ore','幽灵晶',0x8899bb,0.65)]),
    M('bay_phantom','海湾幻魔','ghost', 0x4466aa,0x6688cc, 85,14,46,220,44,2000,0.004,13,
      [D('ghost_ore','幽灵晶',0x8899bb,0.75)]),
    M('sea_horror','深海恐魔','demon', 0x223355,0x446688,200,22,30,175,52,2400,0.002,22,
      [D('ghost_ore','幽灵晶',0x8899bb,0.85), D('dark_ore','暗影矿',0x9900cc,0.3)]),
  ],
  [BIOME.TOXIC_JUNGLE]: [
    M('poison_fang','毒牙兽','wolf',  0x44ff44,0x66ff66, 50,11,60,155,40,1500,0.006,7,
      [D('toxic_ore','毒素矿',0x44cc44,0.70)]),
    M('acid_sprite','酸液精灵','sprite',0x660099,0x8822cc, 35,13,50,165,36,1400,0.007,9,
      [D('toxic_ore','毒素矿',0x44cc44,0.65)]),
    M('vine_titan','藤蔓泰坦','golem', 0x1a4420,0x2a6630,185,20,26,145,52,2700,0.003,20,
      [D('toxic_ore','毒素矿',0x44cc44,0.85), D('dark_ore','暗影矿',0x9900cc,0.25)]),
  ],
  [BIOME.ASH_DESERT]: [
    M('bone_knight','骷髅骑士','undead',0xffeedd,0xffffff, 80,12,40,150,44,2000,0.005,10,
      [D('bone_ore','骨灰矿',0xffeedd,0.70)]),
    M('dust_wraith','尘灰怨灵','ghost', 0xccccbb,0xddddcc, 55,10,48,180,40,1700,0.006,7,
      [D('bone_ore','骨灰矿',0xffeedd,0.55)]),
    M('bone_colossus','骨骸巨像','golem', 0xeeeedd,0xffffff,240,24,22,130,55,2900,0.002,26,
      [D('bone_ore','骨灰矿',0xffeedd,0.90), D('holy_ore','神圣晶',0xffee88,0.2)]),
  ],
  [BIOME.RUSTED_RUINS]: [
    M('mech_guard','机械守卫','golem', 0x553322,0x775544, 90,14,32,140,48,2200,0.005,12,
      [D('steel_ore','钢铁矿',0x8888aa,0.70), D('thunder_ore','雷电矿',0xffff00,0.40)]),
    M('rust_spider','铁锈蜘蛛','bat',   0x444466,0x666688, 45,11,58,165,38,1500,0.007,8,
      [D('steel_ore','钢铁矿',0x8888aa,0.55)]),
    M('automaton','废铁魔像','golem', 0x332211,0x554433,200,22,28,120,52,2800,0.003,22,
      [D('steel_ore','钢铁矿',0x8888aa,0.85), D('thunder_ore','雷电矿',0xffff00,0.35)]),
  ],
  [BIOME.METEOR_CRATER]: [
    M('meteor_sprite','陨石精灵','sprite',0x6644aa,0x8866cc, 45,12,65,170,38,1400,0.006,9,
      [D('meteor_ore','陨石矿',0x6644aa,0.70)]),
    M('cosmic_worm','宇宙虫','snake',  0x4422aa,0x6644cc, 70,14,50,160,42,1700,0.005,11,
      [D('meteor_ore','陨石矿',0x6644aa,0.65)]),
    M('crater_titan','星坑巨灵','golem', 0x1a1a3a,0x4488ff,190,24,26,140,52,2600,0.003,22,
      [D('meteor_ore','陨石矿',0x6644aa,0.85), D('chaos_ore','混沌原石',0xcc99ff,0.2)]),
  ],
  [BIOME.ABYSS_RIFT]: [
    M('rift_demon','裂隙恶魔','demon', 0xff0033,0xff2255, 85,18,46,200,44,1800,0.005,14,
      [D('void_ore','虚空矿',0x440044,0.70), D('chaos_ore','混沌原石',0xcc99ff,0.30)]),
    M('void_devourer','虚空吞噬者','bat', 0x0a0005,0x440044, 50,14,80,220,36,1300,0.007,10,
      [D('void_ore','虚空矿',0x440044,0.60)]),
    M('abyss_lord','深渊领主','golem', 0x220011,0x880044,280,30,24,180,56,3000,0.0015,32,
      [D('void_ore','虚空矿',0x440044,0.90), D('chaos_ore','混沌原石',0xcc99ff,0.35)]),
  ],
  [BIOME.MUSHROOM_FOREST]: [
    M('spore_sprite','孢子精灵','sprite',0xff88ee,0xff99ff, 38,9,48,150,36,1600,0.007,6,
      [D('spore_ore','孢子晶',0xaa44cc,0.70)]),
    M('mycelium_golem','菌丝傀儡','golem', 0x2a1a33,0x3a2a44,130,16,28,130,50,2500,0.004,15,
      [D('spore_ore','孢子晶',0xaa44cc,0.80)]),
    M('shroom_spirit','毒菇灵','ghost', 0xaa44cc,0xcc66ee, 65,12,42,175,42,1900,0.005,10,
      [D('spore_ore','孢子晶',0xaa44cc,0.60), D('dark_ore','暗影矿',0x9900cc,0.35)]),
  ],
  [BIOME.MIRAGE_OASIS]: [
    M('mirage_lion','幻影狮','wolf',  0xddcc88,0xeedd99, 60,11,60,165,42,1600,0.005,9,
      [D('sand_ore','沙金矿',0xffdd44,0.65)]),
    M('sand_guardian','沙漠神官','angel', 0xffee88,0xffff99,100,15,38,160,46,2100,0.005,13,
      [D('sand_ore','沙金矿',0xffdd44,0.75), D('holy_ore','神圣晶',0xffee88,0.35)]),
    M('oasis_giant','绿洲巨灵','golem', 0xbbaa66,0xccbb77,190,22,26,140,52,2700,0.003,20,
      [D('sand_ore','沙金矿',0xffdd44,0.85)]),
  ],
  [BIOME.SILVER_PEAKS]: [
    M('avalanche_bear','雪崩熊','bear',  0xeeffff,0xffffff,150,17,32,140,50,2300,0.004,17,
      [D('silver_ore','银矿',0xeeeeff,0.75)]),
    M('silver_eagle','银翼冰鹰','bird',  0xccddee,0xddeeff, 55,11,75,200,38,1300,0.005,9,
      [D('silver_ore','银矿',0xeeeeff,0.60), D('frost_ore','冰霜晶',0x88ccff,0.40)]),
    M('glacier_titan','冰川泰坦','golem', 0xaabbcc,0xccddee,230,25,20,130,55,3000,0.002,26,
      [D('silver_ore','银矿',0xeeeeff,0.90)]),
  ],
  [BIOME.DECAY_FOREST]: [
    M('flesh_zombie','腐肉行尸','undead',0x3a2210,0x554433, 70,11,38,150,42,2000,0.006,9,
      [D('decay_ore','枯木矿',0x886644,0.70)]),
    M('tree_spirit','树精古灵','sprite',0xcc6622,0xdd7733, 50,10,44,155,38,1700,0.006,7,
      [D('decay_ore','枯木矿',0x886644,0.60)]),
    M('rot_titan','腐朽巨灵','golem', 0x1a0a00,0x3a2210,185,21,26,140,52,2700,0.003,20,
      [D('decay_ore','枯木矿',0x886644,0.85), D('dark_ore','暗影矿',0x9900cc,0.30)]),
  ],
  [BIOME.CHAOS_FORGE]: [
    M('chaos_elemental','混沌元素','sprite',0xff00ff,0xff44ff, 60,17,65,185,40,1400,0.006,13,
      [D('chaos_ore','混沌原石',0xcc99ff,0.80)]),
    M('arcane_shade','大魔导残影','ghost', 0x440044,0x660066, 90,20,48,210,44,1800,0.004,16,
      [D('chaos_ore','混沌原石',0xcc99ff,0.75), D('void_ore','虚空矿',0x440044,0.30)]),
    M('chaos_titan','混沌泰坦','golem', 0x220022,0x440044,300,32,20,165,58,3200,0.0012,35,
      [D('chaos_ore','混沌原石',0xcc99ff,0.95), D('rare_gem','混沌魔晶',0xff00ff,0.40)]),
  ],
}

// ─── MonsterSystem ─────────────────────────────────────────────────────────────
export class MonsterSystem {
  constructor(scene, worldContainer) {
    this.scene = scene
    this.wc    = worldContainer   // worldContainer reference
    this.monsters = []
    this.MAX = 28
    this._spawnTimer = 0
    // M13: BiomeSystem director (set externally after construction)
    this.biomeSystem = null
  }

  /** 当前玩家等级（用于难度缩放），从 CombatSystem 读取 */
  get _playerLevel() {
    return this.scene.combatSystem?.level ?? 1
  }

  /** 当前怪物上限：有 BiomeSystem 时按等级 + 昼夜动态裁决 */
  get _maxMonsters() {
    if (this.biomeSystem) return this.biomeSystem.getMaxMonsters(this._playerLevel)
    return this.MAX
  }

  // Call when player moves; tries to populate monsters near player
  trySpawnNear(playerTile, worldGen, tileToScreen) {
    if (this.monsters.length >= this._maxMonsters) return
    const { x: px, y: py } = playerTile
    const R = 9
    const attempts = 4
    for (let i = 0; i < attempts; i++) {
      const tx = px + Phaser.Math.Between(-R, R)
      const ty = py + Phaser.Math.Between(-R, R)
      const gap = Math.abs(tx - px) + Math.abs(ty - py)
      if (gap < 4 || gap > R) continue
      if (tx < 0 || ty < 0) continue
      const biome = worldGen.getBiome(tx, ty)
      const h = worldGen.getHeight(tx, ty)
      const { sx, sy } = tileToScreen(tx, ty, h)

      // ── M13 路径：BiomeSystem 分等级生成（密度/精英/Boss/夜间已在内部裁决）
      if (this.biomeSystem) {
        // 受群系危险系数影响的刷新积极度
        const danger = this.biomeSystem.getDangerFactor(biome)
        if (Math.random() > 0.5 * danger) continue
        const desc = this.biomeSystem.rollSpawn(biome, this._playerLevel)
        if (!desc) continue
        this._spawnFromDesc(desc, sx, sy - 8)
        if (this.monsters.length >= this._maxMonsters) return
        continue
      }

      // ── 回退路径：旧 BIOME_MONSTERS 内置表
      const types = BIOME_MONSTERS[biome]
      if (!types) continue
      const type = Phaser.Utils.Array.GetRandom(types)
      if (Math.random() > type.density * 80) continue
      this._spawn(type, sx, sy - 8, biome)
    }
  }

  /**
   * M13：把 BiomeSystem.rollSpawn() 的描述转成 MonsterSystem 内部 type 并生成。
   * @param {SpawnDesc} desc
   */
  _spawnFromDesc(desc, sx, sy) {
    const { stats, render, name, isElite, isBoss, sizeScale } = desc
    // 攻击综合物理+魔法
    const atk = (stats.physAtk ?? 0) + (stats.magAtk ?? 0)
    // 速度：Boss 慢、精英略快、普通中等
    const speed = isBoss ? 38 : isElite ? 62 : 52

    // lootTable(string[]) → drops 对象
    const drops = (stats.lootTable ?? []).map(item => ({
      item,
      itemName: item,
      color: render.glowColor,
      chance: stats.dropRate ?? 0.2,
      count: isBoss ? [2, 4] : 1,
    }))

    const type = {
      id: desc.id,
      name,
      shape: render.shape,
      color: render.color,
      glowColor: render.glowColor,
      hp: stats.hp,
      atk,
      speed,
      aggroRange: isBoss ? 240 : 175,
      attackRange: isBoss ? 55 : 42,
      attackCooldown: isBoss ? 1100 : 1500,
      xp: stats.xp,
      drops,
      isElite,
      isBoss,
    }
    this._spawn(type, sx, sy, undefined, sizeScale)
  }

  _spawn(type, sx, sy, _biome, sizeScale = 1.0) {
    const m = {
      type, sx, sy,
      hp: type.hp, maxHp: type.hp, atk: type.atk,
      state: 'wander',
      wdx: 0, wdy: 0, wTimer: 0,
      atkTimer: 0,
      sizeScale,
      isElite: !!type.isElite,
      isBoss: !!type.isBoss,
      id: ++MonsterSystem._uid,
      gfx: null, hpBg: null, hpFill: null, label: null,
    }
    this._buildGfx(m)
    this.monsters.push(m)
  }

  _buildGfx(m) {
    const s = this.scene, wc = this.wc
    const { sx, sy, type } = m

    m.gfx = s.add.graphics()
    m.gfx.x = sx; m.gfx.y = sy
    m.gfx.setDepth(1000 + sy)
    this._drawShape(m.gfx, type)
    if (m.sizeScale && m.sizeScale !== 1.0) m.gfx.setScale(m.sizeScale)
    wc.add(m.gfx)

    m.hpBg = s.add.graphics()
    m.hpBg.fillStyle(0x220000, 0.85)
    m.hpBg.fillRect(-15, -24, 30, 5)
    m.hpBg.x = sx; m.hpBg.y = sy
    m.hpBg.setDepth(1001 + sy)
    wc.add(m.hpBg)

    m.hpFill = s.add.graphics()
    m.hpFill.x = sx; m.hpFill.y = sy
    m.hpFill.setDepth(1002 + sy)
    wc.add(m.hpFill)
    this._updateBar(m)

    const hex = '#' + type.color.toString(16).padStart(6, '0')
    m.label = s.add.text(sx, sy - 28, type.name, {
      fontSize: '9px', color: hex,
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5, 1).setDepth(1003 + sy)
    wc.add(m.label)
  }

  _drawShape(g, t) {
    const c = t.color, gl = t.glowColor
    g.fillStyle(gl, 0.18); g.fillCircle(0, 0, 16)  // aura
    switch (t.shape) {
      case 'wolf':
        g.fillStyle(c, 1); g.fillEllipse(2, 3, 20, 11); g.fillCircle(-7, -4, 7)
        g.fillStyle(0xffffff, 0.9); g.fillCircle(-8, -5, 2)
        break
      case 'sprite':
        g.fillStyle(c, 1); g.fillCircle(0, 0, 8)
        for (let i = 0; i < 6; i++) { const a = i*Math.PI*2/6; g.fillRect(Math.cos(a)*7-1, Math.sin(a)*7-1, 4, 2) }
        g.fillStyle(gl, 0.9); g.fillCircle(0, -1, 3)
        break
      case 'golem':
        g.fillStyle(c, 1); g.fillRect(-10, -12, 20, 17)
        g.fillStyle(gl, 0.9); g.fillCircle(-4, -5, 3); g.fillCircle(4, -5, 3)
        g.lineStyle(1, 0x000000, 0.4); g.strokeRect(-10, -12, 20, 17)
        break
      case 'demon': case 'goblin':
        g.fillStyle(c, 1); g.fillCircle(0, -3, 7); g.fillEllipse(0, 6, 13, 11)
        g.fillTriangle(-4,-9,-7,-16,-2,-9); g.fillTriangle(4,-9,7,-16,2,-9)
        g.fillStyle(gl, 0.9); g.fillCircle(-2, -4, 2); g.fillCircle(2, -4, 2)
        break
      case 'lizard':
        g.fillStyle(c, 1); g.fillEllipse(2, 2, 18, 10); g.fillCircle(-7, 0, 6); g.fillRect(10, 0, 8, 3)
        g.fillStyle(gl, 0.9); g.fillCircle(-8, -1, 2)
        break
      case 'bear':
        g.fillStyle(c, 1); g.fillCircle(0, 3, 11); g.fillCircle(0, -7, 8)
        g.fillCircle(-11, -3, 4); g.fillCircle(11, -3, 4)
        g.fillStyle(gl, 0.9); g.fillCircle(-3, -8, 2); g.fillCircle(3, -8, 2)
        break
      case 'undead':
        g.fillStyle(c, 0.9); g.fillCircle(0, -2, 9)
        g.lineStyle(1.5, gl, 0.75); for (let i=-1;i<=1;i++) g.strokeRect(i*4-1,4,2,5)
        g.fillStyle(gl,1); g.fillCircle(-3,-3,2.5); g.fillCircle(3,-3,2.5)
        break
      case 'bat':
        g.fillStyle(c, 1)
        g.fillEllipse(-11,0,13,7); g.fillEllipse(11,0,13,7); g.fillCircle(0,0,6)
        g.fillStyle(gl,0.9); g.fillCircle(-2,-2,2); g.fillCircle(2,-2,2)
        break
      case 'ghost':
        g.fillStyle(c, 0.8)
        g.fillCircle(0,-5,9); g.fillRect(-9,-5,18,8)
        g.fillTriangle(-9,3,-5,8,-1,3); g.fillTriangle(1,3,5,8,9,3)
        g.fillStyle(gl,0.9); g.fillCircle(-3,-6,2.5); g.fillCircle(3,-6,2.5)
        break
      case 'bird':
        g.fillStyle(c,1); g.fillCircle(0,0,8)
        g.fillEllipse(-13,-2,17,7); g.fillEllipse(13,-2,17,7); g.fillCircle(0,-9,5)
        g.fillStyle(gl,0.9); g.fillCircle(-1,-10,1.5)
        break
      case 'snake':
        g.fillStyle(c,1)
        g.fillEllipse(-6,3,8,11); g.fillEllipse(3,-2,8,11); g.fillCircle(7,-5,6)
        g.fillStyle(gl,0.9); g.fillCircle(6,-7,2); g.fillCircle(9,-7,2)
        break
      case 'angel':
        g.fillStyle(c,1); g.fillCircle(0,-4,7); g.fillEllipse(0,5,13,11)
        g.fillStyle(c,0.45); g.fillEllipse(-15,-2,17,11); g.fillEllipse(15,-2,17,11)
        g.fillStyle(gl,0.9); g.fillCircle(-2,-5,2); g.fillCircle(2,-5,2)
        break
      default:
        g.fillStyle(c,1); g.fillCircle(0,0,9)
    }
  }

  _updateBar(m) {
    m.hpFill.clear()
    const r = Math.max(0, m.hp / m.maxHp)
    m.hpFill.fillStyle(r > 0.5 ? 0x44ff44 : r > 0.25 ? 0xffaa00 : 0xff2200, 0.9)
    m.hpFill.fillRect(-15, -24, 30 * r, 5)
  }

  // playerSX/SY = tileToScreen of player tile (worldContainer-local)
  update(delta, playerSX, playerSY) {
    const dt = delta / 1000
    const attacks = []   // { monster } for WorldScene to resolve
    for (let i = this.monsters.length - 1; i >= 0; i--) {
      const m = this.monsters[i]
      if (!m.gfx?.active) { this.monsters.splice(i, 1); continue }
      this._tickStatus(m, delta)
      if (m._freeze > 0) {            // 冰冻：跳过 AI（仍可被攻击）
        if (m.gfx) { m.gfx.x = m.sx; m.gfx.y = m.sy }
        continue
      }
      const r = this._updateAI(m, dt, playerSX, playerSY)
      if (r) attacks.push(r)
    }
    return attacks
  }

  /**
   * M14：施加状态效果（技能/被动调用）。
   * @param {object} m   怪物
   * @param {'burn'|'freeze'|'slow'} kind
   * @param {number} dps  每秒伤害（burn 用）
   * @param {number} durSec 持续秒数
   */
  applyStatus(m, kind, dps = 0, durSec = 3) {
    if (!m || m.state === 'dead') return
    if (kind === 'burn')   { m._burn = durSec * 1000; m._burnDps = dps }
    if (kind === 'freeze') { m._freeze = durSec * 1000 }
    if (kind === 'slow')   { m._slow = durSec * 1000 }
  }

  /** 每帧处理怪物身上的状态效果 */
  _tickStatus(m, delta) {
    if (m._freeze > 0) {
      m._freeze -= delta
      if (m.gfx) m.gfx.setAlpha(0.6)
    }
    if (m._slow > 0) m._slow -= delta
    if (m._burn > 0) {
      m._burn -= delta
      m._burnTick = (m._burnTick ?? 0) + delta
      if (m._burnTick >= 500) {            // 每 0.5s 跳一次燃烧
        m._burnTick = 0
        const d = Math.round(m._burnDps * 0.5)
        if (d > 0) {
          m.hp -= d; this._updateBar(m)
          this._showBurnTick(m, d)
          if (m.hp <= 0) { this._kill(m); return }
        }
      }
    }
    // 状态全清时恢复透明度
    if (m._freeze <= 0 && m.gfx && m.gfx.alpha < 1) m.gfx.setAlpha(1)
  }

  _showBurnTick(m, d) {
    const t = this.scene.add.text(m.sx, m.sy - 18, `🔥${d}`, {
      fontSize: '10px', color: '#ff7733', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(1400)
    this.wc.add(t)
    this.scene.tweens.add({ targets: t, y: '-=12', alpha: 0, duration: 700, onComplete: () => t.destroy() })
  }

  _updateAI(m, dt, psx, psy) {
    if (m.state === 'dead') return null
    const dx = psx - m.sx, dy = psy - m.sy
    const dist = Math.sqrt(dx*dx + dy*dy)
    const { type } = m
    const spd = (m._slow > 0 ? 0.4 : 1) * type.speed   // M14 减速

    if (dist < type.attackRange) m.state = 'attack'
    else if (dist < type.aggroRange) m.state = 'chase'
    else m.state = 'wander'

    let attacked = null
    switch (m.state) {
      case 'wander':
        m.wTimer -= dt
        if (m.wTimer <= 0) {
          const a = Math.random() * Math.PI * 2
          m.wdx = Math.cos(a) * spd * 0.45
          m.wdy = Math.sin(a) * spd * 0.45
          m.wTimer = 2 + Math.random() * 3
        }
        m.sx += m.wdx * dt; m.sy += m.wdy * dt
        break
      case 'chase':
        if (dist > 0) { m.sx += (dx/dist)*spd*dt; m.sy += (dy/dist)*spd*dt }
        break
      case 'attack':
        m.atkTimer -= dt * 1000
        if (m.atkTimer <= 0) {
          m.atkTimer = type.attackCooldown
          attacked = { monster: m, atk: type.atk }
        }
        break
    }

    if (m.gfx)    { m.gfx.x    = m.sx; m.gfx.y    = m.sy }
    if (m.hpBg)   { m.hpBg.x   = m.sx; m.hpBg.y   = m.sy }
    if (m.hpFill) { m.hpFill.x = m.sx; m.hpFill.y = m.sy }
    if (m.label)  { m.label.x  = m.sx; m.label.y  = m.sy }

    return attacked
  }

  getAt(lx, ly, r = 22) {
    for (const m of this.monsters) {
      if (m.state === 'dead') continue
      const dx = lx - m.sx, dy = ly - m.sy
      if (dx*dx + dy*dy < r*r) return m
    }
    return null
  }

  damage(m, dmg) {
    m.hp -= dmg; this._updateBar(m)
    if (m.gfx) this.scene.tweens.add({ targets: m.gfx, alpha: { from: 0.25, to: 1 }, duration: 220 })
    if (m.hp <= 0) { this._kill(m); return true }
    return false
  }

  _kill(m) {
    m.state = 'dead'
    const objs = [m.gfx, m.hpBg, m.hpFill, m.label].filter(Boolean)
    this.scene.tweens.add({
      targets: objs, alpha: 0, scaleX: 1.6, scaleY: 1.6, duration: 500, ease: 'Power2',
      onComplete: () => {
        objs.forEach(o => o?.active && o.destroy())
        const idx = this.monsters.indexOf(m)
        if (idx !== -1) this.monsters.splice(idx, 1)
      }
    })
  }

  pruneFar(playerSX, playerSY, maxDist = 750) {
    const md2 = maxDist * maxDist
    for (let i = this.monsters.length - 1; i >= 0; i--) {
      const m = this.monsters[i]
      const dx = m.sx - playerSX, dy = m.sy - playerSY
      if (dx*dx + dy*dy > md2) {
        [m.gfx, m.hpBg, m.hpFill, m.label].forEach(o => o?.active && o.destroy())
        this.monsters.splice(i, 1)
      }
    }
  }

  clear() {
    this.monsters.forEach(m =>
      [m.gfx, m.hpBg, m.hpFill, m.label].forEach(o => o?.active && o.destroy())
    )
    this.monsters = []
  }
}
MonsterSystem._uid = 0
