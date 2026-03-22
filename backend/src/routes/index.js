import express from 'express'
import userRoutes from '../modules/user/user.route.js'
import productRoutes from '../modules/product/product.route.js'
import cartRoutes from '../modules/cart/cart.route.js'
import orderRoutes from '../modules/order/order.route.js'
import paymentRoutes from '../modules/payment/payment.route.js'
import dashboardRoutes from '../modules/dashboard/dashboard.route.js'
import customerRoutes from '../modules/customer/customer.route.js'
import marketingRouter from '../modules/marketing/marketing.route.js';
import analyticsRoutes from '../modules/analytics/analytics.route.js';

const router = express.Router()

router.use('/users', userRoutes)
router.use('/products', productRoutes)
router.use('/cart', cartRoutes)
router.use('/orders', orderRoutes)
router.use('/payments', paymentRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/customers', customerRoutes)
router.use('/marketing', marketingRouter);
router.use('/analytics', analyticsRoutes);

export default router