import express from 'express'
import { login, register, createStaff } from './user.controller.js'
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/create-staff', authMiddleware, adminMiddleware, createStaff)
router.get('/me', authMiddleware, (req, res) => {
  res.json({
    message: 'Protected route',
    user: req.user
  })
})
export default router