import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { Star, ShoppingBag, ChevronLeft, Check, Shield, Truck, RotateCcw, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-hot-toast';
import { formatPrice } from '../../utils/format';
import { useTranslation } from 'react-i18next';

const ProductDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { socket } = useSocket();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  
  // States for Variants
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Initialize selected variants from URL or first available
  useEffect(() => {
    if (product) {
      const urlSize = (searchParams.get('size') || '').trim();
      const urlColor = (searchParams.get('color') || '').trim();
      
      // Get unique sizes and colors
      let sizes = [...new Set((product.variants || []).filter(v => v?.size).map(v => v.size))];
      const colors = [...new Set((product.variants || []).filter(v => v?.color).map(v => v.color))];
      
      // If no variants, try to get sizes from chart
      if (sizes.length === 0 && product.sizeChart) {
        try {
          const chart = JSON.parse(product.sizeChart);
          sizes = Object.keys(chart);
        } catch (e) {}
      }
      
      console.log(`[VARIANT_INIT] URL Size: "${urlSize}", URL Color: "${urlColor}", Found Sizes:`, sizes);

      if (urlSize && sizes.includes(urlSize)) {
        setSelectedSize(urlSize);
      } else if (sizes.length > 0 && !selectedSize) {
        setSelectedSize(sizes[0]);
      }

      if (urlColor && colors.includes(urlColor)) {
        setSelectedColor(urlColor);
      } else if (colors.length > 0 && !selectedColor) {
        setSelectedColor(colors[0]);
      }
    }
  }, [product, searchParams]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
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

    // Đính kèm biến thể đã chọn trước khi đưa vào giỏ hàng
    const productData = {
      ...product,
      selectedSize,
      selectedColor
    };

    addToCart(productData, quantity);
    setAdded(true);
    toast.success(t('product.added_to_cart_msg', { name: product.name, size: selectedSize || '', color: selectedColor || '' }));
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
        <Link to="/" className="hover:text-primary-600 transition-colors">{t('nav.home')}</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary-600 transition-colors">{t('nav.products')}</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium truncate max-w-[180px]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* ── Image Gallery ── */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 shadow-lg group">
            {/* Navigation buttons for slider */}
            {images.length > 1 && (
              <>
                <button 
                  onClick={() => setSelectedImage(prev => (prev - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-800 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white z-10"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setSelectedImage(prev => (prev + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-800 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white z-10"
                >
                  <ChevronLeft size={20} className="rotate-180" />
                </button>
              </>
            )}

            <div className="w-full h-full relative">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={product.name}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${selectedImage === idx ? 'opacity-100 z-0' : 'opacity-0 -z-10'}`}
                />
              ))}
            </div>

            {/* Indicator Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`h-1.5 rounded-full transition-all ${selectedImage === idx ? 'w-6 bg-primary-600' : 'w-1.5 bg-white/60'}`}
                  />
                ))}
              </div>
            )}

            {!inStock && (
              <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center z-20">
                <span className="bg-white text-slate-900 font-bold px-6 py-2 rounded-full shadow-xl animate-bounce">{t('product.out_of_stock')}</span>
              </div>
            )}
          </div>

          {/* Thumbnails Collection */}
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide py-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 relative ${selectedImage === idx ? 'border-primary-500 shadow-lg scale-95 ring-4 ring-primary-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  {selectedImage === idx && (
                    <div className="absolute inset-0 bg-primary-600/10 flex items-center justify-center">
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div className="flex flex-col space-y-6 py-2">
          {/* Badge + Wish */}
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-700 uppercase tracking-wider">{t('product_detail.premium_essential')}</span>
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
            <span className="text-sm font-medium text-slate-600">4.8 ({t('product_detail.reviews_count', { count: 124 })})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-slate-900 font-display">{formatPrice(product.price)}</span>
            {product.discountPercentage > 0 && (
              <>
                <span className="text-slate-400 line-through text-lg">{formatPrice(product.originalPrice)}</span>
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-sm font-bold rounded-full">-{product.discountPercentage}%</span>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* Description */}
          {product.description && (
            <p className="text-slate-600 leading-relaxed text-sm">{product.description}</p>
          )}

          {/* ────── SIZE & COLOR SELECTION ────── */}
          <div className="space-y-6">
            {product.variants?.length > 0 ? (
              <>
                {/* Color Selector */}
                {[...new Set((product.variants || []).filter(v => v?.color).map(v => v.color))].length > 0 && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-900 uppercase tracking-wide">{t('product_detail.color')}: {selectedColor || t('product_detail.not_selected')}</span>
                    </div>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set((product.variants || []).filter(v => v?.color).map(v => v.color))].map(color => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`min-w-[70px] px-4 py-2 rounded-xl text-[13px] font-bold transition-all border-2 ${
                              selectedColor === color 
                                ? 'border-slate-900 bg-slate-900 text-white shadow-md' 
                                : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                            }`}
                          >
                            {color}
                          </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                {[...new Set((product.variants || []).filter(v => v?.size).map(v => v.size))].length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 uppercase tracking-wide text-xs">{t('product_detail.size')}:</span>
                        <span className="text-sm font-black text-slate-900">{selectedSize || t('product_detail.not_selected')}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set((product.variants || []).filter(v => v?.size).map(v => v.size))].map(size => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`w-11 h-11 rounded-xl text-sm font-black transition-all border-2 flex items-center justify-center ${
                              selectedSize === size 
                                ? 'border-slate-900 bg-slate-900 text-white shadow-md scale-105' 
                                : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                            }`}
                          >
                            {size}
                          </button>
                      ))}
                    </div>
                    
                    {/* Weight Hint */}
                    {product.sizeChart && selectedSize && (() => {
                      try {
                        const chart = JSON.parse(product.sizeChart);
                        const weightStr = chart[selectedSize];
                        if (weightStr) {
                          return (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-3 animate-fade-in-up">
                              <Shield size={18} className="text-emerald-600" />
                              <div className="text-[13px] leading-tight text-emerald-900">
                                 {t('product_detail.weight_hint', { size: selectedSize, weight: weightStr })}
                              </div>
                            </div>
                          );
                        }
                      } catch (e) { return null; }
                    })()}
                  </div>
                )}
              </>
            ) : (
              <div className="py-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">{t('product_detail.no_variants')}</span>
              </div>
            )}
          </div>

          {/* ────── SIZE & COLOR VISUAL CHART ────── */}
          {(product.sizeChart || (product.variants?.length > 0)) && (
            <div className="pt-6 border-t border-slate-100 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                    <Shield size={16} className="text-primary-600" />
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">{t('product_detail.size_guide')}</h3>
                 </div>
                 <span className="text-[10px] text-slate-400 font-medium italic">{t('product_detail.choose_weight')}</span>
              </div>
              
              {product.sizeChart ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(() => {
                    try {
                      const chart = JSON.parse(product.sizeChart);
                      return Object.entries(chart).map(([s, weight]) => (
                        <div 
                          key={s} 
                          onClick={() => setSelectedSize(s)}
                          className={`cursor-pointer group relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center ${
                            selectedSize === s 
                              ? 'border-primary-600 bg-primary-50/50 ring-4 ring-primary-100 shadow-sm' 
                              : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 transition-colors ${selectedSize === s ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                             <span className="text-sm font-black">{s}</span>
                          </div>
                          <div className="text-[9px] uppercase font-bold text-slate-400 tracking-tighter mb-1 select-none">{t('product_detail.suggested_weight')}</div>
                          <div className={`text-xs font-black transition-colors ${selectedSize === s ? 'text-primary-900' : 'text-slate-700'}`}>
                             {weight}
                          </div>
                          
                          {selectedSize === s && (
                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white animate-bounce-short">
                               <Check size={10} strokeWidth={4} />
                            </div>
                          )}
                        </div>
                      ));
                    } catch (e) {
                      return (
                        <div className="col-span-full bg-slate-50 rounded-2xl p-6 text-center border border-slate-100 italic text-slate-400 text-xs">
                           {t('product_detail.size_chart')}: {product.sizeChart}
                        </div>
                      );
                    }
                  })()}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-6 text-center border-2 border-dashed border-slate-200">
                   <p className="text-xs text-slate-400 font-medium italic">{t('product_detail.updating_size')}</p>
                </div>
              )}
              
              {/* Extra helper hint */}
              {selectedSize && (
                 <p className="mt-4 text-[10px] text-slate-400 text-center italic">
                    {t('product_detail.size_selection_note', { size: selectedSize })}
                 </p>
              )}
            </div>
          )}

          {/* Stock badge */}
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-semibold ${inStock ? 'text-emerald-600' : 'text-red-600'}`}>
              {inStock ? `${product.stock} ${t('product.in_stock')}` : t('product.out_of_stock')}
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
              {added ? <><Check size={20} /> {t('product_detail.added')}</> : <><ShoppingBag size={20} /> {t('product.add_to_cart')}</>}
            </button>
          </div>

          {/* Trust signals */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: <Truck size={18} />, text: t('home.features.delivery') },
              { icon: <Shield size={18} />, text: t('home.features.warranty') },
              { icon: <RotateCcw size={18} />, text: t('product_detail.returns') },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-primary-600">{item.icon}</span>
                <span className="text-xs font-semibold text-slate-600">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductDetail;
