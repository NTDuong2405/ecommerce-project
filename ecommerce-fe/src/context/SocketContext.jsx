import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    console.log('🔄 [Socket.io] Socket.io Attempting connection to Port 3000...');
    
    // Kết nối về Backend (cổng 3000)
    // Dùng mảng các transports và cấu hình reconnection mạnh mẽ hơn
    const newSocket = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket', 'polling'], // Ưu tiên websocket
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 2000,
      timeout: 15000,
    });

    newSocket.on('connect', () => {
      console.log('%c🔌 [Socket.io] Connected successfully!', 'color: #10b981; font-weight: bold', newSocket.id);
      setConnected(true);
    });

    // BỘ LỰC LƯỢNG PHẢN ỨNG NHANH - LOG TOÀN CẦU
    newSocket.on('chat-msg', (msg) => {
      console.log('%c📬 [Socket.io] GLOBAL MESSAGE RECEIVED:', 'color: #3b82f6; font-weight: bold', msg);
    });

    newSocket.on('stock-update', (data) => {
      console.log('📦 [Socket.io] Stock update received:', data);
    });

    newSocket.on('new-order', (data) => {
      console.log('🔔 [Socket.io] New order notification:', data);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 [Socket.io] Disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('⚠️ [Socket.io] Connection Error:', err.message);
    });

    // Test listener
    newSocket.on('pong-test', (data) => {
      console.log('🏓 [Socket.io] Received Pong:', data);
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 [Socket.io] Closing connection...');
      newSocket.close();
    };
  }, []);

  const sendPing = () => {
    if (socket) {
      console.log('🏓 [Socket.io] Sending Ping...');
      socket.emit('ping-test', { time: new Date().toISOString() });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, connected, sendPing }}>
      {children}
    </SocketContext.Provider>
  );
};
