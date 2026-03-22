import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { DollarSign, ShoppingBag, Users, Activity, TrendingUp, Tag, AlertTriangle, Trophy, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    marketing: { promoUsed: 0, totalDiscounted: 0 },
    inventoryIssues: [],
    topProducts: [],
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
            <StatCard title="Total Revenue" value={`$${stats.totalRevenue?.toLocaleString()}`} trend="+12%" isPositive={true} icon={<DollarSign size={24} />} color="bg-emerald-100 text-emerald-600" />
          )}
          <StatCard title="Total Orders" value={stats.totalOrders} trend="+5%" isPositive={true} icon={<ShoppingBag size={24} />} color="bg-blue-100 text-blue-600" />
          <StatCard title="Customers" value={stats.totalCustomers} trend="Real-time" isPositive={true} icon={<Users size={24} />} color="bg-purple-100 text-purple-600" />
          <StatCard title="Avg. Order Value" value={`$${stats.avgOrderValue?.toFixed(2)}`} trend="Stable" isPositive={true} icon={<TrendingUp size={24} />} color="bg-indigo-100 text-indigo-600" />
        </div>
      )}

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Charts */}
        <div className="lg:col-span-2 space-y-8">
          {!loading && isAdmin && stats.chartData && stats.chartData.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800 font-display">Revenue Overview</h3>
                <p className="text-sm text-slate-500">Daily performance for the last 7 days</p>
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
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top Products Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 font-display flex items-center gap-2">
                <Trophy className="text-amber-500" size={20} /> Best Sellers
              </h3>
            </div>
            <div className="p-0">
               {(!stats.topProducts || stats.topProducts.length === 0) ? (
                 <div className="p-10 text-center text-slate-400 text-sm">No top products found.</div>
               ) : (
                 stats.topProducts.map((p, i) => (
                   <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                          {p.image ? <img src={p.image} className="w-full h-full object-cover rounded-lg" alt="" /> : i+1}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                          <div className="text-xs text-slate-500">{p.sales} units sold</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900 text-sm">${p.revenue?.toLocaleString()}</div>
                        <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Top Performing</div>
                      </div>
                   </div>
                 ))
               )}
            </div>
          </div>
        </div>

        {/* Right: Sidebar Insights */}
        <div className="space-y-8">
          {/* Inventory Warnings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 font-display mb-4 flex items-center gap-2">
              <AlertTriangle className="text-rose-500" size={20} /> Inventory Hotlist
            </h3>
            <div className="space-y-4">
              {(!stats.inventoryIssues || stats.inventoryIssues.length === 0) ? (
                <div className="p-6 text-center text-slate-400 text-sm">All products are healthy.</div>
              ) : (
                stats.inventoryIssues.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 truncate max-w-[150px]">{item.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.stock === 0 ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                      {item.stock} left
                    </span>
                  </div>
                ))
              )}
            </div>
            <Link to="/admin/inventory" className="mt-6 w-full py-2 flex items-center justify-center gap-2 text-primary-600 font-bold text-sm bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors">
              Manage Stock <ChevronRight size={16} />
            </Link>
          </div>

          {/* Marketing Summary Card */}
          <div className="bg-primary-600 p-6 rounded-3xl shadow-xl shadow-primary-600/20 text-white relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <h3 className="text-lg font-bold mb-4">Voucher Campaign</h3>
            <div className="space-y-4 relative">
              <div className="flex justify-between items-end">
                <span className="text-sm text-white/70 font-medium">Coupons Used</span>
                <span className="text-2xl font-bold">{stats.marketing?.promoUsed}</span>
              </div>
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-2/3" />
              </div>
              <p className="text-xs text-white/60">Total discounts given this period: ${stats.marketing?.totalDiscounted?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
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
