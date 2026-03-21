import express from 'express';
import * as dashboardController from './dashboard.controller.js';

const router = express.Router();

router.get('/stats', dashboardController.getStats);

export default router;
