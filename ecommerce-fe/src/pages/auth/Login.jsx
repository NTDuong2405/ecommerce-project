import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Mail, Lock, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Custom Validation
    const newErrors = {};
    if (!email) newErrors.email = true;
    if (!password) newErrors.password = true;
    
    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/users/login', { email, password });
      
      const { token, user } = res.data.data;
      
      // Store token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Báo hiệu cho ChatBox và các component khác
      window.dispatchEvent(new Event('storage'));
      
      toast.success(`Chào mừng trở lại, ${user.email}! 👋`);
      // Redirect to home or profile
      navigate('/');
      window.location.reload(); // Refresh to update layout state
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      toast.error('Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 animate-fade-in-up">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-4">
            <UserCheck size={32} />
          </div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Welcome Back</h2>
          <p className="mt-2 text-slate-500">Đăng nhập để nhận ưu đãi từ VibeCart</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm animate-shake">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form noValidate className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) setValidationErrors({...validationErrors, email: false});
                  }}
                  className={`block w-full pl-12 pr-4 py-3.5 border rounded-2xl focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                    validationErrors.email 
                    ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                    : 'bg-slate-50 border-slate-200 focus:ring-primary-500 focus:bg-white'
                  }`}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) setValidationErrors({...validationErrors, password: false});
                  }}
                  className={`block w-full pl-12 pr-4 py-3.5 border rounded-2xl focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                    validationErrors.password 
                    ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                    : 'bg-slate-50 border-slate-200 focus:ring-primary-500 focus:bg-white'
                  }`}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded" />
              <label className="ml-2 text-slate-500">Ghi nhớ tôi</label>
            </div>
            <Link to="#" className="font-semibold text-primary-600 hover:text-primary-700">Quên mật khẩu?</Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-lg shadow-primary-600/30 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Authenticating...
              </span>
            ) : (
              <span className="flex items-center gap-2 uppercase tracking-widest">
                Đăng nhập ngay <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-slate-500">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-bold text-slate-900 hover:text-primary-600 transition-colors underline decoration-primary-500/30 decoration-2 underline-offset-4">
              Đăng ký thành viên
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
