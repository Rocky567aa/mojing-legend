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
}

// ─── MonsterSystem ─────────────────────────────────────────────────────────────
export class MonsterSystem {
  constructor(scene, worldContainer) {
    this.scene = scene
    this.wc    = worldContainer   // worldContainer reference
    this.monsters = []
    this.MAX = 28
    this._spawnTimer = 0
  }

  // Call when player moves; tries to populate monsters near player
  trySpawnNear(playerTile, worldGen, tileToScreen) {
    if (this.monsters.length >= this.MAX) return
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
      const types = BIOME_MONSTERS[biome]
      if (!types) continue
      const type = Phaser.Utils.Array.GetRandom(types)
      if (Math.random() > type.density * 80) continue
      const h = worldGen.getHeight(tx, ty)
      const { sx, sy } = tileToScreen(tx, ty, h)
      this._spawn(type, sx, sy - 8, biome)
    }
  }

  _spawn(type, sx, sy) {
    const m = {
      type, sx, sy,
      hp: type.hp, maxHp: type.hp, atk: type.atk,
      state: 'wander',
      wdx: 0, wdy: 0, wTimer: 0,
      atkTimer: 0,
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
      const r = this._updateAI(m, dt, playerSX, playerSY)
      if (r) attacks.push(r)
    }
    return attacks
  }

  _updateAI(m, dt, psx, psy) {
    if (m.state === 'dead') return null
    const dx = psx - m.sx, dy = psy - m.sy
    const dist = Math.sqrt(dx*dx + dy*dy)
    const { type } = m

    if (dist < type.attackRange) m.state = 'attack'
    else if (dist < type.aggroRange) m.state = 'chase'
    else m.state = 'wander'

    let attacked = null
    switch (m.state) {
      case 'wander':
        m.wTimer -= dt
        if (m.wTimer <= 0) {
          const a = Math.random() * Math.PI * 2
          m.wdx = Math.cos(a) * type.speed * 0.45
          m.wdy = Math.sin(a) * type.speed * 0.45
          m.wTimer = 2 + Math.random() * 3
        }
        m.sx += m.wdx * dt; m.sy += m.wdy * dt
        break
      case 'chase':
        if (dist > 0) { m.sx += (dx/dist)*type.speed*dt; m.sy += (dy/dist)*type.speed*dt }
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
