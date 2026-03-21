import * as productService from './product.service.js'
import { emitStockUpdate } from '../../utils/socket.js';

export const getList = async (req, res) => {
  try {
    const data = await productService.getList(req.query)

    res.json({
      message: 'Get product list success',
      data
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getDetail = async (req, res) => {
  try {
    const data = await productService.getDetail(req.params.id)

    res.json({
      message: 'Get product detail success',
      data
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// ✅ [CONTROLLER] API Thêm Sản phẩm
export const create = async (req, res) => {
  try {
    const data = await productService.create(req.body)

    res.json({
      message: 'Create product success',
      data
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// ✅ [CONTROLLER] API Cập nhật Sản phẩm
export const update = async (req, res) => {
  console.log("UPDATE PARAMS / BODY", req.params.id, req.body)
  try {
    // Gọi hàm update trong service truyền ID từ params và cục data từ body
    const data = await productService.update(req.params.id, req.body)
    console.log("UPDATE SUCCESS")

    // PHÁT TÍN HIỆU CẬP NHẬT KHO REAL-TIME
    emitStockUpdate(req.params.id, data.stock);

    res.json({
      message: 'Update product success',
      data
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// ✅ [CONTROLLER] API Xóa Sản phẩm
export const remove = async (req, res) => {
  try {
    // Gọi hàm remove truyền ID từ params URL
    const data = await productService.remove(req.params.id)

    res.json({
      message: 'Delete product success',
      data
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}