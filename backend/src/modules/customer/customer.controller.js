import * as customerService from './customer.service.js';
import { emitChatMessage } from '../../utils/socket.js';

export const getCustomers = async (req, res) => {
  try {
    const data = await customerService.getCustomers(req.query);
    res.json({ message: 'Get customers success', data });
  } catch (err) { res.status(400).json({ message: err.message }); }
}

export const sendChat = async (req, res) => {
  try {
    const targetId = req.params.id;
    console.log("🕵️‍♂️ [Controller] Admin sending to:", targetId);
    
    const isGuest = String(targetId).startsWith('G') || Number(targetId) > 10000;

    const data = await customerService.sendChat({
      senderId: 1, 
      receiverId: isGuest ? null : targetId,
      content: req.body.content, 
      guestId: isGuest ? targetId : null
    });
    
    res.json({ message: 'Send chat success', data });
  } catch (err) { res.status(400).json({ message: err.message }); }
}

export const sendChatFromGuest = async (req, res) => {
  try {
    const guestId = req.params.id;
    console.log("🕵️‍♂️ [Controller] Guest sending. ID from URL:", guestId);
    
    const data = await customerService.sendChat({
      senderId: null, 
      receiverId: 1, 
      content: req.body.content, 
      guestId
    });
    res.json({ message: 'Send chat from guest success', data });
  } catch (err) { res.status(400).json({ message: err.message }); }
}

import { prisma } from '../../config/prisma.js';

export const getMyChats = async (req, res) => {
  try {
    console.log("🕵️‍♂️ [DEBUG] getMyChats req.user:", JSON.stringify(req.user));
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    if (!userId) return res.status(401).json({ message: 'Unauthorized (No user ID)' });
    
    // Tìm ID của ADMIN để lấy hội thoại chung
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const adminId = admin ? admin.id : 1; 

    const data = await customerService.getChats(adminId, userId);
    res.json({ message: 'Get my chats success', data });
  } catch (err) { res.status(400).json({ message: err.message }); }
}

export const getChatsByGuestId = async (req, res) => {
  try {
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const adminId = admin ? admin.id : 1; 
    const data = await customerService.getChats(adminId, req.params.id);
    res.json({ message: 'Get guest chats success', data });
  } catch (err) { res.status(400).json({ message: err.message }); }
}

export const sendChatFromMember = async (req, res) => {
  try {
    console.log("🕵️‍♂️ [DEBUG] sendChatFromMember req.user:", JSON.stringify(req.user));
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    if (!userId) return res.status(401).json({ message: 'Unauthorized (No user ID)' });

    // Tin nhắn từ khách luôn gửi tới Admin
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const adminId = admin ? admin.id : 1;

    const data = await customerService.sendChat({
      senderId: userId, 
      receiverId: adminId, 
      content: req.body.content, 
      guestId: null
    });
    res.json({ message: 'Send chat from member success', data });
  } catch (err) { res.status(400).json({ message: err.message }); }
}

export const sendNotification = async (req, res) => {
  try {
    const data = await customerService.sendNotification(req.params.id, req.body);
    res.json({ message: 'Send notification success', data });
  } catch (err) { res.status(400).json({ message: err.message }); }
}

export const getChats = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?.userId;
    const data = await customerService.getChats(adminId, req.params.id);
    res.json({ message: 'Get chats success', data });
  } catch (err) { res.status(400).json({ message: err.message }); }
}

export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    
    if (!userId || isNaN(Number(userId))) {
      return res.status(401).json({ message: 'User identity missing' });
    }

    const data = await customerService.getNotifications(userId);
    res.json({ message: 'Get notifications success', data });
  } catch (err) { 
    console.error("DEBUG [getNotifications Error]:", err);
    res.status(400).json({ message: err.message }); 
  }
}

export const markAsRead = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await customerService.markAsRead(req.params.notifId, userId);
    res.json({ message: 'Mark as read success' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// ✅ [ADMIN] Lấy tất cả thông báo hệ thống
export const getAdminNotifications = async (req, res) => {
  try {
    const data = await customerService.getAdminNotifications();
    res.json({ message: 'Get admin notifications success', data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// ✅ [ADMIN] Đánh dấu thông báo hệ thống là đã đọc
export const markAdminNotificationRead = async (req, res) => {
  try {
    const data = await customerService.markAdminAsRead(req.params.notifId);
    res.json({ message: 'Mark admin as read success', data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export const updateCustomer = async (req, res) => {
  try {
    const data = await customerService.updateCustomer(req.params.id, req.body);
    res.json({ message: 'Update customer success', data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
