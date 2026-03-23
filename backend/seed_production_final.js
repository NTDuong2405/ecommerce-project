import { prisma } from './src/config/prisma.js';

async function main() {
  console.log('🚀 Starting Final Production Seeding...');

  // 1. Clear existing data safely (optional, but requested for 'chuẩn' data)
  // Note: We avoid deleteMany for foreign keys if possible, but for a fresh start:
  // await prisma.orderItem.deleteMany();
  // await prisma.cartItem.deleteMany();
  // await prisma.productVariant.deleteMany();
  // await prisma.productImage.deleteMany();
  // await prisma.product.deleteMany();

  const products = [
    // --- FASHION ---
    {
      name: 'Modern Silk Ao Dai - "Heritage Bliss"',
      description: 'A contemporary take on Vietnam\'s traditional attire. Hand-stitched with premium silk, featuring a high-slit design and minimalist floral embroidery. Perfect for modern celebrations.',
      category: 'Fashion',
      subCategory: 'Áo Dài',
      price: 2450000,
      stock: 45,
      images: [
        'https://images.unsplash.com/photo-1588612144218-12cb23fd354b?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=1200'
      ],
      sizeChart: JSON.stringify({ S: "40-48kg", M: "49-55kg", L: "56-65kg", XL: "66-75kg" }),
      variants: [
        { size: 'S', color: 'Pearl White', stock: 10, price: 2450000 },
        { size: 'M', color: 'Pearl White', stock: 15, price: 2450000 },
        { size: 'L', color: 'Pearl White', stock: 10, price: 2450000 },
        { size: 'M', color: 'Emerald Green', stock: 10, price: 2650000 }
      ]
    },
    {
      name: 'Hades "Cyberpunk" Oversized Tee',
      description: 'Streetwear legend from Saigon. Heavyweight cotton (320gsm), dropping shoulders, and glow-in-the-dark graphic prints. Authentic urban style.',
      category: 'Fashion',
      subCategory: 'Streetwear',
      price: 550000,
      stock: 120,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=1200'
      ],
      sizeChart: JSON.stringify({ S: "Oversized 50-65kg", M: "Oversized 66-80kg", L: "Oversized 81-100kg" }),
      variants: [
        { size: 'S', color: 'Phantom Black', stock: 40, price: 550000 },
        { size: 'M', color: 'Phantom Black', stock: 50, price: 550000 },
        { size: 'L', color: 'Phantom Black', stock: 30, price: 550000 }
      ]
    },
    {
      name: 'Levis 501 Original Selvedge Jeans',
      description: 'The definitive denim. Features an iconic straight fit and signature button fly. Crafted with heavy selvedge non-stretch denim.',
      category: 'Fashion',
      subCategory: 'Pants',
      price: 2850000,
      stock: 80,
      images: [
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1583743814966-faef02215131?auto=format&fit=crop&q=80&w=1200'
      ],
      sizeChart: JSON.stringify({ "28": "Waist 72cm", "30": "Waist 77cm", "32": "Waist 82cm", "34": "Waist 87cm" }),
      variants: [
        { size: '28', color: 'Indigo', stock: 20, price: 2850000 },
        { size: '30', color: 'Indigo', stock: 20, price: 2850000 },
        { size: '32', color: 'Indigo', stock: 25, price: 2850000 },
        { size: '34', color: 'Indigo', stock: 15, price: 2850000 }
      ]
    },

    // --- TECH ---
    {
      name: 'iPhone 16 Pro Max - Titanium Grey',
      description: 'The pinnacle of mobile technology. Grade 5 Titanium frame, A18 Pro chip, and the revolutionary Camera Control button. 1TB Storage.',
      category: 'Tech',
      subCategory: 'Smartphone',
      price: 44990000,
      stock: 15,
      images: [
        'https://images.unsplash.com/photo-1678911820864-e2c567c655d7?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba3f21?auto=format&fit=crop&q=80&w=1200'
      ],
      variants: [
        { size: '1TB', color: 'Natural Titanium', stock: 5, price: 44990000 },
        { size: '512GB', color: 'Natural Titanium', stock: 10, price: 39990000 },
        { size: '1TB', color: 'Black Titanium', stock: 5, price: 44990000 }
      ]
    },
    {
      name: 'Sony WH-1000XM5 Wireless Headphones',
      description: 'World-class noise cancellation. Two processors control 8 microphones for unprecedented quiet. 30-hour battery life and touch controls.',
      category: 'Tech',
      subCategory: 'Audio',
      price: 8490000,
      stock: 30,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=1200'
      ],
      variants: [
        { size: 'Standard', color: 'Midnight Blue', stock: 15, price: 8490000 },
        { size: 'Standard', color: 'Silver', stock: 15, price: 8490000 }
      ]
    },

    // --- BEAUTY ---
    {
      name: 'Cocoon Coffee Body Polish - 200ml',
      description: 'Vegan clean beauty from Vietnam. Made from Dak Lak coffee beans and cocoa butter. Removes dead skin for smooth, radiant results.',
      category: 'Beauty',
      subCategory: 'Skincare',
      price: 195000,
      stock: 500,
      images: [
        'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=1200'
      ],
      variants: [
        { size: '200ml', color: 'Natural', stock: 500, price: 195000 }
      ]
    },
    {
      name: 'La Roche-Posay Anthelios UVmune 400',
      description: 'The gold standard in sun protection. Lightweight, non-greasy, and suitable for the most sensitive skin. High SPF 50+ protection.',
      category: 'Beauty',
      subCategory: 'Skincare',
      price: 495000,
      stock: 200,
      images: [
        'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=1200'
      ],
      variants: [
        { size: '50ml', color: 'Invisible Finish', stock: 200, price: 495000 }
      ]
    },

    // --- HOME ---
    {
      name: 'Handwoven Seagrass Basket Set',
      description: 'Eco-friendly storage solution handcrafted by artisans in Ninh Binh. Natural seagrass with a minimalist check pattern. Set of 3 sizes.',
      category: 'Home',
      subCategory: 'Pottery/Basket',
      price: 850000,
      stock: 60,
      images: [
        'https://images.unsplash.com/photo-1591534065671-33230a1bf804?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1524634126442-357e0eac3c14?auto=format&fit=crop&q=80&w=1200'
      ],
      variants: [
        { size: 'Set of 3', color: 'Natural/Beige', stock: 60, price: 850000 }
      ]
    },
    {
      name: 'Minimalist Nordic Ceramic Vase',
      description: 'Elegant Bat Trang ceramic with a matte finish. Unique organic shape that complements modern interior styles. Durable and high-temperature fired.',
      category: 'Home',
      subCategory: 'Vase',
      price: 320000,
      stock: 100,
      images: [
        'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1578500494198-246f61203b3d?auto=format&fit=crop&q=80&w=1200'
      ],
      variants: [
        { size: 'Medium (25cm)', color: 'Off-White', stock: 50, price: 320000 },
        { size: 'Large (35cm)', color: 'Sandstorm', stock: 50, price: 450000 }
      ]
    },

    // --- ACCESSORIES ---
    {
      name: 'Leinné "Raffia" Handcrafted Bag',
      description: 'Luxury resort wear accessory. Hand-woven raffia with premium calfskin leather handles. Designed for the nomadic spirit.',
      category: 'Accessories',
      subCategory: 'Bag',
      price: 3800000,
      stock: 20,
      images: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=1200'
      ],
      variants: [
        { size: 'Medium', color: 'Natural Straw', stock: 10, price: 3800000 },
        { size: 'Large', color: 'Natural Straw', stock: 10, price: 4200000 }
      ]
    },
    {
      name: 'Apple Watch Series 10 - Silver Alum',
      description: 'Thinnest, biggest display yet. Intelligent health tracking, advanced workout metrics, and fall detection. The perfect wrist companion.',
      category: 'Accessories',
      subCategory: 'Watch',
      price: 10990000,
      stock: 40,
      images: [
        'https://images.unsplash.com/photo-1544117518-30dd5f2f109e?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=1200'
      ],
      variants: [
        { size: '45mm', color: 'Silver', stock: 20, price: 10990000 },
        { size: '41mm', color: 'Silver', stock: 20, price: 9990000 }
      ]
    }
  ];

  for (const p of products) {
    const { variants, images, ...productData } = p;
    
    const createdProduct = await prisma.product.create({
      data: {
        ...productData,
        images: {
          create: images.map(url => ({ url }))
        },
        variants: {
          create: variants.map(v => ({
            ...v,
            name: v.name || `${v.size || ""} ${v.color || ""}`.trim() || productData.name,
            sku: v.sku || `PROD-${Math.random().toString(36).substr(2, 7).toUpperCase()}`
          }))
        }
      }
    });
    console.log(`✅ Created: ${createdProduct.name}`);
  }

  console.log('✨ Seeding complete! Your store is now ready for production.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
