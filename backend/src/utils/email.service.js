import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// ─── Tạo Transporter với timeout để tránh hang ────────────────────
let transporter = null;
const LOG_FILE = path.join(process.cwd(), 'logs', 'email.log');

const writeToLog = (msg) => {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`);
  console.log(msg);
};

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS?.replace(/\s/g, ''), // Loại bỏ dấu cách nếu có
    },
    // Timeout để tránh hang server khi SMTP không kết nối được
    connectionTimeout: 8000,  // 8 giây
    greetingTimeout: 5000,
    socketTimeout: 8000,
  });

  return transporter;
};

// ─── Gửi email bất đồng bộ, không bao giờ hang ───────────────────
export const sendMail = async ({ to, subject, html }) => {
  // Nếu chưa cấu hình email, bỏ qua
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-gmail@gmail.com') {
    console.log(`[Mail] SKIP (not configured) → ${to}`);
    return { skipped: true };
  }

  try {
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    writeToLog(`[Mail] Attempting to send... From: ${fromAddress} | To: ${to}`);
    
    const info = await getTransporter().sendMail({
      from: fromAddress,
      to,
      subject,
      html,
    });
    writeToLog(`[Mail] ✅ SUCCESS! Message sent: ${info.messageId}`);
    return info;
  } catch (err) {
    writeToLog(`[Mail] ❌ FAILED error: ${err.message}`);
    if (err.message.includes('Invalid login')) {
      writeToLog('[Mail] 💡 TIP: Check if App Password or Email in .env is correct.');
    }
    transporter = null;
    return { error: err.message };
  }
};

// ─── Template: Xác nhận đặt hàng ─────────────────────────────────
export const buildOrderConfirmEmail = ({ customerName, orderId, items, totalPrice, shippingFee, paymentMethod, address }) => {
  const grandTotal = totalPrice + shippingFee;
  const methodLabels = {
    COD: '💵 Cash on Delivery',
    BANK_TRANSFER: '🏦 Bank Transfer',
    MOMO: '🟣 MoMo Wallet',
    VNPAY: '💳 VNPay Gateway',
  };

  const itemRows = items.map(item => `
    <tr>
      <td style="padding:12px 8px;border-bottom:1px solid #f1f5f9;">
        <div style="font-weight:600;color:#1e293b;">${item.name}</div>
        <div style="font-size:13px;color:#94a3b8;margin-top:2px;">Qty: ${item.quantity}</div>
      </td>
      <td style="padding:12px 8px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;color:#1e293b;">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>VibeCart - Order Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#4f46e5 100%);padding:40px 40px 32px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:16px;">
                <div style="background:rgba(255,255,255,0.2);border-radius:12px;padding:10px;display:inline-block;">
                  <span style="font-size:24px;">🛍️</span>
                </div>
              </div>
              <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px;">VibeCart</h1>
              <div style="background:rgba(255,255,255,0.15);border-radius:100px;display:inline-block;padding:6px 18px;margin-top:12px;">
                <span style="color:#e0e7ff;font-size:13px;font-weight:600;">✓ Order Confirmed</span>
              </div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:36px 40px 0;">
              <h2 style="margin:0 0 8px;font-size:22px;color:#1e293b;font-weight:700;">
                Thank you, ${customerName || 'friend'}! 🎉
              </h2>
              <p style="margin:0;color:#64748b;font-size:15px;line-height:1.6;">
                Your order <strong style="color:#4f46e5;">#${orderId}</strong> has been received and is now being processed. 
                We'll keep you updated every step of the way.
              </p>
            </td>
          </tr>

          <!-- Order Items -->
          <tr>
            <td style="padding:28px 40px 0;">
              <div style="background:#f8fafc;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
                <div style="padding:16px 20px;border-bottom:1px solid #e2e8f0;background:#f1f5f9;">
                  <span style="font-weight:700;color:#1e293b;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;">📦 Items Ordered</span>
                </div>
                <table width="100%" cellpadding="0" cellspacing="0" style="padding:0 12px;">
                  ${itemRows}
                  <!-- Subtotal -->
                  <tr>
                    <td style="padding:12px 8px;color:#64748b;font-size:14px;">Subtotal</td>
                    <td style="padding:12px 8px;text-align:right;color:#64748b;font-size:14px;">$${totalPrice.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 8px;color:#64748b;font-size:14px;">Shipping</td>
                    <td style="padding:4px 8px;text-align:right;font-size:14px;${shippingFee === 0 ? 'color:#10b981;font-weight:600;' : 'color:#64748b;'}">
                      ${shippingFee === 0 ? 'Free 🎁' : `$${shippingFee.toFixed(2)}`}
                    </td>
                  </tr>
                  <!-- Grand Total -->
                  <tr>
                    <td style="padding:16px 8px 12px;border-top:2px solid #e2e8f0;font-weight:800;color:#1e293b;font-size:16px;">Total</td>
                    <td style="padding:16px 8px 12px;border-top:2px solid #e2e8f0;text-align:right;font-weight:800;color:#4f46e5;font-size:18px;">
                      $${grandTotal.toFixed(2)}
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Payment & Delivery Info -->
          <tr>
            <td style="padding:24px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="background:#f0fdf4;border-radius:14px;padding:18px;vertical-align:top;">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#10b981;font-weight:700;margin-bottom:8px;">Payment</div>
                    <div style="font-weight:600;color:#1e293b;font-size:14px;">${methodLabels[paymentMethod] || paymentMethod}</div>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background:#eff6ff;border-radius:14px;padding:18px;vertical-align:top;">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#3b82f6;font-weight:700;margin-bottom:8px;">Delivery To</div>
                    <div style="font-weight:600;color:#1e293b;font-size:14px;">${address || 'Your address on file'}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:32px 40px;text-align:center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
                style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:100px;font-weight:700;font-size:15px;letter-spacing:0.3px;box-shadow:0 4px 14px rgba(99,102,241,0.4);">
                Continue Shopping →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:28px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;">
                Questions? Reply to this email or contact <a href="mailto:${process.env.EMAIL_USER}" style="color:#6366f1;text-decoration:none;">our support team</a>.
              </p>
              <p style="margin:0;color:#cbd5e1;font-size:12px;">
                © ${new Date().getFullYear()} VibeCart · All rights reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
