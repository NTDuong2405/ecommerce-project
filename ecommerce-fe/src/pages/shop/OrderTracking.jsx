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
  ChevronRight
} from 'lucide-react';

const OrderTracking = () => {
  const [orderId, setOrderId] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await axios.get(`http://localhost:3000/api/orders/track?orderId=${orderId}&contact=${contact}`);
      setOrder(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found. Please check your info.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'CONFIRMED': return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
      case 'SHIPPING': return <Truck className="w-5 h-5 text-indigo-500" />;
      case 'DELIVERED': return <ShoppingBag className="w-5 h-5 text-emerald-500" />;
      case 'CANCELLED': return <Clock className="w-5 h-5 text-rose-500" />;
      default: return null;
    }
  };

  const getStatusStep = (status) => {
    const steps = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED'];
    return steps.indexOf(status);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Track Your Order</h1>
          <p className="text-slate-500">Enter your order details to see real-time updates.</p>
        </div>

        {/* Tracking Form */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 mb-8">
          <form onSubmit={handleTrack} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Order ID</label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. 1024"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email or Phone</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Enter contact info"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
              {loading ? 'Searching...' : <><Search className="w-5 h-5" /> Track Now</>}
            </button>
          </form>
          {error && <p className="mt-4 text-center text-rose-500 font-medium">{error}</p>}
        </div>

        {/* Results */}
        {order && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Status Card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden">
              <div className="bg-slate-900 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                    <Package className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Order #{order.id}</h3>
                    <p className="text-slate-400 text-sm">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-5 py-2 rounded-full border border-white/10 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${order.status === 'CANCELLED' ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`} />
                  <span className="text-white font-bold text-sm tracking-wide">{order.status}</span>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="px-8 py-12">
                <div className="relative flex justify-between items-center max-w-2xl mx-auto">
                  {/* Progress Line */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10" />
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 -z-10 transition-all duration-700" 
                    style={{ width: `${(getStatusStep(order.status) / 3) * 100}%` }}
                  />

                  {['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED'].map((step, idx) => {
                    const isCompleted = getStatusStep(order.status) >= idx;
                    const isActive = getStatusStep(order.status) === idx;
                    return (
                      <div key={step} className="flex flex-col items-center gap-3">
                        <div className={`
                          w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
                          ${isCompleted ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-300 border-2 border-slate-100'}
                          ${isActive ? 'ring-4 ring-indigo-50 font-bold scale-110' : ''}
                        `}>
                          {idx === 0 && <Clock className="w-6 h-6" />}
                          {idx === 1 && <CheckCircle2 className="w-6 h-6" />}
                          {idx === 2 && <Truck className="w-6 h-6" />}
                          {idx === 3 && <ShoppingBag className="w-6 h-6" />}
                        </div>
                        <span className={`text-[11px] font-bold tracking-tight uppercase ${isCompleted ? 'text-indigo-600' : 'text-slate-300'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Info */}
              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60">
                <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-500" /> Shipping Details
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Customer</p>
                    <p className="font-semibold text-slate-800">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Address</p>
                    <p className="font-semibold text-slate-800">{order.address}</p>
                    <p className="text-slate-600 font-medium">{order.city}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Contact</p>
                    <p className="font-semibold text-slate-800">{order.customerPhone || order.customerEmail}</p>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60">
                <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-500" /> Order Items
                </h4>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm line-clamp-1">{item.product.name}</p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-bold text-slate-900 text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t-2 border-slate-50 flex justify-between items-center">
                  <span className="font-bold text-slate-400">Total Price</span>
                  <span className="text-2xl font-black text-indigo-600">${order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
