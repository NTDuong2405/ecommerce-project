import { prisma } from './src/config/prisma.js';

async function main() {
  console.log('--- Starting Production Seeding ---');

  // 1. Áo Polo (Phân loại: Fashion)
  const polo = await prisma.product.create({
    data: {
      name: 'Áo Polo Cotton Pique Premium',
      description: 'Chất vải Pique thoáng khí, giữ form cực tốt. Phù hợp đi làm và đi chơi.',
      category: 'Fashion',
      price: 299000,
      stock: 450,
      sizeChart: JSON.stringify({
        "S": "50-60kg",
        "M": "61-70kg",
        "L": "71-80kg",
        "XL": "81-90kg"
      }),
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80' },
          { url: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=80' }
        ]
      },
      variants: {
        create: [
          { name: 'S - Trắng', size: 'S', color: 'Trắng', stock: 50, sku: 'POLO-W-S' },
          { name: 'M - Trắng', size: 'M', color: 'Trắng', stock: 50, sku: 'POLO-W-M' },
          { name: 'L - Trắng', size: 'L', color: 'Trắng', stock: 50, sku: 'POLO-W-L' },
          { name: 'S - Đen', size: 'S', color: 'Đen', stock: 50, sku: 'POLO-B-S' },
          { name: 'M - Đen', size: 'M', color: 'Đen', stock: 50, sku: 'POLO-B-M' },
          { name: 'L - Đen', size: 'L', color: 'Đen', stock: 50, sku: 'POLO-B-L' },
          { name: 'S - Xanh Navy', size: 'S', color: 'Xanh Navy', stock: 50, sku: 'POLO-N-S' },
          { name: 'M - Xanh Navy', size: 'M', color: 'Xanh Navy', stock: 50, sku: 'POLO-N-M' },
          { name: 'L - Xanh Navy', size: 'L', color: 'Xanh Navy', stock: 100, sku: 'POLO-N-L' }
        ]
      }
    }
  });
  console.log('✅ Created: Áo Polo');

  // 2. Quần Jean (Phân loại: Fashion)
  const jeans = await prisma.product.create({
    data: {
      name: 'Quần Jean Slim Fit Co Giãn',
      description: 'Chất jean denim 12oz, co giãn nhẹ, ôm dáng nhưng vẫn thoải mái vận động.',
      category: 'Fashion',
      price: 550000,
      stock: 200,
      sizeChart: JSON.stringify({
        "29": "50-58kg",
        "30": "59-65kg",
        "31": "66-72kg",
        "32": "73-80kg",
        "33": "81-88kg"
      }),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80' }]
      },
      variants: {
        create: [
          { name: '29 - Xanh Sáng', size: '29', color: 'Xanh Sáng', stock: 30, sku: 'JEAN-LB-29' },
          { name: '30 - Xanh Sáng', size: '30', color: 'Xanh Sáng', stock: 30, sku: 'JEAN-LB-30' },
          { name: '31 - Xanh Sáng', size: '31', color: 'Xanh Sáng', stock: 30, sku: 'JEAN-LB-31' },
          { name: '32 - Xanh Sáng', size: '32', color: 'Xanh Sáng', stock: 10, sku: 'JEAN-LB-32' },
          { name: '29 - Xanh Đậm', size: '29', color: 'Xanh Đậm', stock: 30, sku: 'JEAN-DB-29' },
          { name: '30 - Xanh Đậm', size: '30', color: 'Xanh Đậm', stock: 30, sku: 'JEAN-DB-30' },
          { name: '32 - Xanh Đậm', size: '32', color: 'Xanh Đậm', stock: 40, sku: 'JEAN-DB-32' }
        ]
      }
    }
  });
  console.log('✅ Created: Quần Jean');

  // 3. Tai nghe (Phân loại: Tech - Không size chart)
  const headphones = await prisma.product.create({
    data: {
      name: 'Tai nghe Bluetooth Noise Cancelling',
      description: 'Chống ồn chủ động ANC, pin trâu 40h, âm thanh Hi-Res Audio.',
      category: 'Tech',
      price: 2450000,
      stock: 80,
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' }]
      },
      variants: {
        create: [
          { name: 'Đen Tuyển', color: 'Đen', stock: 50, sku: 'HEAD-B' },
          { name: 'Trắng Bạc', color: 'Trắng', stock: 30, sku: 'HEAD-W' }
        ]
      }
    }
  });
  console.log('✅ Created: Tai nghe Tech');

  // 4. Đồng hồ (Phân loại: Accessories - Không size chart)
  const watch = await prisma.product.create({
    data: {
      name: 'Đồng hồ Vibe Midnight Edition',
      description: 'Thiết kế sang trọng, tối giản. Chống nước 5ATM, kính saphire chống trầy.',
      category: 'Accessories',
      price: 1800000,
      stock: 120,
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80' }]
      },
      variants: {
        create: [
          { name: 'Midnight Black', color: 'Black', stock: 120, sku: 'WATCH-MB' }
        ]
      }
    }
  });
  console.log('✅ Created: Đồng hồ');

  // 5. Áo Khoác (Phân loại: Fashion)
  const jacket = await prisma.product.create({
    data: {
      name: 'Áo Khoác Bomber Vải Gió',
      description: 'Chống nước nhẹ, bo chun cổ tay và gấu áo. Phù hợp thời tiết se lạnh.',
      category: 'Fashion',
      price: 490000,
      stock: 150,
      sizeChart: JSON.stringify({
        "M": "55-65kg",
        "L": "66-75kg",
        "XL": "76-85kg",
        "XXL": "86-95kg"
      }),
      images: {
        create: [{ url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80' }]
      },
      variants: {
        create: [
          { name: 'M - Xanh Rêu', size: 'M', color: 'Xanh Rêu', stock: 30, sku: 'JK-G-M' },
          { name: 'L - Xanh Rêu', size: 'L', color: 'Xanh Rêu', stock: 40, sku: 'JK-G-L' },
          { name: 'XL - Xanh Rêu', size: 'XL', color: 'Xanh Rêu', stock: 5, sku: 'JK-G-XL' },
          { name: 'M - Xám', size: 'M', color: 'Xám', stock: 25, sku: 'JK-S-M' },
          { name: 'L - Xám', size: 'L', color: 'Xám', stock: 50, sku: 'JK-S-L' }
        ]
      }
    }
  });
  console.log('✅ Created: Áo Khoác');

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
