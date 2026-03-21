import crypto from 'crypto';
import axios from 'axios';

// ─── COD ────────────────────────────────────────────────────────
export const createCodPayment = (orderId, amount) => {
  // COD không cần redirect, trả về thông tin đơn giản
  return {
    method: 'COD',
    status: 'PENDING',
    message: 'Đơn hàng đã được đặt. Thanh toán khi nhận hàng.',
    orderId,
    amount
  };
};

// ─── Bank Transfer ────────────────────────────────────────────────
export const createBankTransferInfo = (orderId, amount) => {
  return {
    method: 'BANK_TRANSFER',
    bankName: 'Vietcombank',
    accountNumber: '1234567890',
    accountName: 'CONG TY VIBECART',
    amount,
    transferContent: `VIBECART ${orderId}`,
    qrUrl: `https://img.vietqr.io/image/VCB-1234567890-compact2.jpg?amount=${amount}&addInfo=VIBECART${orderId}&accountName=VIBECART`,
    message: `Chuyển khoản theo thông tin dưới đây, đơn hàng sẽ được xác nhận trong 1-2 giờ.`
  };
};

// ─── MoMo (Sandbox) ───────────────────────────────────────────────
export const createMomoPayment = async (orderId, amount) => {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  const orderInfo = `VibeCart - Don hang #${orderId}`;
  const redirectUrl = process.env.MOMO_REDIRECT_URL;
  const ipnUrl = process.env.MOMO_IPN_URL;
  const requestId = `${partnerCode}${Date.now()}`;
  const requestType = 'payWithMethod';
  const extraData = '';
  const orderGroupId = '';
  const autoCapture = true;
  const lang = 'vi';

  // Tạo rawSignature theo format MoMo yêu cầu
  const rawSignature = [
    `accessKey=${accessKey}`,
    `amount=${amount}`,
    `extraData=${extraData}`,
    `ipnUrl=${ipnUrl}`,
    `orderId=${requestId}`,
    `orderInfo=${orderInfo}`,
    `partnerCode=${partnerCode}`,
    `redirectUrl=${redirectUrl}`,
    `requestId=${requestId}`,
    `requestType=${requestType}`,
  ].join('&');

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  const requestBody = {
    partnerCode,
    partnerName: 'VibeCart',
    storeId: 'VibeCartStore',
    requestId,
    amount,
    orderId: requestId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    lang,
    requestType,
    autoCapture,
    extraData,
    orderGroupId,
    signature,
  };

  try {
    const response = await axios.post(process.env.MOMO_ENDPOINT, requestBody, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.data.resultCode !== 0) {
      throw new Error(response.data.message || 'MoMo payment failed');
    }

    return {
      method: 'MOMO',
      payUrl: response.data.payUrl,
      deeplink: response.data.deeplink,
      qrCodeUrl: response.data.qrCodeUrl,
      orderId,
      amount
    };
  } catch (err) {
    // Sandbox fallback: trả về URL giả lập để demo
    console.warn('[MoMo] Sandbox error, falling back to demo QR:', err.message);
    return {
      method: 'MOMO',
      payUrl: null,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=momo://app?action=payWithApp%26isScanQR=true%26amount=${amount}%26orderId=${orderId}`,
      orderId,
      amount,
      isFallback: true
    };
  }
};

// ─── VNPay ────────────────────────────────────────────────────────
export const createVnpayUrl = (orderId, amount, ipAddr = '127.0.0.1') => {
  const tmnCode = process.env.VNPAY_TMN_CODE;
  const secretKey = process.env.VNPAY_HASH_SECRET;
  const vnpUrl = process.env.VNPAY_URL;
  const returnUrl = process.env.VNPAY_RETURN_URL;

  const date = new Date();
  const createDate = date.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);

  const params = new URLSearchParams({
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: `${orderId}-${Date.now()}`,
    vnp_OrderInfo: `VibeCart thanh toan don hang ${orderId}`,
    vnp_OrderType: 'other',
    vnp_Amount: amount * 100, // VNPay tính bằng đồng (x100)
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  });

  // Sort params alphabetically (VNPay yêu cầu)
  const sortedParams = new URLSearchParams([...params.entries()].sort());
  const signData = sortedParams.toString();

  const signature = crypto
    .createHmac('sha512', secretKey)
    .update(signData)
    .digest('hex');

  sortedParams.append('vnp_SecureHash', signature);

  return `${vnpUrl}?${sortedParams.toString()}`;
};

// ─── VNPay IPN Verify ─────────────────────────────────────────────
export const verifyVnpayReturn = (query) => {
  const { vnp_SecureHash, ...params } = query;
  const secretKey = process.env.VNPAY_HASH_SECRET;

  const sortedParams = new URLSearchParams(
    Object.entries(params)
      .filter(([key]) => key.startsWith('vnp_'))
      .sort(([a], [b]) => a.localeCompare(b))
  );

  const signData = sortedParams.toString();
  const checkSum = crypto
    .createHmac('sha512', secretKey)
    .update(signData)
    .digest('hex');

  return {
    isValid: checkSum === vnp_SecureHash,
    responseCode: params.vnp_ResponseCode,
    txnRef: params.vnp_TxnRef,
    amount: Number(params.vnp_Amount) / 100,
  };
};
