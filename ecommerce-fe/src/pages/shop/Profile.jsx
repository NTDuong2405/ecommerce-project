import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Bell, Package, Gift, Heart, LogOut, ChevronRight, AlertCircle, ShoppingBag, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Profile = () => {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'notifications');
  const [selectedNotif, setSelectedNotif] = useState(null);
  const navigate = useNavigate();

  // Cập nhật tab khi URL thay đổi
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(storedUser));
    fetchNotifications(token);
  }, [navigate]);

  const fetchNotifications = async (token) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const res = await axios.get(`${apiUrl}/customers/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data?.data || []);
    } catch (err) {
      console.error("Lỗi fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar / Tabs */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-5 md:p-6 text-center border border-slate-100 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-16 md:h-24 bg-gradient-to-r from-primary-500 to-indigo-600 opacity-10"></div>
            <div className="relative z-10 flex flex-row lg:flex-col items-center gap-4 lg:gap-0">
              <div className="w-14 h-14 md:w-20 md:h-20 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg shadow-primary-500/10 transition-transform hover:scale-105 duration-300">
                <User size={30} className="md:w-10 md:h-10" />
              </div>
              <div className="text-left lg:text-center flex-1 min-w-0">
                <h3 className="font-display font-bold text-slate-900 truncate text-base md:text-lg">{user?.email}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">VibeCart Member</p>
              </div>
            </div>
          </div>

          <nav className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="p-1 md:p-2 flex flex-row lg:flex-col overflow-x-auto scrollbar-hide">
              <NavItem 
                icon={<Bell size={18} />} 
                label="Hộp thư" 
                active={activeTab === 'notifications'} 
                onClick={() => setActiveTab('notifications')}
                badge={notifications.length}
              />
              <NavItem 
                icon={<Package size={18} />} 
                label="Đơn hàng" 
                active={activeTab === 'orders'} 
                onClick={() => setActiveTab('orders')}
              />
              <NavItem 
                icon={<Heart size={18} />} 
                label="Yêu thích" 
                active={activeTab === 'wishlist'} 
                onClick={() => setActiveTab('wishlist')}
              />
              <div className="hidden lg:block my-2 border-t border-slate-100 mx-2"></div>
              <button 
                onClick={handleLogout}
                className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-2xl transition-colors whitespace-nowrap lg:w-full"
              >
                <div className="flex items-center gap-3">
                  <LogOut size={18} />
                  <span className="hidden lg:inline">Đăng xuất</span>
                </div>
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl md:rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-5 md:p-8 min-h-[400px] md:min-h-[500px] animate-fade-in-up">
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-display font-bold text-slate-900">Notifications</h2>
                  <span className="bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                    {notifications.length} Unread
                  </span>
                </div>

                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-50 space-y-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                      <Bell size={40} className="text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">Hiện tại chưa có khuyến mại nào dành cho bạn.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={() => setSelectedNotif(notif)}
                        className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-600/5 transition-all duration-300 relative overflow-hidden cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`mt-1 h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${
                            notif.type === 'PROMO' ? 'bg-pink-100 text-pink-600' : 
                            notif.type === 'SYSTEM' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                          }`}>
                            {notif.type === 'PROMO' ? <Gift size={20} /> : <AlertCircle size={20} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 mb-1 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{notif.title}</h4>
                            <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">{notif.content}</p>
                            <span className="text-[11px] font-bold text-slate-400 mt-2 block uppercase tracking-widest">{new Date(notif.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                            <ChevronRight size={20} className="text-primary-300" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modal chi tiết thông báo */}
            {selectedNotif && (
              <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-zoom-in">
                  <div className={`h-32 flex items-center justify-center relative ${
                    selectedNotif.type === 'PROMO' ? 'bg-gradient-to-br from-pink-500 to-rose-400' : 
                    selectedNotif.type === 'SYSTEM' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-amber-400 to-orange-500'
                  }`}>
                    <button 
                      onClick={() => setSelectedNotif(null)}
                      className="absolute top-6 right-6 w-10 h-10 bg-black/10 hover:bg-black/20 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <X size={20} />
                    </button>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                      {selectedNotif.type === 'PROMO' ? <Gift size={32} className="text-white" /> : <AlertCircle size={32} className="text-white" />}
                    </div>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">{new Date(selectedNotif.createdAt).toLocaleDateString()}</span>
                      <h3 className="text-2xl font-display font-bold text-slate-900 leading-tight uppercase tracking-tight italic">
                        {selectedNotif.title}
                      </h3>
                    </div>
                    
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <p className="text-slate-600 leading-relaxed font-medium">
                        {selectedNotif.content}
                      </p>
                    </div>

                    <div className="pt-2">
                      <button 
                        onClick={() => setSelectedNotif(null)}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 uppercase tracking-widest text-xs"
                      >
                        Đã hiểu
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="text-center py-20 opacity-50 space-y-4">
                <ShoppingBag size={48} className="mx-auto text-slate-300" />
                <p className="font-medium">Lịch sử đơn hàng hiện không có sẵn.</p>
                <button 
                  onClick={() => navigate('/products')}
                  className="bg-primary-600 text-white px-6 py-2 rounded-full font-bold hover:bg-primary-700 transition-all text-sm uppercase tracking-widest"
                >
                  Đến cửa hàng
                </button>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="text-center py-20 opacity-50 space-y-4">
                <Heart size={48} className="mx-auto text-slate-300" />
                <p className="font-medium">Danh sách yêu thích rỗng.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center lg:justify-between px-4 lg:px-4 py-2.5 lg:py-3.5 text-xs lg:text-sm font-semibold rounded-2xl transition-all whitespace-nowrap gap-2 lg:gap-3 ${
      active 
        ? 'bg-primary-50 text-primary-600 shadow-sm' 
        : 'text-slate-500 hover:bg-slate-50'
    }`}
  >
    <div className="flex items-center gap-2 lg:gap-3">
      <span className={active ? 'text-primary-600' : 'text-slate-400'}>{icon}</span>
      <span>{label}</span>
    </div>
    {badge > 0 && (
      <span className="bg-primary-600 text-white text-[9px] lg:text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>
    )}
  </button>
);

export default Profile;
