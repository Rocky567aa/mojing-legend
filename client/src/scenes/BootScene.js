import { preloadBiomeTiles } from '../utils/BiomeTileMap.js'

/**
 * BootScene — 资源预加载场景
 * 加载所有素材后跳转到职业选择场景（新玩家）或世界场景（老玩家）
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    // 加载进度条
    const { width, height } = this.scale
    const bar = this.add.graphics()
    const bg = this.add.graphics()
    bg.fillStyle(0x222244, 1)
    bg.fillRect(width / 2 - 160, height / 2 - 15, 320, 30)

    this.load.on('progress', (value) => {
      bar.clear()
      bar.fillStyle(0x9933ff, 1)
      bar.fillRect(width / 2 - 158, height / 2 - 13, 316 * value, 26)
    })

    const title = this.add.text(width / 2, height / 2 - 60, '魔晶传说', {
      fontSize: '32px', color: '#cc88ff', fontStyle: 'bold'
    }).setOrigin(0.5)

    const loading = this.add.text(width / 2, height / 2 + 50, '加载中...', {
      fontSize: '16px', color: '#8866aa'
    }).setOrigin(0.5)

    // AI-生成地形贴图 (15个新群系)
    preloadBiomeTiles(this)
    // TODO: 加载等距瓦片图集、角色精灵、魔晶特效图
    // this.load.atlas('tiles', 'assets/tiles/isometric.png', 'assets/tiles/isometric.json')
    // this.load.atlas('crystals', 'assets/crystals/all.png', 'assets/crystals/all.json')
    // this.load.atlas('player', 'assets/player/sprites.png', 'assets/player/sprites.json')
  }

  create() {
    // 每次进入游戏都弹出英雄选择界面，把已有存档传过去保留进度
    let saveData = null
    try {
      const raw = localStorage.getItem('mojing_save')
      if (raw) saveData = JSON.parse(raw)
    } catch (e) {
      console.warn('[Boot] 存档损坏，已重置', e)
      localStorage.removeItem('mojing_save')
    }
    this.scene.start('ProfessionSelectScene', { existingSave: saveData })
  }
}
