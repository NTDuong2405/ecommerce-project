import express from 'express';
import * as analyticsController from './analytics.controller.js';
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Chỉ Admin mới được xem Analytics chuyên sâu
router.get('/', authMiddleware, adminMiddleware, analyticsController.getDeepAnalytics);

export default router;
