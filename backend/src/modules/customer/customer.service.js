import { prisma } from "../../config/prisma.js";
import { emitChatMessage } from "../../utils/socket.js";

export const getCustomers = async () => {
  // 1. Lấy Users đăng ký + đếm chat, orders, notifs
  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    select: {
      id: true,
      email: true,
      createdAt: true,
      _count: { 
        select: { 
          orders: true, 
          notifications: true,
          sentMessages: true, 
          receivedMessages: true 
        } 
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // 2. Lấy danh sách Guest duy nhất từ ChatMessage
  const guestChats = await prisma.chatMessage.findMany({
    where: { guestId: { not: null } },
    distinct: ['guestId'],
    select: {
      guestId: true,
      createdAt: true
    }
  });

  // 3. Quy đổi Guest thành định dạng giống User để hiển thị
  const guests = await Promise.all(guestChats.map(async (gc) => {
    const chatCount = await prisma.chatMessage.count({
      where: { guestId: gc.guestId }
    });
    
    return {
      id: gc.guestId,
      email: `Guest_${gc.guestId}`,
      createdAt: gc.createdAt,
      isGuest: true,
      _count: { 
        orders: 0, 
        notifications: 0,
        chatMessages: chatCount
      }
    };
  }));

  const userList = users.map(u => ({ 
    ...u, 
    isGuest: false,
    _count: {
      ...u._count,
      chatMessages: u._count.sentMessages + u._count.receivedMessages
    }
  }));

  // Gộp lại (Users trước, Guests sau)
  return [...userList, ...guests];
}


export const sendChat = async ({ senderId, receiverId, content, guestId }) => {
  console.log(`💾 [Service] Saving chat: From ${senderId} To ${receiverId} | Guest: ${guestId}`);
  
  const message = await prisma.chatMessage.create({
    data: {
      senderId: senderId ? Number(senderId) : null,
      receiverId: receiverId ? Number(receiverId) : null,
      guestId: guestId ? String(guestId) : null,
      content
    }
  });

  // PHÁT THÔNG BÁO CHO ADMIN NẾU CUSTOMER GỬI TIN NHẮN TỚI
  if (String(receiverId) === "1") {
    const customerId = senderId || guestId;
    await createAdminNotification({
      title: 'New Chat!',
      content: `Msg from: ${guestId ? 'Guest_' + guestId : 'Customer_#' + senderId}: ${content.slice(0, 30)}...`,
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
