import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Headset } from 'lucide-react';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { useLocation } from 'react-router-dom';

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [guestId, setGuestId] = useState(null);
  const { socket } = useSocket();
  const location = useLocation();
  const scrollRef = useRef(null);
  const chatRef = useRef(null);

  // Identity detection (optimized: computed once per render)
  let curUid = null;
  let curGid = null;
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'undefined') curUid = JSON.parse(storedUser)?.id;
    curGid = localStorage.getItem('vibe_chat_guest_id');
  } catch (e) {}

  // 0. Đóng khi click bên ngoài hoặc nhấn ESC
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  // 1. Khởi tạo & Cập nhật danh tính liên tục
  useEffect(() => {
    const initChat = () => {
      let user = null;
      try {
        const storedUser = localStorage.getItem('user');
        user = storedUser ? JSON.parse(storedUser) : null;
      } catch (e) { console.error(e); }
      
      if (user && user.id) {
        setGuestId(user.id);
        fetchHistory(user.id);
      } else {
        let id = localStorage.getItem('vibe_chat_guest_id');
        if (!id) {
          id = 'G' + Math.floor(Math.random() * 1000000);
          localStorage.setItem('vibe_chat_guest_id', id);
        }
        setGuestId(id);
        fetchHistory(id);
      }
    };

    initChat();
    window.addEventListener('storage', initChat);
    return () => window.removeEventListener('storage', initChat);
  }, [isOpen, location.pathname]);

  const fetchHistory = async (id) => {
    try {
      let endpoint = `/customers/${id}/chat`;
      const storedUser = localStorage.getItem('user');
      const isMember = storedUser && storedUser !== 'undefined' && storedUser !== 'null';
      
      if (isMember) {
        endpoint = `/customers/chat`;
      } else {
        endpoint = `/customers/${id}/chat_from_guest`;
      }

      const res = await api.get(endpoint);
      setMessages(res.data?.data || []);
    } catch (err) {
      console.error("Lỗi fetch chat history:", err);
    }
  };

  // 2. Lắng nghe tin nhắn mới từ Socket
  useEffect(() => {
    if (socket) {
      const handleNewMsg = (msg) => {
        console.log("💬 [Socket.io] ChatBox received msg:", msg);
        
        let currentUserId = null;
        let currentGuestId = null;
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) currentUserId = JSON.parse(storedUser)?.id;
          currentGuestId = localStorage.getItem('vibe_chat_guest_id');
        } catch (e) {}

        const myId = currentUserId || currentGuestId;

        const isRelated = 
          (msg.guestId && String(msg.guestId) === String(myId)) ||
          (msg.senderId && String(msg.senderId) === String(myId) && String(msg.receiverId) === "1") ||
          (String(msg.senderId) === "1" && (String(msg.receiverId) === String(myId) || String(msg.guestId) === String(myId)));

        if (isRelated) {
          console.log("✅ Message matches current user! Adding to state.");
          setMessages(prev => {
            const exists = prev.some(m => m.id && msg.id && String(m.id) === String(msg.id));
            if (exists) return prev;
            return [...prev, msg];
          });
        }
      };

      socket.on('chat-msg', handleNewMsg);
      return () => socket.off('chat-msg', handleNewMsg);
    }
  }, [socket]);

  // Tự động cuộn xuống cuối
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      let user = null;
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
          user = JSON.parse(storedUser);
        }
      } catch (e) {}

      const isMember = !!(user && user.id);
      let targetId = user?.id || localStorage.getItem('vibe_chat_guest_id');

      // Clear input ngay lập tức để tạo cảm giác mượt mà
      setInput('');

      if (isMember) {
        await api.post('/customers/chat_from_member', { content: input });
      } else {
        await api.post(`/customers/${targetId}/chat_from_guest`, { content: input });
      }
    } catch (err) {
      console.error("Lỗi gửi tin nhắn:", err);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999]" ref={chatRef}>
      {/* Floating Social Buttons (Above main bubble) */}
      <div className={`flex flex-col gap-3 mb-4 transition-all duration-500 ${isOpen ? 'opacity-0 scale-75 pointer-events-none translate-y-10' : 'opacity-100 scale-100 translate-y-0'}`}>
        {/* Zalo Button */}
        <a 
          href="https://zalo.me/your_phone_number" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-blue-500 text-white shadow-xl flex items-center justify-center hover:bg-blue-600 hover:scale-110 transition-all group relative animate-slide-in-right animation-delay-200"
          title="Chat qua Zalo"
        >
          <div className="animate-gentle-swing">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 12.03c-.2.74-.84 1.34-1.58 1.54-.74.2-2.34.25-3.32.22-.98-.03-2.31-.19-3.05-.33-.74-.14-1.18-.54-1.39-1.28-.21-.74-.21-1.48-.21-2.22s0-1.48.21-2.22c.21-.74.65-1.14 1.39-1.28.74-.14 2.07-.3 3.05-.33.98-.03 2.58.02 3.32.22.74.2 1.38.8 1.58 1.54.2.74.23 1.48.23 2.22s-.03 1.48-.23 2.22zM12 9.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z"/>
            </svg>
          </div>
          {/* Tooltip */}
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
            Zalo: 09xx xxx xxx
          </span>
        </a>

        {/* Facebook Button */}
        <a 
          href="https://facebook.com/your_page" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-indigo-600 text-white shadow-xl flex items-center justify-center hover:bg-indigo-700 hover:scale-110 transition-all group relative animate-slide-in-right animation-delay-100"
          title="Facebook Messenger"
        >
          <div className="animate-gentle-swing" style={{ animationDelay: '1s' }}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 2.04c-5.5 0-9.96 4.46-9.96 9.96 0 5 3.66 9.15 8.44 9.89v-6.99h-2.54v-2.9h2.54v-2.21c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v6.99c4.78-.74 8.44-4.89 8.44-9.89 0-5.5-4.46-9.96-9.96-9.96z"/>
            </svg>
          </div>
          {/* Tooltip */}
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
            VibeCart Messenger
          </span>
        </a>
      </div>

      {/* Nút bong bóng chat */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
          isOpen ? 'bg-slate-800 rotate-90' : 'bg-primary-600 hover:bg-primary-700'
        } text-white`}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* Cửa sổ chat */}
      {isOpen && (
        <div className="absolute bottom-18 right-0 w-80 sm:w-96 h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-primary-600 p-4 text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Headset size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm">VibeCart Support</h3>
              <p className="text-[10px] text-primary-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                We're online to help you
              </p>
            </div>
          </div>

          {/* Messages Body */}
          <div 
            ref={scrollRef}
            className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-50">
                <MessageCircle size={40} className="text-slate-300" />
                <p className="text-sm">Hi there! Ask us anything.</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = curUid 
                  ? String(msg.senderId) === String(curUid)
                  : (msg.guestId && String(msg.guestId) === String(curGid) && !msg.senderId);

                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      isMe 
                        ? 'bg-primary-600 text-white rounded-tr-sm' 
                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Footer */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Type your message..." 
                className="flex-1 bg-slate-100 border-none px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={!input.trim()}
                className="w-11 h-11 rounded-2xl bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-lg shadow-primary-600/20"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
