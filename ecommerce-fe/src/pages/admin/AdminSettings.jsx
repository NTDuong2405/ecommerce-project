import { useState } from 'react';
import api from '../../utils/api';
import { UserPlus, Shield, Mail, Lock, CheckCircle, AlertCircle, Info } from 'lucide-react';

const AdminSettings = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: 'error', msg: 'Mật khẩu xác nhận không khớp.' });
      setLoading(false);
      return;
    }

    try {
      await api.post('/users/create-staff', {
        email: formData.email,
        password: formData.password
      });
      setStatus({ type: 'success', msg: 'Tạo tài khoản Nhân viên thành công!' });
      setFormData({ email: '', password: '', confirmPassword: '' }); // Reset form
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Lỗi khi tạo tài khoản' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-display font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500 mt-2">Cấu hình hệ thống và quản lý nhân sự</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-xl shadow-primary-600/20">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield size={24} /> Phân quyền
            </h3>
            <p className="text-primary-100 text-sm leading-relaxed opacity-90">
              Tài khoản Nhân viên (Staff) có quyền truy cập vào các mục Quản lý Sản phẩm, Đơn hàng, Kho hàng và Marketing, nhưng KHÔNG thể vào phần Analytics/Cài đặt hệ thống.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 text-amber-600 mb-3">
                <Info size={20} />
                <span className="font-bold text-sm tracking-tight">Lưu ý bảo mật</span>
             </div>
             <p className="text-xs text-slate-500 leading-relaxed">
                Khi tạo tài khoản xong, hãy cung cấp Email và Mật khẩu này cho nhân viên. Họ có thể đăng nhập tại trang Login Admin.
             </p>
          </div>
        </div>

        {/* Right: Create Staff Form */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
           <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center">
                 <UserPlus size={24} />
              </div>
              <div>
                 <h3 className="text-xl font-bold text-slate-800 font-display">Tạo tài khoản Nhân viên</h3>
                 <p className="text-sm text-slate-400">Cấp quyền truy cập hệ thống cho thành viên mới</p>
              </div>
           </div>

           {status.msg && (
                <div className={`p-4 rounded-2xl mb-6 flex items-center gap-3 animate-slide-up ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium text-sm">{status.msg}</span>
                </div>
           )}

           <form onSubmit={handleCreateStaff} className="space-y-5" autoComplete="off">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Mail size={16} className="text-slate-400" /> Email nhân viên
                </label>
                <input 
                  type="email" 
                  required
                  placeholder="staff@vibecart.com"
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  autoComplete="off"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Lock size={16} className="text-slate-400" /> Mật khẩu
                    </label>
                    <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        autoComplete="new-password"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <CheckCircle size={16} className="text-slate-400" /> Xác nhận mật khẩu
                    </label>
                    <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        value={formData.confirmPassword}
                        onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                        autoComplete="new-password"
                    />
                </div>
              </div>

              <div className="pt-4">
                 <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-900/10 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                    {loading ? "Đang xử lý..." : "Kích hoạt tài khoản Nhân viên"}
                 </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
