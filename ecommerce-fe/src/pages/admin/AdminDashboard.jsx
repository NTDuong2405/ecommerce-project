import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { DollarSign, ShoppingBag, Users, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    chartData: [],
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Lấy thông tin role từ localStorage
    const userStr = localStorage.getItem('admin_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setIsAdmin(user.role === 'ADMIN');
    }

    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error("Lỗi fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-display font-bold text-slate-900">Dashboard Overview</h2>
        <p className="text-slate-500 mt-2">Welcome back! Here's what's happening today.</p>
      </div>
      
      {/* Stats row */}
      {loading ? (
        <div className="text-slate-500 animate-pulse text-center py-6">Đang tải biểu đồ...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isAdmin && (
            <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} trend="Real-time" isPositive={true} icon={<DollarSign size={24} />} color="bg-emerald-100 text-emerald-600" />
          )}
          <StatCard title="Active Orders" value={stats.totalOrders} trend="Real-time" isPositive={true} icon={<ShoppingBag size={24} />} color="bg-blue-100 text-blue-600" />
          <StatCard title="Customers" value={stats.totalCustomers} trend="Real-time" isPositive={true} icon={<Users size={24} />} color="bg-purple-100 text-purple-600" />
          {isAdmin && (
            <StatCard title="Conversion Rate" value="3.2%" trend="Giả lập" isPositive={false} icon={<Activity size={24} />} color="bg-orange-100 text-orange-600" />
          )}
        </div>
      )}

      {/* Charts Section - Chỉ hiện cho Admin */}
      {!loading && isAdmin && stats.chartData && stats.chartData.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800 font-display">Revenue Overview (Last 7 Days)</h3>
              <p className="text-sm text-slate-500">Daily revenue and sales performance</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `$${value}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 font-display">Recent Orders</h3>
          <Link to="/admin/orders" className="text-primary-600 hover:text-primary-700 font-medium text-sm">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-6 text-center text-slate-500">No recent orders found.</td>
                </tr>
              ) : (
                stats.recentOrders.map((order, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-primary-600">#{order.id}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{order.customer}</td>
                    <td className="px-6 py-4 text-slate-600">{order.product}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{new Date(order.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'SHIPPING' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        order.status === 'CONFIRMED' ? 'bg-purple-100 text-purple-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">${order.price.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, isPositive, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between group hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h4 className="text-2xl font-bold text-slate-900 font-display">{value}</h4>
      <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
        <span>{trend}</span>
        <span className="text-slate-400 font-normal ml-1">vs last month</span>
      </div>
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
  </div>
);

export default AdminDashboard;
