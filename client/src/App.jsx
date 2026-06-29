import React, { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import BootScene from './scenes/BootScene'
import TitleScene from './scenes/TitleScene'
import ProfessionSelectScene from './scenes/ProfessionSelectScene'
import WorldScene from './scenes/WorldScene'
import BaseScene from './scenes/BaseScene'
import UIOverlay from './components/UIOverlay'

const GAME_CONFIG = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#0a0a1a',
  scene: [BootScene, TitleScene, ProfessionSelectScene, WorldScene, BaseScene],
  dom: {
    createContainer: true
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  render: {
    pixelArt: false,
    antialias: true
  }
}

export default function App() {
  const gameRef = useRef(null)
  const containerRef = useRef(null)
  const [gameReady, setGameReady] = useState(false)

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      const game = new Phaser.Game({
        ...GAME_CONFIG,
        parent: containerRef.current
      })
      gameRef.current = game
      setGameReady(true)
    }
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Phaser Canvas Layer */}
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
      {/* React UI Overlay Layer */}
      {gameReady && <UIOverlay game={gameRef.current} />}
    </div>
  )
}
