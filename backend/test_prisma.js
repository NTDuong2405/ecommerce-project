import { prisma } from './src/config/prisma.js';

async function main() {
  try {
    console.log("Checking Promotion model fields...");
    const fields = Object.keys(prisma.promotion || {});
    console.log("Promotion fields found:", fields);

    // Thử tạo một promotion test với code
    const testCode = "TEST_" + Math.random().toString(36).substring(7);
    const promo = await prisma.promotion.create({
      data: {
        code: testCode,
        title: "Test Promo",
        description: "Test",
        discount: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        isActive: true
      }
    });
    console.log("SUCCESS! Created promo with code:", promo.code);
    
    // Xóa ngay sau khi test
    await prisma.promotion.delete({ where: { id: promo.id } });
    console.log("Cleanup done.");
  } catch (err) {
    console.error("FAILED! Prisma still doesn't recognize 'code':", err.message);
  } finally {
    process.exit();
  }
}

main();
