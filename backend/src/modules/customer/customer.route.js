import express from 'express';
import * as customerController from './customer.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', customerController.getCustomers);
router.get('/notifications', authMiddleware, customerController.getMyNotifications);
router.patch('/notifications/:notifId/read', authMiddleware, customerController.markAsRead);

// ✅ [ADMIN] Lấy & Đánh dấu đã đọc thông báo Admin
router.get('/admin/notifications', authMiddleware, customerController.getAdminNotifications);
router.patch('/admin/notifications/:notifId/read', authMiddleware, customerController.markAdminNotificationRead);

router.post('/chat_from_member', authMiddleware, customerController.sendChatFromMember);
router.post('/:id/chat', customerController.sendChat);
router.post('/:id/chat_from_guest', customerController.sendChatFromGuest);
router.post('/:id/notify', customerController.sendNotification);
router.get('/:id/chat', customerController.getChats);

export default router;
