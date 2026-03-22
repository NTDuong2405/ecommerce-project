import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Search, Eye, Filter, CheckCircle, Package, Truck, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Pagination from '../../components/Pagination';

const AdminOrders = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('orderId') || '');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Lắng nghe URL param để tự động lọc đơn hàng
  useEffect(() => {
    const oid = searchParams.get('orderId');
    if (oid) setSearchTerm(oid);
  }, [searchParams]);

  // Toast Notification
  const [toast, setToast] = useState({ msg: '', type: '' });
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3000);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      showToast('Cập nhật trạng thái đơn hàng thành công!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi cập nhật trạng thái đơn hàng!', 'error');
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/all?page=${page}&limit=10&search=${searchTerm}`);
      setOrders(res.data?.data?.data || res.data?.data || []);
      setMeta(res.data?.data?.meta || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, searchTerm]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"><CheckCircle size={12}/> Delivered</span>;
      case 'SHIPPING': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"><Truck size={12}/> Shipping</span>;
      case 'CONFIRMED': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700"><Package size={12}/> Confirmed</span>;
      case 'CANCELLED': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700"><XCircle size={12}/> Cancelled</span>;
      default: return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span> Pending</span>;
    }
  };

  if (loading && orders.length === 0) return <div className="p-10 text-center text-slate-500">Loading orders...</div>;

  return (
    <div className="space-y-6 animate-fade-in-up relative">
      {/* Toast Notification Tự dọn */}
      {toast.msg && (
        <div className={`fixed top-8 right-8 z-[100] text-white px-6 py-4 rounded-xl shadow-xl font-medium animate-fade-in-up flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.type === 'error' ? <XCircle size={22} className="text-red-200" /> : <CheckCircle size={22} className="text-emerald-200" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900">Orders Management</h2>
          <p className="text-slate-500 text-sm mt-1">Review orders, update statuses, and fulfill shipments.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer Name..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select className="border border-slate-200 text-slate-600 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SHIPPING">Shipping</option>
            <option value="DELIVERED">Delivered</option>
          </select>
          <button className="flex items-center justify-center gap-2 text-slate-600 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium transition-colors">
            <Filter size={18} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Orders Table / Cards View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs font-black uppercase tracking-widest border-b border-slate-200">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-20 text-slate-400 font-medium font-display animate-pulse uppercase tracking-widest">Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-20 text-slate-400 font-medium font-display uppercase tracking-widest">No orders found.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-6 py-4 font-black text-slate-900 italic">
                      <span className="text-primary-600">#{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-black text-slate-800 uppercase tracking-tight text-sm">
                        {order.customerName || 'Guest Customer'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                        {order.customerEmail || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-widest">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900 text-base">
                      {order.totalPrice.toLocaleString()}đ
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all shadow-sm outline-none"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="SHIPPING">Shipping</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2.5 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Cards */}
        <div className="md:hidden divide-y divide-slate-100 px-4">
          {loading ? (
            <div className="py-20 text-center text-slate-400 font-medium font-display animate-pulse uppercase tracking-widest">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-medium font-display uppercase tracking-widest">No orders found.</div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="py-6 flex flex-col gap-4 animate-fade-in-up">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 block">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <h4 className="font-black text-slate-900 italic text-lg leading-none">
                      #{order.id}
                    </h4>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</span>
                    <span className="text-sm font-black text-slate-800 uppercase tracking-tight truncate max-w-[150px]">
                      {order.customerName || 'Guest'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Price</span>
                    <span className="text-base font-black text-primary-600">
                      {order.totalPrice.toLocaleString()}đ
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
                  >
                    <Eye size={14} /> Chi tiết
                  </button>
                  <div className="flex-1 relative">
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="w-full bg-white border-2 border-slate-100 text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl appearance-none outline-none focus:border-primary-500 transition-colors"
                    >
                      <option value="PENDING">Status</option>
                      <option value="CONFIRMED">Firmed</option>
                      <option value="SHIPPING">Ship</option>
                      <option value="DELIVERED">Done</option>
                      <option value="CANCELLED">Exit</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Pagination meta={meta} onPageChange={(p) => setPage(p)} />


      {/* --- ORDER DETAILS MODAL --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={() => setSelectedOrder(null)}
          ></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">
            <div className="px-6 sm:px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight italic">Order #{selectedOrder.id}</h3>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest italic">Placed on {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="p-2.5 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-600 transition-all shadow-sm shrink-0"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
              <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Column 1 & 2: Items List */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Items Ordered
                    </div>
                    <div className="divide-y divide-slate-50">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="p-4 sm:p-6 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 shadow-sm">
                            <img 
                              src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/150'} 
                              alt={item.product?.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-slate-900 truncate uppercase tracking-tight text-sm">{item.product?.name}</h4>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Price: {item.price.toLocaleString()}đ</p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-black text-slate-900 text-sm italic">x{item.quantity}</div>
                            <div className="text-sm font-black text-primary-600 mt-0.5 italic">{(item.price * item.quantity).toLocaleString()}đ</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-slate-50/30 p-4 sm:p-6 space-y-2 border-t border-slate-100">
                      <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Subtotal</span>
                        <span className="text-slate-900 font-bold italic">{(selectedOrder.totalPrice - (selectedOrder.shippingPrice || 0)).toLocaleString()}đ</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Shipping ({selectedOrder.shippingMethod || 'Standard'})</span>
                        <span className={selectedOrder.shippingPrice === 0 ? 'text-emerald-600 font-black' : 'text-slate-900 font-bold italic'}>
                           {selectedOrder.shippingPrice === 0 ? 'FREE' : `${selectedOrder.shippingPrice?.toLocaleString()}đ`}
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-black text-slate-900 pt-4 border-t border-slate-100 mt-2 italic uppercase">
                        <span>Total Amount</span>
                        <span className="text-primary-600 text-xl font-black">
                          {selectedOrder.totalPrice.toLocaleString()}đ
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary-50/50 border border-primary-100 p-5 rounded-3xl flex items-start gap-4">
                    <div className="w-10 h-10 bg-white text-primary-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Truck size={20} />
                    </div>
                    <div>
                      <h5 className="font-black text-primary-900 text-[10px] uppercase tracking-[0.2em] mb-1">Ghi chú từ khách hàng</h5>
                      <p className="text-xs text-primary-700 font-bold leading-relaxed italic opacity-80">
                        {selectedOrder.note || "Không có ghi chú đặc biệt cho đơn hàng này."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Column 3: Customer Info */}
                <div className="space-y-6">
                  {/* Customer Details info block */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3">Customer Details</h5>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center font-black text-sm border border-slate-200">
                          {selectedOrder.customerName?.[0]?.toUpperCase() || 'G'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{selectedOrder.customerName}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{selectedOrder.customerEmail || 'Guest'}</p>
                        </div>
                      </div>
                      <div className="space-y-4 pt-2">
                        <div className="group">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Phone Number</p>
                          <p className="text-sm text-slate-900 font-black italic">{selectedOrder.customerPhone || 'N/A'}</p>
                        </div>
                        <div className="group">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Shipping Address</p>
                          <p className="text-sm text-slate-900 font-black italic leading-relaxed uppercase tracking-tight">
                            {selectedOrder.address}, {selectedOrder.city}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3">Payment Info</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Method</p>
                        <div className="inline-flex px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest italic">
                          {selectedOrder.payment?.method || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Pay Status</p>
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest italic animate-pulse ${
                          selectedOrder.payment?.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 
                          selectedOrder.payment?.status === 'FAILED' ? 'bg-red-100 text-red-700' : 
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {selectedOrder.payment?.status || 'PENDING'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl space-y-5 border-4 border-slate-800">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Admin Control</h5>
                    <div className="space-y-3">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Update Status</p>
                      <div className="relative group">
                        <select 
                          value={selectedOrder.status}
                          onChange={(e) => {
                            handleStatusChange(selectedOrder.id, e.target.value);
                            setSelectedOrder({...selectedOrder, status: e.target.value});
                          }}
                          className="w-full bg-slate-800 border-2 border-slate-700 text-white px-4 py-3 rounded-2xl outline-none focus:border-primary-500 transition-all text-sm font-black uppercase tracking-widest italic cursor-pointer appearance-none"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="SHIPPING">Shipping</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold leading-tight opacity-60 italic">
                        Cập nhật trạng thái này sẽ đồng bộ hóa ngay lập tức.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 font-black rounded-2xl hover:bg-slate-100 transition-all shadow-sm uppercase tracking-widest text-[10px]"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
