import { getAdminStats } from './src/modules/dashboard/dashboard.service.js';

async function test() {
  try {
    console.log("🔍 Đang thử nghiệm lấy STATS...");
    const stats = await getAdminStats();
    console.log("✅ KẾT QUẢ STATS:");
    console.log(JSON.stringify(stats, null, 2));
  } catch (err) {
    console.error("❌ LỖI KHI LẤY STATS:");
    console.error(err);
  }
}

test();
