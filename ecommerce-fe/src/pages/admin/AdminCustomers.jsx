import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { Search, MessageCircle, Gift, CheckCircle, X, Send, AlertTriangle } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useSearchParams } from 'react-router-dom';

const AdminCustomers = () => {
  const [searchParams] = useSearchParams();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Lắng nghe điều hướng từ Chuông thông báo
  useEffect(() => {
    const customerId = searchParams.get('customerId');
    const timestamp = searchParams.get('t'); // Nhận diện cú click mới
    
    if (customerId && customers.length > 0) {
      const targetUser = customers.find(c => 
        String(c.id) === String(customerId) || 
        (c.guestId && String(c.guestId) === String(customerId))
      );
      if (targetUser) {
        openChat(targetUser);
      }
    }
  }, [searchParams, customers]);

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'CHAT' | 'NOTIFY' | null
  const [selectedUser, setSelectedUser] = useState(null);

  // Đóng Modal khi nhấn ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') setActiveModal(null);
    };
    if (activeModal) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [activeModal]);

  // Chat state
  const [chats, setChats] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const { socket } = useSocket();

  // Notification state
  const [notifyData, setNotifyData] = useState({
    title: '',
    content: '',
    type: 'PROMO'
  });

  // Bộ đếm tin nhắn chưa đọc cho từng khách - Cố định qua Reload
  const [unreadMap, setUnreadMap] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_customers_unread');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('admin_customers_unread', JSON.stringify(unreadMap));
  }, [unreadMap]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Lắng nghe tin nhắn Real-time để cập nhật UI ngay lập tức
  useEffect(() => {
    if (socket) {
      const handleGlobalChatMsg = (msg) => {
        // Cập nhật số lượng chat hoặc refresh list
        fetchCustomers();
        
        const senderId = msg.senderId || msg.guestId;
        const isFromCustomer = String(msg.senderId) !== "1";

        // Nếu đang mở chat với đúng người đó, cập nhật tin nhắn
        if (activeModal === 'CHAT' && selectedUser) {
          const myId = selectedUser.id || selectedUser.guestId;
          const isRelated = String(senderId) === String(myId);
          
          if (isRelated) {
            setChats(prev => [...prev, msg]);
            return; // Đã xem rồi thì không cần báo đỏ
          }
        }

        // Nếu tin nhắn mới từ khách và mình chưa mở chat với họ -> Báo đỏ
        if (isFromCustomer) {
          setUnreadMap(prev => ({
            ...prev,
            [senderId]: (prev[senderId] || 0) + 1
          }));
        }
      };

      socket.on('chat-msg', handleGlobalChatMsg);
      return () => socket.off('chat-msg', handleGlobalChatMsg);
    }
  }, [socket, activeModal, selectedUser]);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      // Đảm bảo luôn set một Array để tránh crash .filter
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setCustomers(data);
    } catch (err) {
      console.error("Lỗi fetch khách hàng:", err);
      setCustomers([]); // Reset về array trống nếu lỗi
    } finally {
      setLoading(false);
    }
  };

  const fetchChats = async (userId) => {
    try {
      const res = await api.get(`/customers/${userId}/chat`);
      setChats(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const openChat = (user) => {
    setSelectedUser(user);
    setActiveModal('CHAT');
    const myId = user.id || user.guestId;
    setUnreadMap(prev => ({ ...prev, [myId]: 0 }));
    fetchChats(myId);
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedUser) return;

    try {
      const isGuest = selectedUser?.isGuest;
      const payload = {
        content: chatMessage,
        receiverId: isGuest ? null : selectedUser?.id,
        guestId: isGuest ? selectedUser?.id : null
      };

      await api.post(`/customers/${selectedUser?.id}/chat`, payload);
      setChatMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendNotify = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await api.post(`/customers/${selectedUser?.id}/notify`, notifyData);
      setActiveModal(null);
      setNotifyData({ title: '', content: '', type: 'PROMO' });
      alert('Notification sent successfully!');
    } catch (err) {
      alert('Failed to send notification');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center text-slate-500">Loading customers...</div>;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900">Customers & Support</h2>
          <p className="text-slate-500 text-sm mt-1">Manage users, send notifications, and provide real-time support.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by email..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-semibold">Customer ID</th>
                <th className="px-6 py-4 font-semibold">Identity</th>
                <th className="px-6 py-4 font-semibold">Quick Stats</th>
                <th className="px-6 py-4 font-semibold">Last Seen</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((user) => (
                <tr key={user?.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900 text-xs">#{String(user?.id || '').slice(-4)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm ${user?.isGuest ? 'bg-slate-100 text-slate-400' : 'bg-primary-600 text-white'}`}>
                        {user?.isGuest ? '?' : user?.email?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          {user?.email}
                          {user?.isGuest && <span className="bg-slate-200 text-slate-500 text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Guest</span>}
                        </div>
                        <div className="text-xs text-slate-500">Joined {user?.createdAt ? new Date(user?.createdAt).toLocaleDateString() : 'Unknown'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-4">
                      <div className="text-center">
                        <div className="text-xs font-bold text-slate-900">{user?._count?.orders || 0}</div>
                        <div className="text-[10px] text-slate-400 uppercase">Orders</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-bold text-blue-600">{user?._count?.chatMessages || 0}</div>
                        <div className="text-[10px] text-slate-400 uppercase">Chats</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    Active Recently
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openChat(user)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors group/btn relative"
                      >
                        <MessageCircle size={20} />
                        {unreadMap[user?.id || user?.guestId] > 0 && (
                          <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse border-2 border-white">
                            {unreadMap[user?.id || user?.guestId]}
                          </span>
                        )}
                        <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">Open Chat</span>
                      </button>
                      {!user?.isGuest && (
                        <button 
                          onClick={() => { setSelectedUser(user); setActiveModal('NOTIFY'); }}
                          className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors group/btn relative"
                        >
                          <Gift size={20} />
                          <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">Send Promo</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CHAT MODAL */}
      {activeModal === 'CHAT' && selectedUser && (
        <div 
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[500px]"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-blue-50/50">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${selectedUser?.isGuest ? 'bg-slate-200 text-slate-500' : 'bg-primary-600 text-white'}`}>
                  {selectedUser?.isGuest ? '?' : selectedUser?.email?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    Support Chat
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedUser?.isGuest ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-700'}`}>
                      {selectedUser?.isGuest ? 'Guest' : 'Member'}
                    </span>
                  </h3>
                  <p className="text-sm text-slate-500">Talking to: <span className="font-semibold text-blue-600">{selectedUser?.email}</span></p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
              {chats.length === 0 ? (
                <div className="text-center text-slate-400 mt-10 text-sm">No messages yet. Say hi!</div>
              ) : (
                chats.map((msg, idx) => {
                  const isAdmin = msg.senderId && Number(msg.senderId) !== Number(selectedUser?.id);
                  return (
                    <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${isAdmin ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-white">
              <form onSubmit={handleSendChat} className="flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="flex-1 bg-slate-100 border-none px-4 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                />
                <button type="submit" disabled={!chatMessage.trim()} className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFY MODAL */}
      {activeModal === 'NOTIFY' && selectedUser && (
        <div 
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-pink-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Send Notification</h3>
                <p className="text-sm text-slate-500">To: <span className="font-semibold text-pink-600">{selectedUser?.email}</span></p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSendNotify} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notice Type</label>
                <select 
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                  value={notifyData.type}
                  onChange={(e) => setNotifyData({...notifyData, type: e.target.value})}
                >
                  <option value="PROMO">Promotion / Discount</option>
                  <option value="BIRTHDAY">Happy Birthday</option>
                  <option value="SYSTEM">System Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                  type="text" autoFocus
                  placeholder="e.g. 50% Off Black Friday!"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-medium text-slate-900"
                  value={notifyData.title}
                  onChange={(e) => setNotifyData({...notifyData, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Content Message</label>
                <textarea 
                  rows="4"
                  placeholder="Hello, here's a gift for you..."
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all resize-none text-slate-700 text-sm"
                  value={notifyData.content}
                  onChange={(e) => setNotifyData({...notifyData, content: e.target.value})}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setActiveModal(null)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-pink-600 text-white font-medium hover:bg-pink-700 rounded-xl transition-colors shadow-sm shadow-pink-600/20 flex items-center gap-2">
                  <Gift size={18} /> Blow the horn!
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
