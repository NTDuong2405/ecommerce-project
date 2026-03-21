import 'dotenv/config';
import nodemailer from 'nodemailer';

console.log('=== Email Config Test ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'NOT SET');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('========================');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ EMAIL_USER hoặc EMAIL_PASS chưa được set trong .env');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 10000,
});

console.log('🔄 Đang kiểm tra kết nối SMTP...');
try {
  await transporter.verify();
  console.log('✅ Kết nối SMTP thành công!');

  console.log(`📨 Đang gửi email test đến ${process.env.EMAIL_USER}...`);
  const info = await transporter.sendMail({
    from: `VibeCart <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: '✅ VibeCart Email Test',
    html: '<h1>🎉 Email hoạt động!</h1><p>Hệ thống email của VibeCart đã được cấu hình thành công.</p>',
  });

  console.log('✅ Email gửi thành công!');
  console.log('Message ID:', info.messageId);
} catch (err) {
  console.error('❌ Lỗi:', err.message);
  if (err.message.includes('Invalid login')) {
    console.error('\n💡 Gợi ý: App Password sai hoặc Gmail chưa bật 2FA');
    console.error('   Bật tại: https://myaccount.google.com/security');
    console.error('   Tạo App Password: https://myaccount.google.com/apppasswords');
  }
  if (err.message.includes('ETIMEDOUT') || err.message.includes('ECONNREFUSED')) {
    console.error('\n💡 Gợi ý: Không thể kết nối đến SMTP server - kiểm tra firewall/mạng');
  }
}
