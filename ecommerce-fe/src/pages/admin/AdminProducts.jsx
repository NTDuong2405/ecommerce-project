import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Plus, Search, Edit2, Trash2, Filter, X, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

const AdminProducts = () => {
  // --- STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  // States quản lý Modal Thêm/Sửa sản phẩm
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [currentProduct, setCurrentProduct] = useState({ name: '', description: '', price: 0, stock: 0, imageUrl: '' });
  const [saving, setSaving] = useState(false);

  // State quản lý Modal Xác nhận Xóa
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState({ msg: '', type: '' });
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3000);
  };

  // --- HÀM LẤY DATA (FETCH) ---
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products?search=${searchTerm}`);
      setProducts(res.data?.data?.data || res.data?.data || []);
    } catch (err) {
      console.error("Lỗi khi fetch sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm]);

  useEffect(() => {
    // --- Tích hợp Socket.io Real-time tập trung ---
    if (socket) {
      const handleStockUpdate = ({ productId, newStock }) => {
        console.log(`%c⚡️ [Real-time Update] Product ID: ${productId} -> New Stock: ${newStock}`, "color: #10b981; font-weight: bold; padding: 4px;");
        
        // Cập nhật danh sách sản phẩm hiện tại
        setProducts(prev => {
          const updated = prev.map(p => 
            p.id == productId ? { ...p, stock: newStock, isUpdating: true } : p
          );
          return updated;
        });

        // Xóa hiệu ứng nháy sau 2 giây
        setTimeout(() => {
          setProducts(prev => prev.map(p => 
            p.id == productId ? { ...p, isUpdating: false } : p
          ));
        }, 2000);
      };

      socket.on('stock-update', handleStockUpdate);
      return () => socket.off('stock-update', handleStockUpdate);
    }
  }, [socket]);



  // --- HÀM THAO TÁC (ACTIONS) ---
  
  // Mở modal thêm mới
  const handleOpenAdd = () => {
    setModalMode('add');
    setCurrentProduct({ name: '', description: '', price: '', stock: 0, imageUrl: '' });
    setIsModalOpen(true);
  };

  // Mở modal sửa với data của sản phẩm đang chọn
  const handleOpenEdit = (product) => {
    setModalMode('edit');
    setCurrentProduct({ 
      id: product.id,
      name: product.name, 
      description: product.description || '', 
      price: product.price, 
      stock: product.stock,
      imageUrl: product.images?.[0]?.url || '' 
    });
    setIsModalOpen(true);
  };

  // Nút Lưu trong Modal
  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentProduct.name || !currentProduct.price) return showToast("Vui lòng điền đủ tên và giá!", "error");

    setSaving(true);
    try {
      const payload = {
        name: currentProduct.name,
        description: currentProduct.description,
        price: Number(currentProduct.price),
        stock: Number(currentProduct.stock),
        images: currentProduct.imageUrl ? [currentProduct.imageUrl] : []
      };

      if (modalMode === 'add') {
        await api.post('/products', payload);
        showToast("Thêm sản phẩm thành công!");
      } else {
        await api.put(`/products/${currentProduct.id}`, payload);
        showToast("Cập nhật sản phẩm thành công!");
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Lỗi khi lưu sản phẩm:", error);
      showToast("Đã xảy ra lỗi khi lưu!", "error");
    } finally {
      setSaving(false);
    }
  };

  // Hành động Xóa khi đã Xác nhận
  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteConfirmId}`);
      setDeleteConfirmId(null);
      showToast("Đã xóa sản phẩm thành công!");
      fetchProducts();
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      showToast("Không thể xóa sản phẩm do lỗi Backend hoặc dính tới Đơn hàng!", "error");
      setDeleteConfirmId(null);
    } finally {
      setDeleting(false);
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

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900">Products Management</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your catalog, inventory, and variants.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search products by name..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 text-slate-600 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto">
          <Filter size={18} />
          <span>Filters</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-semibold w-12">ID</th>
                <th className="px-6 py-4 font-semibold">Product Info</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold text-center">Stock</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                 <tr><td colSpan="4" className="text-center py-6 text-slate-500">Loading products...</td></tr>
              ) : products.length === 0 ? (
                 <tr><td colSpan="4" className="text-center py-6 text-slate-500">No products found.</td></tr>
              ) : (
                 products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-slate-500 text-sm">#{product.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shadow-sm">
                          <img src={product.images?.[0]?.url || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{product.name}</div>
                          <div className="text-sm text-slate-500 mt-0.5 line-clamp-1">{product.description || 'No description'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">${product.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono transition-all duration-500
                        ${product.isUpdating ? 'ring-4 ring-emerald-400 scale-125 bg-emerald-100' : ''}
                        ${product.stock > 10 ? 'bg-emerald-50 text-emerald-600' : product.stock > 0 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                        <Package size={12} className={product.stock === 0 ? 'animate-bounce' : ''} />
                        {product.stock}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEdit(product)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => setDeleteConfirmId(product.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CẤU TRÚC MODAL CHI TIẾT SẢN PHẨM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold font-display text-slate-900">
                {modalMode === 'add' ? 'Thêm mới Sản phẩm' : 'Chỉnh sửa Sản phẩm'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên sản phẩm (*)</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={currentProduct.name}
                  onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả chi tiết</label>
                <textarea 
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={currentProduct.description}
                  onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giá (*)</label>
                  <input 
                    type="number" 
                    required
                    min={0}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-slate-900"
                    value={currentProduct.price}
                    onChange={e => setCurrentProduct({...currentProduct, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng Kho (*)</label>
                  <input 
                    type="number" 
                    required
                    min={0}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold ${Number(currentProduct.stock) === 0 ? 'border-red-300 bg-red-50 text-red-700' : 'border-slate-200 text-slate-900'}`}
                    value={currentProduct.stock}
                    onChange={e => setCurrentProduct({...currentProduct, stock: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link Ảnh (URL)</label>
                <input 
                  type="url" 
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={currentProduct.imageUrl}
                  onChange={e => setCurrentProduct({...currentProduct, imageUrl: e.target.value})}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-4 py-2 font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu Sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CẤU TRÚC MODAL XÁC NHẬN XÓA --- */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !deleting && setDeleteConfirmId(null)}></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold font-display text-slate-900 mb-2">Xác nhận xóa?</h3>
            <p className="text-slate-500 mb-8">
              Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm này khỏi hệ thống?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleting}
                className="flex-1 py-2.5 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50"
              >
                {deleting ? 'Đang xóa...' : 'Xóa ngay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
