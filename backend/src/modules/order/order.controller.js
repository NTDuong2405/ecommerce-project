import * as orderService from './order.service.js'
import { emitNewOrder } from '../../utils/socket.js';

export const createOrder = async (req, res) => {
  console.log('Incoming Create Order Request:', req.body);
  try {
    // Nếu có auth thì lấy userId, không thì null (guest)
    const userId = req.user?.id || req.user?.userId || null;
    const data = await orderService.createOrder(userId, req.body);

    // BÁO ĐỘNG ĐƠN HÀNG MỚI REAL-TIME
    emitNewOrder(data);

    res.json({
      message: 'Create order success',
      data
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export const trackOrder = async (req, res) => {
  try {
    const { orderId, contact } = req.query;
    if (!orderId || !contact) {
      return res.status(400).json({ message: 'OrderId and Contact (Email/Phone) are required' });
    }

    const data = await orderService.findByTracking(orderId, contact);
    res.json({ message: 'Order found', data });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
}


export const getOrders = async (req, res) => {
  try {
    const userId = req.user.userId
    const data = await orderService.getOrders(userId)

    res.json({
      message: 'Get orders success',
      data
    })
  } catch (err) {
    res.status(400).json({
      message: err.message
    })
  }
}

export const getAllOrdersAdmin = async (req, res) => {
  try {
    const data = await orderService.getAllOrders(req.query)

    res.json({
      message: 'Get all orders success',
      data
    })
  } catch (err) {
    res.status(400).json({
      message: err.message
    })
  }
}

export const getOrderDetail = async (req, res) => {
  try {
    const userId = req.user.userId
    const { id } = req.params

    const data = await orderService.getOrderDetail(userId, id)

    res.json({
      message: 'Get order detail success',
      data
    })
  } catch (err) {
    res.status(400).json({
      message: err.message
    })
  }
}

export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.userId
    const { id } = req.params

    const data = await orderService.cancelOrder(userId, id)

    res.json({
      message: 'Cancel order success',
      data
    })
  } catch (err) {
    res.status(400).json({
      message: err.message
    })
  }
}

// ✅ [CONTROLLER] [ADMIN] Đổi trạng thái đơn hàng
export const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const data = await orderService.updateOrderStatusAdmin(id, status)

    res.json({
      message: 'Update order status success',
      data
    })
  } catch (err) {
    res.status(400).json({
      message: err.message
    })
  }
}