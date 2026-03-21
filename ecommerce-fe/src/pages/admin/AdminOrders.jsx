import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Search, Eye, Filter, CheckCircle, Package, Truck, XCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const AdminOrders = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('orderId') || '');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
      const res = await api.get('/orders/all');
      setOrders(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"><CheckCircle size={12}/> Delivered</span>;
      case 'SHIPPING': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"><Truck size={12}/> Shipping</span>;
      case 'CONFIRMED': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700"><Package size={12}/> Confirmed</span>;
      case 'CANCELLED': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700"><XCircle size={12}/> Cancelled</span>;
      default: return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span> Pending</span>;
    }
  };

  const filteredOrders = orders.filter(order => 
    String(order.id).includes(searchTerm) || 
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-6 text-slate-500">No orders found.</td></tr>
              ) : (
                filteredOrders.map((order) => (
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
                      
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-white hover:bg-primary-600 rounded-lg transition-all border border-primary-200 hover:border-transparent">
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
      </div>
    </div>
  );
};

export default AdminOrders;
