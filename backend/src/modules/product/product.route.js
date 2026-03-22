import express from 'express'
import * as productController from './product.controller.js'
import { authMiddleware, adminMiddleware, staffMiddleware } from '../../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/', productController.getList)
router.get('/:id', productController.getDetail)

// [STAFF/ADMIN] Thêm & Cập nhật sản phẩm
router.post('/', authMiddleware, staffMiddleware, productController.create)
router.put('/:id', authMiddleware, staffMiddleware, productController.update)

// [ADMIN ONLY] Xóa sản phẩm
router.delete('/:id', authMiddleware, adminMiddleware, productController.remove)

export default router