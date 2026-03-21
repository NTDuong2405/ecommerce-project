import * as paymentService from './payment.service.js'
import * as gateway from './payment.gateway.js'
import { prisma } from '../../config/prisma.js'
import { sendMail, buildOrderConfirmEmail } from '../../utils/email.service.js'

export const createPayment = async (req, res) => {
  try {
    const userId = req.user.userId
    const data = await paymentService.createPayment(userId, req.body)
    res.json({ message: 'Create payment success', data })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getPaymentDetail = async (req, res) => {
  try {
    const userId = req.user.userId
    const data = await paymentService.getPaymentDetail(userId, req.params.id)
    res.json({ message: 'Get payment detail success', data })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const updatePaymentStatus = async (req, res) => {
  try {
    const userId = req.user.userId
    const data = await paymentService.updatePaymentStatus(userId, req.params.id, req.body)
    res.json({ message: 'Update payment status success', data })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getMyPayments = async (req, res) => {
  try {
    const userId = req.user.userId
    const data = await paymentService.getMyPayments(userId)
    res.json({ message: 'Get payments success', data })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// ─── Helper: Gửi email khi thanh toán thành công ────────────────
const sendSuccessEmail = async (orderId) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: {
        payment: true,
        user: { select: { email: true } },
        items: { include: { product: true } }
      }
    });

    if (!order) return;

    // Ưu tiên lấy email và tên từ bản ghi Order vừa cập nhật (cho guest/manual flow)
    const recipientEmail = order.customerEmail || order.user?.email;
    if (!recipientEmail) return;

    const emailItems = order.items.map(i => ({
      name: i.product?.name || 'Product',
      quantity: i.quantity,
      price: i.price
    }));

    const shippingFee = order.totalPrice >= 150 ? 0 : 9.99;
    const subtotal = order.totalPrice - shippingFee < 0 ? order.totalPrice : order.totalPrice - shippingFee;

    await sendMail({
      to: recipientEmail,
      subject: `✅ VibeCart – Order #${orderId} Confirmed/Paid!`,
      html: buildOrderConfirmEmail({
        customerName: order.customerName || 'Customer',
        orderId: order.id,
        items: emailItems,
        totalPrice: subtotal,
        shippingFee,
        paymentMethod: order.payment?.method || 'N/A',
        address: order.address || 'Standard Delivery'
      })
    });
  } catch (err) {
    console.error('[Email Helper] Error:', err.message);
  }
};

// ─── Gateway: Khởi tạo link/thông tin thanh toán ────────────────
export const initiatePayment = async (req, res) => {
  console.log('Incoming Initiate Payment Request:', req.body);
  try {
    const { orderId, method, amount } = req.body;

    if (!orderId || !method || !amount) {
      return res.status(400).json({ message: 'orderId, method, amount required' });
    }

    let result;

    switch (method) {
      case 'COD':
        result = gateway.createCodPayment(orderId, amount);
        break;

      case 'BANK_TRANSFER':
        result = gateway.createBankTransferInfo(orderId, amount);
        break;

      case 'MOMO':
        result = await gateway.createMomoPayment(orderId, amount);
        break;

      case 'VNPAY': {
        const ipAddr = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '127.0.0.1';
        const payUrl = gateway.createVnpayUrl(orderId, amount, ipAddr);
        result = { method: 'VNPAY', payUrl, orderId, amount };
        break;
      }

      default:
        return res.status(400).json({ message: 'Unsupported payment method' });
    }

    // ─── Lưu Payment record ──────────────────────────────────────
    let orderRecord = null;
    try {
      orderRecord = await prisma.order.findUnique({
        where: { id: Number(orderId) },
        include: {
          payment: true,
          user: { select: { email: true } },
          items: { include: { product: true } }
        }
      });

      if (orderRecord && !orderRecord.payment) {
        await prisma.payment.create({
          data: {
            orderId: orderRecord.id,
            method,
            amount: Number(amount),
            status: method === 'COD' ? 'SUCCESS' : 'PENDING' // COD xác nhận ngay
          }
        });
      }
    } catch (dbErr) {
      console.warn('[Payment] DB record skip:', dbErr.message);
    }

    // ─── Nếu là COD: Gửi email ngay ───────────────────────────────
    if (method === 'COD') {
      setImmediate(() => sendSuccessEmail(orderId));
    }

    res.json({ message: 'Payment initiated', data: result });
  } catch (err) {
    console.error('[Payment Gateway]', err);
    res.status(400).json({ message: err.message });
  }
}

// ─── VNPay Return URL (Callback sau khi thanh toán) ──────────────
export const vnpayReturn = async (req, res) => {
  try {
    const result = gateway.verifyVnpayReturn(req.query);
    const orderId = result.txnRef;
    const isSuccess = result.responseCode === '00';
    const status = isSuccess ? 'SUCCESS' : 'FAILED';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Cập nhật Database
    await prisma.payment.update({
      where: { orderId: Number(orderId) },
      data: { status }
    });

    // Nếu thành công -> Gửi mail
    if (isSuccess) {
      setImmediate(() => sendSuccessEmail(orderId));
    }

    res.redirect(`${frontendUrl}/checkout/result?status=${status}&orderId=${orderId}&amount=${result.amount}&method=VNPAY`);
  } catch (err) {
    console.error('[VNPay Return] Error:', err.message);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/result?status=FAILED`);
  }
}

// ─── MoMo IPN (Webhook từ MoMo sau khi thanh toán) ──────────────
export const momoIpn = async (req, res) => {
  try {
    const { resultCode, orderId, amount } = req.body;
    const isSuccess = resultCode === 0;
    const status = isSuccess ? 'SUCCESS' : 'FAILED';

    console.log(`[MoMo IPN] orderId=${orderId} status=${status}`);

    // Cập nhật Database
    await prisma.payment.update({
      where: { orderId: Number(orderId) },
      data: { status }
    });

    // Nếu thành công -> Gửi mail
    if (isSuccess) {
      setImmediate(() => sendSuccessEmail(orderId));
    }

    res.json({ status: 0 }); 
  } catch (err) {
    res.status(200).json({ status: -1 });
  }
}