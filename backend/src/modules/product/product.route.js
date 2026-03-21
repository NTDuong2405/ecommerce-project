import express from 'express'
import * as productController from './product.controller.js'
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/', productController.getList)
router.get('/:id', productController.getDetail)

// Các route thay đổi dữ liệu cần quyền ADMIN
router.post('/', authMiddleware, adminMiddleware, productController.create)
router.put('/:id', authMiddleware, adminMiddleware, productController.update)
router.delete('/:id', authMiddleware, adminMiddleware, productController.remove)

export default router