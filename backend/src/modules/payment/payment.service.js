import { prisma } from "../../config/prisma.js"

const VALID_CREATE_METHODS = ['COD', 'BANK_TRANSFER', 'MOMO', 'VNPAY']
const VALID_UPDATE_STATUSES = ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED']

export const createPayment = async (userId, { orderId, method }) => {
  if (!orderId) {
    throw new Error('orderId is required')
  }

  if (!method) {
    throw new Error('method is required')
  }

  if (!VALID_CREATE_METHODS.includes(method)) {
    throw new Error('Invalid payment method')
  }

  const order = await prisma.order.findFirst({
    where: {
      id: Number(orderId),
      userId
    },
    include: {
      payment: true
    }
  })

  if (!order) {
    throw new Error('Order not found')
  }

  if (order.payment) {
    throw new Error('Payment already exists for this order')
  }

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      method,
      amount: order.totalPrice,
      status: method === 'COD' ? 'PENDING' : 'PENDING'
    },
    include: {
      order: true
    }
  })

  return payment
}

export const getPaymentDetail = async (userId, paymentId) => {
  const payment = await prisma.payment.findFirst({
    where: {
      id: Number(paymentId),
      order: {
        userId
      }
    },
    include: {
      order: {
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      }
    }
  })

  if (!payment) {
    throw new Error('Payment not found')
  }

  return payment
}

export const updatePaymentStatus = async (
  userId,
  paymentId,
  { status, transactionId }
) => {
  if (!status) {
    throw new Error('status is required')
  }

  if (!VALID_UPDATE_STATUSES.includes(status)) {
    throw new Error('Invalid payment status')
  }

  const payment = await prisma.payment.findFirst({
    where: {
      id: Number(paymentId),
      order: {
        userId
      }
    },
    include: {
      order: true
    }
  })

  if (!payment) {
    throw new Error('Payment not found')
  }

  const updatedPayment = await prisma.payment.update({
    where: {
      id: payment.id
    },
    data: {
      status,
      transactionId: transactionId || payment.transactionId
    },
    include: {
      order: true
    }
  })

  // Đồng bộ trạng thái order theo payment
  if (status === 'SUCCESS') {
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'CONFIRMED' }
    })
  }

  if (status === 'FAILED') {
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'PENDING' }
    })
  }

  if (status === 'REFUNDED') {
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'CANCELLED' }
    })
  }

  return updatedPayment
}

export const getMyPayments = async (userId) => {
  return await prisma.payment.findMany({
    where: {
      order: {
        userId
      }
    },
    include: {
      order: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}