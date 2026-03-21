import React, { useState, useEffect, useRef } from 'react';
import { Bell, ShoppingCart, MessageCircle, Warehouse, X, CheckCheck } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { socket } = useSocket();

  // 1. Tải thông báo từ Backend khi khởi tạo
  useEffect(() => {
    fetchAdminNotifications();
  }, []);

  const fetchAdminNotifications = async () => {
    try {
      const res = await api.get('/customers/admin/notifications');
      const mapped = (res.data?.data || []).map(n => ({
        ...n,
        message: n.content,
        time: new Date(n.createdAt),
        icon: getIcon(n.type)
      }));
      setNotifications(mapped);
    } catch (err) {
      console.error("Lỗi fetch thông báo Admin:", err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ORDER': return <ShoppingCart className="text-emerald-500" size={18} />;
      case 'CHAT': return <MessageCircle className="text-blue-500" size={18} />;
      case 'STOCK': return <Warehouse className="text-rose-500" size={18} />;
      default: return <Bell className="text-slate-400" size={18} />;
    }
  };

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Chỉ đếm những thông báo CHƯA ĐỌC
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Lắng nghe tín hiệu Admin CHÍNH CHỦ từ Backend
  useEffect(() => {
    if (socket) {
      const handleAdminNotif = (notif) => {
        // Tín hiệu này đã được Server tạo DB rồi, có ID xịn
        setNotifications(prev => [{
          ...notif,
          message: notif.content,
          time: new Date(notif.createdAt),
          icon: getIcon(notif.type)
        }, ...prev].slice(0, 50));
      };

      socket.on('admin-notification', handleAdminNotif);
      return () => socket.off('admin-notification', handleAdminNotif);
    }
  }, [socket]);

  const addNotification = (notif) => {
    setNotifications(prev => [{ ...notif, isRead: false }, ...prev].slice(0, 50));
  };

  const handleNotifClick = (notif) => {
    if (!notif.isRead) markAsRead(notif.id);
    
    if (notif.path) {
      // MẸO: Thêm timestamp để ép React Router nhận diện thay đổi URL (giúp mở lại Modal Chat)
      const separator = notif.path.includes('?') ? '&' : '?';
      const forcePath = `${notif.path}${separator}t=${Date.now()}`;
      navigate(forcePath);
    }
    setIsOpen(false);
  };

  const markAsRead = async (id) => {
    try {
      // CHỈ gọi API nếu ID là số (ID xịn từ DB)
      if (typeof id === 'number') {
        await api.patch(`/customers/admin/notifications/${id}/read`);
      }
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Lỗi đánh dấu đã xem:", err);
    }
  };

  const clearAll = async () => {
    // Để cho đơn giản, ta chỉ mark local và hy vọng user xử lý từng cái hoặc reload
    // Hoặc nếu muốn xịn thì viết thêm API markAllRead
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
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
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-[1000] animate-fade-in-down origin-top-right">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="text-[10px] bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">
                  {unreadCount} UNREAD
                </span>
              )}
            </h3>
            <button 
              onClick={clearAll}
              className="text-xs text-slate-400 hover:text-primary-600 transition-colors flex items-center gap-1 font-bold"
            >
              <CheckCheck size={14} />
              Mark all as read
            </button>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center gap-3 opacity-40">
                <Bell size={40} className="text-slate-300" />
                <p className="text-sm text-slate-500 italic">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  className={`p-4 flex gap-4 cursor-pointer transition-all border-b border-slate-50 last:border-0 group relative ${
                    !notif.isRead ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-slate-100 group-hover:scale-110 transition-transform ${!notif.isRead ? 'border-blue-200 ring-2 ring-blue-100' : ''}`}>
                    {notif.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs mb-0.5 truncate uppercase tracking-tight ${
                      !notif.isRead ? 'font-black text-slate-900' : 'font-semibold text-slate-400'
                    }`}>
                      {notif.title}
                    </p>
                    <p className={`text-xs leading-relaxed mb-1 line-clamp-2 ${
                      !notif.isRead ? 'font-bold text-slate-700' : 'font-medium text-slate-500 italic'
                    }`}>
                      {notif.message}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                      {new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(notif.time)}
                      {!notif.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>}
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

export default NotificationBell;
