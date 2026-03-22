import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { BarChart3, TrendingUp, Package, PieChart as PieIcon, Activity, ArrowUpRight } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend 
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) return <div className="p-10 text-center text-slate-500 animate-pulse font-medium">Báo cáo đang được xử lý...</div>;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Business Analytics</h2>
          <p className="text-slate-500 mt-2 font-medium">Phân tích chuyên sâu về hiệu suất kinh doanh</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 text-sm font-bold text-slate-600">
           <Activity size={16} className="text-emerald-500" />
           Cập nhật: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Doanh thu & Biểu đồ đường */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800 font-display">Biểu đồ Tăng trưởng</h3>
              <p className="text-sm text-slate-400">Doanh thu 7 ngày gần nhất</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400 font-medium uppercase tracking-widest text-[10px]">Total Revenue</p>
              <p className="text-2xl font-bold text-emerald-600 font-display">${data.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="h-80 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  itemStyle={{fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trạng thái đơn hàng - Pie Chart */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-full text-left mb-6">
                <h3 className="text-xl font-bold text-slate-800 font-display">Tỉ trọng Đơn hàng</h3>
                <p className="text-sm text-slate-400">Phân bổ theo trạng thái</p>
            </div>
            <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data.statusStats}
                            cx="50%" cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.statusStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <p className="text-2xl font-bold text-slate-800">{data.totalOrders}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Orders</p>
                </div>
            </div>
            <div className="w-full mt-6 space-y-3">
                {data.statusStats.map((s, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                            <span className="text-slate-600 font-medium uppercase tracking-tight text-xs">{s.name}</span>
                        </div>
                        <span className="font-bold text-slate-800">{s.value}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Top Product List */}
        <div className="lg:col-span-3 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
                <div>
                   <h3 className="text-xl font-bold text-slate-800 font-display flex items-center gap-2">
                       <TrendingUp className="text-blue-500" /> Sản phẩm Bán chạy
                   </h3>
                   <p className="text-sm text-slate-400">Dựa trên số lượng đơn hàng đã bán</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {data.topProducts.map((p, i) => (
                    <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all hover:shadow-lg group">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 mb-4 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                            <Package size={24} />
                        </div>
                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[40px]">{p.name}</h4>
                        <div className="mt-4 flex justify-between items-end">
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Đã bán</p>
                                <p className="text-xl font-bold text-slate-900">{p.sales}</p>
                            </div>
                            <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg">
                                <ArrowUpRight size={16} />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200">
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Revenue</p>
                             <p className="text-sm font-bold text-slate-800">${p.revenue.toLocaleString()}</p>
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
