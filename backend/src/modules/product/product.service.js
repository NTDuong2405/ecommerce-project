import { prisma } from "../../config/prisma.js"

export const getList = async (query) => {
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  const skip = (page - 1) * limit

  // ✅ SEARCH CLEAN
  const searchString =
    typeof query.search === 'string'
      ? query.search
      : Array.isArray(query.search)
      ? query.search.join(' ')
      : ''

  const keywords = [
    ...new Set(
      searchString
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter(Boolean)
    )
  ]

  // ✅ PRICE SAFE
  const minPrice = Number(query.minPrice)
  const maxPrice = Number(query.maxPrice)

  const priceFilter = {}
  if (!isNaN(minPrice)) priceFilter.gte = minPrice
  if (!isNaN(maxPrice)) priceFilter.lte = maxPrice

  // ✅ WHERE FINAL
  const where = {
    AND: [
      keywords.length
        ? {
            OR: keywords.map((word) => ({
              name: {
                contains: word,
                mode: 'insensitive'
              }
            }))
          }
        : undefined,

      Object.keys(priceFilter).length
        ? { price: priceFilter }
        : undefined
    ].filter(Boolean)
  }

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        images: true
      }
    }),
    prisma.product.count({ where })
  ])

  return {
    data,
    meta: {
      page,
      limit,
      total
    }
  }
}

export const getDetail = async (id) => {
  return await prisma.product.findUnique({
    where: { id: Number(id) },
    include: {
      images: true
    }
  })
}

// ✅ [SERVICE] Xử lý nghiệp vụ Thêm Sản phẩm
export const create = async (data) => {
  // Prisma sẽ tự động insert dữ liệu vào các bảng liên quan nếu dùng nested create
  return await prisma.product.create({
    data: {
      name: data.name,
      description: data.description || '', // Default rỗng nếu không truyền
      price: Number(data.price),
      stock: data.stock ? Number(data.stock) : 0,
      
      // Nếu có mảng URLs ảnh gửi lên, tạo luôn record cho bảng ProductImage
      ...(data.images && data.images.length > 0 && {
        images: {
          create: data.images.map(imgUrl => ({ url: imgUrl }))
        }
      })
    },
    include: {
      images: true // Trả về luôn thông tin ảnh vừa tạo
    }
  })
}

// ✅ [SERVICE] Xử lý nghiệp vụ Cập nhật Sản phẩm
export const update = async (id, data) => {
  // Xóa ảnh cũ nếu có truyền danh sách ảnh mới (đơn giản hóa logic cập nhật ảnh)
  if (data.images && data.images.length > 0) {
    await prisma.productImage.deleteMany({ where: { productId: Number(id) } });
  }

  return await prisma.product.update({
    where: { id: Number(id) },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.price && { price: Number(data.price) }),
      ...(data.stock !== undefined && { stock: Number(data.stock) }),
      
      // Tạo lại mảng ảnh mới sau khi đã xóa mảng cũ 
      ...(data.images && data.images.length > 0 && {
        images: {
          create: data.images.map(imgUrl => ({ url: imgUrl }))
        }
      })
    },
    include: {
      images: true
    }
  })
}

// ✅ [SERVICE] Xử lý nghiệp vụ Xóa Sản phẩm
export const remove = async (id) => {
  // Do có khoá ngoại với bảng ProductImage, CartItem, OrderItem 
  // Ở đây xoá ProductImage trước, trong thực tế nên cân nhắc status = 'DELETED' (Soft Delete)
  await prisma.productImage.deleteMany({
    where: { productId: Number(id) }
  })
  
  // Xoá Variant (nếu có)
  await prisma.productVariant.deleteMany({
    where: { productId: Number(id) }
  })

  // Cuối cùng xoá Product
  return await prisma.product.delete({
    where: { id: Number(id) }
  })
}

// ✅ [SERVICE] [IMPORT EXCEL] Xử lý hàng loạt sản phẩm
export const importProducts = async (data) => {
  let count = 0;
  for (const row of data) {
    const productId = Number(row.id || row.ID);
    const stock = Number(row.stock || row.Stock);
    const price = Number(row.price || row.Price);
    const name = row.name || row.Name;
    const category = row.category || row.Category;
    const description = row.description || row.Description;

    if (productId && !isNaN(productId)) {
      // 1. Cập nhật sản phẩm hiện có
      await prisma.product.update({
        where: { id: productId },
        data: {
          ...(row.stock !== undefined && { stock: stock }), // Cập nhật số lượng mới
          ...(price && { price: price }),
          ...(name && { name: name }),
          ...(category && { category: category }),
          ...(description !== undefined && { description: description })
        }
      });
      count++;
    } else if (name) {
      // 2. Tạo sản phẩm mới hoàn toàn
      await prisma.product.create({
        data: {
          name: name,
          category: category || 'General',
          price: price || 0,
          stock: stock || 0,
          description: description || ''
        }
      });
      count++;
    }
  }
  return { count };
}

// ✅ [SERVICE] [EXPORT TEMPLATE] Lấy dữ liệu sản phẩm để làm mẫu Excel
export const getExportTemplateData = async () => {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      price: true,
      stock: true
    },
    orderBy: { id: 'asc' }
  });
  
  if (products.length === 0) {
    // Nếu chưa có SP nào, trả về 1 dòng ví dụ
    return [{
      id: '',
      name: 'Nike Air Force 1 (Ví dụ)',
      category: 'Shoes',
      price: 1500000,
      stock: 50
    }];
  }
  
  return products;
}