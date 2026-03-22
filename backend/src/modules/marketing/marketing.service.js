import { prisma } from "../../config/prisma.js";

export const getAllPromotions = async () => {
  return await prisma.promotion.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

export const createPromotion = async (data) => {
  const promo = await prisma.promotion.create({
    data: {
      title: data.title,
      description: data.description,
      discount: data.discount,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      isActive: true
    }
  });

  // Gửi thông báo cho TẤT CẢ người dùng nếu là khuyến mãi lớn
  const users = await prisma.user.findMany({
    where: { role: 'USER' }
  });

  const notifications = users.map(user => ({
    userId: user.id,
    title: `🎁 ${data.title}`,
    content: data.description,
    type: 'PROMO',
    path: '/products'
  }));

  if (notifications.length > 0) {
    await prisma.notification.createMany({
      data: notifications
    });
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

  return await prisma.notification.create({
    data: {
      userId: user.id,
      title: "🎂 Chúc mừng sinh nhật!",
      content: `VibeCart chúc bạn một ngày sinh nhật rực rỡ! Tặng bạn mã GIẢM GIÁ 20% cho đơn hàng hôm nay.`,
      type: 'PROMO',
      path: '/'
    }
  });
};

export const deletePromotion = async (id) => {
  return await prisma.promotion.delete({
    where: { id: parseInt(id) }
  });
};
