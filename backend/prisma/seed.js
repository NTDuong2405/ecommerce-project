import 'dotenv/config';
import { prisma } from '../src/config/prisma.js';

async function main() {
  console.log('🚀 Đang bắt đầu seeding dữ liệu "hàng hiệu" cho VibeCart...');

  try {
    // 1. CLEAR DATA
    await prisma.notification.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.promotion.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany({ where: { role: 'USER' } });

    console.log('✅ Đã dọn dẹp database.');

    // 2. KHÁCH HÀNG (15 users)
    const customers = [];
    for (let i = 1; i <= 15; i++) {
      customers.push(await prisma.user.create({
        data: {
          email: `customer${i}@example.com`,
          password: 'password123',
          fullName: `Nguyen Van ${String.fromCharCode(65 + i)}`,
          role: 'USER',
          birthday: new Date(1995, i % 12, (i * 5) % 28)
        }
      }));
    }

    // 3. DANH SÁCH SẢN PHẨM "THẬT" (30 products)
    const realProducts = [
      { name: 'Nike Air Force 1 07', cat: 'Shoes', sub: 'Sneakers', price: 110, img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80' },
      { name: 'Adidas Ultraboost 22', cat: 'Shoes', sub: 'Sneakers', price: 190, img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80' },
      { name: 'Jordan 1 Retro High', cat: 'Shoes', sub: 'Sneakers', price: 170, img: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500&q=80' },
      { name: 'Yeezy Boost 350', cat: 'Shoes', sub: 'Sneakers', price: 230, img: 'https://images.unsplash.com/photo-1586525198428-225f6f12cff5?w=500&q=80' },
      { name: 'Gucci Marmont Bag', cat: 'Bags', sub: 'Handbag', price: 2500, img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80' },
      { name: 'LV Neverfull MM', cat: 'Bags', sub: 'Handbag', price: 2100, img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=80' },
      { name: 'Prada Cleo Bag', cat: 'Bags', sub: 'Handbag', price: 2800, img: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&q=80' },
      { name: 'Hermes Birkin 25', cat: 'Bags', sub: 'Handbag', price: 9500, img: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=500&q=80' },
      { name: 'Rolex Submariner', cat: 'Accessories', sub: 'Watch', price: 12000, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80' },
      { name: 'Apple Watch Ultra', cat: 'Accessories', sub: 'Watch', price: 799, img: 'https://images.unsplash.com/photo-1434493907317-a46b5bc78344?w=500&q=80' },
      { name: 'Ray-Ban Aviator', cat: 'Accessories', sub: 'Glasses', price: 160, img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80' },
      { name: 'Supreme Box Logo Tee', cat: 'Clothing', sub: 'T-Shirt', price: 400, img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80' },
      { name: 'Off-White Hoodie', cat: 'Clothing', sub: 'Streetwear', price: 550, img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80' },
      { name: 'Levi 501 Original', cat: 'Clothing', sub: 'Pants', price: 80, img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80' },
      { name: 'Polo Ralph Lauren', cat: 'Clothing', sub: 'Polo', price: 120, img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80' },
      { name: 'iPhone 16 Pro Max', cat: 'Tech', sub: 'Smartphone', price: 1200, img: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&q=80' },
      { name: 'MacBook Pro M3', cat: 'Tech', sub: 'Laptop', price: 2500, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80' },
      { name: 'Sony WH-1000XM5', cat: 'Tech', sub: 'Audio', price: 350, img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80' },
    ];

    const products = [];
    for (const p of realProducts) {
      products.push(await prisma.product.create({
        data: {
          name: p.name,
          category: p.cat,
          subCategory: p.sub || null,
          price: p.price,
          stock: 50,
          description: `Sản phẩm cao cấp ${p.name} chuẩn quốc tế.`,
          images: {
            create: [{ url: p.img }]
          }
        }
      }));
    }

    // Nhân đôi danh sách cho đủ 30
    for (let i = 0; i < 15; i++) {
        const source = realProducts[i];
        products.push(await prisma.product.create({
          data: {
            name: `${source.name} Edition ${i}`,
            category: source.cat,
            subCategory: source.sub || null,
            price: source.price + 10,
            stock: 30,
            description: `Phiên bản giới hạn của ${source.name}.`,
            images: {
              create: [{ url: source.img }]
            }
          }
        }));
    }
    console.log(`✅ Đã tạo xong 30 sản phẩm với hình ảnh "thật".`);

    // 4. ĐƠN HÀNG (60 đơn cho biểu đồ thêm chi tiết)
    const statuses = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
    const methods = ['VNPAY', 'MOMO', 'COD'];

    for (let i = 0; i < 60; i++) {
      const user = customers[i % customers.length];
      const status = statuses[i % statuses.length];
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - (i % 45)); // Trải dài 45 ngày

      const p = products[i % products.length];
      const total = p.price + 15;

      await prisma.order.create({
        data: {
          userId: user.id,
          customerName: user.fullName,
          customerEmail: user.email,
          totalPrice: total,
          status: status,
          createdAt: orderDate,
          items: {
            create: [{ productId: p.id, quantity: 1, price: p.price }]
          },
          payment: status === 'DELIVERED' ? {
            create: {
              amount: total,
              method: methods[i % methods.length],
              status: 'SUCCESS',
              transactionId: `TXN${Date.now()}${i}`
            }
          } : undefined
        }
      });
    }

    console.log('✨ HOÀN TẤT SEEDING! Shop của Sếp giờ đã cực kỳ lung linh.');
  } catch (err) {
    console.error('❌ Lỗi Seeding:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
