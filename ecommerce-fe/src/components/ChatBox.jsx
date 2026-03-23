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
