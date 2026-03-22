import express from 'express'
import multer from 'multer'
import * as productController from './product.controller.js'
import { authMiddleware, adminMiddleware, staffMiddleware } from '../../middlewares/auth.middleware.js'

const router = express.Router()

// Cấu hình Multer để nhận file
const upload = multer({ dest: 'uploads/' })

router.get('/', productController.getList)
router.get('/export-template', authMiddleware, staffMiddleware, productController.exportTemplate)
router.get('/:id', productController.getDetail)

// [STAFF/ADMIN] Thêm & Cập nhật sản phẩm
router.post('/', authMiddleware, staffMiddleware, productController.create)
router.put('/:id', authMiddleware, staffMiddleware, productController.update)

// [STAFF/ADMIN] Import từ Excel
router.post('/import', authMiddleware, staffMiddleware, upload.single('file'), productController.handleImport)

// [ADMIN ONLY] Xóa sản phẩm
router.delete('/:id', authMiddleware, adminMiddleware, productController.remove)

export default router