import express from 'express';
import * as marketingController from './marketing.controller.js';
import { authMiddleware, staffMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Chỉ Admin/Staff mới được vào
router.use(authMiddleware, staffMiddleware);

router.get('/promotions', marketingController.getPromotions);
router.post('/promotions', marketingController.createPromotion);
router.delete('/promotions/:id', marketingController.deletePromotion);
router.get('/birthdays', marketingController.getBirthdays);
router.post('/birthdays/:userId', marketingController.sendBirthdayWish);

export default router;
