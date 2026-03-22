import { verifyToken } from '../utils/jwt.js'
import { prisma } from '../config/prisma.js'

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      throw new Error('No token')
    }

    const decoded = verifyToken(token)

    // KIỂM TRA THỰC TẾ TRONG DATABASE (Phát hiện User hết hạn/bị xóa)
    const userId = decoded.id || decoded.userId || decoded.sub;
    if (userId) {
      const userExists = await prisma.user.findUnique({ where: { id: Number(userId) } });
      if (!userExists) {
        return res.status(401).json({ message: 'Tài khoản không tồn tại hoặc đã bị xóa. Vui lòng đăng nhập lại!' });
      }
      // Gán lại thông tin User thực tế cho req.user để dùng cho Staff/Admin check
      req.user = userExists;
    } else {
      req.user = decoded;
    }

    next()
  } catch (error) {
    res.status(401).json({
      message: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!'
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