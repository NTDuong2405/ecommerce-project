import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, ShoppingBag, ChevronLeft, Check, Shield, Truck, RotateCcw, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSocket } from '../../context/SocketContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { socket } = useSocket();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:3000/api/products/${id}`);
        setProduct(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();

    // --- Tích hợp Socket.io Real-time từ Context ---
    if (socket) {
      socket.on('stock-update', ({ productId, newStock }) => {
        // Chỉ cập nhật nếu đúng sản phẩm đang xem
        if (Number(productId) == Number(id)) {
          console.log(`%c⚡️ [Real-time Update] Product ID: ${productId} -> New Stock: ${newStock}`, "color: #10b981; font-weight: bold; border: 1px solid #10b981; padding: 4px;");
          setProduct(prev => prev ? { ...prev, stock: newStock } : null);
        }
      });

      return () => socket.off('stock-update');
    }

  }, [id, socket]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-slate-200 rounded-3xl" />
          <div className="space-y-4 pt-4">
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-10 bg-slate-200 rounded w-3/4" />
            <div className="h-6 bg-slate-200 rounded w-1/3" />
            <div className="h-24 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <ShoppingBag size={56} className="mb-4 text-slate-300" />
        <p className="text-xl font-semibold">Product not found</p>
        <Link to="/products" className="mt-4 text-primary-600 hover:underline font-medium">← Back to Collection</Link>
      </div>
    );
  }

  const images = product.images?.length > 0
    ? product.images.map(img => img.url)
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'];

  const inStock = product.stock > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary-600 transition-colors">Collection</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium truncate max-w-[180px]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* ── Image Gallery ── */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 shadow-lg group">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {!inStock && (
              <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                <span className="bg-white text-slate-900 font-bold px-6 py-2 rounded-full">Out of Stock</span>
              </div>
            )}
          </div>
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-primary-500 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div className="flex flex-col space-y-6 py-2">
          {/* Badge + Wish */}
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-700 uppercase tracking-wider">Premium Essential</span>
            <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-all">
              <Heart size={18} />
            </button>
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 leading-tight">{product.name}</h1>

          {/* Rating row */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={18} className={s <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 fill-slate-200'} />
              ))}
            </div>
            <span className="text-sm font-medium text-slate-600">4.8 (124 reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-slate-900 font-display">${product.price.toFixed(2)}</span>
            <span className="text-slate-400 line-through text-lg">${(product.price * 1.2).toFixed(2)}</span>
            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-sm font-bold rounded-full">-17%</span>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* Description */}
          {product.description && (
            <p className="text-slate-600 leading-relaxed">{product.description}</p>
          )}

          {/* Stock badge */}
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-semibold ${inStock ? 'text-emerald-600' : 'text-red-600'}`}>
              {inStock ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-2">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-slate-900 text-xl font-bold transition-colors"
              >
                −
              </button>
              <span className="w-8 text-center font-bold text-slate-900">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                disabled={!inStock}
                className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-slate-900 text-xl font-bold transition-colors disabled:opacity-40"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-base transition-all shadow-lg ${
                added
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30 scale-[0.98]'
                  : inStock
                  ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {added ? <><Check size={20} /> Added!</> : <><ShoppingBag size={20} /> Add to Cart</>}
            </button>
          </div>

          {/* Trust signals */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: <Truck size={18} />, text: 'Free Delivery' },
              { icon: <Shield size={18} />, text: '1 Year Warranty' },
              { icon: <RotateCcw size={18} />, text: '30-Day Returns' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-primary-600">{item.icon}</span>
                <span className="text-xs font-semibold text-slate-600">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Back link */}
      <div className="mt-12">
        <Link to="/products" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 font-medium transition-colors group">
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Collection
        </Link>
      </div>
    </div>
  );
};

export default ProductDetail;
