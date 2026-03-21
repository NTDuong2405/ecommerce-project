import * as customerService from './customer.service.js';
import { emitChatMessage } from '../../utils/socket.js';

export const getCustomers = async (req, res) => {
  try {
    const data = await customerService.getCustomers();
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

export const sendChatFromMember = async (req, res) => {
  try {
    // Thử cả id và userId cho chắc
    const userId = req.user?.id || req.user?.userId;
    console.log("🕵️‍♂️ [Controller] Member sending. User from Token:", req.user, "Target ID:", userId);

    const data = await customerService.sendChat({
      senderId: userId, 
      receiverId: 1, 
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
    const data = await customerService.getChats(1, req.params.id);
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
