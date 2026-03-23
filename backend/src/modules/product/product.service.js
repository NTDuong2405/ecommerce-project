import { prisma } from "../../config/prisma.js"

// Helper: Áp dụng giảm giá từ chiến dịch Marketing đang chạy
const applyMarketingDiscount = async (products) => {
  const now = new Date();
  // Tìm khuyến mãi chung (userId null) và đang active, ko tính birthday (định danh bằng code ko bắt đầu bằng BDAY)
  const activePromo = await prisma.promotion.findFirst({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
      userId: null,
      NOT: {
        code: { startsWith: 'BDAY' }
      }
    },
    orderBy: { discount: 'desc' } // Lấy cái giảm sâu nhất nếu có nhiều campaign
  });

  const discount = activePromo ? activePromo.discount : 0;

  const processProduct = (p) => {
    if (!p) return p;
    if (discount > 0) {
      return {
        ...p,
        originalPrice: p.price,
        price: p.price * (1 - discount / 100),
        discountPercentage: discount
      };
    }
    return {
        ...p,
        originalPrice: p.price,
        discountPercentage: 0
    };
  };

  if (Array.isArray(products)) {
    return products.map(processProduct);
  }
  return processProduct(products);
};

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
        : undefined,
      
      query.category
        ? { category: { equals: query.category, mode: 'insensitive' } }
        : undefined,

      query.subCategory
        ? { subCategory: { equals: query.subCategory, mode: 'insensitive' } }
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
        images: true,
        variants: true
      }
    }),
    prisma.product.count({ where })
  ])

  const processedData = await applyMarketingDiscount(data);

  return {
    data: processedData,
    meta: {
      page,
      limit,
      total
    }
  }
}

export const getDetail = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: {
      images: true,
      variants: true
    }
  });

  return await applyMarketingDiscount(product);
}

// ✅ [SERVICE] Xử lý nghiệp vụ Thêm Sản phẩm
export const create = async (data) => {
  // Prisma sẽ tự động insert dữ liệu vào các bảng liên quan nếu dùng nested create
  return await prisma.product.create({
    data: {
      name: data.name,
      description: data.description || '',
      category: data.category || 'General',
      price: Number(data.price),
      stock: data.stock ? Number(data.stock) : 0,
      sizeChart: data.sizeChart || null,
      
      ...(data.images && data.images.length > 0 && {
        images: {
          create: data.images.map(imgUrl => ({ url: imgUrl }))
        }
      }),

      ...(data.variants && data.variants.length > 0 && {
        variants: {
          create: data.variants.map(v => ({
            name: v.name || `${v.size || ''} - ${v.color || ''}`,
            size: v.size,
            color: v.color,
            price: v.price ? Number(v.price) : null,
            stock: Number(v.stock || 0),
            sku: v.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
          }))
        }
      })
    },
    include: {
      images: true,
      variants: true
    }
  })
}

// ✅ [SERVICE] Xử lý nghiệp vụ Cập nhật Sản phẩm
export const update = async (id, data) => {
  console.log("Service update starting for ID:", id);
  // Xóa ảnh cũ nếu có truyền danh sách ảnh mới (đơn giản hóa logic cập nhật ảnh)
  // Xóa ảnh cũ nếu update mảng ảnh mới
  if (data.images && data.images.length > 0) {
    console.log("Deleting old images...");
    await prisma.productImage.deleteMany({ where: { productId: Number(id) } });
  }

  // Xóa variants cũ để ghi đè (đơn giản hóa logic sync)
  if (data.variants && data.variants.length > 0) {
    console.log("Deleting old variants...");
    await prisma.productVariant.deleteMany({ where: { productId: Number(id) } });
  }
  
  console.log("Updating product with Prisma...");

  return await prisma.product.update({
    where: { id: Number(id) },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.category && { category: data.category }),
      ...(data.price && { price: Number(data.price) }),
      ...(data.stock !== undefined && { stock: Number(data.stock) }),
      ...(data.sizeChart !== undefined && { sizeChart: data.sizeChart }),
      
      ...(data.images && data.images.length > 0 && {
        images: {
          create: data.images.map(imgUrl => ({ url: imgUrl }))
        }
      }),

      ...(data.variants && data.variants.length > 0 && {
        variants: {
          create: data.variants.map(v => ({
            name: v.name || `${v.size || ''} - ${v.color || ''}`,
            size: v.size,
            color: v.color,
            price: v.price ? Number(v.price) : null,
            stock: Number(v.stock || 0),
            sku: v.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
          }))
        }
      })
    },
    include: {
      images: true,
      variants: true
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
    const sizeChart = row.sizeChart || row.SizeChart;

    const variantData = row.variants || []; // Có thể là mảng nested JSON

    const productPayload = {
      ...(row.stock !== undefined && { stock: stock }),
      ...(price && { price: price }),
      ...(name && { name: name }),
      ...(category && { category: category }),
      ...(description !== undefined && { description: description }),
      ...(sizeChart !== undefined && { sizeChart: sizeChart })
    };

    if (productId && !isNaN(productId)) {
      // 1. Cập nhật sản phẩm hiện có
      await prisma.product.update({
        where: { id: productId },
        data: {
          ...productPayload,
          ...(variantData.length > 0 && {
            variants: {
              deleteMany: {},
              create: variantData.map(v => ({
                name: v.name || `${v.size || ''} - ${v.color || ''}`,
                size: v.size?.toString(),
                color: v.color?.toString(),
                price: v.price ? Number(v.price) : null,
                stock: Number(v.stock || 0),
                sku: v.sku || `IMPORT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
              }))
            }
          })
        }
      });
      count++;
    } else if (name) {
      // 2. Tạo mới hoàn toàn
      await prisma.product.create({
        data: {
          ...productPayload,
          category: category || 'General',
          ...(variantData.length > 0 && {
            variants: {
              create: variantData.map(v => ({
                name: v.name || `${v.size || ''} - ${v.color || ''}`,
                size: v.size?.toString(),
                color: v.color?.toString(),
                price: v.price ? Number(v.price) : null,
                stock: Number(v.stock || 0),
                sku: v.sku || `IMPORT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
              }))
            }
          })
        }
      });
      count++;
    }
  }
  return { count };
}

// ✅ [SERVICE] [EXPORT TEMPLATE] Lấy toàn bộ dữ liệu sản phẩm để làm mẫu Excel hoặc sao lưu
export const getExportTemplateData = async () => {
  const products = await prisma.product.findMany({
    include: {
      images: true,
      variants: true
    },
    orderBy: { id: 'asc' }
  });
  
  if (products.length === 0) {
    // Nếu chưa có SP nào, trả về 1 dòng ví dụ
    return [{
      id: '',
      name: 'Áo Vibe (Ví dụ)',
      description: 'Mô tả sản phẩm mẫu của bạn...',
      category: 'Fashion',
      price: 250000,
      stock: 100,
      images: 'https://example.com/image1.jpg, https://example.com/image2.jpg',
      sizeChart: '{"S":"40-50kg","M":"50-60kg"}',
      variants: '[{"size":"S","color":"Trắng","stock":50},{"size":"M","color":"Đen","stock":50}]'
    }];
  }
  
  // Format lại để xuất ra Excel (làm dẹt mảng con)
  return products.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description || '',
    category: p.category || 'General',
    price: p.price,
    stock: p.stock,
    sizeChart: p.sizeChart || '',
    images: p.images.map(img => img.url).join(', '),
    variants: p.variants.length > 0 ? JSON.stringify(p.variants.map(v => ({
       size: v.size,
       color: v.color,
       stock: v.stock,
       sku: v.sku
    }))) : ''
  }));
}