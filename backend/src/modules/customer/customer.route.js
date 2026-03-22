import express from 'express';
import * as customerController from './customer.controller.js';
import { authMiddleware, adminMiddleware, staffMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// [STAFF/ADMIN] Quản lý khách hàng
router.get('/', authMiddleware, staffMiddleware, customerController.getCustomers);
router.get('/notifications', authMiddleware, customerController.getMyNotifications);
router.patch('/notifications/:notifId/read', authMiddleware, customerController.markAsRead);

// [STAFF/ADMIN] Thông báo Admin
router.get('/admin/notifications', authMiddleware, staffMiddleware, customerController.getAdminNotifications);
router.patch('/admin/notifications/:notifId/read', authMiddleware, staffMiddleware, customerController.markAdminNotificationRead);

// [STAFF/ADMIN] Chat & Gửi thông báo
router.post('/chat_from_member', authMiddleware, customerController.sendChatFromMember);
router.post('/:id/chat', authMiddleware, staffMiddleware, customerController.sendChat);
router.post('/:id/chat_from_guest', customerController.sendChatFromGuest);
router.post('/:id/notify', authMiddleware, staffMiddleware, customerController.sendNotification);
router.get('/:id/chat', authMiddleware, staffMiddleware, customerController.getChats);
router.patch('/:id', authMiddleware, staffMiddleware, customerController.updateCustomer);

export default router;
