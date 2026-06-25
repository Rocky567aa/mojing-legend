/**
 * PickupNotification.js — 拾取提示 UI 系统
 *
 * 收集到物资后，在屏幕右侧弹出卡片：
 *   ┌──────────────────────┐
 *   │  🔴  获得道具          │
 *   │                      │
 *   │  火玄矿               │
 *   │  Ⅱ阶 · 少见矿石        │
 *   │  ×1                  │
 *   └──────────────────────┘
 *
 * 动画：从右侧滑入 → 停留 2.2s → 向上淡出
 * 支持队列：同时触发多个时自动垂直排列
 */

// 物资完整信息表（中文名称 + 等级 + 稀有度）
export const ITEM_INFO = {
  // ── 矿石类 ─────────────────────────────────────────────────
  fire_ore: {
    name: '火玄矿',
    tier: 'Ⅰ阶',
    rarity: '普通',
    rarityColor: '#888888',
    borderColor: '#ff4400',
    icon: '🔴',
    desc: '炼制火焰晶的原矿',
  },
  ice_ore: {
    name: '寒冰晶矿',
    tier: 'Ⅰ阶',
    rarity: '普通',
    rarityColor: '#888888',
    borderColor: '#44aaee',
    icon: '🔵',
    desc: '炼制冰霜晶的原矿',
  },
  thunder_ore: {
    name: '雷纹矿',
    tier: 'Ⅱ阶',
    rarity: '少见',
    rarityColor: '#4488ff',
    borderColor: '#ffdd22',
    icon: '⚡',
    desc: '带有天雷纹路的导电矿石',
  },
  dark_ore: {
    name: '暗影矿脉',
    tier: 'Ⅱ阶',
    rarity: '少见',
    rarityColor: '#4488ff',
    borderColor: '#7700aa',
    icon: '🌑',
    desc: '地穴深处的暗影晶矿',
  },
  holy_ore: {
    name: '圣光矿',
    tier: 'Ⅲ阶',
    rarity: '稀有',
    rarityColor: '#9933ff',
    borderColor: '#ffee88',
    icon: '✨',
    desc: '古代遗迹中的神圣矿脉',
  },
  chaos_ore: {
    name: '混沌原石',
    tier: 'Ⅳ阶',
    rarity: '传说',
    rarityColor: '#ff8800',
    borderColor: '#cc99ff',
    icon: '🌈',
    desc: '极稀有 · 唯一混沌晶原料',
  },
  // ── 材料类（后续扩展） ───────────────────────────────────────
  wood: {
    name: '橡木原木',
    tier: 'Ⅰ阶',
    rarity: '普通',
    rarityColor: '#888888',
    borderColor: '#8B4513',
    icon: '🪵',
    desc: '建造基地的基础木材',
  },
  stone: {
    name: '花岗石块',
    tier: 'Ⅰ阶',
    rarity: '普通',
    rarityColor: '#888888',
    borderColor: '#aaaaaa',
    icon: '🪨',
    desc: '坚固的建筑用石材',
  },
  magic_herb: {
    name: '魔法草药',
    tier: 'Ⅱ阶',
    rarity: '少见',
    rarityColor: '#4488ff',
    borderColor: '#44cc44',
    icon: '🌿',
    desc: '合成净化剂的原料',
  },
}

// ── PickupNotification 类 ────────────────────────────────────────────────────

export class PickupNotification {
  /**
   * @param {Phaser.Scene} scene - 所属场景
   */
  constructor(scene) {
    this.scene = scene
    this.queue = []          // 当前显示中的通知列表
    this.maxVisible = 4      // 最多同时显示 4 条
    this.cardWidth = 220
    this.cardHeight = 78
    this.margin = 10         // 卡片间距
    this.rightPad = 16       // 距屏幕右边距
    this.topStart = 70       // 第一张卡片顶部 Y 位置
  }

  /**
   * 显示拾取通知
   * @param {string} itemKey - 物资 key（对应 ITEM_INFO）
   * @param {number} count   - 数量（默认 1）
   */
  show(itemKey, count = 1) {
    const info = ITEM_INFO[itemKey]
    if (!info) return

    // 超出最大数量时移除最早的
    if (this.queue.length >= this.maxVisible) {
      const oldest = this.queue.shift()
      if (oldest && oldest.container) oldest.container.destroy()
    }

    this._createCard(info, count)
    this._repositionAll()
  }

  _createCard(info, count) {
    const scene = this.scene
    const { width, height } = scene.scale
    const cw = this.cardWidth, ch = this.cardHeight

    // 容器，固定在屏幕坐标（不随地图滚动）
    const container = scene.add.container(width + cw, this.topStart).setDepth(1000).setScrollFactor(0)

    // ── 背景 ─────────────────────────────────────────────────
    const bg = scene.add.graphics()
    // 外发光（稀有度颜色）
    const borderColor = parseInt(info.borderColor.replace('#', ''), 16)
    bg.lineStyle(2, borderColor, 0.9)
    bg.fillStyle(0x0a0a1e, 0.93)
    bg.strokeRoundedRect(-cw / 2, -ch / 2, cw, ch, 8)
    bg.fillRoundedRect(-cw / 2, -ch / 2, cw, ch, 8)
    // 左侧彩色竖条
    bg.fillStyle(borderColor, 1)
    bg.fillRoundedRect(-cw / 2, -ch / 2, 4, ch, { tl: 8, bl: 8, tr: 0, br: 0 })

    // ── 顶部小标签 "获得道具" ─────────────────────────────────
    const labelBg = scene.add.graphics()
    labelBg.fillStyle(borderColor, 0.25)
    labelBg.fillRoundedRect(-cw / 2 + 10, -ch / 2 + 6, 68, 16, 3)

    const labelText = scene.add.text(-cw / 2 + 44, -ch / 2 + 14, '获 得 道 具', {
      fontSize: '9px', color: info.borderColor, fontStyle: 'bold',
    }).setOrigin(0.5)

    // ── 图标 ─────────────────────────────────────────────────
    const iconText = scene.add.text(-cw / 2 + 28, 2, info.icon, {
      fontSize: '26px',
    }).setOrigin(0.5)

    // ── 物资名称（中文，大字）────────────────────────────────
    const nameText = scene.add.text(-cw / 2 + 58, -ch / 2 + 28, info.name, {
      fontSize: '15px', color: '#ffffff', fontStyle: 'bold',
    })

    // ── 等级 + 稀有度 ────────────────────────────────────────
    const tierText = scene.add.text(-cw / 2 + 58, -ch / 2 + 46, `${info.tier} · ${info.rarity}`, {
      fontSize: '11px', color: info.rarityColor,
    })

    // ── 数量 ─────────────────────────────────────────────────
    const countText = scene.add.text(cw / 2 - 14, ch / 2 - 14, `×${count}`, {
      fontSize: '13px', color: '#cccccc', fontStyle: 'bold',
    }).setOrigin(1, 1)

    container.add([bg, labelBg, labelText, iconText, nameText, tierText, countText])

    // ── 闪光扫描特效 ─────────────────────────────────────────
    const shine = scene.add.graphics()
    shine.fillStyle(0xffffff, 0.15)
    shine.fillRect(-cw / 2, -ch / 2, 20, ch)
    container.add(shine)
    scene.tweens.add({
      targets: shine, x: cw, duration: 600, ease: 'Quad.easeIn',
      delay: 150,
      onComplete: () => shine.destroy(),
    })

    // ── 滑入动画 ─────────────────────────────────────────────
    const { width: sw } = scene.scale
    const targetX = sw - this.rightPad - cw / 2

    scene.tweens.add({
      targets: container,
      x: targetX,
      duration: 320,
      ease: 'Back.easeOut',
    })

    // ── 停留后向上淡出 ────────────────────────────────────────
    const entry = { container, info }
    this.queue.push(entry)

    scene.time.delayedCall(2400, () => {
      if (!container.active) return
      scene.tweens.add({
        targets: container, y: container.y - 30, alpha: 0,
        duration: 450, ease: 'Power2',
        onComplete: () => {
          container.destroy()
          const idx = this.queue.indexOf(entry)
          if (idx !== -1) this.queue.splice(idx, 1)
          this._repositionAll()
        },
      })
    })
  }

  // 重新排列所有卡片 Y 位置
  _repositionAll() {
    const scene = this.scene
    const { width } = scene.scale
    const targetX = width - this.rightPad - this.cardWidth / 2

    this.queue.forEach((entry, i) => {
      if (!entry.container || !entry.container.active) return
      const targetY = this.topStart + i * (this.cardHeight + this.margin) + this.cardHeight / 2
      scene.tweens.add({
        targets: entry.container,
        x: targetX, y: targetY,
        duration: 250, ease: 'Power2',
      })
    })
  }
}
