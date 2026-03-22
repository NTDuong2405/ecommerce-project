import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Mail, Lock, ArrowRight, UserPlus, AlertCircle, CheckCircle, Phone, Cake } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    birthday: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/users/register', { 
        email: formData.email, 
        password: formData.password,
        phone: formData.phone,
        birthday: formData.birthday
      });
      
      toast.success('Đăng ký thành công! Hãy đăng nhập để tiếp tục. 🎉');
      // Navigate to login after success
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      toast.error('Đăng ký thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 animate-fade-in-up">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
            <UserPlus size={32} />
          </div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Join VibeCart</h2>
          <p className="mt-2 text-slate-500">Bắt đầu hành trình mua sắm & nhận quà tặng</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm animate-shake">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleRegister} autoComplete="off">
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900"
                  placeholder="name@example.com"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900"
                  placeholder="09xx xxx xxx"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Birthday</label>
              <div className="relative">
                <Cake className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
              <div className="relative">
                <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500 px-1">
            <input type="checkbox" required className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded" />
            <p>Tôi đồng ý với <Link to="#" className="font-semibold text-emerald-600 underline decoration-emerald-500/30">Điều khoản</Link> của VibeCart.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating Account...
              </span>
            ) : (
              <span className="flex items-center gap-2 uppercase tracking-widest">
                Đăng ký ngay <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-slate-500">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-bold text-slate-900 hover:text-emerald-600 transition-colors underline decoration-emerald-500/30 decoration-2 underline-offset-4">
              Đăng nhập tại đây
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
