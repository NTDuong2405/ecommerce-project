import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Megaphone, Cake, Send, Plus, Calendar, Tag, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';

const AdminMarketing = () => {
  const [promotions, setPromotions] = useState([]);
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPromo, setNewPromo] = useState({ code: '', title: '', description: '', discount: 10, startDate: '', endDate: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [promoRes, bdayRes] = await Promise.all([
        api.get('/marketing/promotions'),
        api.get('/marketing/birthdays')
      ]);
      setPromotions(promoRes.data.data);
      setBirthdays(bdayRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    try {
      await api.post('/marketing/promotions', newPromo);
      setStatus({ type: 'success', msg: 'Khởi tạo chiến dịch & thông báo toàn hệ thống thành công!' });
      setShowAddModal(false);
      setNewPromo({ code: '', title: '', description: '', discount: 10, startDate: '', endDate: '' }); // Xóa trắng form
      fetchData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi khi tạo khuyến mãi';
      setStatus({ type: 'error', msg: errorMsg });
    }
  };

  const handleDeletePromo = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chiến dịch này?")) return;
    try {
      await api.delete(`/marketing/promotions/${id}`);
      setStatus({ type: 'success', msg: 'Xóa chiến dịch thành công!' });
      fetchData();
    } catch (err) {
      setStatus({ type: 'error', msg: 'Lỗi khi xóa chiến dịch' });
    }
  };

  const sendBdayWish = async (userId) => {
    try {
      await api.post(`/marketing/birthdays/${userId}`);
      setStatus({ type: 'success', msg: 'Đã gửi thiệp mừng & quà tặng cho khách hàng!' });
      fetchData();
    } catch (err) {
      setStatus({ type: 'error', msg: 'Lỗi khi gửi lời chúc' });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-800">Tiếp thị & Chăm sóc</h2>
          <p className="text-slate-500">Quản lý chiến dịch và bồi đắp lòng trung thành</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-primary-600/20 transition-all hover:-translate-y-1"
        >
          <Plus size={20} /> Tạo Khuyến Mãi
        </button>
      </div>

      {status.msg && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-slide-up ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{status.msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Promotion Campaigns */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Megaphone size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Chiến dịch Khuyến mãi</h3>
          </div>

          <div className="space-y-4 flex-1">
            {promotions.length === 0 ? (
              <p className="text-slate-400 text-center py-10">Chưa có chiến dịch nào.</p>
            ) : (
              promotions.map(promo => (
                <div key={promo.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary-200 transition-colors group relative">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900">{promo.title}</h4>
                      <div className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 inline-block mt-1">CODE: {promo.code}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {new Date(promo.endDate) < new Date() ? (
                        <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">Hết hạn</span>
                      ) : (
                        <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">Đang chạy</span>
                      )}
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-bold">-{promo.discount}%</span>
                      <button 
                        onClick={() => handleDeletePromo(promo.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        title="Xóa chiến dịch"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{promo.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(promo.startDate).toLocaleDateString('vi-VN')}</span>
                    <span>đến</span>
                    <span>{new Date(promo.endDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Birthday Greetings */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <Cake size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Sứ mệnh Sinh nhật</h3>
          </div>

          <div className="space-y-4 flex-1">
            {birthdays.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <p className="text-slate-400">Không có khách hàng nào sinh nhật trong tháng này.</p>
                <p className="text-[10px] text-slate-300 italic">Mẹo: Cập nhật ngày sinh cho khách hàng ở trang 'Customers'</p>
              </div>
            ) : (
              birthdays.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-rose-50/30 rounded-2xl border border-rose-100/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold">
                      {user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user.email}</p>
                      <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                        <Cake size={10} /> Sinh nhật: {new Date(user.birthday).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => sendBdayWish(user.id)}
                    className="p-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-all shadow-md shadow-rose-500/20"
                    title="Gửi thiệp mừng"
                  >
                    <Send size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-bounce-in">
            <div className="p-8 border-b border-slate-100 bg-primary-50">
              <h3 className="text-2xl font-bold text-primary-900 flex items-center gap-3">
                <Megaphone /> Khởi tạo Chiến dịch
              </h3>
            </div>
            <form onSubmit={handleCreatePromo} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Mã Voucher (In hoa)</label>
                  <input 
                    type="text" 
                    required
                    placeholder="VIBE50"
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-mono"
                    value={newPromo.code}
                    onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Mức giảm (%)</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                    value={newPromo.discount}
                    onChange={e => setNewPromo({...newPromo, discount: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Tiêu đề Chiến dịch</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Lễ hội Mùa hè rực rỡ"
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  value={newPromo.title}
                  onChange={e => setNewPromo({...newPromo, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Nội dung (Gửi tới Notifications của Khách)</label>
                <textarea 
                  required
                  rows="3"
                  placeholder="Ví dụ: Tặng bạn ưu đãi 10% cho tất cả sản phẩm..."
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  value={newPromo.description}
                  onChange={e => setNewPromo({...newPromo, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Ngày bắt đầu</label>
                  <input 
                    type="date" 
                    required
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                    value={newPromo.startDate}
                    onChange={e => setNewPromo({...newPromo, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Ngày kết thúc</label>
                  <input 
                    type="date" 
                    required
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                    value={newPromo.endDate}
                    onChange={e => setNewPromo({...newPromo, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-primary-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-600/20"
                >
                  Phát hành
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMarketing;
