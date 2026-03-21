import jwt from 'jsonwebtoken'

const SECRET = 'your_secret_key' // sau này dùng .env

export const generateToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET)
}