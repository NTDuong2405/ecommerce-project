import * as cartService from './cart.service.js'

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id
    const { productId, quantity } = req.body

    const data = await cartService.addToCart(userId, productId, quantity)

    res.json({
      message: 'Add to cart success',
      data
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id

    const data = await cartService.getCart(userId)

    res.json({
      message: 'Get cart success',
      data
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const updateItem = async (req, res) => {
  try {
    const { id } = req.params
    const { quantity } = req.body

    const data = await cartService.updateItem(id, quantity)

    res.json({
      message: 'Update item success',
      data
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const removeItem = async (req, res) => {
  try {
    const { id } = req.params

    await cartService.removeItem(id)

    res.json({
      message: 'Remove item success'
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}