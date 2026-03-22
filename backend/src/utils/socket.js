import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';

let io;
const LOG_FILE = path.join(process.cwd(), 'logs', 'email.log');

const writeToLog = (msg) => {
  try {
    const timestamp = new Date().toISOString();
    
    // Đảm bảo thư mục logs tồn tại
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    fs.appendFileSync(LOG_FILE, `[Socket-Log] [${timestamp}] ${msg}\n`);
    console.log(msg);
  } catch (err) {
    // Nếu lỗi khi ghi file (ví dụ trên môi trường cloud) thì chỉ cần console.log là đủ, tránh làm sập server
    console.log(`[Socket-Log-Console] ${msg}`);
  }
};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Cho phép mọi domain (Vercel, Render...) truy cập vào Socket
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    },
    allowEIO3: true, // Hỗ trợ các client đời cũ nếu cần
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    writeToLog(`🔌 User connected: ${socket.id} | Total: ${io.engine.clientsCount}`);

    socket.on('ping-test', (data) => {
      writeToLog(`🏓 Received Ping from ${socket.id}: ${JSON.stringify(data)}`);
      socket.emit('pong-test', { reply: 'Hello from Server!', received: data });
    });

    socket.on('disconnect', () => {
      writeToLog(`🔌 User disconnected: ${socket.id} | Remaining: ${io.engine.clientsCount}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io must be initialized first!');
  }
  return io;
};

// --- Helper broadcast sự kiện ---
export const emitStockUpdate = (productId, newStock) => {
  if (io) {
    io.emit('stock-update', { productId: Number(productId), newStock: Number(newStock) });
    writeToLog(`📢 Broadcast stock-update: ID ${productId} -> ${newStock} units`);
  } else {
    writeToLog(`⚠️ FAILED to broadcast: IO not initialized!`);
  }
};

export const emitNewOrder = (orderData) => {
  if (io) {
    io.emit('new-order', orderData);
    writeToLog(`🔔 Broadcast new-order: Order ID ${orderData.id} from ${orderData.customerName}`);
  }
};

export const emitChatMessage = (message) => {
  if (io) {
    // Gửi tín hiệu chat-msg tới tất cả (để debug nhanh, sau này có thể dùng room)
    io.emit('chat-msg', message);
    writeToLog(`💬 Chat from ${message.senderId} to ${message.receiverId}: ${message.content.substring(0, 20)}...`);
  }
};
