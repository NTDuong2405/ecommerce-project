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

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Total Price</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-6 text-slate-500">Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-6 text-slate-500">No orders found.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <span className="text-primary-600">#{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{order.customerName || 'Guest Customer'}</div>
                      <div className="text-xs text-slate-500">{order.customerEmail || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">${order.totalPrice.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 flex items-center justify-end gap-2">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="border border-slate-200 text-sm text-slate-600 px-2 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="SHIPPING">Shipping</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                      
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-white hover:bg-primary-600 rounded-lg transition-all border border-primary-200 hover:border-transparent"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
      </div>

      {/* --- ORDER DETAILS MODAL --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={() => setSelectedOrder(null)}
          ></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-slate-900">Order #{selectedOrder.id}</h3>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-sm text-slate-500 mt-1">Placed on {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all shadow-sm"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1 & 2: Items List */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50/50 px-6 py-3 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Items Ordered
                    </div>
                    <div className="divide-y divide-slate-50">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="p-6 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                          <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                            <img 
                              src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/150'} 
                              alt={item.product?.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 truncate">{item.product?.name}</h4>
                            <p className="text-sm text-slate-500 mt-0.5">Price: ${item.price.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-slate-900">x{item.quantity}</div>
                            <div className="text-sm font-bold text-primary-600 mt-0.5">${(item.price * item.quantity).toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-slate-50/30 p-6 space-y-2 border-t border-slate-100">
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>Subtotal</span>
                        <span>${(selectedOrder.totalPrice - (selectedOrder.shippingPrice || 0)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>Shipping ({selectedOrder.shippingMethod || 'Standard'})</span>
                        <span className={selectedOrder.shippingPrice === 0 ? 'text-emerald-600 font-medium' : ''}>
                           {selectedOrder.shippingPrice === 0 ? 'Free' : `$${selectedOrder.shippingPrice?.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-100">
                        <span>Total Amount</span>
                        <span className="text-primary-600">${selectedOrder.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck size={18} />
                    </div>
                    <div>
                      <h5 className="font-bold text-blue-900 text-sm">Ghi chú từ khách hàng</h5>
                      <p className="text-sm text-blue-700 mt-0.5 leading-relaxed">
                        {selectedOrder.note || "Không có ghi chú đặc biệt cho đơn hàng này."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Column 3: Customer Info */}
                <div className="space-y-6">
                  <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Details</h5>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xs">
                          {selectedOrder.customerName?.[0]?.toUpperCase() || 'G'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{selectedOrder.customerName}</p>
                          <p className="text-xs text-slate-500">{selectedOrder.customerEmail || 'Guest'}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-50">
                        <p className="text-xs text-slate-400 font-medium uppercase">Phone Number</p>
                        <p className="text-sm text-slate-900 font-bold mt-1">{selectedOrder.customerPhone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shipping Address</h5>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Address</p>
                        <p className="text-sm text-slate-900 font-semibold mt-1 leading-relaxed">
                          {selectedOrder.address}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium">City</p>
                        <p className="text-sm text-slate-900 font-semibold mt-1">{selectedOrder.city}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Information</h5>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Method</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-slate-900">{selectedOrder.payment?.method || 'N/A'}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
                            {selectedOrder.payment?.method === 'COD' ? '💵 COD' : '💳 Online'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Status</p>
                        <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold mt-1 ${
                          selectedOrder.payment?.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 
                          selectedOrder.payment?.status === 'FAILED' ? 'bg-red-100 text-red-700' : 
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {selectedOrder.payment?.status || 'PENDING'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg space-y-4">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Control</h5>
                    <div className="space-y-3">
                      <p className="text-xs text-slate-300">Update Order Status</p>
                      <select 
                        value={selectedOrder.status}
                        onChange={(e) => {
                          handleStatusChange(selectedOrder.id, e.target.value);
                          setSelectedOrder({...selectedOrder, status: e.target.value});
                        }}
                        className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-bold"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="SHIPPING">Shipping</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Cập nhật trạng thái này sẽ gửi thông báo và thay đổi hiển thị cho khách hàng.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-all shadow-sm"
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
