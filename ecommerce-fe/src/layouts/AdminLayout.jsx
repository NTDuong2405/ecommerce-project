import { Outlet, Link, useLocation } from 'react-router-dom';
import { Package, ShoppingCart, Users, BarChart3, Settings, LogOut, Warehouse, Bell, X, CheckCircle, Megaphone, Activity, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import NotificationBell from '../components/NotificationBell';

const AdminLayout = () => {
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const userStr = localStorage.getItem('admin_user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  // Đóng sidebar khi chuyển trang trên mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/admin/login';
  };

  const isStaff = user?.role === 'STAFF';

  return (
    <div className="h-screen flex bg-slate-100 overflow-hidden">

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky lg:top-0 inset-y-0 left-0 w-64 bg-slate-900 text-white z-50 transform transition-transform duration-300 shadow-2xl lg:translate-x-0 h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
        <div className="p-6 border-b border-slate-800/50 flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold text-primary-400">AdminPanel.</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto custom-scrollbar">
          <SidebarItem icon={<BarChart3 />} label="Dashboard" to="/admin" />
          
          {/* Chỉ Admin mới thấy Analytics & Settings */}
          {!isStaff && (
            <>
              <SidebarItem icon={<Activity />} label="Analytics" to="/admin/analytics" />
              <SidebarItem icon={<Settings />} label="Settings" to="/admin/settings" />
            </>
          )}

          <SidebarItem icon={<Megaphone />} label="Marketing" to="/admin/marketing" />
          <SidebarItem icon={<Package />} label="Products" to="/admin/products" />
          <SidebarItem icon={<Warehouse />} label="Inventory" to="/admin/inventory" />
          <SidebarItem icon={<ShoppingCart />} label="Orders" to="/admin/orders" />
          <SidebarItem icon={<Users />} label="Customers" to="/admin/customers" />
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full px-4 py-2 rounded-lg hover:bg-slate-800 group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col md:flex-row md:items-center md:gap-2">
              <h1 className="text-sm md:text-xl font-bold text-slate-800 tracking-tight truncate max-w-[120px] md:max-w-none">
                {location.pathname === '/admin' ? 'Dashboard' : location.pathname.split('/').pop().charAt(0).toUpperCase() + location.pathname.split('/').pop().slice(1)}
              </h1>
              {isStaff && <span className="text-[8px] md:text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest w-fit">Staff</span>}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <NotificationBell />
            
            <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{user?.email?.split('@')[0]}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">{user?.role}</p>
              </div>
              
              <div className="group relative">
                <div className="w-10 h-10 rounded-2xl bg-primary-600 border border-primary-500 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-600/20 cursor-pointer">
                  <span className="text-sm">
                    {user?.email?.[0]?.toUpperCase() || 'AD'}
                  </span>
                </div>
                
                {/* Profile/Logout Tooltip-Menu */}
                <div className="absolute top-full right-0 mt-3 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="p-4 border-b border-slate-100">
                    <p className="text-xs text-slate-400 mb-1 italic">Personal ID</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium text-sm"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-8 overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, to }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        isActive 
          ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <div className="opacity-80">{icon}</div>
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export default AdminLayout;
