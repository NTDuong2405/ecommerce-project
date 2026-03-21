import express from 'express'
import * as cartController from './cart.controller.js'
import { authMiddleware } from '../../middlewares/auth.middleware.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', cartController.getCart)
router.post('/', cartController.addToCart)
router.patch('/:id', cartController.updateItem)
router.delete('/:id', cartController.removeItem)

export default router