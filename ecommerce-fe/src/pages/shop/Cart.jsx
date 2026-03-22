import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const Cart = () => {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCart();

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80';

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-slate-300" />
        </div>
        <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">Your cart is empty</h2>
        <p className="text-slate-500 mb-8">Looks like you haven't added anything yet.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-7 py-3.5 rounded-full font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          Browse Collection <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-slate-900">
          Shopping Cart <span className="text-slate-400 font-normal text-xl ml-2">({items.length} items)</span>
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
        >
          <Trash2 size={15} /> Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Cart Items ── */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-5 group hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <Link to={`/product/${item.productId}`} className="shrink-0">
                <img
                  src={item.image || FALLBACK_IMAGE}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover bg-slate-100"
                />
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.productId}`} className="hover:text-primary-600 transition-colors">
                  <h3 className="font-bold text-slate-900 font-display truncate">{item.name}</h3>
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-slate-900 font-bold text-sm">${item.price.toFixed(2)}</span>
                  {item.discountPercentage > 0 && (
                    <span className="text-slate-400 text-xs line-through">${item.originalPrice?.toFixed(2)}</span>
                  )}
                </div>
              </div>

              {/* Quantity stepper */}
              <div className="flex items-center gap-1 bg-slate-100 rounded-xl px-1.5 py-1 shrink-0">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-lg hover:bg-white transition-all"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-bold text-slate-900 text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                  className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-lg hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Subtotal + Remove */}
              <div className="text-right shrink-0 min-w-[80px]">
                <div className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</div>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="mt-1 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Order Summary ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-24">
            <h2 className="font-display font-bold text-lg text-slate-900 mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-medium text-slate-900">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="text-emerald-600 font-medium">{totalPrice >= 150 ? 'Free' : '$9.99'}</span>
              </div>
              {totalPrice < 150 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl px-3 py-2">
                  Add ${(150 - totalPrice).toFixed(2)} more for free shipping!
                </div>
              )}
              <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-base text-slate-900">
                <span>Total</span>
                <span>${(totalPrice + (totalPrice >= 150 ? 0 : 9.99)).toFixed(2)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="mt-6 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Proceed to Checkout <ArrowRight size={18} />
            </Link>

            <Link
              to="/products"
              className="mt-3 w-full flex items-center justify-center text-sm text-slate-500 hover:text-primary-600 py-2 transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
