import { prisma } from "../../config/prisma.js";

export const getAdminStats = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalRevenueResult, 
    totalOrders, 
    totalCustomers, 
    recentOrders, 
    recent7DaysOrders, 
    topProductsRaw, 
    statusStats,
    marketingStats,
    lowStockProducts
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { totalPrice: true, discountAmount: true },
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
    }),
    // 3. Thống kê Marketing (Voucher)
    prisma.order.aggregate({
      where: { couponCode: { not: null } },
      _count: { id: true },
      _sum: { discountAmount: true }
    }),
    // 4. Sản phẩm tồn kho thấp
    prisma.product.findMany({
      where: { stock: { lt: 10 } },
      take: 10,
      orderBy: { stock: 'asc' }
    })
  ]);

  // 1. Lấy thông tin chi tiết sản phẩm cho topProducts (Optimized: 1 query instead of N queries)
  const productIds = topProductsRaw.map(item => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { 
      id: true,
      name: true, 
      price: true, 
      images: { take: 1, select: { url: true } } 
    }
  });

  const topProducts = topProductsRaw.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      name: product?.name || 'Unknown',
      sales: item._sum.quantity,
      revenue: (product?.price || 0) * item._sum.quantity,
      image: product?.images?.[0]?.url || null
    };
  });

  // ... (giữ nguyên logic chartDataMap và formattedRecentOrders) ...
  const chartDataMap = {};
  for(let i=6; i>=0; i--) { // Đổi i>0 thành i>=0 để lấy cả hôm nay
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
      const firstItem = order.items[0];
      productName = firstItem?.product?.name || firstItem?.name || 'Sản phẩm ẩn';
      if (order.items.length > 1) productName += ` (+${order.items.length - 1})`;
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

  const totalRevenue = totalRevenueResult._sum.totalPrice || 0;
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

  return {
    totalRevenue: totalRevenue || 0,
    totalOrders: totalOrders || 0,
    totalCustomers: totalCustomers || 0,
    avgOrderValue: avgOrderValue || 0,
    marketing: {
      promoUsed: marketingStats?._count?.id || 0,
      totalDiscounted: marketingStats?._sum?.discountAmount || 0
    },
    inventoryIssues: lowStockProducts.map(p => ({
      name: p.name,
      stock: p.stock
    })),
    chartData: chartData || [],
    recentOrders: formattedRecentOrders || [],
    topProducts: topProducts || [],
    statusStats: (statusStats || []).map(s => ({ name: s.status, value: s._count.id }))
  };
};
