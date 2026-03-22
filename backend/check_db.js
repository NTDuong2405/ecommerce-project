import pkg from 'pg';
import 'dotenv/config';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function check() {
  try {
    console.log("🔍 Thăm dò kết nối đến DATABASE_URL...");
    const start = Date.now();
    const res = await pool.query('SELECT NOW() as now, current_database() as db');
    const end = Date.now();
    console.log("✅ KẾT NỐI THÀNH CÔNG!");
    console.log("⌚ Thời gian phản hồi: " + (end - start) + "ms");
    console.log("📦 DATABASE: " + res.rows[0].db);
    console.log("⏰ GIỜ HỆ THỐNG: " + res.rows[0].now);
  } catch (err) {
    console.error("❌ KẾT NỐI THẤT BẠI!");
    console.error("⚠️ Lỗi: " + err.message);
    if (err.message.includes("ECONNREFUSED")) {
      console.error("💡 Có vẻ như Database chưa nổ máy hoặc sai Port (5432).");
    } else if (err.message.includes("password authentication failed")) {
      console.error("💡 Có vẻ như sai Mật khẩu (123456).");
    }
  } finally {
    await pool.end();
  }
}

check();
