/**
 * DayNightSystem — 昼夜循环系统
 *
 * 一个完整的游戏昼夜周期 = 10 分钟现实时间（可调）
 * 分六个阶段：
 *   日出 (06:00–08:00) → 白昼 (08:00–17:00) → 黄昏 (17:00–19:00)
 *   → 入夜 (19:00–21:00) → 深夜 (21:00–05:00) → 黎明 (05:00–06:00)
 *
 * 实现：在场景顶部叠加一个全屏半透明色彩层（overlay），通过色调变化
 * 模拟光照变化；同时驱动 UI 时钟显示。
 */
export class DayNightSystem {
  /**
   * @param {Phaser.Scene} scene
   * @param {object} opts
   * @param {number} [opts.cycleDuration=600000] 一天周期毫秒数（默认 10 分钟）
   * @param {number} [opts.startTime=0.25]       起始时间比例 (0=午夜, 0.25=06:00)
   */
  constructor(scene, opts = {}) {
    this.scene = scene
    this.cycleDuration = opts.cycleDuration ?? 600_000   // 10 min
    this.timeRatio     = opts.startTime ?? 0.25          // 从黎明开始

    const { width, height } = scene.scale

    // 全屏色调叠加层（scrollFactor=0 跟随 UI 而非世界）
    this.overlay = scene.add.graphics()
      .setDepth(500)
      .setScrollFactor(0)
    this._drawOverlay(0x000011, 0)   // 先画一次占位

    // 时钟文字
    this.clockText = scene.add.text(width / 2, 10, '', {
      fontSize: '13px',
      color: '#ffe8a0',
      stroke: '#000000',
      strokeThickness: 3,
      backgroundColor: '#00000055',
      padding: { x: 8, y: 3 },
    }).setOrigin(0.5, 0).setDepth(501).setScrollFactor(0)

    // 天体图标（☀/🌙）
    this.sunMoonIcon = scene.add.text(width / 2, 30, '', {
      fontSize: '20px',
    }).setOrigin(0.5, 0).setDepth(501).setScrollFactor(0)

    // 更新一次初始状态
    this.update(0)
  }

  // ── 核心更新 ──────────────────────────────────────────────────────────────

  /**
   * @param {number} delta  帧间隔毫秒
   */
  update(delta) {
    this.timeRatio = (this.timeRatio + delta / this.cycleDuration) % 1

    const phase = this._getPhase(this.timeRatio)
    const { color, alpha, label, icon } = this._interpolatePhase(this.timeRatio)

    this._drawOverlay(color, alpha)

    // 时钟
    const totalMinutes = Math.round(this.timeRatio * 1440)
    const h = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
    const m = String(totalMinutes % 60).padStart(2, '0')
    this.clockText.setText(`${icon} ${h}:${m}  ${label}`)
  }

  /** 当前是否白天（08:00–18:00） */
  isDay() {
    return this.timeRatio >= 8 / 24 && this.timeRatio < 18 / 24
  }

  /** 当前是否深夜（21:00–05:00） */
  isDeepNight() {
    return this.timeRatio > 21 / 24 || this.timeRatio < 5 / 24
  }

  /** 0–1 亮度（1=正午，0=深夜） */
  getBrightness() {
    const t = this.timeRatio
    if (t >= 0.5 / 24 && t < 8 / 24) {
      return (t - 0.5 / 24) / (7.5 / 24)
    }
    if (t >= 8 / 24 && t < 17 / 24) return 1
    if (t >= 17 / 24 && t < 21 / 24) {
      return 1 - (t - 17 / 24) / (4 / 24)
    }
    return 0
  }

  destroy() {
    this.overlay.destroy()
    this.clockText.destroy()
    this.sunMoonIcon.destroy()
  }

  // ── 内部 ──────────────────────────────────────────────────────────────────

  _drawOverlay(color, alpha) {
    const { width, height } = this.scene.scale
    this.overlay.clear()
    this.overlay.fillStyle(color, alpha)
    this.overlay.fillRect(0, 0, width, height)
  }

  /**
   * 根据 timeRatio 插值出叠加色 + 透明度 + 标签
   * 关键帧 (timeRatio → [color, alpha, label]):
   *   0.00 (00:00) 深夜   #000033  0.55
   *   0.21 (05:00) 黎明   #ff6030  0.25
   *   0.25 (06:00) 日出   #ffaa44  0.10
   *   0.33 (08:00) 白昼   #000000  0.00
   *   0.71 (17:00) 黄昏   #ff8030  0.12
   *   0.79 (19:00) 入夜   #330055  0.30
   *   0.875(21:00) 深夜   #000033  0.55
   */
  _interpolatePhase(t) {
    const KF = [
      { t: 0,        color: [0,0,51],    alpha: 0.55, label: '深夜', icon: '🌙' },
      { t: 5/24,     color: [200,60,20], alpha: 0.25, label: '黎明', icon: '🌅' },
      { t: 6/24,     color: [255,160,60],alpha: 0.08, label: '日出', icon: '🌤' },
      { t: 8/24,     color: [0,0,0],     alpha: 0.00, label: '白昼', icon: '☀️'  },
      { t: 17/24,    color: [200,80,20], alpha: 0.10, label: '黄昏', icon: '🌇' },
      { t: 19/24,    color: [40,0,70],   alpha: 0.30, label: '入夜', icon: '🌆' },
      { t: 21/24,    color: [0,0,51],    alpha: 0.55, label: '深夜', icon: '🌙' },
      { t: 1,        color: [0,0,51],    alpha: 0.55, label: '深夜', icon: '🌙' },
    ]

    let a = KF[0], b = KF[KF.length - 1]
    for (let i = 0; i < KF.length - 1; i++) {
      if (t >= KF[i].t && t < KF[i+1].t) { a = KF[i]; b = KF[i+1]; break }
    }

    const f = a.t === b.t ? 0 : (t - a.t) / (b.t - a.t)
    const r = Math.round(a.color[0] + (b.color[0]-a.color[0]) * f)
    const g = Math.round(a.color[1] + (b.color[1]-a.color[1]) * f)
    const bv= Math.round(a.color[2] + (b.color[2]-a.color[2]) * f)
    const alpha = a.alpha + (b.alpha - a.alpha) * f
    const color = (r<<16)|(g<<8)|bv

    const label = f < 0.5 ? a.label : b.label
    const icon  = f < 0.5 ? a.icon  : b.icon

    return { color, alpha, label, icon }
  }

  _getPhase(t) {
    if (t < 5/24)    return 'deep_night'
    if (t < 6/24)    return 'dawn'
    if (t < 8/24)    return 'sunrise'
    if (t < 17/24)   return 'day'
    if (t < 19/24)   return 'dusk'
    if (t < 21/24)   return 'evening'
    return 'deep_night'
  }
}
