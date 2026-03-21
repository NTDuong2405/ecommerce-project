import express from 'express'
import { login, register } from './user.controller.js'
import { authMiddleware } from '../../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', authMiddleware, (req, res) => {
  res.json({
    message: 'Protected route',
    user: req.user
  })
})
export default router