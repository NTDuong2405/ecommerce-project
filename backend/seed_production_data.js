import { prisma } from './src/config/prisma.js';

async function main() {
  // console.log('--- Cleaning up existing data ---');
  // await prisma.productVariant.deleteMany();
  // await prisma.productImage.deleteMany();
  // await prisma.product.deleteMany();

  console.log('--- Starting Production Seeding ---');

  // 1. Áo Polo (Fashion)
  await prisma.product.create({
    data: {
      name: 'Áo Polo Cotton Pique Premium',
      description: 'Chất vải Pique thoáng khí, giữ form cực tốt. Phù hợp đi làm và đi chơi.',
      category: 'Fashion',
      price: 299000,
      stock: 450,
      sizeChart: JSON.stringify({ "S": "50-60kg", "M": "61-70kg", "L": "71-80kg", "XL": "81-90kg" }),
      images: { create: [{ url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80' }] },
      variants: {
        create: [
          { name: 'S - Trắng', size: 'S', color: 'Trắng', stock: 50, sku: 'POLO-W-S' },
          { name: 'M - Trắng', size: 'M', color: 'Trắng', stock: 50, sku: 'POLO-W-M' },
          { name: 'L - Trắng', size: 'L', color: 'Trắng', stock: 50, sku: 'POLO-W-L' },
          { name: 'S - Đen', size: 'S', color: 'Đen', stock: 50, sku: 'POLO-B-S' },
          { name: 'M - Đen', size: 'M', color: 'Đen', stock: 50, sku: 'POLO-B-M' }
        ]
      }
    }
  });

  // 2. Tai nghe (Tech)
  await prisma.product.create({
    data: {
      name: 'Tai nghe Bluetooth Noise Cancelling',
      description: 'Chống ồn chủ động ANC, pin trâu 40h, âm thanh Hi-Res Audio.',
      category: 'Tech',
      price: 2450000,
      stock: 80,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' }] },
      variants: {
        create: [
          { name: 'Đen Tuyển', color: 'Đen', stock: 50, sku: 'HEAD-B' },
          { name: 'Trắng Bạc', color: 'Trắng', stock: 30, sku: 'HEAD-W' }
        ]
      }
    }
  });

  // 3. Bàn phím cơ (Tech)
  await prisma.product.create({
    data: {
      name: 'Bàn phím cơ VibeRGB Pro',
      description: 'Hỗ trợ thay switch nóng (Hot-swap), đèn LED RGB triệu màu, kết nối 3 chế độ.',
      category: 'Tech',
      price: 1250000,
      stock: 60,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80' }] },
      variants: {
        create: [
          { name: 'Linear Switch', color: 'Xám Space', stock: 30, sku: 'KB-LIN-GR' },
          { name: 'Clicky Switch', color: 'Trắng Tuyết', stock: 30, sku: 'KB-CLK-WH' }
        ]
      }
    }
  });

  // 4. Set Dưỡng da (Beauty)
  await prisma.product.create({
    data: {
      name: 'Bộ Skincare Glow & Radiance',
      description: 'Chiết xuất tự nhiên, giúp sáng da mờ thâm. Phù hợp mọi loại da.',
      category: 'Beauty',
      price: 890000,
      stock: 120,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80' }] },
      variants: {
        create: [
          { name: 'Full Set 3 món', color: 'Original', stock: 120, sku: 'SKIN-FS' }
        ]
      }
    }
  });

  // 5. Nước hoa (Beauty)
  await prisma.product.create({
    data: {
      name: 'Nước hoa Vibe Bloom EDP',
      description: 'Hương hoa nhài và gỗ tuyết tùng trầm ấm. Lưu hương trên 8 tiếng.',
      category: 'Beauty',
      price: 1350000,
      stock: 45,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80' }] },
      variants: {
        create: [
          { name: 'Chai 50ml', color: 'Rose Gold', stock: 45, sku: 'PERF-50' }
        ]
      }
    }
  });

  // 6. Đèn thông minh (Home)
  await prisma.product.create({
    data: {
      name: 'Đèn bàn Smart LED Vibe',
      description: 'Điều khiển qua App, thay đổi độ sáng và nhiệt độ màu bảo vệ mắt.',
      category: 'Home',
      price: 650000,
      stock: 150,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&w=800&q=80' }] },
      variants: {
        create: [
          { name: 'Đế Gỗ', color: 'Gỗ Tự Nhiên', stock: 75, sku: 'LAMP-WOOD' },
          { name: 'Đế Kim Loại', color: 'Đen Mờ', stock: 75, sku: 'LAMP-METAL' }
        ]
      }
    }
  });

  // 7. Ví da (Accessories)
  await prisma.product.create({
    data: {
      name: 'Ví da Crossgrain Leather',
      description: 'Da thật 100%, thiết kế mỏng nhẹ, nhiều ngăn chứa thẻ tiện dụng.',
      category: 'Accessories',
      price: 420000,
      stock: 200,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80' }] },
      variants: {
        create: [
          { name: 'Nâu Classic', color: 'Nâu', stock: 100, sku: 'WAL-BR' },
          { name: 'Đen Sang Trọng', color: 'Đen', stock: 100, sku: 'WAL-BK' }
        ]
      }
    }
  });

  console.log('✅ Created: Diverse category set');
  console.log('--- Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
