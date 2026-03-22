import express from 'express'
import * as orderController from './order.controller.js'
import { authMiddleware, adminMiddleware, staffMiddleware } from '../../middlewares/auth.middleware.js'

const router = express.Router()

// [STAFF/ADMIN] Quản lý đơn hàng toàn hệ thống
router.get('/all', authMiddleware, staffMiddleware, orderController.getAllOrdersAdmin) 
router.patch('/:id/status', authMiddleware, staffMiddleware, orderController.updateOrderStatusAdmin)

// [PUBLIC ROUTE] Tra cứu đơn hàng & Tạo đơn hàng (guest)
router.get('/track', orderController.trackOrder)
router.post('/', orderController.createOrder)

router.use(authMiddleware)

router.get('/', orderController.getOrders)
router.get('/:id', orderController.getOrderDetail)
router.patch('/:id/cancel', orderController.cancelOrder)

export default router