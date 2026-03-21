import { prisma } from "../../config/prisma.js";

export const getAdminStats = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [totalRevenueResult, totalOrders, totalCustomers, recentOrders, recent7DaysOrders] = await Promise.all([
    prisma.order.aggregate({
      _sum: { totalPrice: true },
      where: { status: { notIn: ['CANCELLED'] } }
    }),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } },
        items: { include: { product: { select: { name: true } } } }
      }
    }),
    prisma.order.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: { notIn: ['CANCELLED'] }
      },
      select: { createdAt: true, totalPrice: true }
    })
  ]);

  const chartDataMap = {};
  for(let i=6; i>=0; i--) {
     const d = new Date();
     d.setDate(d.getDate() - i);
     const dateString = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}`;
     chartDataMap[dateString] = { name: dateString, revenue: 0, orders: 0 };
  }

  recent7DaysOrders.forEach(order => {
     const orderDate = new Date(order.createdAt);
     const dateString = `${orderDate.getDate().toString().padStart(2, '0')}/${(orderDate.getMonth()+1).toString().padStart(2, '0')}`;
     if (chartDataMap[dateString]) {
        chartDataMap[dateString].revenue += order.totalPrice;
        chartDataMap[dateString].orders += 1;
     }
  });

  const chartData = Object.values(chartDataMap);

  const formattedRecentOrders = recentOrders.map(order => ({
    id: order.id,
    customer: order.user?.email || 'N/A',
    product: order.items.length > 0 ? (order.items.length > 1 ? `${order.items[0].product.name} +${order.items.length - 1} more` : order.items[0].product.name) : 'No items',
    date: order.createdAt,
    status: order.status,
    price: order.totalPrice
  }));

  return {
    totalRevenue: totalRevenueResult._sum.totalPrice || 0,
    totalOrders,
    totalCustomers,
    chartData,
    recentOrders: formattedRecentOrders
  };
};
