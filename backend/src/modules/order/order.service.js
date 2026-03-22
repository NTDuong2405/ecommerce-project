import { prisma } from '../../config/prisma.js'
import { emitStockUpdate, emitNewOrder } from '../../utils/socket.js'

export const createOrder = async (userId, data) => {
  const { 
    items, totalPrice, customerName, customerEmail, customerPhone, address, city, note, 
    shippingMethod, shippingPrice, discountAmount, couponCode 
  } = data;

  if (!items || items.length === 0) {
    throw new Error('No items in order');
  }

  // Sử dụng Transaction để đảm bảo tính toàn vẹn dữ liệu
  const result = await prisma.$transaction(async (tx) => {
    // 1. Kiểm tra tồn kho và Trừ kho cho từng sản phẩm
    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: Number(item.productId) }
      });

      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Product "${product.name}" doesn't have enough stock. (Available: ${product.stock})`);
      }

      // Trừ kho
      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: { decrement: Number(item.quantity) }
        }
      });
    }

    // 2. Tạo đơn hàng (Order)
    const order = await tx.order.create({
      data: {
        userId: userId || null,
        totalPrice: Number(totalPrice),
        discountAmount: Number(discountAmount) || 0,
        couponCode: couponCode || null,
        customerName,
        customerEmail,
        customerPhone,
        address,
        city,
        note,
        shippingMethod: shippingMethod || 'Standard Shipping',
        shippingPrice: Number(shippingPrice) || 0,
        items: {
          create: items.map((item) => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity),
            price: Number(item.price)
          }))
        }
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    // 3. Nếu có userId, xóa giỏ hàng DB
    if (userId) {
      const cart = await tx.cart.findFirst({ where: { userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    }

    return order;
  });

  // 4. Phát tín hiệu Real-time sau khi Transaction thành công
  if (result && result.items) {
    // Thông báo cho Admin biết có ĐƠN HÀNG MỚI (Tên khách + Tổng tiền)
    if (global.io) { // Giả sử ta export io ra global hoặc dùng helper
       // Ở đây ta dùng emitStockUpdate trực tiếp vì nó dùng io bên trong
    }
    
    // Phát tín hiệu STOCK UPDATE như cũ
    result.items.forEach(item => {
      emitStockUpdate(item.productId, item.product.stock); 
    });

    // Phát tín hiệu NEW ORDER (Sự kiện mới)
    emitNewOrder({
      id: result.id,
      customerName: result.customerName,
      totalPrice: result.totalPrice,
      itemCount: result.items.length
    });

    // LƯU THÔNG BÁO VÀO DATABASE CHO ADMIN
    try {
      const { createAdminNotification } = await import('../customer/customer.service.js');
      await createAdminNotification({
        title: 'New Order! 🛍️',
        content: `Order #${result.id} by ${result.customerName} - Total: $${result.totalPrice}`,
        type: 'ORDER',
        path: `/admin/orders?orderId=${result.id}`
      });
    } catch (e) {
      console.error("Lỗi lưu thông báo Admin:", e);
    }
  }



  return result;
}



export const findByTracking = async (orderId, contact) => {
  // Tìm kiếm theo ID và Email HOẶC SĐT để bảo mật cơ bản
  const order = await prisma.order.findFirst({
    where: {
      id: Number(orderId),
      OR: [
        { customerEmail: contact },
        { customerPhone: contact }
      ]
    },
    include: {
      items: {
        include: { product: true }
      },
      payment: true
    }
  });

  if (!order) {
    throw new Error('Order not found with provided info');
  }

  return order;
}

export const getOrders = async (userId) => {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export const getAllOrders = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = query.search ? String(query.search).toLowerCase() : '';

  const where = search ? {
    OR: [
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerEmail: { contains: search, mode: 'insensitive' } },
      // Nếu search là số, tìm theo ID
      ...(!isNaN(Number(search)) ? [{ id: Number(search) }] : [])
    ]
  } : {};

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: { id: true, email: true }
        },
        payment: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.order.count({ where })
  ]);

  return {
    data,
    meta: { page, limit, total }
  };
}

export const getOrderDetail = async (userId, orderId) => {
  const order = await prisma.order.findFirst({
    where: {
      id: Number(orderId),
      userId
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  })

  if (!order) {
    throw new Error('Order not found')
  }

  return order
}

export const cancelOrder = async (userId, orderId) => {
  const order = await prisma.order.findFirst({
    where: {
      id: Number(orderId),
      userId
    },
    include: { items: true }
  })

  if (!order) {
    throw new Error('Order not found')
  }

  if (order.status !== 'PENDING') {
    throw new Error('Cannot cancel this order')
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Cộng lại kho cho từng sản phẩm
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: { increment: item.quantity }
        }
      });
    }

    // 2. Chuyển trạng thái đơn hàng
    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' },
      include: { items: { include: { product: true } } }
    });

    return updatedOrder;
  });

  // 3. Phát tín hiệu Real-time Hoàn kho
  if (result && result.items) {
    result.items.forEach(item => {
      emitStockUpdate(item.productId, item.product.stock); 
    });
  }

  return result;
}



// ✅ [SERVICE] [ADMIN] Cập nhật trạng thái đơn hàng
export const updateOrderStatusAdmin = async (orderId, status) => {
  // Prisma tự động mapping status với Enum OrderStatus hợp lệ
  return await prisma.order.update({
    where: { id: Number(orderId) },
    data: { status }
  })
}