/**
 * PlantSystem — 植物生态系统
 *
 * 三种植物类型：
 *   NORMAL       — 普通植物：静态装饰 + 可采集（草药/种子）
 *   CARNIVOROUS  — 食虫植物：有触发范围，自动捕捉附近昆虫，播放吞食动画
 *   TOXIC        — 有毒植物：接触玩家造成持续中毒伤害，紫色毒雾粒子
 *   MONSTER      — 植物怪物：伪装成普通植物头露地面，玩家点击"拔起"后变形为怪物
 *
 * 植物怪物行为：
 *   1. 静止阶段：仅渲染叶冠（看起来像普通植物）
 *   2. 拔起触发：缩放+旋转动画，弹出完整身体
 *   3. 激活阶段：进入AI追击模式，攻击玩家
 *
 * 与 InsectSystem 配合：
 *   - 每帧检测 DETECT_RADIUS 内的昆虫
 *   - 捕捉最近昆虫 → 触发 InsectSystem.capture(insectId)
 *   - 播放"咬合"动画 + 咀嚼粒子
 */

import { getBiomeContent } from '../data/BiomeContentMap.js'

// M16: 物种类型 → 叶茎颜色
const SPECIES_COLORS = {
  edible:     0x2d8a2d,
  medicine:   0x9aaa22,
  hazard:     0xcc4411,
  rare:       0x9933cc,
  decorative: 0x4477aa,
  default:    0x2d8a2d,
}

export const PLANT_TYPE = {
  NORMAL:      0,  // 普通植物
  CARNIVOROUS: 1,  // 食虫植物
  TOXIC:       2,  // 有毒植物
  MONSTER:     3,  // 植物怪物（伪装）
}

// 每种类型的基础配置
const PLANT_CONFIG = {
  [PLANT_TYPE.NORMAL]: {
    label: '野生草药',
    radius: 0,
    harvestable: true,
    drops: ['herb', 'seed'],
    dropProb: [0.6, 0.3],
    baseColor: 0x2d8a2d,
    glowColor: null,
    // 草图：浅绿小花 + 圆形灌木
  },
  [PLANT_TYPE.CARNIVOROUS]: {
    label: '食虫植物',
    radius: 48,           // 捕虫触发半径（像素）
    harvestable: false,   // 无法直接采集（太危险）
    drops: [],
    baseColor: 0x1a6b1a,
    glowColor: 0x00ff44,  // 绿色荧光（诱虫）
    attackCooldown: 4000, // 捕食冷却（毫秒）
    digestionTime: 6000,  // 消化时间（毫秒）
    // 草图：宽口捕虫夹 + 触须 + 绿色荧光
  },
  [PLANT_TYPE.TOXIC]: {
    label: '毒刺荆棘',
    radius: 28,           // 伤害接触半径
    harvestable: true,    // 可采集（需装备手套）
    drops: ['toxin'],
    dropProb: [0.7],
    baseColor: 0x6b0090,
    glowColor: 0xcc00ff,  // 紫色毒雾
    damagePerSec: 5,
    poisonDuration: 8000,
    // 草图：黑紫球茎 + 毒液滴落 + 紫色烟雾
  },
  [PLANT_TYPE.MONSTER]: {
    label: '魔藤潜伏者',
    radius: 0,
    harvestable: false,
    drops: ['vine_core', 'green_sap', 'monster_seed'],
    dropProb: [0.9, 0.6, 0.2],
    baseColor: 0x3a7a3a,  // 伪装颜色（与普通植物接近）
    glowColor: null,
    // 隐藏属性（激活后）
    hp: 80, atk: 12, spd: 1.8,
    revealAnimation: true,
    // 草图：地面仅露出叶冠 → 拔起后露出巨大藤蔓身体+尖牙
  },
}

// 生物群系→植物类型分布权重 [NORMAL, CARNIVOROUS, TOXIC, MONSTER]
const BIOME_PLANT_WEIGHTS = {
  0: [0.65, 0.15, 0.10, 0.10],  // GRASSLAND
  1: [0.20, 0.30, 0.25, 0.25],  // FIRE_VALLEY（烧焦植被+食虫+怪物多）
  2: [0.50, 0.10, 0.15, 0.25],  // FROST_FJORD（冻原植被）
  3: [0.30, 0.20, 0.25, 0.25],  // THUNDER_HIGHLAND
  4: [0.10, 0.35, 0.35, 0.20],  // DARK_CAVERN（毒草+食虫植物最多）
  5: [0.40, 0.15, 0.10, 0.35],  // HOLY_RUINS（神圣植被+怪物多）
}

// 每群系植物密度（每 100 格出现概率）
const BIOME_PLANT_DENSITY = {
  0: 0.04, 1: 0.025, 2: 0.02, 3: 0.03, 4: 0.05, 5: 0.035,
}

export class PlantSystem {
  /**
   * @param {Phaser.Scene} scene
   * @param {Phaser.GameObjects.Container} worldContainer
   * @param {InsectSystem} insectSystem
   */
  constructor(scene, worldContainer, insectSystem) {
    this.scene = scene
    this.container = worldContainer
    this.insectSystem = insectSystem

    // key: "wx_wy" → { type, graphics, labelText, state, config, ... }
    this.plants = new Map()

    // 活跃食虫植物（每帧检测昆虫）
    this.activeCarnivorous = []

    // 中毒玩家追踪
    this.poisonedPlayer = false
    this.poisonTimer = 0
  }

  // ── 区块加载时生成植物 ────────────────────────────────────────────────────

  spawnChunkPlants(tiles, cx, cy, tileToScreen) {
    const CHUNK = 32
    for (let r = 0; r < CHUNK; r++) {
      for (let c = 0; c < CHUNK; c++) {
        const cell = tiles[r][c]
        if (!cell || cell.deco !== null) continue  // 已有装饰物跳过
        const biome = cell.biome ?? 0
        const density = BIOME_PLANT_DENSITY[biome] ?? 0.03
        const wx = cx * CHUNK + c
        const wy = cy * CHUNK + r
        const key = `${wx}_${wy}`
        if (this.plants.has(key)) continue

        const hash = this._hash(wx, wy, 0xb10b)
        if (hash > density) continue

        // 根据权重选植物类型
        const type = this._weightedRandom(BIOME_PLANT_WEIGHTS[biome] ?? BIOME_PLANT_WEIGHTS[0], wx, wy)
        const { sx, sy } = tileToScreen(wx, wy, cell.height ?? 0)
        this._spawnPlant(wx, wy, sx, sy, type, biome)
      }
    }
  }

  // M16: 从 BiomeContentMap 按类型随机选一个物种
  _pickSpecies(biome, type, wx, wy) {
    const content = getBiomeContent(biome)
    if (!content) return null
    const pool = type === PLANT_TYPE.TOXIC
      ? (content.plants ?? []).filter(p => p.type === 'hazard')
      : type === PLANT_TYPE.NORMAL
        ? (content.plants ?? []).filter(p => p.type !== 'hazard')
        : null
    if (!pool || pool.length === 0) return null
    const idx = Math.abs(this._hash(wx, wy, 0xf00d)) % pool.length
    return pool[idx]
  }

  _spawnPlant(wx, wy, sx, sy, type, biome) {
    const key = `${wx}_${wy}`
    const cfg = PLANT_CONFIG[type]
    // M16: 选取物种
    const species = this._pickSpecies(biome, type, wx, wy)
    const speciesColor = species ? (SPECIES_COLORS[species.type] ?? SPECIES_COLORS.default) : null
    const g = this.scene.add.graphics()

    // 公共：画植物基础形态（传入物种色）
    this._drawPlantGraphic(g, sx, sy, type, biome, speciesColor)
    g.setDepth(wy + wx + 0.5)
    this.container.add(g)

    const plant = {
      wx, wy, sx, sy, type, cfg,
      graphics: g,
      species,          // M16: 物种数据
      state: type === PLANT_TYPE.MONSTER ? 'disguised' : 'idle',
      hp: cfg.hp ?? 0,
      lastAttack: 0,
      captureTarget: null,
    }

    // M16: 悬停显示物种名称
    if (species) {
      g.setInteractive(new Phaser.Geom.Circle(sx, sy - 20, 22), Phaser.Geom.Circle.Contains)
      g.on('pointerover', () => this._showSpeciesTooltip(plant))
      g.on('pointerout',  () => this._hideTooltip())
    }

    // 食虫植物：添加荧光脉冲 + 注册到活跃列表
    if (type === PLANT_TYPE.CARNIVOROUS) {
      this._addCarnivorousGlow(plant)
      this.activeCarnivorous.push(key)
    }

    // 有毒植物：持续毒雾粒子
    if (type === PLANT_TYPE.TOXIC) {
      this._startToxicParticles(plant)
    }

    // 植物怪物：可交互（点击拔起）
    if (type === PLANT_TYPE.MONSTER) {
      g.setInteractive(
        new Phaser.Geom.Circle(sx, sy - 10, 22),
        Phaser.Geom.Circle.Contains
      )
      g.on('pointerdown', () => this._revealMonster(plant, key))
      g.on('pointerover', () => {
        if (plant.state === 'disguised') {
          // 轻微抖动提示（可拔起）
          this.scene.tweens.add({
            targets: g, x: { from: -2, to: 2 },
            duration: 60, yoyo: true, repeat: 3
          })
        }
      })
    }

    // 普通植物：可采集
    if (type === PLANT_TYPE.NORMAL) {
      g.setInteractive(
        new Phaser.Geom.Circle(sx, sy - 12, 18),
        Phaser.Geom.Circle.Contains
      )
      g.on('pointerdown', () => this._harvestPlant(plant, key))
    }

    this.plants.set(key, plant)
  }

  // ── 植物图形绘制 ──────────────────────────────────────────────────────────

  _drawPlantGraphic(g, sx, sy, type, biome, speciesColor = null) {
    g.clear()
    switch (type) {
      case PLANT_TYPE.NORMAL:
        this._drawNormalPlant(g, sx, sy, biome, speciesColor)
        break
      case PLANT_TYPE.CARNIVOROUS:
        this._drawCarnivorousPlant(g, sx, sy)
        break
      case PLANT_TYPE.TOXIC:
        this._drawToxicPlant(g, sx, sy, speciesColor)
        break
      case PLANT_TYPE.MONSTER:
        this._drawDisguisedMonsterHead(g, sx, sy)
        break
    }
  }

  _drawNormalPlant(g, sx, sy, biome, speciesColor = null) {
    // M16: 用物种色 > biome备用色 > 默认色
    const biomeColors = [0x2d8a2d, 0x5a3a1a, 0x7ab8d0, 0x5a6a3a, 0x1a5a3a, 0x8a7a4a]
    const stemColor = speciesColor ?? biomeColors[biome] ?? 0x2d8a2d
    g.fillStyle(stemColor, 1)
    g.fillRect(sx - 1, sy - 22, 2, 14)
    // 叶片（椭圆）
    g.fillStyle(stemColor, 0.9)
    g.fillEllipse(sx - 8, sy - 26, 12, 7)
    g.fillEllipse(sx + 6, sy - 28, 10, 6)
    g.fillEllipse(sx, sy - 32, 14, 8)
    // 花（白色/淡色小圆点）
    g.fillStyle(0xffffff, 0.8)
    g.fillCircle(sx, sy - 34, 3)
    g.fillStyle(0xffdd88, 1)
    g.fillCircle(sx, sy - 34, 1.5)
  }

  _drawCarnivorousPlant(g, sx, sy) {
    // 茎
    g.fillStyle(0x1a5a1a, 1)
    g.fillRect(sx - 1.5, sy - 26, 3, 18)
    // 捕虫夹底座（梯形）
    g.fillStyle(0x1a6b1a, 1)
    g.fillTriangle(sx - 14, sy - 28, sx + 14, sy - 28, sx, sy - 46)
    // 上颚（开口）
    g.fillStyle(0x0d400d, 0.95)
    g.fillTriangle(sx - 12, sy - 30, sx + 12, sy - 30, sx, sy - 44)
    // 内部齿（白色锯齿）
    g.lineStyle(1.5, 0xeeffcc, 0.9)
    for (let i = -10; i <= 10; i += 4) {
      g.strokeLineShape(new Phaser.Geom.Line(sx + i, sy - 30, sx + i + 2, sy - 26))
    }
    // 触须（两侧）
    g.lineStyle(1, 0x2daa2d, 0.8)
    g.strokeLineShape(new Phaser.Geom.Line(sx - 14, sy - 32, sx - 22, sy - 42))
    g.strokeLineShape(new Phaser.Geom.Line(sx + 14, sy - 32, sx + 22, sy - 42))
    // 触须末端诱蜜腺（小绿圆）
    g.fillStyle(0x00ff44, 0.7)
    g.fillCircle(sx - 22, sy - 43, 3)
    g.fillCircle(sx + 22, sy - 43, 3)
  }

  _drawToxicPlant(g, sx, sy, speciesColor = null) {
    const col = speciesColor ?? 0x3a0055
    const glow = speciesColor ? Phaser.Display.Color.IntegerToColor(col).darken(20).color : 0x7700aa
    // 球茎（黑紫色）
    g.fillStyle(0x3a0055, 1)
    g.fillCircle(sx, sy - 22, 11)
    g.fillStyle(0x7700aa, 0.7)
    g.fillCircle(sx - 3, sy - 25, 6)
    // 毒刺（四方向）
    g.fillStyle(0xcc00ff, 0.9)
    for (let angle = 0; angle < 360; angle += 45) {
      const rad = angle * Math.PI / 180
      const tx = sx + Math.cos(rad) * 14
      const ty = (sy - 22) + Math.sin(rad) * 14
      g.fillTriangle(
        sx + Math.cos(rad) * 10, (sy - 22) + Math.sin(rad) * 10,
        tx - Math.sin(rad) * 2, ty + Math.cos(rad) * 2,
        tx + Math.sin(rad) * 2, ty - Math.cos(rad) * 2
      )
    }
    // 毒液滴（下方）
    g.fillStyle(0xcc00ff, 0.6)
    g.fillCircle(sx - 4, sy - 8, 2.5)
    g.fillCircle(sx + 6, sy - 6, 2)
    g.fillCircle(sx, sy - 4, 3)
  }

  _drawDisguisedMonsterHead(g, sx, sy) {
    // 地面裂缝（暗示有东西埋在下面）
    g.lineStyle(1, 0x1a2a0a, 0.5)
    g.strokeEllipse(sx, sy - 4, 28, 10)
    // 叶冠（看起来像普通植物，但叶片更宽厚）
    g.fillStyle(0x2a7a2a, 1)
    g.fillEllipse(sx - 6, sy - 20, 16, 9)
    g.fillEllipse(sx + 5, sy - 22, 15, 8)
    g.fillEllipse(sx, sy - 28, 18, 10)
    // 细节：叶脉线（一根白色半透明）
    g.lineStyle(1, 0x88dd88, 0.4)
    g.strokeLineShape(new Phaser.Geom.Line(sx, sy - 14, sx, sy - 30))
    // 可疑的眼睛缝（极细，伪装）
    g.fillStyle(0xff3300, 0.15)
    g.fillEllipse(sx - 3, sy - 26, 4, 2)
    g.fillEllipse(sx + 3, sy - 26, 4, 2)
  }

  // ── 植物怪物激活 ─────────────────────────────────────────────────────────

  _revealMonster(plant, key) {
    if (plant.state !== 'disguised') return
    plant.state = 'revealing'
    const g = plant.graphics
    const { sx, sy } = plant

    // 第一阶段：震动 + 地面裂开
    this.scene.tweens.add({
      targets: g, x: { from: -4, to: 4 }, duration: 80,
      yoyo: true, repeat: 5,
    })

    // 地裂特效
    const crack = this.scene.add.graphics()
    crack.lineStyle(2, 0x3a1a00, 1)
    crack.strokeLineShape(new Phaser.Geom.Line(sx - 20, sy, sx + 20, sy))
    crack.strokeLineShape(new Phaser.Geom.Line(sx - 12, sy - 4, sx + 8, sy + 4))
    this.container.add(crack)
    this.scene.tweens.add({
      targets: crack, alpha: 0, duration: 600, delay: 300,
      onComplete: () => crack.destroy()
    })

    // 第二阶段：拔出动画（Y轴向上）
    this.scene.time.delayedCall(400, () => {
      this.scene.tweens.add({
        targets: g, y: g.y - 32, duration: 350, ease: 'Back.easeOut',
        onComplete: () => {
          // 重绘为完整怪物形态
          g.clear()
          this._drawMonsterFullBody(g, sx, sy - 32)
          plant.state = 'active'
          // 启动怪物 AI
          this._startMonsterAI(plant, key)
        }
      })
    })

    // 拔出提示文字
    this._showActionText(sx, sy - 40, '⚠ 植物怪物！', 0xff4400)
  }

  _drawMonsterFullBody(g, sx, sy) {
    // 躯干（藤蔓缠绕的粗茎）
    g.fillStyle(0x1a4a1a, 1)
    g.fillRect(sx - 8, sy - 30, 16, 36)
    // 藤蔓缠绕纹理
    g.lineStyle(1.5, 0x2d7a2d, 0.8)
    for (let y = 0; y > -30; y -= 8) {
      g.strokeEllipse(sx, sy + y - 15, 20, 6)
    }
    // 双臂（粗藤蔓）
    g.lineStyle(6, 0x1a4a1a, 1)
    g.strokeLineShape(new Phaser.Geom.Line(sx - 8, sy - 15, sx - 28, sy - 8))
    g.strokeLineShape(new Phaser.Geom.Line(sx + 8, sy - 15, sx + 28, sy - 8))
    // 爪尖
    g.fillStyle(0x0d2a0d, 1)
    g.fillTriangle(sx - 28, sy - 8, sx - 34, sy - 14, sx - 22, sy - 3)
    g.fillTriangle(sx + 28, sy - 8, sx + 34, sy - 14, sx + 22, sy - 3)
    // 头部（巨型花苞变形）
    g.fillStyle(0x2a6a2a, 1)
    g.fillCircle(sx, sy - 40, 16)
    g.fillStyle(0x0d3a0d, 1)
    g.fillCircle(sx, sy - 40, 10)
    // 眼睛（红色怒目）
    g.fillStyle(0xff2200, 1)
    g.fillCircle(sx - 5, sy - 42, 4)
    g.fillCircle(sx + 5, sy - 42, 4)
    g.fillStyle(0x000000, 1)
    g.fillCircle(sx - 5, sy - 42, 2)
    g.fillCircle(sx + 5, sy - 42, 2)
    // 嘴（锯齿）
    g.fillStyle(0x000000, 0.9)
    g.fillRect(sx - 9, sy - 36, 18, 5)
    g.fillStyle(0xffffff, 1)
    for (let i = -8; i <= 8; i += 4) {
      g.fillTriangle(sx + i, sy - 36, sx + i + 2, sy - 31, sx + i + 4, sy - 36)
    }
    // 根系（脚部）
    g.lineStyle(4, 0x0d2a0d, 1)
    g.strokeLineShape(new Phaser.Geom.Line(sx - 6, sy + 6, sx - 14, sy + 16))
    g.strokeLineShape(new Phaser.Geom.Line(sx + 6, sy + 6, sx + 14, sy + 16))
    g.strokeLineShape(new Phaser.Geom.Line(sx, sy + 6, sx, sy + 18))
  }

  _startMonsterAI(plant, key) {
    // 简单AI：向玩家方向移动并攻击
    // TODO M3: 接入战斗系统后扩展
    const moveEvent = this.scene.time.addEvent({
      delay: 800,
      callback: () => {
        if (!plant.graphics.active) {
          moveEvent.destroy()
          return
        }
        // 发射攻击粒子
        const atk = this.scene.add.graphics()
        atk.fillStyle(0x44ff44, 0.8)
        atk.fillCircle(plant.sx, plant.sy - 40, 5)
        this.container.add(atk)
        this.scene.tweens.add({
          targets: atk,
          x: this.scene.playerSprite?.x ?? 0,
          y: this.scene.playerSprite?.y ?? 0,
          alpha: 0, duration: 600,
          onComplete: () => atk.destroy()
        })
      },
      repeat: -1,
    })
  }

  // ── 食虫植物捕食逻辑 ──────────────────────────────────────────────────────

  _addCarnivorousGlow(plant) {
    const { sx, sy } = plant
    const halo = this.scene.add.graphics()
    halo.lineStyle(2, 0x00ff44, 0.4)
    halo.strokeCircle(sx, sy - 30, plant.cfg.radius * 0.5)
    halo.setDepth(plant.wx + plant.wy + 0.3)
    this.container.add(halo)
    plant.haloGraphics = halo
    this.scene.tweens.add({
      targets: halo,
      alpha: { from: 0.2, to: 0.6 },
      duration: 1500 + Math.random() * 500,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    })
  }

  checkCarnivorousHunting(now) {
    for (const key of this.activeCarnivorous) {
      const plant = this.plants.get(key)
      if (!plant || plant.state === 'eating') continue
      if (now - plant.lastAttack < plant.cfg.attackCooldown) continue

      // 询问 InsectSystem 最近昆虫
      if (!this.insectSystem) continue
      const nearest = this.insectSystem.findNearestInsect(plant.sx, plant.sy - 30, plant.cfg.radius)
      if (!nearest) continue

      plant.state = 'eating'
      plant.lastAttack = now
      this._playEatingAnimation(plant, nearest, key)
    }
  }

  _playEatingAnimation(plant, insect, plantKey) {
    const g = plant.graphics
    const { sx, sy } = plant

    // 捕虫夹快速闭合（scaleY 0.1 挤压）
    this.scene.tweens.add({
      targets: g,
      scaleY: { from: 1, to: 0.15 },
      duration: 120, ease: 'Cubic.easeIn',
      onComplete: () => {
        // 消灭昆虫
        this.insectSystem.captureInsect(insect.id)
        // 咀嚼粒子（绿色碎片）
        for (let i = 0; i < 6; i++) {
          const spark = this.scene.add.graphics()
          spark.fillStyle(0x00ff44, 0.9)
          spark.fillCircle(sx + (Math.random() - 0.5) * 20, sy - 28 + (Math.random() - 0.5) * 10, 2)
          this.container.add(spark)
          this.scene.tweens.add({
            targets: spark,
            y: spark.y - 12 - Math.random() * 8,
            alpha: 0, duration: 400 + Math.random() * 200,
            onComplete: () => spark.destroy()
          })
        }
        // 夹子重新打开
        this.scene.tweens.add({
          targets: g,
          scaleY: { from: 0.15, to: 1 },
          duration: 500, delay: plant.cfg.digestionTime,
          ease: 'Back.easeOut',
          onComplete: () => { plant.state = 'idle' }
        })
      }
    })
  }

  // ── 有毒植物特效 ──────────────────────────────────────────────────────────

  _startToxicParticles(plant) {
    const { sx, sy } = plant
    this.scene.time.addEvent({
      delay: 600 + Math.random() * 400,
      callback: () => {
        if (!plant.graphics.active) return
        // 毒雾上升
        const p = this.scene.add.graphics()
        const ox = (Math.random() - 0.5) * 14
        p.fillStyle(0xcc00ff, 0.5)
        p.fillCircle(sx + ox, sy - 22, 3 + Math.random() * 2)
        p.setDepth(plant.wx + plant.wy + 0.8)
        this.container.add(p)
        this.scene.tweens.add({
          targets: p,
          y: p.y - 18 - Math.random() * 12,
          alpha: 0,
          scaleX: 1.8, scaleY: 1.8,
          duration: 1200 + Math.random() * 400,
          ease: 'Sine.easeOut',
          onComplete: () => p.destroy()
        })
      },
      repeat: -1,
    })
  }

  // ── 采集普通植物 (M16 enhanced) ───────────────────────────────────────────

  _harvestPlant(plant, key) {
    if (plant.state !== 'idle') return
    plant.state = 'harvested'
    // 采集弹出效果
    this.scene.tweens.add({
      targets: plant.graphics,
      scaleY: { from: 1, to: 0 },
      y: plant.graphics.y - 10,
      duration: 300, ease: 'Back.easeIn',
      onComplete: () => {
        plant.graphics.destroy()
        this.plants.delete(key)
      }
    })
    // M16: 应用物种专属效果
    if (plant.species) {
      this._applySpeciesHarvest(plant)
      this._showActionText(plant.sx, plant.sy - 40, `🌿 ${plant.species.name}`, 0x88ff44)
    } else {
      this._showActionText(plant.sx, plant.sy - 40, '🌿 采集草药', 0x88ff44)
    }
  }

  /** M16: 应用 BiomeContentMap 物种效果（通过 FoodSystem / CombatSystem）*/
  _applySpeciesHarvest(plant) {
    const sp = plant.species
    const fs = this.scene.foodSystem
    const cs = this.scene.combatSystem
    if (!sp || !cs) return
    // HP 恢复
    if (sp.hpRestore > 0) {
      cs.hp = Math.min(cs.maxHp, cs.hp + sp.hpRestore)
      cs.refreshUI()
    }
    // 效果
    if (sp.effect && fs) {
      fs._applyEffect(sp.effect, sp)
    }
  }

  /** M16: 悬停 tooltip 显示物种名称 */
  _showSpeciesTooltip(plant) {
    this._hideTooltip()
    if (!plant.species) return
    const sp = plant.species
    const label = sp.name + (sp.hpRestore ? `  HP${sp.hpRestore > 0 ? '+' : ''}${sp.hpRestore}` : '')
    this._tooltip = this.scene.add.text(plant.sx, plant.sy - 45, label, {
      fontSize: '11px', color: '#eeffcc', stroke: '#000', strokeThickness: 3,
      backgroundColor: '#00000066', padding: { x: 4, y: 2 },
    }).setOrigin(0.5, 1).setDepth(9998).setScrollFactor(1)
    this.container.add(this._tooltip)
  }
  _hideTooltip() { this._tooltip?.destroy(); this._tooltip = null }


  // ── 工具函数 ─────────────────────────────────────────────────────────────

  _showActionText(sx, sy, text, color) {
    const style = {
      fontSize: '11px',
      fill: '#' + color.toString(16).padStart(6, '0'),
      stroke: '#000000', strokeThickness: 2,
    }
    const t = this.scene.add.text(sx, sy, text, style).setOrigin(0.5, 1)
    t.setDepth(9999)
    this.scene.tweens.add({
      targets: t, y: t.y - 22, alpha: 0, duration: 1400, ease: 'Sine.easeOut',
      onComplete: () => t.destroy()
    })
  }

  _hash(wx, wy, salt = 0) {
    let h = (wx * 73856093) ^ (wy * 19349663) ^ salt
    h = ((h >> 16) ^ h) * 0x45d9f3b
    h = ((h >> 16) ^ h) * 0x45d9f3b
    h = (h >> 16) ^ h
    return Math.abs(h % 10000) / 10000
  }

  _weightedRandom(weights, wx, wy) {
    const r = this._hash(wx, wy, 0xf00d)
    let cumulative = 0
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i]
      if (r < cumulative) return i
    }
    return 0
  }

  // ── 每帧更新 ─────────────────────────────────────────────────────────────

  update(now) {
    this.checkCarnivorousHunting(now)
  }
}
