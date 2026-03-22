import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { CheckCircle, ShoppingBag, Truck, CreditCard, ChevronRight, Copy, ExternalLink, Ticket, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const STEPS = ['Cart Review', 'Delivery Info', 'Payment'];
const DEMO_ORDER_ID = 1; // MVP: dùng order demo, thay bằng orderId thật khi có auth

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [orderDone, setOrderDone] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', address: '', city: '', note: '',
    paymentMethod: 'COD'
  });
  const [coupon, setCoupon] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await api.get('/marketing/available');
        setVouchers(res.data.data);
      } catch (err) {
        console.log('User not logged in or no vouchers');
      }
    };
    fetchVouchers();
  }, []);

  const shippingFee = totalPrice >= 150 ? 0 : 9.99;
  const discountAmount = appliedPromo ? (totalPrice * (appliedPromo.discount / 100)) : 0;
  const grandTotal = Math.max(0, totalPrice + shippingFee - discountAmount);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleApplyVoucher = async () => {
    if (!coupon) return;
    setIsValidating(true);
    try {
      const res = await api.post('/marketing/validate', { code: coupon.toUpperCase() });
      setAppliedPromo(res.data.data);
      // toast.success(`Đã áp dụng mã ${coupon.toUpperCase()}!`); (Giả sử có toast)
    } catch (err) {
      setAppliedPromo(null);
      alert(err.response?.data?.message || 'Mã giảm giá không hợp lệ');
    } finally {
      setIsValidating(false);
    }
  };

  const handlePlaceOrder = async () => {
    setProcessing(true);
    try {
      // 1. Tạo đơn hàng (Order) trong database trước
      const orderData = {
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price, name: i.name })),
        totalPrice: grandTotal,
        customerName: form.fullName,
        customerEmail: form.email,
        customerPhone: form.phone,
        address: form.address,
        city: form.city,
        note: form.note,
        shippingPrice: shippingFee,
        discountAmount: discountAmount,
        couponCode: appliedPromo?.code || null
      };

      const orderRes = await api.post('/orders', orderData);
      const realOrderId = orderRes.data.data.id;

      // 2. Khởi tạo thanh toán (Payment) với OrderId thật
      const paymentRes = await api.post('/payments/initiate', {
        orderId: realOrderId,
        method: form.paymentMethod,
        amount: grandTotal,
        customerEmail: form.email,
        customerName: form.fullName,
        customerAddress: `${form.address}${form.city ? ', ' + form.city : ''}`,
        items: orderData.items
      });

      const data = paymentRes.data.data;
      setPaymentResult(data);

      if (form.paymentMethod === 'COD') {
        clearCart();
        setOrderDone(true);
      } else if (form.paymentMethod === 'VNPAY' && data.payUrl) {
        window.location.href = data.payUrl;
      }
      // Bank Transfer & MoMo: hiển thị QR screen
    } catch (err) {
      console.error('[Checkout] Order/Payment error:', err);
    } finally {
      setProcessing(false);
    }
  };

  // ── Empty cart guard ──────────────────────────────────────────
  if (items.length === 0 && !orderDone && !paymentResult) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 flex flex-col items-center text-center">
        <ShoppingBag size={48} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
        <Link to="/products" className="mt-4 text-primary-600 hover:underline font-medium">← Browse products</Link>
      </div>
    );
  }

  // ── Success screen ────────────────────────────────────────────
  if (orderDone) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 flex flex-col items-center text-center animate-fade-in-up">
        <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <CheckCircle size={52} className="text-emerald-500" />
        </div>
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-3">Order Placed! 🎉</h1>
        <p className="text-slate-500 mb-2">Thank you, <strong>{form.fullName || 'friend'}</strong>!</p>
        {form.paymentMethod === 'COD' && (
          <p className="text-slate-400 text-sm mb-6">Pay upon delivery. We'll contact you to confirm.</p>
        )}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 w-full text-left mb-8">
          <h3 className="font-bold text-slate-800 mb-3">Order Summary</h3>
          <div className="flex justify-between text-sm text-slate-600 mb-1"><span>Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm text-slate-600 mb-1"><span>Shipping</span><span>{shippingFee === 0 ? 'Free' : `$${shippingFee}`}</span></div>
          <div className="flex justify-between font-bold text-slate-900 text-base border-t border-slate-200 pt-2 mt-2"><span>Total</span><span>${grandTotal.toFixed(2)}</span></div>
        </div>
        <div className="flex gap-3 w-full">
          <Link to="/products" className="flex-1 text-center px-6 py-3 rounded-full border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors">Continue Shopping</Link>
          <Link to="/" className="flex-1 text-center px-6 py-3 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors">Back to Home</Link>
        </div>
      </div>
    );
  }

  // ── Bank Transfer QR screen ───────────────────────────────────
  if (paymentResult?.method === 'BANK_TRANSFER') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 animate-fade-in-up">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white text-center">
            <div className="text-4xl mb-2">🏦</div>
            <h2 className="text-xl font-bold font-display">Bank Transfer</h2>
            <p className="text-blue-100 text-sm mt-1">Scan QR or transfer manually</p>
          </div>
          <div className="p-6 space-y-4">
            {paymentResult.qrUrl && (
              <div className="flex justify-center">
                <img src={paymentResult.qrUrl} alt="VietQR" className="rounded-2xl w-48 h-48 border border-slate-100" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            )}
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-sm">
              {[
                ['Bank', paymentResult.bankName],
                ['Account No.', paymentResult.accountNumber],
                ['Account Name', paymentResult.accountName],
                ['Amount', `$${Number(paymentResult.amount).toLocaleString()}`],
                ['Transfer Ref', paymentResult.transferContent],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    {val}
                    {label === 'Transfer Ref' && (
                      <button onClick={() => navigator.clipboard?.writeText(val)} className="ml-1 text-slate-400 hover:text-primary-600" title="Copy">
                        <Copy size={14} />
                      </button>
                    )}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 text-center">{paymentResult.message}</p>
            <button onClick={() => { clearCart(); setOrderDone(true); }}
              className="w-full py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all">
              I've Completed the Transfer ✓
            </button>
            <button onClick={() => setPaymentResult(null)} className="w-full py-2 text-slate-400 text-sm hover:text-slate-600">
              ← Choose another method
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── MoMo QR screen ───────────────────────────────────────────
  if (paymentResult?.method === 'MOMO') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 animate-fade-in-up">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-6 text-white text-center">
            <div className="text-4xl mb-2">🟣</div>
            <h2 className="text-xl font-bold font-display">MoMo Wallet</h2>
            <p className="text-pink-100 text-sm mt-1">Scan with MoMo app to pay</p>
          </div>
          <div className="p-6 space-y-4">
            {paymentResult.qrCodeUrl && (
              <div className="flex justify-center">
                <img src={paymentResult.qrCodeUrl} alt="MoMo QR" className="rounded-2xl w-52 h-52 border border-slate-100" />
              </div>
            )}
            <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-pink-600 font-display">${Number(paymentResult.amount).toLocaleString()}</div>
              <div className="text-xs text-pink-400 mt-1">Order #{paymentResult.orderId}</div>
            </div>
            {paymentResult.payUrl && (
              <a href={paymentResult.payUrl} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#ae2070] text-white rounded-full font-bold hover:opacity-90 transition-opacity">
                <ExternalLink size={18} /> Open MoMo App
              </a>
            )}
            <button onClick={() => { clearCart(); setOrderDone(true); }}
              className="w-full py-3 border border-slate-200 text-slate-600 rounded-full font-medium hover:bg-slate-50 transition-colors">
              I've Paid ✓
            </button>
            <button onClick={() => setPaymentResult(null)} className="w-full py-2 text-slate-400 text-sm hover:text-slate-600">
              ← Choose another method
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main checkout steps ───────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {STEPS.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = step === stepNum;
          const isDone = step > stepNum;
          return (
            <div key={idx} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                isActive ? 'bg-slate-900 text-white' : isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
              }`}>
                <span>{isDone ? '✓' : stepNum}</span>
                <span className="hidden sm:inline">{label}</span>
              </div>
              {idx < STEPS.length - 1 && <ChevronRight size={16} className="text-slate-300" />}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">

          {/* Step 1: Review */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <ShoppingBag size={20} /> Review Your Items
              </h2>
              {items.map(item => (
                <div key={item.productId} className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
                  <img src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                    alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{item.name}</div>
                    <div className="text-sm text-slate-400">Qty: {item.quantity} × ${item.price.toFixed(2)}</div>
                  </div>
                  <div className="font-bold text-slate-900 shrink-0">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
              <div className="pt-2 flex justify-end">
                <button onClick={() => setStep(2)} className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all hover:-translate-y-0.5 shadow-lg">
                  Continue to Delivery →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Delivery */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <Truck size={20} /> Delivery Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', name: 'fullName', placeholder: 'Nguyen Van A', col: 2 },
                  { label: 'Email', name: 'email', placeholder: 'you@email.com', col: 1 },
                  { label: 'Phone', name: 'phone', placeholder: '0901 234 567', col: 1 },
                  { label: 'Address', name: 'address', placeholder: '123 Main Street', col: 2 },
                  { label: 'City / District', name: 'city', placeholder: 'Ho Chi Minh City', col: 2 },
                ].map(field => (
                  <div key={field.name} className={field.col === 2 ? 'sm:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>
                    <input type={field.name === 'email' ? 'email' : 'text'} name={field.name}
                      placeholder={field.placeholder} value={form[field.name]} onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm" />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Note (optional)</label>
                  <textarea name="note" rows="2" placeholder="Special requests..." value={form.note} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm resize-none" />
                </div>
              </div>
              <div className="pt-2 flex justify-between">
                <button onClick={() => setStep(1)} className="px-6 py-3 border border-slate-200 rounded-full text-slate-600 font-medium hover:bg-slate-50 transition-colors">← Back</button>
                <button onClick={() => setStep(3)} disabled={!form.fullName || !form.address || !form.phone}
                  className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-lg">
                  Continue to Payment →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
              <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <CreditCard size={20} /> Payment Method
              </h2>
              <div className="space-y-3">
                {[
                  { value: 'COD', label: 'Cash on Delivery', desc: 'Pay when you receive your order', emoji: '💵' },
                  { value: 'BANK_TRANSFER', label: 'Bank Transfer (VietQR)', desc: 'Vietcombank · Scan QR to pay instantly', emoji: '🏦' },
                  { value: 'MOMO', label: 'MoMo Wallet', desc: 'Scan QR code with MoMo app', emoji: '🟣' },
                  { value: 'VNPAY', label: 'VNPay Gateway', desc: 'Redirect to VNPay sandbox to pay', emoji: '💳' },
                ].map(pm => (
                  <label key={pm.value} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    form.paymentMethod === pm.value ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200'
                  }`}>
                    <input type="radio" name="paymentMethod" value={pm.value}
                      checked={form.paymentMethod === pm.value} onChange={handleChange} className="sr-only" />
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">{pm.emoji}</div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{pm.label}</div>
                      <div className="text-xs text-slate-400">{pm.desc}</div>
                    </div>
                    {form.paymentMethod === pm.value && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </label>
                ))}
              </div>
              <div className="pt-2 flex justify-between">
                <button onClick={() => setStep(2)} className="px-6 py-3 border border-slate-200 rounded-full text-slate-600 font-medium hover:bg-slate-50 transition-colors">← Back</button>
                <button onClick={handlePlaceOrder} disabled={processing}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-all hover:-translate-y-0.5 shadow-lg shadow-emerald-600/20 disabled:opacity-60">
                  {processing ? 'Processing...' : 'Place Order 🎉'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Order Summary Sidebar ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-24">
            <h2 className="font-display font-bold text-base text-slate-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              {items.map(item => (
                <div key={item.productId} className="flex justify-between text-slate-600">
                  <span className="truncate max-w-[160px]">{item.name} ×{item.quantity}</span>
                  <span className="font-medium shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-2 flex justify-between text-slate-500">
                <span>Shipping</span>
                <span className={shippingFee === 0 ? 'text-emerald-600 font-medium' : ''}>{shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-rose-500 font-medium">
                  <span>Discount ({appliedPromo.discount}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-base text-slate-900">
                <span>Total</span><span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Voucher Input Section */}
            {!appliedPromo ? (
              <div className="mt-6 border-t border-slate-100 pt-4">
                <div className="flex justify-between items-end mb-2 px-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ">Have a Coupon?</label>
                  {vouchers.length > 0 && (
                    <button 
                      onClick={() => setShowVoucherModal(true)}
                      className="text-[10px] font-bold text-primary-600 hover:underline uppercase tracking-widest"
                    >
                      Chọn từ ưu đãi ({vouchers.length})
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter code..." 
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                  />
                  <button 
                    onClick={handleApplyVoucher}
                    disabled={!coupon || isValidating}
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-40 transition-all font-display"
                  >
                    {isValidating ? '...' : 'Apply'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 text-lg">🏷️</div>
                  <div>
                    <div className="text-xs font-bold text-emerald-700">{appliedPromo.code}</div>
                    <div className="text-[10px] text-emerald-500 line-clamp-1">{appliedPromo.title}</div>
                  </div>
                </div>
                <button 
                  onClick={() => { setAppliedPromo(null); setCoupon(''); }}
                  className="text-emerald-300 hover:text-rose-500 transition-colors p-1"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {form.fullName && (
              <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-500 space-y-1">
                <div className="font-semibold text-slate-700">{form.fullName}</div>
                {form.address && <div>{form.address}{form.city ? `, ${form.city}` : ''}</div>}
                {form.phone && <div>{form.phone}</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Voucher Selection Modal ── */}
      {showVoucherModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-bounce-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Ticket className="text-primary-600" /> Ưu đãi của bạn
              </h3>
              <button onClick={() => setShowVoucherModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 max-h-[400px] overflow-y-auto space-y-4">
              {vouchers.length === 0 ? (
                <div className="text-center py-10 text-slate-400">Bạn chưa có mã giảm giá nào.</div>
              ) : (
                vouchers.map(v => (
                  <div key={v.id} 
                    onClick={() => { setAppliedPromo(v); setShowVoucherModal(false); }}
                    className="group border-2 border-slate-100 hover:border-primary-500 rounded-2xl p-4 cursor-pointer transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary-50 -mr-8 -mt-8 rounded-full group-hover:bg-primary-100 transition-colors" />
                    <div className="relative">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-mono text-primary-700 font-bold bg-primary-50 px-2 py-0.5 rounded text-sm">{v.code}</span>
                        <span className="font-bold text-emerald-600">Giảm {v.discount}%</span>
                      </div>
                      <div className="font-bold text-slate-800 text-sm">{v.title}</div>
                      <div className="text-xs text-slate-400 mt-1">{v.description}</div>
                      <div className="text-[10px] text-slate-300 mt-2">Hết hạn: {new Date(v.endDate).toLocaleDateString('vi-VN')}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button onClick={() => setShowVoucherModal(false)} className="w-full py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
