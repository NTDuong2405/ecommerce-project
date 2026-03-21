import 'dotenv/config'
// RESTART TRIGGER FOR PRISMA CLIENT SYNC
import express from 'express'
import cors from 'cors'
import http from 'http'
import routes from './routes/index.js'
import { initSocket } from './utils/socket.js'

const app = express()
const server = http.createServer(app)

// Khởi chạy Socket.io
initSocket(server)

app.use(cors())
app.use(express.json())

app.use('/api', routes)

const PORT = 3000
server.listen(PORT, () => {
  console.log(`Server & Real-time Socket running on port ${PORT} 🚀`)
})
// --- Trigger: Socket-Fix reload @ 2026-03-21T15:50 ---
