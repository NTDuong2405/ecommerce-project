import { prisma } from "../../config/prisma.js"

/**
 * 👉 Lấy hoặc tạo cart cho user
 */
const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findFirst({
    where: { userId }
  })

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId }
    })
  }

  return cart
}

/**
 * 👉 Add to cart
 */
export const addToCart = async (userId, productId, quantity = 1) => {
  const cart = await getOrCreateCart(userId)

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId
    }
  })

  if (existingItem) {
    return await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + quantity
      }
    })
  }

  return await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      quantity
    }
  })
}

/**
 * 👉 Get cart
 */
export const getCart = async (userId) => {
  const cart = await prisma.cart.findFirst({
    where: { userId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  })

  return cart
}

/**
 * 👉 Update quantity
 */
export const updateItem = async (itemId, quantity) => {
  return await prisma.cartItem.update({
    where: { id: Number(itemId) },
    data: { quantity }
  })
}

/**
 * 👉 Remove item
 */
export const removeItem = async (itemId) => {
  return await prisma.cartItem.delete({
    where: { id: Number(itemId) }
  })
}