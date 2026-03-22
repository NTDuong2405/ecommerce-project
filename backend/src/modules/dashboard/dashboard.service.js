import { prisma } from "../../config/prisma.js";

export const getAdminStats = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [totalRevenueResult, totalOrders, totalCustomers, recentOrders, recent7DaysOrders, topProductsRaw, statusStats] = await Promise.all([
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
    }),
    // 1. Thống kê sản phẩm bán chạy nhất
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    }),
    // 2. Thống kê theo trạng thái đơn hàng
    prisma.order.groupBy({
      by: ['status'],
      _count: { id: true }
    })
  ]);

  // Lấy tên sản phẩm cho topProducts
  const topProducts = await Promise.all(topProductsRaw.map(async (item) => {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      select: { name: true, price: true }
    });
    return {
      name: product?.name || 'Unknown',
      sales: item._sum.quantity,
      revenue: (product?.price || 0) * item._sum.quantity
    };
  }));

  const chartDataMap = {};
  for(let i=6; i>0; i--) {
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

  const formattedRecentOrders = recentOrders.map(order => {
    let productName = 'No items';
    if (order.items && order.items.length > 0) {
      const firstItemName = order.items[0]?.product?.name || 'Unknown Product';
      productName = order.items.length > 1 
        ? `${firstItemName} (+${order.items.length - 1})` 
        : firstItemName;
    }

    return {
      id: order.id,
      customer: order.user?.email || 'Guest',
      product: productName,
      date: order.createdAt,
      status: order.status,
      price: order.totalPrice || 0
    };
  });

  return {
    totalRevenue: totalRevenueResult._sum.totalPrice || 0,
    totalOrders,
    totalCustomers,
    chartData,
    recentOrders: formattedRecentOrders,
    topProducts,
    statusStats: statusStats.map(s => ({ name: s.status, value: s._count.id }))
  };
};
