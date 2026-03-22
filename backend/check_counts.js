import pkg from 'pg';
import 'dotenv/config';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function check() {
  try {
    const prods = await pool.query('SELECT COUNT(*) FROM "Product"');
    const ords = await pool.query('SELECT COUNT(*) FROM "Order"');
    const users = await pool.query('SELECT COUNT(*) FROM "User"');
    const notifs = await pool.query('SELECT COUNT(*) FROM "Notification"');

    console.log("📊 [DATABASE REPORT]");
    console.log("📦 Sản phẩm: " + prods.rows[0].count);
    console.log("🛒 Đơn hàng: " + ords.rows[0].count);
    console.log("👥 Tổng User: " + users.rows[0].count);
    console.log("🔔 Thông báo: " + notifs.rows[0].count);
  } catch (err) {
    console.error("❌ Lỗi truy vấn: " + err.message);
  } finally {
    await pool.end();
  }
}

check();
