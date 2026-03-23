import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Plus, Search, Edit2, Trash2, Filter, X, AlertTriangle, CheckCircle, Package, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import Pagination from '../../components/Pagination';

const AdminProducts = () => {
  // --- STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const { socket } = useSocket();

  // States quản lý Modal Thêm/Sửa sản phẩm
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [currentProduct, setCurrentProduct] = useState({ 
    name: '', description: '', category: '', price: 0, stock: 0, images: [], sizeChart: '', variants: [] 
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [importing, setImporting] = useState(false);

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
      const res = await api.get(`/products?search=${searchTerm}&page=${page}&limit=10`);
      setProducts(res.data?.data?.data || res.data?.data || []);
      setMeta(res.data?.data?.meta || null);
    } catch (err) {
      console.error("Lỗi khi fetch sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, page]);

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
    setCurrentProduct({ name: '', description: '', category: 'General', price: '', stock: 0, images: [], sizeChart: '', variants: [] });
    setNewImageUrl('');
    setIsModalOpen(true);
  };

  // Mở modal sửa với data của sản phẩm đang chọn
  const handleOpenEdit = (product) => {
    setModalMode('edit');
    setCurrentProduct({ 
      id: product.id,
      name: product.name, 
      description: product.description || '', 
      category: product.category || 'General',
      price: product.price, 
      stock: product.stock,
      sizeChart: product.sizeChart || '',
      images: product.images?.map(img => img.url) || [],
      variants: product.variants || []
    });
    setNewImageUrl('');
    setIsModalOpen(true);
  };

  // Nút Lưu trong Modal
  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!currentProduct.name) newErrors.name = true;
    if (!currentProduct.price) newErrors.price = true;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return showToast("Vui lòng điền đủ tên và giá!", "error");
    }

    setSaving(true);
    try {
      const payload = {
        name: currentProduct.name,
        description: currentProduct.description,
        category: currentProduct.category,
        price: Number(currentProduct.price),
        stock: Number(currentProduct.stock),
        images: currentProduct.images,
        sizeChart: currentProduct.sizeChart,
        variants: currentProduct.variants
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
      showToast("Đã xảy ra lỗi khi lưu: " + (error.response?.data?.message || error.message), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setImporting(true);
    try {
      const res = await api.post('/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast(`Import thành công ${res.data.count} sản phẩm!`);
      fetchProducts();
    } catch (error) {
      showToast("Lỗi import: " + (error.response?.data?.message || error.message), "error");
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleExportExcel = async () => {
    try {
      showToast("Đang chuẩn bị file tải về...");
      const res = await api.get('/products/export-template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `VibeCart_Products_Export_Template_${new Date().toLocaleDateString('vi-VN')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast("Tải file thành công!");
    } catch (error) {
       showToast("Lỗi khi kết xuất file!", "error");
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
        <div className="flex gap-3">
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition-all shadow-sm"
          >
            <Download size={18} />
            <span>Export ALL</span>
          </button>
          <label className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm border ${importing ? 'bg-slate-50 text-slate-400' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'}`}>
            <Package size={18} />
            <span>{importing ? 'Importing...' : 'Import Excel'}</span>
            <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleImportExcel} disabled={importing} />
          </label>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        </div>
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

      {/* Products Table / Cards View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs font-black uppercase tracking-widest border-b border-slate-200">
                <th className="px-6 py-4 w-12 text-center">ID</th>
                <th className="px-6 py-4">Product Info</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-center">Stock</th>
                <th className="px-6 py-4 text-right pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                 <tr><td colSpan="5" className="text-center py-20 text-slate-400 font-medium">Loading catalog...</td></tr>
              ) : products.length === 0 ? (
                 <tr><td colSpan="5" className="text-center py-20 text-slate-400 font-medium">No products match your search.</td></tr>
              ) : (
                 products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-6 py-4 text-slate-400 text-xs font-mono text-center">#{product.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm shrink-0">
                          <img src={product.images?.[0]?.url || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 max-w-[200px] lg:max-w-xs">
                          <div className="font-black text-slate-900 truncate">{product.name}</div>
                          <div className="text-xs text-slate-400 mt-1 line-clamp-1">{product.description || 'No description'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-slate-900">{product.price.toLocaleString()}đ</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all duration-500
                        ${product.isUpdating ? 'ring-4 ring-primary-400 scale-110 bg-primary-50' : ''}
                        ${product.stock > 10 ? 'bg-emerald-50 text-emerald-600' : product.stock > 0 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                        {product.stock}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right pr-6">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                        <button onClick={() => handleOpenEdit(product)} className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-white rounded-xl shadow-sm hover:shadow transition-all border border-transparent hover:border-slate-100">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => setDeleteConfirmId(product.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl shadow-sm hover:shadow transition-all border border-transparent hover:border-slate-100">
                          <Trash2 size={16} />
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
        <div className="md:hidden divide-y divide-slate-100 px-4 py-2">
          {loading ? (
             <div className="py-20 text-center text-slate-400 font-medium">Loading catalog...</div>
          ) : products.length === 0 ? (
             <div className="py-20 text-center text-slate-400 font-medium">No products found.</div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="py-5 flex items-start gap-4 animate-fade-in-up">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm shrink-0">
                  <img src={product.images?.[0]?.url || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-black text-slate-900 text-sm leading-tight line-clamp-2">{product.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">#{product.id}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-black text-primary-600 text-base">{product.price.toLocaleString()}đ</div>
                    <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black tracking-widest uppercase ${product.stock > 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      Stock: {product.stock}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => handleOpenEdit(product)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors">
                      <Edit2 size={14} /> Sửa
                    </button>
                    <button onClick={() => setDeleteConfirmId(product.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">
                      <Trash2 size={14} /> Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Pagination meta={meta} onPageChange={(p) => setPage(p)} />

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

            <form noValidate onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.name ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-slate-200 focus:ring-primary-500'
                  }`}
                  value={currentProduct.name}
                  onChange={e => {
                    setCurrentProduct({...currentProduct, name: e.target.value});
                    if (errors.name) setErrors({...errors, name: false});
                  }}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Giá chính (đ) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    required
                    min={0}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all font-bold ${
                        errors.price ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-slate-200 focus:ring-primary-500'
                    }`}
                    value={currentProduct.price}
                    onChange={e => {
                        setCurrentProduct({...currentProduct, price: e.target.value});
                        if (errors.price) setErrors({...errors, price: false});
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tổng kho <span className="text-red-500">*</span>
                  </label>
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
                <label className="block text-sm font-medium text-slate-700 mb-1 text-xs uppercase tracking-wider">Size Chart (JSON - vd: {"{\"S\": \"40-50kg\"}"})</label>
                <textarea 
                  rows={2}
                  placeholder='{"S": "40-50kg", "M": "50-60kg"}'
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-xs"
                  value={currentProduct.sizeChart}
                  onChange={e => setCurrentProduct({...currentProduct, sizeChart: e.target.value})}
                />
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center">
                   <label className="text-xs font-bold text-slate-500 uppercase">Phân loại (Variants)</label>
                   <button 
                     type="button"
                     onClick={() => setCurrentProduct({...currentProduct, variants: [...(currentProduct.variants || []), { size: '', color: '', stock: 0, sku: '' }]})}
                     className="text-primary-600 text-xs font-bold hover:underline"
                   >
                     + Thêm phân loại
                   </button>
                </div>
                
                {(currentProduct.variants || []).map((v, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-2 items-end">
                    <div>
                      <input type="text" placeholder="Size" className="w-full px-2 py-1 text-xs border rounded" value={v.size} onChange={e => {
                        const newV = [...currentProduct.variants]; newV[idx].size = e.target.value; setCurrentProduct({...currentProduct, variants: newV});
                      }} />
                    </div>
                    <div>
                      <input type="text" placeholder="Màu" className="w-full px-2 py-1 text-xs border rounded" value={v.color} onChange={e => {
                        const newV = [...currentProduct.variants]; newV[idx].color = e.target.value; setCurrentProduct({...currentProduct, variants: newV});
                      }} />
                    </div>
                    <div>
                      <input type="number" placeholder="Kho" className="w-full px-2 py-1 text-xs border rounded" value={v.stock} onChange={e => {
                        const newV = [...currentProduct.variants]; newV[idx].stock = e.target.value; setCurrentProduct({...currentProduct, variants: newV});
                      }} />
                    </div>
                    <button type="button" onClick={() => {
                        const newV = currentProduct.variants.filter((_, i) => i !== idx); setCurrentProduct({...currentProduct, variants: newV});
                    }} className="text-red-400 hover:text-red-600 px-2 py-1">×</button>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Hình ảnh sản phẩm</label>
                
                {/* List current images */}
                <div className="grid grid-cols-4 gap-3">
                    {currentProduct.images.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200">
                            <img src={img} className="w-full h-full object-cover" />
                            <button 
                                type="button"
                                onClick={() => setCurrentProduct({...currentProduct, images: currentProduct.images.filter((_, i) => i !== idx)})}
                                className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add new image URL */}
                <div className="flex gap-2">
                    <input 
                    type="url" 
                    placeholder="Dán link ảnh tại đây (https://...)"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    />
                    <button 
                        type="button"
                        onClick={() => {
                            if (newImageUrl.trim()) {
                                setCurrentProduct({...currentProduct, images: [...currentProduct.images, newImageUrl.trim()]});
                                setNewImageUrl('');
                            }
                        }}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all"
                    >
                        Thêm
                    </button>
                </div>
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
