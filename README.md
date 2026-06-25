# 魔晶传说 (Mojing Legend)

> 伪3D 等距沙盒 · 综合模拟 · 生存 RPG

## 核心玩法

```
采矿 → 搅碎机 → 提纯槽 → 炼金机 → ✨魔晶
```

六阶魔晶：🟢凡晶 → 🔵灵晶 → 🟣魔晶 → 🟡神晶 → 🔴皇晶 → 🌈圣晶

## 项目结构

```
mojing-legend/
├── client/          # Phaser.js + React 前端
│   └── src/
│       ├── scenes/         # 游戏场景
│       │   ├── BootScene.js           # 启动/预加载
│       │   ├── ProfessionSelectScene.js # 职业选择（永久）
│       │   ├── WorldScene.js          # 等距世界地图
│       │   └── BaseScene.js           # 基地 + 炼金生产线
│       ├── components/     # React UI 组件
│       └── systems/        # 游戏系统（炼金/副作用/存档）
└── server/          # Node.js 后端
    └── src/
        ├── models/         # MongoDB Schema
        ├── routes/         # API 路由
        └── services/       # 业务逻辑
```

## 本地开发

```bash
# 前端
cd client && npm install && npm run dev

# 后端
cd server && cp .env.example .env && npm install && npm run dev
```

## 技术栈

- **前端**：Phaser.js 3.x + React 18 + Vite
- **渲染**：等距瓦片地图（Isometric Tilemap）
- **后端**：Node.js + Express + MongoDB + Redis
- **实时**：WebSocket（全服广播）

## 当前进度（Prototype v0.1）

- [x] 项目结构搭建
- [x] 职业选择场景（6职业，永久锁定）
- [x] 等距世界地图渲染
- [x] 点击挖矿交互
- [x] 基地场景 + 炼金生产链 UI
- [x] 副作用系统逻辑
- [x] 存档系统（localStorage）
- [x] 后端基础结构 + User Schema
- [ ] 美术素材替换（当前为程序绘制占位图形）
- [ ] 多人联机同步
- [ ] 赛季系统 / 排行榜
