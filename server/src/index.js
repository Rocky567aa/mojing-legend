require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
const WebSocket = require('ws')
const mongoose = require('mongoose')

const app = express()
app.use(cors())
app.use(express.json())

// 路由
app.use('/api/auth', require('./routes/auth'))
app.use('/api/crystals', require('./routes/crystals'))
app.use('/api/base', require('./routes/base'))
app.use('/api/leaderboard', require('./routes/leaderboard'))

// WebSocket（全服广播）
const httpServer = createServer(app)
const wss = new WebSocket.Server({ server: httpServer })

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    const data = JSON.parse(msg)
    // 彩晶广播
    if (data.type === 'rainbow_crystal_born') {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'broadcast',
            message: `🌈 全服公告：玩家 ${data.playerName} 炼出了全服第一颗圣晶！`
          }))
        }
      })
    }
  })
})

// 连接 MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mojing-legend')
  .then(() => console.log('✅ MongoDB 连接成功'))
  .catch(err => console.error('❌ MongoDB 连接失败:', err))

const PORT = process.env.PORT || 4000
httpServer.listen(PORT, () => {
  console.log(`🚀 魔晶传说 服务器启动 → http://localhost:${PORT}`)
})
