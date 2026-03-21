import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Search, CheckCircle, Save, AlertTriangle } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

const AdminInventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  // Lưu trữ các stock thay đổi chưa lưu { [productId]: stock }
  const [editedStocks, setEditedStocks] = useState({});
  const [savingId, setSavingId] = useState(null);

  // Lưu trữ trạng thái nháy update cho UI
  const [updatingIds, setUpdatingIds] = useState({});

  // Toast Notification
  const [toast, setToast] = useState({ msg: '', type: '' });
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3000);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products?search=${searchTerm}`);
      setProducts(res.data?.data?.data || res.data?.data || []);
      setEditedStocks({});
    } catch (err) {
      console.error("Lỗi fetch inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm]);

  useEffect(() => {
    if (socket) {
      const handleStockUpdate = ({ productId, newStock }) => {
        console.log(`%c⚡️ [Inventory Real-time] Product ${productId} -> ${newStock}`, "color: #10b981; font-weight: bold;");
        
        // Cập nhật số lượng trong danh sách
        setProducts(prev => prev.map(p => 
          p.id == productId ? { ...p, stock: newStock } : p
        ));

        // Kích hoạt hiệu ứng nháy
        setUpdatingIds(prev => ({ ...prev, [productId]: true }));
        setTimeout(() => {
          setUpdatingIds(prev => {
            const next = { ...prev };
            delete next[productId];
            return next;
          });
        }, 2000);
      };

      socket.on('stock-update', handleStockUpdate);
      return () => socket.off('stock-update', handleStockUpdate);
    }
  }, [socket]);


  const handleStockChange = (id, value) => {
    setEditedStocks(prev => ({
      ...prev,
      [id]: parseInt(value) || 0
    }));
  };

  const handleSaveStock = async (product) => {
    const newStock = editedStocks[product.id];
    if (newStock === undefined || newStock === product.stock) return;

    try {
      setSavingId(product.id);
      // Gọi API update sản phẩm (tái sử dụng API PUT /api/products/:id)
      await api.put(`/products/${product.id}`, {
        stock: newStock
      });
      showToast('Cập nhật tồn kho thành công!');
      
      // Cập nhật state local
      setProducts(products.map(p => p.id === product.id ? { ...p, stock: newStock } : p));
      
      const newEdited = {...editedStocks};
      delete newEdited[product.id];
      setEditedStocks(newEdited);
    } catch (err) {
      console.error(err);
      showToast('Lỗi cập nhật kho (Vui lòng thử lại)!', 'error');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up relative">
      {/* Toast Notification Tự dọn */}
      {toast.msg && (
        <div className={`fixed top-8 right-8 z-[100] text-white px-6 py-4 rounded-xl shadow-xl font-medium animate-fade-in-up flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.type === 'error' ? <AlertTriangle size={22} className="text-red-200" /> : <CheckCircle size={22} className="text-emerald-200" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900">Inventory Management</h2>
          <p className="text-slate-500 text-sm mt-1">Control your stock levels and availability in one click.</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search products by name..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-semibold w-12">ID</th>
                <th className="px-6 py-4 font-semibold">Product Info</th>
                <th className="px-6 py-4 font-semibold text-center w-36">Status</th>
                <th className="px-6 py-4 font-semibold text-right w-40">Stock Quantity</th>
                <th className="px-6 py-4 font-semibold text-right w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-6 text-slate-500">Loading inventory...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-6 text-slate-500">No products found.</td></tr>
              ) : products.map((product) => {
                const currentStock = editedStocks[product.id] !== undefined ? editedStocks[product.id] : (product.stock || 0);
                const hasChanged = editedStocks[product.id] !== undefined && editedStocks[product.id] !== (product.stock || 0);
                const isSaving = savingId === product.id;
                
                let StatusBadge = null;
                if (currentStock === 0) {
                  StatusBadge = <span className="inline-flex px-2.5 py-1 rounded-md bg-red-100 text-red-700 text-xs font-bold w-full justify-center">OUT OF STOCK</span>;
                } else if (currentStock < 10) {
                  StatusBadge = <span className="inline-flex px-2.5 py-1 rounded-md bg-orange-100 text-orange-700 text-xs font-bold w-full justify-center">LOW STOCK</span>;
                } else {
                  StatusBadge = <span className="inline-flex px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold w-full justify-center">IN STOCK</span>;
                }

                return (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-slate-500 text-sm">#{product.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shadow-sm shrink-0">
                          <img src={product.images?.[0]?.url || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="font-bold text-slate-900 line-clamp-1">{product.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {StatusBadge}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <input 
                          type="number" 
                          min="0"
                          value={currentStock}
                          onChange={(e) => handleStockChange(product.id, e.target.value)}
                          className={`w-24 text-right px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 font-semibold transition-all duration-500 ${
                            updatingIds[product.id]
                            ? 'ring-4 ring-emerald-400 scale-110 bg-emerald-50 border-emerald-500' 
                            : hasChanged 
                            ? 'border-primary-500 ring-2 ring-primary-100 bg-primary-50 text-primary-900' 
                            : 'border-slate-200 focus:border-primary-500 text-slate-700'
                          }`}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {hasChanged ? (
                        <button 
                          onClick={() => handleSaveStock(product)}
                          disabled={isSaving}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors ml-auto shadow-sm disabled:opacity-50"
                        >
                          <Save size={16} />
                          {isSaving ? '...' : 'Save'}
                        </button>
                      ) : (
                        <div className="h-8 w-8"></div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
