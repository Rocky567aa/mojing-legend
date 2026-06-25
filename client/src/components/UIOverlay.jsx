import React from 'react'

/**
 * UIOverlay — React UI 覆盖层
 * 渲染在 Phaser Canvas 之上，用于 HUD、背包弹窗、系统菜单等
 */
export default function UIOverlay({ game }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none',   // 默认不阻断鼠标事件到 Phaser
      zIndex: 10
    }}>
      {/* 右上角版本水印 */}
      <div style={{
        position: 'absolute', bottom: 8, right: 12,
        color: 'rgba(150,100,220,0.5)', fontSize: '11px',
        userSelect: 'none'
      }}>
        魔晶传说 v0.1 · prototype
      </div>
    </div>
  )
}
