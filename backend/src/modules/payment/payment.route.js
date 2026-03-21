import express from 'express'
import * as paymentController from './payment.controller.js'
import { authMiddleware } from '../../middlewares/auth.middleware.js'

const router = express.Router()

// ─── Public Routes (không cần auth - dành cho gateway callback) ──
router.post('/initiate', paymentController.initiatePayment)
router.get('/vnpay/return', paymentController.vnpayReturn)
router.post('/momo/ipn', paymentController.momoIpn)

// ─── Protected Routes (cần JWT) ───────────────────────────────────
router.use(authMiddleware)
router.get('/', paymentController.getMyPayments)
router.get('/:id', paymentController.getPaymentDetail)
router.post('/', paymentController.createPayment)
router.patch('/:id/status', paymentController.updatePaymentStatus)

export default router