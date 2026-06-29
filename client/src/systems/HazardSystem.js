/**
 * HazardSystem.js — 流沙 / 龙卷风 / 漩涡拉拽 危害系统 (M15)
 *
 * 职责
 * ────
 * 1. 根据玩家当前群系 hazard 标记，激活对应危害效果
 * 2. 管理视觉粒子（全部用 Phaser.Graphics 原语，无需外部贴图）
 * 3. 对外暴露两个接口供 WorldScene 查询：
 *      getMoveSpeedMul()   → 速度惩罚系数（quicksand 0.25 · pull 0.60 · 其他 1.0）
 *      tryDriftPlayer(dt)  → 本帧需要强制移动玩家的 tile 偏移 {dx,dy}|null
 *    并通过 combatSystem.takeDamage() 直接施加危害伤害
 *
 * ── hazard 类型效果 ──────────────────────────────────────────────────────────
 *
 * quicksand（流沙平原 biome 6/12/17）
 *   - 移速 ×0.25（近乎寸步难行）
 *   - 每 2s 造成 1–2 HP 窒息伤害
 *   - 视觉：玩家脚下沙尘颗粒 + 轻微下沉抖动
 *   - 破解：主动技能（英雄自身冲锋/传送）可重置计时器
 *
 * tornado（荒漠暴风 biome 3/14/20）
 *   - 龙卷实体（最多 2 个）随机出现在玩家附近 160–280 px
 *   - 持续向玩家施加拉力（每 1.2s 被拉近 1 tile）
 *   - 玩家进入 70 px 爆炸圈：甩飞 2 tile + 造成 3–8 HP 伤害 + 龙卷消散
 *   - 视觉：旋转粒子环 + 中心深色核
 *
 * pull（漩涡之地 biome 15）
 *   - 移速 ×0.60
 *   - 每 2s 向地图中心拉 1 tile
 *   - 视觉：屏幕边缘向内收敛的旋流箭头（4 方向）
 */

import { BIOME_REGISTRY } from '../systems/BiomeSystem.js'

// ── 常量 ──────────────────────────────────────────────────────────────────────
const QUICKSAND_SPEED = 0.25
const QUICKSAND_DMG_INTERVAL = 2000   // ms
const QUICKSAND_DMG = 2               // HP per tick

const TORNADO_COUNT   = 2
const TORNADO_PULL_INTERVAL = 1200    // ms  玩家被拉近的间隔
const TORNADO_FLING_RANGE  = 70       // px  爆炸圈
const TORNADO_FLING_DMG    = 6        // HP  甩飞伤害（3–8 随机）
const TORNADO_LIFETIME     = 9000     // ms  龙卷存活时长
const TORNADO_RADIUS_OUTER = 46       // px  视觉外圈
const TORNADO_RADIUS_INNER = 18       // px  视觉核心

const PULL_SPEED    = 0.60
const PULL_INTERVAL = 2000            // ms  拉拽间隔

export class HazardSystem {
  constructor(scene) {
    this.scene     = scene
    this._hazard   = null   // 'quicksand' | 'tornado' | 'pull' | null

    // quicksand
    this._qsTimer  = 0
    this._qsGfx    = null
    this._qsTween  = null

    // tornado
    this._tornadoes = []   // { gfx, sx, sy, life, pullTimer, rot }
    this._tornadoSpawnTimer = 0

    // pull
    this._pullTimer = 0
    this._pullArrows = []  // Graphics for 4 directional arrows

    // HUD
    this._warningText = null
    this._warningTimer = 0
  }

  // ─── 外部接口 ──────────────────────────────────────────────────────────────

  /** WorldScene.update() 每帧调用 */
  update(delta, biomeId) {
    const info   = BIOME_REGISTRY[biomeId] ?? BIOME_REGISTRY[0]
    const hazard = info.hazard ?? null

    if (hazard !== this._hazard) this._switchHazard(hazard)
    this._hazard = hazard

    if (hazard === 'quicksand') this._updateQuicksand(delta)
    else if (hazard === 'tornado') this._updateTornadoes(delta)
    else if (hazard === 'pull')   this._updatePull(delta)

    if (this._warningTimer > 0) this._warningTimer -= delta
  }

  /** 返回移速乘数（注入 WorldScene 的 moveDelay 计算） */
  getMoveSpeedMul() {
    if (this._hazard === 'quicksand') return QUICKSAND_SPEED
    if (this._hazard === 'pull')      return PULL_SPEED
    return 1.0
  }

  /**
   * 本帧是否应强制移动玩家 tile（龙卷拉拽/漩涡拉拽）
   * @returns {{ dx:number, dy:number }|null}
   */
  tryDriftPlayer() {
    return this._pendingDrift ?? null
  }
  _clearDrift() { this._pendingDrift = null }

  // ─── 切换群系 ──────────────────────────────────────────────────────────────
  _switchHazard(next) {
    // 清理旧效果
    this._qsGfx?.destroy();    this._qsGfx = null
    this._qsTween?.stop()
    this._tornadoes.forEach(t => t.gfx?.destroy()); this._tornadoes = []
    this._pullArrows.forEach(a => a.destroy());     this._pullArrows = []
    this._tornadoSpawnTimer = 0
    this._pullTimer = 0
    this._qsTimer   = 0

    if (next) this._flashWarning(next)
  }

  // ─── 流沙 ──────────────────────────────────────────────────────────────────
  _updateQuicksand(delta) {
    const s = this.scene
    // 沙尘粒子
    if (!this._qsGfx || !this._qsGfx.active) {
      this._qsGfx = s.add.graphics().setDepth(1450).setScrollFactor(0)
    }
    this._qsGfx.clear()
    for (let i = 0; i < 18; i++) {
      const angle = (Date.now() / 900 + i * 20) % 360 * Math.PI / 180
      const r = 20 + Math.sin(Date.now() / 400 + i) * 6
      const px = s.scale.width / 2 + Math.cos(angle) * r
      const py = s.scale.height / 2 + 22 + Math.sin(angle) * r * 0.5
      const alpha = 0.3 + 0.3 * Math.sin(Date.now() / 300 + i)
      this._qsGfx.fillStyle(0xddbb88, alpha)
      this._qsGfx.fillCircle(px, py, 2 + Math.random())
    }

    // 窒息伤害
    this._qsTimer += delta
    if (this._qsTimer >= QUICKSAND_DMG_INTERVAL) {
      this._qsTimer = 0
      const dmg = 1 + Math.floor(Math.random() * QUICKSAND_DMG)
      s.combatSystem?.takeDamage(dmg)
      this._floatDanger(`−${dmg}`, '#ffaa44')
    }
  }

  // ─── 龙卷风 ────────────────────────────────────────────────────────────────
  _updateTornadoes(delta) {
    const s = this.scene
    this._pendingDrift = null

    // 生成
    this._tornadoSpawnTimer -= delta
    if (this._tornadoes.length < TORNADO_COUNT && this._tornadoSpawnTimer <= 0) {
      this._spawnTornado()
      this._tornadoSpawnTimer = 3000 + Math.random() * 2000
    }

    const cx = s.scale.width / 2
    const cy = s.scale.height / 2 - 30

    for (let i = this._tornadoes.length - 1; i >= 0; i--) {
      const t = this._tornadoes[i]
      t.life -= delta
      t.pullTimer -= delta
      t.rot = (t.rot + delta * 0.003) % (Math.PI * 2)

      // 缓慢飘移
      const drift = Math.sin(t.life / 700) * 0.15
      t.sx += Math.cos(t.rot * 0.4) * drift * delta * 0.04
      t.sy += drift * delta * 0.02

      // 存活到期
      if (t.life <= 0) { t.gfx?.destroy(); this._tornadoes.splice(i, 1); continue }

      // 拉拽玩家（每 1.2s 向龙卷方向位移 1 tile）
      const dx = t.sx - cx, dy = t.sy - cy
      const dist = Math.hypot(dx, dy)
      if (t.pullTimer <= 0) {
        t.pullTimer = TORNADO_PULL_INTERVAL
        if (dist > TORNADO_FLING_RANGE && dist < 340) {
          // 龙卷将玩家向自身方向拉 1 tile
          const nx = dx / dist, ny = dy / dist
          this._pendingDrift = { dx: Math.round(nx), dy: Math.round(ny * 0.7) }
        }
      }

      // 甩飞范围
      if (dist < TORNADO_FLING_RANGE) {
        const flingDir = Math.random() * Math.PI * 2
        const fd = { dx: Math.round(Math.cos(flingDir) * 2), dy: Math.round(Math.sin(flingDir) * 2) }
        this._pendingDrift = fd
        const dmg = 3 + Math.floor(Math.random() * (TORNADO_FLING_DMG + 1))
        s.combatSystem?.takeDamage(dmg)
        this._floatDanger(`龙卷击飞 −${dmg}`, '#ffcc33')
        t.gfx?.destroy(); this._tornadoes.splice(i, 1); continue
      }

      // 绘制龙卷视觉
      this._drawTornado(t, t.sx, t.sy)
    }
  }

  _spawnTornado() {
    const s = this.scene
    const angle = Math.random() * Math.PI * 2
    const dist  = 160 + Math.random() * 120
    const tx = s.scale.width / 2  + Math.cos(angle) * dist
    const ty = s.scale.height / 2 + Math.sin(angle) * dist * 0.6
    const g  = s.add.graphics().setDepth(1460).setScrollFactor(0)
    this._tornadoes.push({ gfx: g, sx: tx, sy: ty, life: TORNADO_LIFETIME, pullTimer: 800, rot: 0 })
  }

  _drawTornado(t, x, y) {
    const g = t.gfx; g.clear()
    // 外旋转粒子环
    for (let k = 0; k < 16; k++) {
      const a = t.rot + k * (Math.PI * 2 / 16)
      const r = TORNADO_RADIUS_OUTER * (0.7 + 0.3 * Math.sin(t.rot * 2 + k))
      const px = x + Math.cos(a) * r
      const py = y + Math.sin(a) * r * 0.5
      const alpha = 0.4 + 0.4 * Math.abs(Math.sin(t.rot + k))
      g.fillStyle(0x886633, alpha)
      g.fillCircle(px, py, 3)
    }
    // 中圈
    for (let k = 0; k < 10; k++) {
      const a = -t.rot * 1.4 + k * (Math.PI * 2 / 10)
      const r = TORNADO_RADIUS_INNER + 6
      g.fillStyle(0xccaa55, 0.55)
      g.fillCircle(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.45, 2.5)
    }
    // 核心
    g.fillStyle(0x443322, 0.85); g.fillEllipse(x, y, 16, 10)
    // 警戒圈
    g.lineStyle(1, 0xff8800, 0.25)
    g.strokeEllipse(x, y, TORNADO_FLING_RANGE * 2, TORNADO_FLING_RANGE)
  }

  // ─── 漩涡拉拽 ──────────────────────────────────────────────────────────────
  _updatePull(delta) {
    const s = this.scene

    // 箭头视觉（屏幕四边 → 中心）
    if (this._pullArrows.length === 0) this._buildPullArrows()
    const t = Date.now() / 600
    this._pullArrows.forEach((a, i) => {
      a.setAlpha(0.35 + 0.25 * Math.abs(Math.sin(t + i * 1.57)))
    })

    // 定时拉拽
    this._pullTimer += delta
    if (this._pullTimer >= PULL_INTERVAL) {
      this._pullTimer = 0
      // 向世界地图中心拉拽（tile 1425,1425 是 2850/2 中心）
      const pt = s.playerTile
      const mcx = 1425, mcy = 1425
      const ddx = Math.sign(mcx - pt.x), ddy = Math.sign(mcy - pt.y)
      if (ddx !== 0 || ddy !== 0) {
        this._pendingDrift = { dx: ddx, dy: ddy }
        this._floatDanger('漩涡吸引！', '#cc99ff')
      }
    }
  }

  _buildPullArrows() {
    const s = this.scene
    const W = s.scale.width, H = s.scale.height
    const cx = W / 2, cy = H / 2
    // 上下左右各一个箭头指向中心
    const arrows = [
      { x: cx, y: 40,     angle: Math.PI / 2 },   // 上 → 下
      { x: cx, y: H - 40, angle: -Math.PI / 2 },  // 下 → 上
      { x: 40, y: cy,     angle: 0 },              // 左 → 右
      { x: W-40, y: cy,   angle: Math.PI },        // 右 → 左
    ]
    for (const a of arrows) {
      const g = s.add.graphics().setDepth(1440).setScrollFactor(0)
      g.fillStyle(0xcc88ff, 0.6)
      // 简单等腰三角（箭头形状）
      const len = 18, hw = 9
      g.fillTriangle(
        a.x + Math.cos(a.angle) * len, a.y + Math.sin(a.angle) * len,
        a.x + Math.cos(a.angle + Math.PI / 2) * hw, a.y + Math.sin(a.angle + Math.PI / 2) * hw,
        a.x + Math.cos(a.angle - Math.PI / 2) * hw, a.y + Math.sin(a.angle - Math.PI / 2) * hw,
      )
      this._pullArrows.push(g)
    }
  }

  // ─── HUD 警告 ──────────────────────────────────────────────────────────────
  _flashWarning(type) {
    const msgs = {
      quicksand: '⚠️ 流沙地带 · 行动迟缓',
      tornado:   '🌪 龙卷风区域 · 保持距离',
      pull:      '🌀 漩涡之地 · 强力拉拽',
    }
    const colors = { quicksand: '#ffdd88', tornado: '#ffcc33', pull: '#cc99ff' }
    const s = this.scene
    this._warningText?.destroy()
    this._warningText = s.add.text(s.scale.width / 2, s.scale.height / 2 - 110,
      msgs[type] ?? '⚠️ 危险区域',
      { fontSize: '16px', color: colors[type] ?? '#ffffff', stroke: '#000000', strokeThickness: 4, align: 'center' }
    ).setOrigin(0.5).setDepth(1700).setScrollFactor(0)
    s.tweens.add({
      targets: this._warningText, alpha: { from: 1, to: 0 }, y: '-=20',
      duration: 2800, ease: 'Power2',
      onComplete: () => { this._warningText?.destroy(); this._warningText = null },
    })
  }

  _floatDanger(txt, color) {
    const s = this.scene
    const t = s.add.text(s.scale.width / 2 + Phaser.Math.Between(-30, 30),
      s.scale.height / 2 - 60, txt,
      { fontSize: '13px', color, stroke: '#000000', strokeThickness: 3 }
    ).setOrigin(0.5).setDepth(1700).setScrollFactor(0)
    s.tweens.add({ targets: t, y: '-=22', alpha: 0, duration: 900, onComplete: () => t.destroy() })
  }

  destroy() {
    this._qsGfx?.destroy()
    this._tornadoes.forEach(t => t.gfx?.destroy())
    this._pullArrows.forEach(a => a.destroy())
    this._warningText?.destroy()
  }
}
