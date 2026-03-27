import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../utils/format';

const Cart = () => {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCart();
  const { t } = useTranslation();

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80';

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-slate-300" />
        </div>
        <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">{t('cart.empty')}</h2>
        <p className="text-slate-500 mb-8">{t('cart.empty_desc')}</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-7 py-3.5 rounded-full font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          {t('nav.products')} <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-slate-900">
          {t('cart.title')} <span className="text-slate-400 font-normal text-xl ml-2">({items.length} {t('cart.items_count')})</span>
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
        >
          <Trash2 size={15} /> {t('cart.clear_all')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Cart Items ── */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.cartKey}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 group hover:shadow-md transition-shadow relative"
            >
              {/* Image */}
              <Link to={`/product/${item.productId}?size=${item.size || ''}&color=${item.color || ''}`} className="shrink-0 w-full sm:w-auto">
                <img
                  src={item.image || FALLBACK_IMAGE}
                  alt={item.name}
                  className="w-full sm:w-24 h-48 sm:h-24 rounded-2xl object-cover bg-slate-100 shadow-sm"
                />
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0 pr-10 sm:pr-0">
                <Link to={`/product/${item.productId}?size=${item.size || ''}&color=${item.color || ''}`} className="hover:text-primary-600 transition-colors">
                  <h3 className="font-bold text-slate-900 font-display text-lg mb-1 line-clamp-2 leading-tight">{item.name}</h3>
                </Link>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-primary-600 font-bold text-base">{formatPrice(item.price)}</span>
                    {item.discountPercentage > 0 && (
                      <span className="text-slate-400 text-xs line-through font-medium">{formatPrice(item.originalPrice)}</span>
                    )}
                  </div>
                  {(item.size || item.color) && (
                    <div className="flex items-center gap-2">
                       {item.size && <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">{t('product_detail.size')}: {item.size}</span>}
                       {item.color && <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">{t('product_detail.color')}: {item.color}</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity stepper + Subtotal container */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50 mt-2 sm:mt-0">
                <div className="flex items-center gap-1 bg-slate-100 rounded-2xl px-2 py-1.5 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                    className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-xl hover:bg-white shadow-sm transition-all"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-9 text-center font-bold text-slate-900 text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-xl hover:bg-white shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-400 font-medium mb-0.5 uppercase tracking-wider">{t('cart.subtotal')}</div>
                  <div className="font-black text-slate-900 text-lg">{formatPrice(item.price * item.quantity)}</div>
                </div>
              </div>

              {/* Absolute Remove Button for mobile-friendly feel */}
              <button
                onClick={() => removeItem(item.cartKey)}
                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Remove Item"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* ── Order Summary ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-24">
            <h2 className="font-display font-bold text-lg text-slate-900 mb-5">{t('cart.order_summary')}</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>{t('cart.subtotal')} ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-medium text-slate-900">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t('cart.shipping')}</span>
                <span className="text-emerald-600 font-medium">{totalPrice >= 150 ? t('cart.free') : formatPrice(9.99)}</span>
              </div>
              {totalPrice < 150 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl px-3 py-2">
                  {t('cart.free_shipping_hint', { amount: formatPrice(150 - totalPrice) })}
                </div>
              )}
              <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-base text-slate-900">
                <span>{t('cart.total')}</span>
                <span>{formatPrice(totalPrice + (totalPrice >= 150 ? 0 : 9.99))}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="mt-6 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {t('cart.checkout')} <ArrowRight size={18} />
            </Link>

            <Link
              to="/products"
              className="mt-3 w-full flex items-center justify-center text-sm text-slate-500 hover:text-primary-600 py-2 transition-colors"
            >
                {t('cart.continue_shopping')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
