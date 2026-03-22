import { verifyToken } from '../utils/jwt.js'

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      throw new Error('No token')
    }

    const decoded = verifyToken(token)

    req.user = decoded

    next()
  } catch (error) {
    res.status(401).json({
      message: 'Unauthorized'
    })
  }
}

export const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next()
  } else {
    res.status(403).json({
      message: 'Access denied: Admin only'
    })
  }
}

// Cho phép cả Admin và Nhân viên (Staff) truy cập
export const staffMiddleware = (req, res, next) => {
  if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'STAFF')) {
    next()
  } else {
    res.status(403).json({
      message: 'Access denied: Staff/Admin only'
    })
  }
}