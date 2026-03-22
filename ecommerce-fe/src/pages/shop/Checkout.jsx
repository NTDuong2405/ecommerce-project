import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { CheckCircle, ShoppingBag, Truck, CreditCard, ChevronRight, Copy, ExternalLink, Ticket, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const STEPS = ['Cart Review', 'Delivery Info', 'Payment'];

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
  const [errors, setErrors] = useState({});
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
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error when typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
  };

  const validateDelivery = () => {
    const newErrors = {};
    if (!form.fullName) newErrors.fullName = true;
    if (!form.email) newErrors.email = true;
    if (!form.phone) newErrors.phone = true;
    if (!form.address) newErrors.address = true;
    if (!form.city) newErrors.city = true;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep2 = () => {
    if (validateDelivery()) {
      setStep(3);
    }
  };

  const handleApplyVoucher = async () => {
    if (!coupon) return;
    setIsValidating(true);
    try {
      const res = await api.post('/marketing/validate', { code: coupon.toUpperCase() });
      setAppliedPromo(res.data.data);
    } catch (err) {
      setAppliedPromo(null);
      alert(err.response?.data?.message || 'Mã giảm giá không hợp lệ');
    } finally {
      setIsValidating(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (step === 2 && !validateDelivery()) return;
    setProcessing(true);
    try {
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
    } catch (err) {
      console.error('[Checkout] Order/Payment error:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0 && !orderDone && !paymentResult) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 flex flex-col items-center text-center">
        <ShoppingBag size={48} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
        <Link to="/products" className="mt-4 text-primary-600 hover:underline font-medium">← Browse products</Link>
      </div>
    );
  }

  if (orderDone) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 flex flex-col items-center text-center animate-fade-in-up">
        <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <CheckCircle size={52} className="text-emerald-500" />
        </div>
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-3">Order Placed! 🎉</h1>
        <p className="text-slate-500 mb-2">Thank you, <strong>{form.fullName || 'friend'}</strong>!</p>
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
                <img src={paymentResult.qrUrl} alt="VietQR" className="rounded-2xl w-48 h-48 border border-slate-100" />
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
                      <button onClick={() => navigator.clipboard?.writeText(val)} className="ml-1 text-slate-400 hover:text-primary-600">
                        <Copy size={14} />
                      </button>
                    )}
                  </span>
                </div>
              ))}
            </div>
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
            </div>
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
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
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <ShoppingBag size={20} /> Review Your Items
              </h2>
              {items.map(item => (
                <div key={item.productId} className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{item.name}</div>
                    <div className="text-sm text-slate-400">
                      Qty: {item.quantity} × <span className="font-bold text-slate-900">${item.price.toFixed(2)}</span>
                      {item.discountPercentage > 0 && (
                        <span className="ml-1 text-xs line-through text-slate-300">${item.originalPrice?.toFixed(2)}</span>
                      )}
                    </div>
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

          {step === 2 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <Truck size={20} /> Delivery Information
              </h2>
              <form noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', name: 'fullName', placeholder: 'Nguyen Van A', col: 2 },
                  { label: 'Email', name: 'email', placeholder: 'you@email.com', col: 1 },
                  { label: 'Phone', name: 'phone', placeholder: '0901 234 567', col: 1 },
                  { label: 'Address', name: 'address', placeholder: '123 Main Street', col: 2 },
                  { label: 'City / District', name: 'city', placeholder: 'Ho Chi Minh City', col: 2 },
                ].map(field => (
                  <div key={field.name} className={field.col === 2 ? 'sm:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {field.label} <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type={field.name === 'email' ? 'email' : 'text'} 
                      name={field.name}
                      placeholder={field.placeholder} 
                      value={form[field.name]} 
                      onChange={handleChange}
                      className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-all text-sm ${
                        errors[field.name] 
                        ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                        : 'bg-white border-slate-200 focus:ring-primary-500'
                      }`} 
                    />
                    {errors[field.name] && <span className="text-[10px] text-red-500 font-bold ml-2 animate-pulse">Trường này là bắt buộc</span>}
                  </div>
                ))}
              </form>
              <div className="pt-2 flex justify-between">
                <button onClick={() => setStep(1)} className="px-6 py-3 border border-slate-200 rounded-full text-slate-600 font-medium hover:bg-slate-50 transition-colors">← Back</button>
                <button onClick={handleStep2}
                  className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all hover:-translate-y-0.5 shadow-lg">
                  Continue to Payment →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
              <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <CreditCard size={20} /> Payment Method
              </h2>
              <div className="space-y-3">
                {[
                  { value: 'COD', label: 'Cash on Delivery', emoji: '💵' },
                  { value: 'BANK_TRANSFER', label: 'Bank Transfer (VietQR)', emoji: '🏦' },
                  { value: 'MOMO', label: 'MoMo Wallet', emoji: '🟣' },
                  { value: 'VNPAY', label: 'VNPay Gateway', emoji: '💳' },
                ].map(pm => (
                  <label key={pm.value} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    form.paymentMethod === pm.value ? 'border-slate-900 bg-slate-50' : 'border-slate-100'
                  }`}>
                    <input type="radio" name="paymentMethod" value={pm.value}
                      checked={form.paymentMethod === pm.value} onChange={handleChange} className="sr-only" />
                    <div className="text-xl">{pm.emoji}</div>
                    <div className="font-bold text-sm">{pm.label}</div>
                  </label>
                ))}
              </div>
              <div className="pt-2 flex justify-between">
                <button onClick={() => setStep(2)} className="px-6 py-3 border border-slate-200 rounded-full text-slate-600 font-medium hover:bg-slate-50 transition-colors">← Back</button>
                <button onClick={handlePlaceOrder} disabled={processing}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-all">
                  {processing ? 'Processing...' : 'Place Order 🎉'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-24 text-sm">
            <h2 className="font-bold text-slate-900 mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-base text-slate-900">
                <span>Total</span><span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
