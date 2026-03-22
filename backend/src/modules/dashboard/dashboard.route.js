import express from 'express';
import * as dashboardController from './dashboard.controller.js';
import { authMiddleware, staffMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/stats', authMiddleware, staffMiddleware, dashboardController.getStats);

export default router;
