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
    const data = await productService.remove(req.params.id)
    res.json({ message: 'Delete product success', data })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

import * as xlsx from 'xlsx'
import fs from 'fs'

// [ADMIN/STAFF] Xử lý Import Excel
export const handleImport = async (req, res) => {
  try {
    if (!req.file) throw new Error('Vui lòng chọn file Excel!')
    
    // Đọc file excel
    const workbook = xlsx.readFile(req.file.path)
    const sheetName = workbook.SheetNames[0]
    const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName])
    
    // Gọi service xử lý hàng loạt
    const result = await productService.importProducts(jsonData)
    
    // Xóa file tạm sau khi xong
    fs.unlinkSync(req.file.path)
    
    res.json({
      message: 'Nhập dữ liệu thành công! 📦',
      count: result.count
    })
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    res.status(400).json({ message: err.message })
  }
}

// [ADMIN/STAFF] Xuất file mẫu Excel kèm dữ liệu hiện có
export const exportTemplate = async (req, res) => {
  try {
    const products = await productService.getExportTemplateData()
    // Chuyển JSON sang Sheet
    const worksheet = xlsx.utils.json_to_sheet(products)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, "Inventory")
    // Tạo Buffer để gửi trực tiếp cho trình duyệt tải về
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    res.setHeader('Content-Disposition', 'attachment; filename="VibeCart_Stock_Template.xlsx"')
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.send(buffer)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}