import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { TrendingUp, Users, ShoppingBag, PieChart as ChartPieIcon, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AdminAnalytics = () => {
  const [data, setData] = useState({
    monthlyRevenue: [],
    categoryStats: [],
    retention: [],
    paymentStats: []
  });
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/analytics?year=${year}`);
        setData(res.data.data);
      } catch (err) {
        console.error("Lỗi fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
            <ChartPieIcon className="text-primary-600" /> Deep Analytics
          </h2>
          <p className="text-slate-500 mt-1">Phân tích dữ liệu kinh doanh chuyên sâu dành riêng cho Admin.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <Calendar size={18} className="text-slate-400 ml-2" />
          <select 
            className="bg-transparent border-none focus:ring-0 font-bold text-slate-700 outline-none"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="2026">Năm 2026</option>
            <option value="2025">Năm 2025</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Doanh thu theo tháng */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
             Tăng trưởng doanh thu ({year})
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                   formatter={(value) => [`$${value.toLocaleString()}`, 'Doanh thu']}
                />
                <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doanh thu theo Danh mục */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
             Tỉ trọng doanh thu Category
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -10px rgb(0 0 0 / 0.1)' }}
                   formatter={(value) => [`$${value.toLocaleString()}`, 'Tổng thu']}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tỉ lệ khách hàng */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
             Tỉ lệ khách hàng mới & cũ
          </h3>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="h-64 w-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.retention}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-4">
              {data.retention.map((r, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                   <div className="flex items-center gap-3">
                     <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                     <span className="font-bold text-slate-700">{r.name}</span>
                   </div>
                   <span className="font-mono font-bold text-slate-900">{r.value} khách</span>
                </div>
              ))}
              <p className="text-xs text-slate-400 mt-4 leading-relaxed italic">
                * Khách quay lại là khách hàng đã phát sinh từ 2 đơn hàng thành công trở lên.
              </p>
            </div>
          </div>
        </div>

        {/* Phương thức thanh toán */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShoppingBag size={120} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 relative">
             Phân tích thanh toán
          </h3>
          <div className="space-y-4 relative">
            {data.paymentStats.map((p, i) => (
              <div key={i} className="group flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:border-primary-500 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center font-bold text-primary-600 group-hover:bg-primary-50">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.orderCount} giao dịch</div>
                  </div>
                </div>
                <div className="text-right">
                   <div className="font-bold text-slate-900">${p.totalValue?.toLocaleString()}</div>
                   <div className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
