import { Outlet, Link } from 'react-router-dom';
import { Package, ShoppingCart, Users, BarChart3, Settings, LogOut, Warehouse, Bell, X, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import NotificationBell from '../components/NotificationBell';

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex bg-slate-100 relative">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col transition-all duration-300">
        <div className="p-6">
          <h2 className="text-2xl font-display font-bold text-primary-400">AdminPanel.</h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem icon={<BarChart3 />} label="Dashboard" to="/admin" />
          <SidebarItem icon={<Package />} label="Products" to="/admin/products" />
          <SidebarItem icon={<Warehouse />} label="Inventory" to="/admin/inventory" />
          <SidebarItem icon={<ShoppingCart />} label="Orders" to="/admin/orders" />
          <SidebarItem icon={<Users />} label="Customers" to="/admin/customers" />
          <SidebarItem icon={<Settings />} label="Settings" to="/admin/settings" />
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/';
            }}
            className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full px-4 py-2 rounded-lg hover:bg-slate-800"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Management Dashboard</h1>
          <div className="flex items-center gap-6">
            <NotificationBell />
            <div className="w-10 h-10 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 font-bold shadow-sm">
              AD
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
  const isActive = window.location.pathname === to;
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
