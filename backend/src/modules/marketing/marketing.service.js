import { prisma } from "../../config/prisma.js";

export const getAllPromotions = async () => {
  return await prisma.promotion.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

export const createPromotion = async (data) => {
  try {
    const promo = await prisma.promotion.create({
      data: {
        code: data.code || `VIBE${Math.random().toString(36).substring(7).toUpperCase()}`,
        title: data.title,
        description: data.description,
        discount: parseInt(data.discount) || 0,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: true
      }
    });

    // Gửi thông báo cho khách hàng
    const users = await prisma.user.findMany({
      where: { role: 'USER' }
    });

    if (users.length > 0) {
      const notifications = users.map(user => ({
        userId: user.id,
        title: `🎁 ${data.title}`,
        content: `Sử dụng mã: ${promo.code} để nhận ưu đãi! ${data.description}`,
        type: 'PROMO',
        path: '/products'
      }));

      await prisma.notification.createMany({
        data: notifications,
        skipDuplicates: true
      });
    }

    return promo;
  } catch (err) {
    console.error("[Marketing Service] Error creating promo:", err);
    throw new Error("Lỗi khi tạo khuyến mãi: " + err.message);
  }
};

export const validateCoupon = async (code) => {
  const now = new Date();
  const promo = await prisma.promotion.findUnique({
    where: { 
      code: code,
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
      userId: { not: null } // Chỉ cho phép áp dụng mã cá nhân/sinh nhật thủ công
    }
  });

  if (!promo) {
    throw new Error("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
  }

  return promo;
};

export const getUpcomingBirthdays = async () => {
  const users = await prisma.user.findMany({
    where: {
      birthday: { not: null },
      role: 'USER'
    },
    select: {
      id: true,
      email: true,
      birthday: true
    }
  });

  // Lọc những người có sinh nhật trong tháng này hoặc tuần này (giản lược: tháng này)
  const today = new Date();
  const currentMonth = today.getMonth();

  return users.filter(user => {
    const bday = new Date(user.birthday);
    return bday.getMonth() === currentMonth;
  });
};

export const sendBirthdayWish = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const year = new Date().getFullYear();
  const bdayCode = `BDAY${userId}-${year}`;

  // Kiểm tra xem đã tặng voucher sinh nhật năm nay chưa
  const existing = await prisma.promotion.findUnique({
    where: { code: bdayCode }
  });

  if (!existing) {
    // Tính ngày cuối cùng của tháng hiện tại để code chỉ có hiệu lực đúng tháng đó
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    await prisma.promotion.create({
      data: {
        userId: user.id,
        code: bdayCode,
        title: `Mừng sinh nhật ${user.email}!`,
        description: `Quà tặng sinh nhật đặc biệt từ VibeCart tại tháng ${now.getMonth() + 1}: Giảm giá 20% cho đơn hàng của bạn.`,
        discount: 20,
        startDate: new Date(),
        endDate: lastDayOfMonth, // Chỉ có hiệu lực đến hết ngày cuối cùng của tháng sinh nhật
        isActive: true
      }
    });
  }

  return await prisma.notification.create({
    data: {
      userId: user.id,
      title: "🎂 Chúc mừng sinh nhật!",
      content: `VibeCart chúc bạn một ngày sinh nhật rực rỡ! Tặng bạn mã GIẢM GIÁ 20% cho đơn hàng tháng này. Mã của bạn là: ${bdayCode}`,
      type: 'PROMO',
      path: '/profile?tab=notifications'
    }
  });
};

export const getAvailablePromotions = async (userId) => {
  const now = new Date();
  if (!userId) return []; // Khách vãng lai không có voucher cá nhân

  return await prisma.promotion.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
      userId: userId // Chỉ lấy voucher đã gán cho User cụ thể (Sinh nhật, Khách quen)
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const deletePromotion = async (id) => {
  return await prisma.promotion.delete({
    where: { id: parseInt(id) }
  });
};
