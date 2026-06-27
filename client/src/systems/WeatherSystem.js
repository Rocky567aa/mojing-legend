/**
 * WeatherSystem — 天气系统
 *
 * 天气类型：
 *   clear      晴天（默认，无特效）
 *   rain       雨天  — 蓝灰雨滴粒子 + 轻微暗化
 *   storm      雷暴  — 密集雨 + 闪电 + 屏幕震动
 *   snow       雪天  — 白色雪花飘落
 *   fog        大雾  — 白色半透明叠加层 + 视野收窄
 *   sandstorm  沙暴  — 橙棕粒子横扫
 *
 * 每隔 CHANGE_INTERVAL 秒随机切换天气（基于当前群系偏好权重）。
 * 通过在 Phaser 画布上用 Canvas 2D 绘制粒子（setTexture('__DEFAULT')） 
 * 和 Tween 驱动的 Graphics 闪电实现。
 */

const WEATHER_WEIGHTS = {
  // biome id → { weatherType: weight }
  0: { clear: 60, rain: 25, storm: 10, fog:  5 },   // 草地
  1: { clear: 40, storm: 40, fog: 10, rain: 10 },   // 火焰峡谷
  2: { clear: 20, snow: 60, fog: 20 },               // 永冻
  3: { clear: 20, storm: 60, rain: 20 },             // 雷霆高地
  4: { clear: 30, fog:  50, rain: 20 },              // 幽暗地穴
  5: { clear: 80, fog:  20 },                        // 神圣遗迹
  // 15 new biomes
  6:  { clear: 30, rain: 30, fog: 40 },              // 腐化沼泽
  7:  { clear: 60, fog: 40 },                        // 水晶洞穴
  8:  { clear: 20, storm: 60, rain: 20 },            // 熔岩高原
  9:  { clear: 20, snow: 70, fog: 10 },              // 极光冻原
  10: { clear: 30, fog: 50, rain: 20 },              // 幽灵海湾
  11: { clear: 20, rain: 60, storm: 20 },            // 毒素丛林
  12: { sandstorm: 50, clear: 40, fog: 10 },         // 骨灰荒漠
  13: { sandstorm: 60, clear: 30, storm: 10 },       // 废铁遗迹
  14: { clear: 40, fog: 30, rain: 30 },              // 陨石荒地
  15: { clear: 30, fog: 50, storm: 20 },             // 深渊裂缝
  16: { clear: 30, rain: 40, fog: 30 },              // 巨菇密林
  17: { clear: 60, fog: 30, sandstorm: 10 },         // 幻境绿洲
  18: { clear: 20, snow: 70, fog: 10 },              // 银雪山脉
  19: { clear: 30, rain: 30, fog: 40 },              // 腐朽密林
  20: { clear: 20, storm: 50, rain: 30 },            // 混沌熔炉
}

const CHANGE_INTERVAL = 90_000   // 每 90 秒可能换天气

export class WeatherSystem {
  constructor(scene) {
    this.scene   = scene
    this.current = 'clear'
    this.biome   = 0
    this._changeTimer = 0
    this._particles   = []     // { g, vx, vy, life, maxLife }
    this._lightningTimer = 0
    this._MAX_PARTICLES = 220

    const { width, height } = scene.scale
    this.W = width
    this.H = height

    // 天气叠加层（雾 / 沙暴底色）
    this.fogOverlay = scene.add.graphics().setDepth(498).setScrollFactor(0)
    // 粒子图层（雨/雪/沙）
    this.particleLayer = scene.add.graphics().setDepth(499).setScrollFactor(0)
    // 天气标签
    this.weatherLabel = scene.add.text(this.W - 14, 50, '', {
      fontSize: '12px', color: '#ccddff',
      stroke: '#000000', strokeThickness: 2,
      backgroundColor: '#00000055',
      padding: { x: 6, y: 3 },
    }).setOrigin(1, 0).setDepth(501).setScrollFactor(0)
  }

  // ── 公共接口 ──────────────────────────────────────────────────────────────

  /** 每帧调用 */
  update(delta, biome) {
    this.biome = biome ?? 0
    this._changeTimer += delta
    if (this._changeTimer >= CHANGE_INTERVAL) {
      this._changeTimer = 0
      this._tryChangeWeather()
    }

    this._updateParticles(delta)
    this._updateFogOverlay()
    this._drawParticles()

    if (this.current === 'storm') {
      this._lightningTimer += delta
      if (this._lightningTimer >= 3000 + Math.random() * 5000) {
        this._lightningTimer = 0
        this._triggerLightning()
      }
    }

    this.weatherLabel.setText(this._label())
  }

  /** 强制切换天气（外部调用） */
  setWeather(type) {
    this.current = type
    this._particles = []
  }

  /** 是否有降雪（供其他系统感知） */
  isSnowing() { return this.current === 'snow' }
  isStorming() { return this.current === 'storm' }

  destroy() {
    this.fogOverlay.destroy()
    this.particleLayer.destroy()
    this.weatherLabel.destroy()
  }

  // ── 粒子逻辑 ──────────────────────────────────────────────────────────────

  _tryChangeWeather() {
    const weights = WEATHER_WEIGHTS[this.biome] ?? WEATHER_WEIGHTS[0]
    const total   = Object.values(weights).reduce((a, b) => a + b, 0)
    let r = Math.random() * total
    for (const [type, w] of Object.entries(weights)) {
      r -= w
      if (r <= 0) { this.current = type; this._particles = []; return }
    }
    this.current = 'clear'
    this._particles = []
  }

  _updateParticles(dt) {
    const W = this.W, H = this.H
    // 产生新粒子
    let spawnRate = 0
    if      (this.current === 'rain')      spawnRate = 6
    else if (this.current === 'storm')     spawnRate = 12
    else if (this.current === 'snow')      spawnRate = 3
    else if (this.current === 'sandstorm') spawnRate = 8

    for (let i = 0; i < spawnRate; i++) {
      if (this._particles.length >= this._MAX_PARTICLES) break
      this._particles.push(this._newParticle())
    }

    // 更新现有粒子
    const alive = []
    for (const p of this._particles) {
      p.x  += p.vx * dt / 16
      p.y  += p.vy * dt / 16
      p.life -= dt
      if (p.life > 0 && p.y < H + 20 && p.x > -20 && p.x < W + 20) {
        alive.push(p)
      }
    }
    this._particles = alive
  }

  _newParticle() {
    const W = this.W, H = this.H
    const type = this.current

    if (type === 'rain' || type === 'storm') {
      return {
        x: Math.random() * (W + 100) - 50,
        y: -10,
        vx: -1.5 - Math.random(),
        vy: 14 + Math.random() * 6 + (type === 'storm' ? 5 : 0),
        life: 2000,
        maxLife: 2000,
        type,
        len: 8 + Math.random() * 5,
        col: 0x7799bb,
        alpha: 0.5 + Math.random() * 0.3,
      }
    }
    if (type === 'snow') {
      return {
        x: Math.random() * (W + 60) - 30,
        y: -8,
        vx: (Math.random() - 0.5) * 0.8,
        vy: 1.5 + Math.random() * 1.5,
        life: 5000 + Math.random() * 3000,
        maxLife: 8000,
        type,
        r: 2 + Math.random() * 2,
        col: 0xeeeeff,
        alpha: 0.7 + Math.random() * 0.3,
        drift: Math.random() * Math.PI * 2,   // 飘动相位
      }
    }
    if (type === 'sandstorm') {
      return {
        x: W + 10,
        y: Math.random() * H,
        vx: -(8 + Math.random() * 6),
        vy: (Math.random() - 0.5) * 1,
        life: 2500,
        maxLife: 2500,
        type,
        len: 6 + Math.random() * 8,
        col: 0xcc8822,
        alpha: 0.35 + Math.random() * 0.3,
      }
    }
    return null
  }

  _updateFogOverlay() {
    this.fogOverlay.clear()
    const type = this.current
    if (type === 'fog') {
      this.fogOverlay.fillStyle(0xaabbcc, 0.35)
      this.fogOverlay.fillRect(0, 0, this.W, this.H)
    } else if (type === 'sandstorm') {
      this.fogOverlay.fillStyle(0xcc8833, 0.18)
      this.fogOverlay.fillRect(0, 0, this.W, this.H)
    } else if (type === 'storm') {
      this.fogOverlay.fillStyle(0x112244, 0.15)
      this.fogOverlay.fillRect(0, 0, this.W, this.H)
    }
  }

  _drawParticles() {
    this.particleLayer.clear()
    for (const p of this._particles) {
      const a = Math.min(p.alpha, p.life / (p.maxLife * 0.3))
      if (p.type === 'rain' || p.type === 'storm') {
        this.particleLayer.lineStyle(1.5, p.col, Math.min(a, 0.8))
        this.particleLayer.beginPath()
        this.particleLayer.moveTo(p.x, p.y)
        this.particleLayer.lineTo(p.x + p.vx * 0.5, p.y - p.len)
        this.particleLayer.strokePath()
      } else if (p.type === 'snow') {
        // 雪花带微微飘动
        const wx = p.x + Math.sin(p.drift + p.y * 0.02) * 2
        this.particleLayer.fillStyle(p.col, Math.min(a, 0.9))
        this.particleLayer.fillCircle(wx, p.y, p.r)
      } else if (p.type === 'sandstorm') {
        this.particleLayer.lineStyle(1, p.col, Math.min(a, 0.7))
        this.particleLayer.beginPath()
        this.particleLayer.moveTo(p.x, p.y)
        this.particleLayer.lineTo(p.x + p.len * 1.8, p.y + (Math.random() - 0.5) * 2)
        this.particleLayer.strokePath()
      }
    }
  }

  _triggerLightning() {
    const scene = this.scene
    const W = this.W, H = this.H

    // 白闪
    const flash = scene.add.graphics().setDepth(502).setScrollFactor(0)
    flash.fillStyle(0xffffff, 0.6)
    flash.fillRect(0, 0, W, H)
    scene.tweens.add({
      targets: flash, alpha: 0, duration: 120,
      onComplete: () => flash.destroy(),
    })

    // 折线闪电
    const bolt = scene.add.graphics().setDepth(503).setScrollFactor(0)
    const sx = W * 0.2 + Math.random() * W * 0.6
    bolt.lineStyle(2, 0xeeeeff, 0.9)
    bolt.beginPath()
    let bx = sx, by = 0
    bolt.moveTo(bx, by)
    while (by < H * 0.75) {
      bx += (Math.random() - 0.5) * 60
      by += 40 + Math.random() * 30
      bolt.lineTo(bx, by)
    }
    bolt.strokePath()

    scene.tweens.add({
      targets: bolt, alpha: 0, duration: 200,
      onComplete: () => bolt.destroy(),
    })

    // 屏幕轻微震动
    scene.cameras.main.shake(120, 0.004)
  }

  _label() {
    const icons = {
      clear: '☀️ 晴天', rain: '🌧 小雨', storm: '⛈ 雷暴',
      snow: '❄️ 降雪', fog: '🌫 大雾', sandstorm: '🌪 沙暴',
    }
    return icons[this.current] ?? ''
  }
}
