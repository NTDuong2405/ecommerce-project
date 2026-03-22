import { prisma } from "../../config/prisma.js";

export const getDeepAnalytics = async (query = {}) => {
  const { year = new Date().getFullYear() } = query;
  
  const [categoryStatsRaw, userStats, monthlyRevenueRaw, paymentStats] = await Promise.all([
    // 1. Lấy tất cả OrderItem để tính doanh thu theo Category
    prisma.orderItem.findMany({
      include: { product: { select: { category: true } } }
    }),
    // 2. Tỷ lệ khách hàng (New vs Returning)
    prisma.order.groupBy({
      by: ['userId'],
      _count: { id: true },
    }),
    // 3. Doanh thu 12 tháng (Growth Bar Chart)
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
        status: { notIn: ['CANCELLED'] }
      },
      select: { createdAt: true, totalPrice: true }
    }),
    // 4. Thống kê phương thức thanh toán
    prisma.payment.groupBy({
      by: ['method'],
      _count: { id: true },
      _sum: { amount: true }
    })
  ]);

  // Xử lý Category Stats: Lấy tên Category từ Product liên kết
  const categoryStatsMap = {};
  for (const item of categoryStatsRaw) {
    const catName = item.product?.category || "Chưa phân loại";
    if (!categoryStatsMap[catName]) categoryStatsMap[catName] = { name: catName, value: 0 };
    categoryStatsMap[catName].value += (item.price * item.quantity);
  }
  const categoryStats = Object.values(categoryStatsMap);

  // Xử lý User Retention
  const totalCustomers = userStats.length;
  const returningCustomers = userStats.filter(u => u._count.id > 1).length;
  const newCustomers = totalCustomers - returningCustomers;

  // Xử lý Monthly Revenue (12 tháng)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyRevenue = monthNames.map((name, i) => ({ name, revenue: 0 }));
  
  monthlyRevenueRaw.forEach(order => {
    const month = new Date(order.createdAt).getMonth();
    monthlyRevenue[month].revenue += order.totalPrice;
  });

  return {
    categoryStats,
    retention: [
      { name: 'Mới', value: newCustomers },
      { name: 'Quay lại', value: returningCustomers }
    ],
    monthlyRevenue,
    paymentStats: paymentStats.map(p => ({
      name: p.method,
      orderCount: p._count.id,
      totalValue: p._sum.amount
    }))
  };
};
