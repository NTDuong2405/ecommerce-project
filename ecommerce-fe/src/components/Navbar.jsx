import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, LogOut, Globe } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CustomerNotificationBell from './CustomerNotificationBell';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
    window.location.reload();
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsMenuOpen(false);
  };

  let user = null;
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
      user = JSON.parse(storedUser);
    }
  } catch (e) {
    console.error("Lỗi parse user in Navbar:", e);
  }

  return (
    <nav className="fixed top-0 left-0 right-0 glass z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <ShoppingBag className="text-white" size={20} />
            </div>
            <Link to="/" className="font-display font-bold text-2xl tracking-tight text-slate-900">
              Vibe<span className="text-primary-600">Cart</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-800 font-medium hover:text-primary-600 transition-colors">{t('nav.home')}</Link>
            <Link to="/products" className="text-slate-600 font-medium hover:text-primary-600 transition-colors">{t('nav.products')}</Link>
            <Link to="/track" className="text-slate-600 font-medium hover:text-primary-600 transition-colors">{t('nav.tracking')}</Link>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-full border border-slate-100 mr-2">
              <button 
                onClick={() => changeLanguage('vi')}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-[10px] font-bold transition-all ${i18n.language.startsWith('vi') ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="Tiếng Việt"
              >
                VI
              </button>
              <button 
                onClick={() => changeLanguage('en')}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-[10px] font-bold transition-all ${i18n.language.startsWith('en') ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="English"
              >
                EN
              </button>
            </div>

            <Link to="/products" className="text-slate-600 hover:text-primary-600 transition-colors p-2 rounded-full hover:bg-primary-50">
              <Search size={20} />
            </Link>
            
            {/* Chuông Thông báo cho Khách hàng */}
            <CustomerNotificationBell />

            {/* User Interaction */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors p-2 rounded-full hover:bg-primary-50 group">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all text-[10px] font-bold">
                    {user.email?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-bold hidden lg:inline">Profile</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors p-2 rounded-full hover:bg-primary-50">
                <User size={20} />
                <span className="text-sm font-bold">{t('nav.login')}</span>
              </Link>
            )}

            <Link to="/cart" className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 relative ml-2">
              <ShoppingBag size={18} />
              <span className="hidden sm:inline">{t('nav.cart')}</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Language switcher for mobile - Gọn hơn */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-full border border-slate-100 scale-75">
              <button 
                onClick={() => changeLanguage('vi')}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-[10px] font-bold transition-all ${i18n.language.startsWith('vi') ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400'}`}
              >
                VI
              </button>
              <button 
                onClick={() => changeLanguage('en')}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-[10px] font-bold transition-all ${i18n.language.startsWith('en') ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400'}`}
              >
                EN
              </button>
            </div>
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-600 p-2 hover:bg-slate-50 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden animate-fade-in border-t border-slate-100 bg-white/95 backdrop-blur-md">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link 
              to="/" 
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 text-base font-bold text-slate-800 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all"
            >
              {t('nav.home')}
            </Link>
            <Link 
              to="/products" 
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 text-base font-bold text-slate-800 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all"
            >
              {t('nav.products')}
            </Link>
            <Link 
              to="/products?sort=newest" 
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 text-base font-bold text-slate-800 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all"
            >
              {t('footer.links.new_arrivals')}
            </Link>
            <Link 
              to="/track" 
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 text-base font-bold text-slate-800 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all"
            >
              {t('nav.tracking')}
            </Link>
            
            <div className="pt-4 border-t border-slate-100">
              {user ? (
                <div className="space-y-2">
                  <Link 
                    to="/profile" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-base font-bold text-primary-600 bg-primary-50 rounded-xl"
                  >
                    <User size={20} />
                    {user.email}
                  </Link>
                  <button 
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-base font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <LogOut size={20} />
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-base font-bold text-slate-800 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <User size={20} />
                  {t('nav.login')}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
