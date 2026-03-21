import { createUser, loginUser } from './user.service.js'

export const register = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await createUser({ email, password })

    res.json({
      message: 'Register success',
      data: user
    })
  } catch (error) {
    res.status(400).json({
      message: error.message
    })
  }
}

export const login = async (req, res) => {
  try {
    const data = await loginUser(req.body)
    res.json({ message: 'Login success', data })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}