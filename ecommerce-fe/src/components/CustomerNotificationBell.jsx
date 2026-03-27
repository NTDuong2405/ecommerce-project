import React, { useState, useEffect, useRef } from 'react';
import { Bell, MessageCircle, Gift, Star, CheckCheck } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CustomerNotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { socket } = useSocket();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Lấy User ID hiện tại (Member)
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const updateIdentity = () => {
      try {
        const storedUser = localStorage.getItem('user');
        setCurrentUser(storedUser ? JSON.parse(storedUser) : null);
      } catch (e) {}
    };
    updateIdentity();
    window.addEventListener('storage', updateIdentity);
    return () => window.removeEventListener('storage', updateIdentity);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // FETCH LẠI THÔNG BÁO CŨ TỪ DATABASE KHI RELOAD
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/customers/notifications');
      const backendNotifs = (res.data?.data || []).map(n => ({
        id: n.id,
        isRead: n.isRead,
        type: n.type === 'PROMO' ? 'PROMO' : 'SYSTEM',
        title: n.title,
        message: n.content,
        path: '/profile?tab=notifications',
        icon: n.type === 'PROMO' ? <Gift className="text-rose-500" size={18} /> : <Star className="text-blue-500" size={18} />,
        time: new Date(n.createdAt)
      }));
      setNotifications(backendNotifs);
    } catch (err) {
      console.error("Lỗi fetch notifications cho chuông:", err);
    }
  };

  useEffect(() => {
    if (socket) {
      // 1. Nhận tin nhắn từ Admin
      const handleIncomingChat = (msg) => {
        if (String(msg.senderId) === "1") {
          const newNotif = {
            id: Date.now() + Math.random(),
            isRead: false,
            type: 'CHAT',
            title: 'Message from Admin',
            message: msg.content,
            path: null,
            icon: <MessageCircle className="text-blue-500" size={18} />,
            time: new Date()
          };
          setNotifications(prev => [newNotif, ...prev].slice(0, 20));
        }
      };

      // 2. Nhận thông báo Promo từ Admin
      const handleNewNotif = (notif) => {
        if (currentUser && Number(notif.userId) === Number(currentUser.id)) {
          const newNotif = {
            id: notif.id || Date.now() + Math.random(),
            isRead: false,
            type: 'PROMO',
            title: notif.title || 'Special Offer for You!',
            message: notif.content,
            path: '/profile?tab=notifications',
            icon: <Gift className="text-rose-500" size={18} />,
            time: new Date()
          };
          setNotifications(prev => [newNotif, ...prev].slice(0, 20));
        }
      };

      socket.on('chat-msg', handleIncomingChat);
      socket.on('new-notification', handleNewNotif);

      return () => {
        socket.off('chat-msg', handleIncomingChat);
        socket.off('new-notification', handleNewNotif);
      };
    }
  }, [socket, currentUser]);

  const handleNotifClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
    }
    if (notif.path) navigate(notif.path);
    setIsOpen(false);
  };

  const markAsRead = async (id) => {
    try {
      // Cập nhật local trước cho mượt
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      // Nếu là Member và có ID thực (số), gửi lên backend
      if (typeof id === 'number') {
        await api.patch(`/customers/notifications/${id}/read`);
      }
    } catch (err) {
      console.error("Lỗi mark as read:", err);
    }
  };

  const clearAll = async () => {
    // Chỉ là hiệu ứng local cho nhanh
    notifications.forEach(n => {
      if (!n.isRead) markAsRead(n.id);
    });
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 focus:outline-none"
      >
        <Bell size={22} className={unreadCount > 0 ? "animate-swing" : ""} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-[1000] animate-fade-in-down origin-top-right">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              Notifications
              {unreadCount > 0 && (
                <span className="text-[10px] bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">
                  {unreadCount} NEW
                </span>
              )}
            </h3>
            <button 
              onClick={clearAll}
              className="text-xs text-slate-400 hover:text-primary-600 transition-colors flex items-center gap-1 font-bold"
            >
              <CheckCheck size={14} />
              Read all
            </button>
          </div>

          <div className="max-h-[350px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center gap-2 opacity-40">
                <Bell size={32} className="text-slate-300" />
                <p className="text-xs text-slate-500 italic">No updates for you yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  className={`p-4 flex gap-4 cursor-pointer transition-all border-b border-slate-50 last:border-0 relative ${
                    !notif.isRead ? 'bg-primary-50/40 hover:bg-primary-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-slate-100 ${!notif.isRead ? 'ring-2 ring-primary-100' : ''}`}>
                    {notif.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs mb-0.5 truncate uppercase tracking-tight ${
                      !notif.isRead ? 'font-black text-slate-900' : 'font-semibold text-slate-400'
                    }`}>
                      {notif.title}
                    </p>
                    <p className={`text-xs leading-relaxed mb-1 line-clamp-2 ${
                      !notif.isRead ? 'font-bold text-slate-700' : 'font-medium text-slate-500'
                    }`}>
                      {notif.message}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                      {new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(notif.time)}
                      {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse"></span>}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-bold text-slate-500 hover:text-primary-600 uppercase tracking-widest"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerNotificationBell;
