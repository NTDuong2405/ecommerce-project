import express from 'express';
import * as marketingController from './marketing.controller.js';
import { authMiddleware, staffMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Public route for checkout validation
router.post('/validate', marketingController.validateCoupon);

// Get available promotions (Public or Auth)
router.get('/available', marketingController.getAvailablePromotions);

// Admin/Staff routes
router.get('/promotions', authMiddleware, staffMiddleware, marketingController.getPromotions);
router.post('/promotions', authMiddleware, staffMiddleware, marketingController.createPromotion);
router.delete('/promotions/:id', authMiddleware, staffMiddleware, marketingController.deletePromotion);
router.get('/birthdays', authMiddleware, staffMiddleware, marketingController.getBirthdays);
router.post('/birthdays/:userId', authMiddleware, staffMiddleware, marketingController.sendBirthdayWish);

export default router;
