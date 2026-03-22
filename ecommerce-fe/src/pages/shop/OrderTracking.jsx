import React, { useState } from 'react';
import axios from 'axios';
import {
  Package,
  Search,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  ShoppingBag,
  CreditCard,
  ChevronRight,
  MessageCircle,
  Download,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import api from '../../utils/api';

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [contact, setContact] = useState(searchParams.get('contact') || '');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Auto-track if params exist
  React.useEffect(() => {
    if (orderId && contact) {
      const triggerTrack = async () => {
        setLoading(true);
        setError('');
        try {
          const res = await api.get(`/orders/track?orderId=${orderId}&contact=${contact}`);
          setOrder(res.data.data);
        } catch (err) {
          setError(err.response?.data?.message || 'Không tìm thấy đơn hàng tự động.');
        } finally {
          setLoading(false);
        }
      };
      triggerTrack();
    }
  }, []);

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await api.get(`/orders/track?orderId=${orderId}&contact=${contact}`);
      setOrder(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Không tìm thấy đơn hàng. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const statusMap = {
    'PENDING': { label: 'Chờ xác nhận', icon: Clock, color: 'amber', step: 0 },
    'CONFIRMED': { label: 'Đã xác nhận', icon: CheckCircle2, color: 'blue', step: 1 },
    'SHIPPING': { label: 'Đang giao hàng', icon: Truck, color: 'indigo', step: 2 },
    'DELIVERED': { label: 'Đã giao thành công', icon: ShoppingBag, color: 'emerald', step: 3 },
    'CANCELLED': { label: 'Đã hủy', icon: Clock, color: 'rose', step: -1 },
  };

  // Helper to safely get status info
  const getStatusInfo = (status) => statusMap[status] || statusMap['PENDING'];

  const currentStatus = order ? getStatusInfo(order.status) : null;

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-12 px-4 selection:bg-indigo-100 selection:text-indigo-700">
      {/* Nền Gradient Mesh (Subtle) */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-100/20 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Trải nghiệm mua sắm hiện đại
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 tracking-tight">
            Theo dõi đơn hàng
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Nhập mã đơn hàng và thông tin liên lạc để biết hành trình gói hàng của bạn nhé!
          </p>
        </div>

        {/* Search Bar - Premium Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white p-2 mb-12 shadow-2xl shadow-slate-200/50">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative group">
              <Package className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Mã đơn hàng (ví dụ: 1024)"
                className="w-full pl-14 pr-6 py-5 bg-transparent border-none focus:ring-0 text-slate-800 font-semibold placeholder:text-slate-400 outline-none"
                required
              />
            </div>
            <div className="w-px bg-slate-100 hidden md:block my-3" />
            <div className="flex-[1.5] relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Email hoặc Số điện thoại đặt hàng"
                className="w-full pl-14 pr-6 py-5 bg-transparent border-none focus:ring-0 text-slate-800 font-semibold placeholder:text-slate-400 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-slate-950 hover:bg-slate-800 text-white px-8 py-4 rounded-[2rem] font-bold transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Tra cứu ngay <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>
          {error && <p className="mt-4 px-6 text-rose-500 text-sm font-bold flex items-center gap-1.5"><Clock className="w-4 h-4" /> {error}</p>}
        </div>

        {/* Result Area */}
        {order && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* Left Column: Progress & Timeline */}
            <div className="lg:col-span-8 space-y-8">
              {/* Massive Status Card */}
              <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-50 overflow-hidden relative">
                {/* Status Badge Overlays */}
                <div className="bg-slate-900 border-b border-white/10 p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 -mr-12 -mt-12 bg-indigo-500/20 rounded-full blur-3xl" />
                  <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                      <p className="text-indigo-300 font-bold tracking-widest uppercase text-xs">Phân loại: {order.shippingMethod || 'Giao hàng Tiêu chuẩn'}</p>
                      <h2 className="text-white text-3xl font-black">Đơn hàng #{order.id}</h2>
                    </div>
                    <div className={`px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3`}>
                      <div className={`w-3 h-3 rounded-full bg-${currentStatus.color}-500 animate-pulse`} />
                      <span className="text-white font-bold text-lg">{currentStatus.label}</span>
                    </div>
                  </div>
                </div>

                {/* Visual Tracker */}
                <div className="p-6 md:p-10 pb-16 md:pb-20">
                  <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center px-4 gap-8 md:gap-2">
                    {/* Road Background (Horizontal on MD+) */}
                    <div className="absolute left-8 lg:left-0 right-0 top-6 h-1 bg-slate-100 rounded-full -z-0 hidden md:block" />
                    {/* Vertical Background (Mobile) */}
                    <div className="absolute left-[38px] top-6 bottom-6 w-1 bg-slate-100 rounded-full -z-0 md:hidden" />
                    
                    {/* Road Background (Vertical on Mobile) */}
                    {['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED'].map((s, idx) => {
                      const Icon = statusMap[s].icon;
                      const done = currentStatus.step >= idx;
                      const active = currentStatus.step === idx;
                      return (
                        <div key={s} className="relative z-10 flex flex-row md:flex-col items-center gap-6 group w-full md:w-auto">
                          <div className={`
                            w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0
                            ${done ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white text-slate-300 border-2 border-slate-100'}
                            ${active ? 'ring-4 ring-indigo-50 scale-110 md:scale-125' : ''}
                          `}>
                            <Icon className={`w-5 h-5 md:w-6 md:h-6 ${active ? 'animate-pulse' : ''}`} />
                            {active && <div className="absolute -top-10 md:-top-12 bg-slate-900 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-lg whitespace-nowrap shadow-lg">Hiện tại</div>}
                          </div>
                          <div className="flex flex-col md:items-center">
                            <span className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest ${done ? 'text-slate-900' : 'text-slate-300'}`}>
                              {statusMap[s].label}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium md:hidden">
                              {idx === 0 ? 'Nhận đơn' : idx === 1 ? 'Lấy hàng' : idx === 2 ? 'Đang đi' : 'Tới nơi'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/chat')}
                  className="p-6 bg-white rounded-3xl border border-slate-50 shadow-lg shadow-slate-100/50 flex flex-col items-center gap-3 hover:bg-slate-50 transition-colors group text-left w-full"
                >
                  <MessageCircle className="w-8 h-8 text-indigo-500" />
                  <span className="font-bold text-slate-800">Cần giúp đỡ?</span>
                  <span className="text-xs text-slate-400 text-center">Chat với nhân viên hỗ trợ về đơn hàng</span>
                </button>
                <div className="p-6 bg-white rounded-3xl border border-slate-50 shadow-lg shadow-slate-100/50 flex flex-col items-center gap-3 opacity-60 cursor-not-allowed">
                  <Download className="w-8 h-8 text-slate-500" />
                  <span className="font-bold text-slate-800 text-center">Xuất Hóa đơn</span>
                  <span className="text-xs text-slate-400">Tải về hóa đơn trực tuyến (PDF)</span>
                </div>
                <button className="p-6 bg-emerald-600 rounded-3xl shadow-lg shadow-emerald-100 flex flex-col items-center gap-3 hover:bg-emerald-700 transition-colors group text-left w-full">
                  <RotateCcw className="w-8 h-8 text-white group-hover:rotate-[-45deg] transition-transform" />
                  <span className="font-bold text-white">Mua lại ngay</span>
                  <span className="text-xs text-white/70">Đặt lại y hệt đơn hàng này</span>
                </button>
              </div>
            </div>

            {/* Right Column: Order Info & Items */}
            <div className="lg:col-span-4 space-y-6">
              {/* Shipping Details */}
              <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-50">
                <h4 className="flex items-center gap-3 font-black text-slate-900 mb-8 border-b border-slate-50 pb-4">
                  <MapPin className="w-5 h-5 text-indigo-600" /> Thông tin Giao nhận
                </h4>
                <div className="space-y-6">
                  <div className="group">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-500 transition-colors">Người nhận</p>
                    <p className="font-bold text-slate-800">{order.customerName}</p>
                    <p className="text-sm text-slate-500">{order.customerPhone || order.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Địa chỉ nhận hàng</p>
                    <p className="font-bold text-slate-800 leading-relaxed">{order.address}</p>
                    <p className="text-sm text-slate-600 font-semibold">{order.city || 'Việt Nam'}</p>
                  </div>
                  {order.note && (
                    <div className="p-4 bg-slate-50 rounded-2xl border-l-4 border-amber-400">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Ghi chú</p>
                      <p className="text-sm italic text-slate-600">"{order.note}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Card */}
              <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-50">
                <h4 className="flex items-center gap-3 font-black text-slate-900 mb-8 border-b border-slate-50 pb-4">
                  <ShoppingBag className="w-5 h-5 text-emerald-600" /> Sản phẩm ({(order.items || []).length})
                </h4>
                <div className="space-y-4 mb-8 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 group">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:bg-slate-100 transition-colors">
                        {item.product?.image ? (
                          <img src={item.product.image} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <ShoppingBag className="w-6 h-6 text-slate-300" />
                        )}
                        <div className="absolute top-0 right-0 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded-bl-xl border-b border-l border-white/20">
                          x{item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{item.product?.name || 'Sản phẩm'}</p>
                        <p className="text-xs font-black text-indigo-600">{item.price?.toLocaleString()}đ</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t-2 border-dashed border-slate-100 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Tiền hàng:</span>
                    <span className="text-slate-900 font-bold">{order.totalPrice?.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Phí giao hàng:</span>
                    <span className="text-slate-900 font-bold">Miễn phí</span>
                  </div>
                  <div className="pt-4 flex justify-between items-baseline">
                    <span className="text-slate-900 font-black text-sm">TỔNG CỘNG</span>
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-indigo-500">
                      {order.totalPrice?.toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Styled Custom Scrollbar CSS */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default OrderTracking;
