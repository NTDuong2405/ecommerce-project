import { prisma } from "../../config/prisma.js";
import { emitChatMessage } from "../../utils/socket.js";

export const getCustomers = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = query.search ? String(query.search).toLowerCase() : '';

  // 1. Lấy Users đăng ký có lọc search
  const usersRaw = await prisma.user.findMany({
    where: { 
      role: 'USER',
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } }
        ]
      })
    },
    select: {
      id: true, email: true, phone: true, birthday: true, createdAt: true,
      _count: { 
        select: { orders: true, notifications: true, sentMessages: true, receivedMessages: true } 
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Tính toán thêm số tiền đã mua (Total Spent) cho từng User
  const users = await Promise.all(usersRaw.map(async (u) => {
    const aggregate = await prisma.order.aggregate({
      where: { userId: u.id, status: { not: 'CANCELLED' } }, // Không tính đơn đã hủy
      _sum: { totalPrice: true }
    });
    return {
      ...u,
      totalSpent: aggregate._sum.totalPrice || 0
    };
  }));

  // 2. Lấy danh sách Guest
  const guestChats = await prisma.chatMessage.findMany({
    where: { 
      guestId: { not: null },
      ...(search && { 
        guestId: { contains: search, mode: 'insensitive' } 
      })
    },
    distinct: ['guestId'],
    select: { guestId: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  });

  const guests = await Promise.all(guestChats.map(async (gc) => {
    const chatCount = await prisma.chatMessage.count({ where: { guestId: gc.guestId } });
    return {
      id: gc.guestId, email: `Guest_${gc.guestId}`, createdAt: gc.createdAt, isGuest: true,
      _count: { orders: 0, notifications: 0, chatMessages: chatCount }
    };
  }));

  const userList = users.map(u => ({ 
    ...u, isGuest: false,
    _count: { ...u._count, chatMessages: u._count.sentMessages + u._count.receivedMessages }
  }));

  const allCustomers = [...userList, ...guests];
  const total = allCustomers.length;
  const data = allCustomers.slice(skip, skip + limit);

  return {
    data,
    meta: { page, limit, total }
  };
}


export const sendChat = async ({ senderId, receiverId, content, guestId }) => {
  let sId = senderId ? Number(senderId) : null;
  let rId = receiverId ? Number(receiverId) : null;

  console.log(`💾 [Service] Validating chat IDs: From ${sId} To ${rId}`);
  
  // KIỂM TRA SỰ TỒN TẠI TRONG DATABASE ĐỂ TRÁNH LỖI FK (Khóa ngoại)
  if (sId && !isNaN(sId)) {
    const user = await prisma.user.findUnique({ where: { id: sId } });
    if (!user) {
      console.log(`⚠️ [Service] Sender ID ${sId} not found in DB. Falling back to null.`);
      sId = null;
    }
  }

  if (rId && !isNaN(rId)) {
    const user = await prisma.user.findUnique({ where: { id: rId } });
    if (!user) {
      console.log(`⚠️ [Service] Receiver ID ${rId} not found in DB. Falling back to null.`);
      rId = null;
    }
  }

  const message = await prisma.chatMessage.create({
    data: {
      senderId: sId,
      receiverId: rId,
      guestId: guestId ? String(guestId) : null,
      content: content || "(Trống)"
    }
  });

  // PHÁT THÔNG BÁO CHO ADMIN NẾU CUSTOMER GỬI TIN NHẮN TỚI
  if (String(rId) === "1" || (!rId && guestId)) {
    const customerId = sId || guestId;
    await createAdminNotification({
      title: 'New Chat!',
      content: `Msg from: ${guestId ? 'Guest_' + guestId : 'Customer_#' + sId}: ${content?.slice(0, 30)}...`,
      type: 'CHAT',
      path: `/admin/customers?customerId=${customerId}`
    });
  }
  
  // Phát tín hiệu Real-time
  emitChatMessage(message);
  
  return message;
}

export const getChats = async (adminId, customerIdOrGuestId) => {
  const targetIdStr = String(customerIdOrGuestId);
  const targetIdNum = !isNaN(customerIdOrGuestId) ? Number(customerIdOrGuestId) : null;

  return await prisma.chatMessage.findMany({
    where: {
      OR: [
        // Gửi từ Admin tới Target (Member hoặc Guest)
        { 
          senderId: Number(adminId), 
          OR: [
            { receiverId: targetIdNum },
            { guestId: targetIdStr }
          ]
        },
        // Gửi từ Target tới Admin
        { 
          receiverId: Number(adminId),
          OR: [
            { senderId: targetIdNum },
            { guestId: targetIdStr }
          ]
        }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });
}


export const sendNotification = async (userId, data) => {
  const notification = await prisma.notification.create({
    data: {
      userId: Number(userId),
      title: data.title,
      content: data.content,
      type: data.type || 'SYSTEM'
    }
  });

  // PHÁT TÍN HIỆU THÔNG BÁO MỚI CHO USER QUA SOCKET
  try {
    const { getIO } = await import("../../utils/socket.js");
    const io = getIO();
    if (io) {
      io.emit('new-notification', notification);
    }
  } catch (e) {
    console.log("Socket not ready for notification emit");
  }

  return notification;
}

export const getNotifications = async (userId) => {
  return await prisma.notification.findMany({
    where: { userId: Number(userId) },
    orderBy: { createdAt: 'desc' }
  });
}

export const markAsRead = async (notifId, userId) => {
  return await prisma.notification.updateMany({
    where: { 
      id: Number(notifId),
      userId: Number(userId)
    },
    data: { isRead: true }
  });
}

// ✅ [ADMIN] Lấy thông báo hệ thống (Order mới, Chat mới...)
export const getAdminNotifications = async () => {
  return await prisma.notification.findMany({
    where: { 
      userId: null,
      guestId: null
    },
    orderBy: { createdAt: 'desc' },
    take: 50 // Giới hạn 50 cái gần nhất
  });
}

// ✅ [ADMIN] Đánh dấu đã xem thông báo Admin
export const markAdminAsRead = async (notifId) => {
  return await prisma.notification.update({
    where: { id: Number(notifId) },
    data: { isRead: true }
  });
}

// ✅ [Helper] Tạo thông báo Admin & Phát Socket Real-time
export const createAdminNotification = async ({ title, content, type, path }) => {
  const notification = await prisma.notification.create({
    data: {
      userId: null,
      guestId: null,
      title,
      content,
      type,
      path,
      isRead: false
    }
  });

  // PHÁT TÍN HIỆU REAL-TIME CHO ADMIN BELL
  try {
    const { getIO } = await import("../../utils/socket.js");
    const io = getIO();
    if (io) {
      // Gửi riêng một event admin-notification để Bell nhận diện
      io.emit('admin-notification', notification);
    }
  } catch (e) {
    console.log("Socket not ready for admin-notification emit");
  }

  return notification;
}

export const updateCustomer = async (userId, data) => {
  return await prisma.user.update({
    where: { id: Number(userId) },
    data: {
      phone: data.phone,
      birthday: data.birthday ? new Date(data.birthday) : null
    }
  });
}
