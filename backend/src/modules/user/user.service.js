import { prisma } from '../../config/prisma.js'
import bcrypt from 'bcrypt'
import { generateToken } from '../../utils/jwt.js'

export const createUser = async ({ email, password }) => {
  // check user tồn tại
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new Error('Email already exists')
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword
    }
  })

  return user
}

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new Error('User not found')
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new Error('Wrong password')
  }

  const token = generateToken({
    id: user.id,
    userId: user.id,
    role: user.role
  })

  return {
    user,
    token
  }
}