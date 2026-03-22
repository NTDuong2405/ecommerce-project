import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatPrice } from '../../utils/format';

/**
 * Trang kết quả thanh toán - VNPay và MoMo sẽ redirect về đây
 * URL params: ?status=SUCCESS|FAILED&orderId=xxx&amount=xxx&method=xxx
 */
const CheckoutResult = () => {
  const [params] = useSearchParams();
  const status = params.get('status') || 'PENDING';
  const orderId = params.get('orderId');
  const amount = params.get('amount');
  const method = params.get('method');

  const isSuccess = status === 'SUCCESS';
  const isFailed = status === 'FAILED';

  return (
    <div className="max-w-lg mx-auto px-4 py-24 flex flex-col items-center text-center animate-fade-in-up">
      {isSuccess ? (
        <>
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
            <CheckCircle size={52} className="text-emerald-500" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-3">Payment Successful! 🎉</h1>
          <p className="text-slate-500 mb-6">Your order has been confirmed and is now being processed.</p>
        </>
      ) : isFailed ? (
        <>
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <XCircle size={52} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-3">Payment Failed</h1>
          <p className="text-slate-500 mb-6">Something went wrong with your payment. Please try again.</p>
        </>
      ) : (
        <>
          <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mb-6">
            <Clock size={52} className="text-amber-500" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-3">Payment Pending</h1>
          <p className="text-slate-500 mb-6">Your payment is being processed. We'll notify you once confirmed.</p>
        </>
      )}

      {/* Order detail card */}
      {(orderId || amount) && (
        <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 text-left space-y-2 text-sm">
          {orderId && (
            <div className="flex justify-between text-slate-600">
              <span>Order Ref</span>
              <span className="font-mono font-semibold text-slate-900">{orderId}</span>
            </div>
          )}
          {amount && (
            <div className="flex justify-between text-slate-600">
              <span>Amount</span>
              <span className="font-bold text-slate-900">{formatPrice(Number(amount))}</span>
            </div>
          )}
          {method && (
            <div className="flex justify-between text-slate-600">
              <span>Method</span>
              <span className="font-semibold text-slate-900">{method}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {isFailed ? (
          <Link to="/checkout" className="flex-1 text-center px-6 py-3 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors">
            Try Again
          </Link>
        ) : (
          <>
            <Link to="/products" className="flex-1 text-center px-6 py-3 rounded-full border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors">
              Continue Shopping
            </Link>
            <Link to="/" className="flex-1 text-center px-6 py-3 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors">
              Back to Home
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutResult;
