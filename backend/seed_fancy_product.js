import { prisma } from './src/config/prisma.js';

async function main() {
  const p = await prisma.product.create({
    data: {
      name: "Áo Polo Nam Premium - VibeCart Edition",
      description: "Áo Polo chất liệu cá sấu cao cấp, co giãn 4 chiều, thấm hút mồ hôi cực tốt. Thiết kế form dáng ôm nhẹ, tôn dáng người mặc.",
      category: "Fashion",
      price: 350000,
      stock: 500,
      sizeChart: JSON.stringify({
        "S": "45kg - 55kg",
        "M": "56kg - 65kg",
        "L": "66kg - 75kg",
        "XL": "76kg - 85kg"
      }),
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80" },
          { url: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=80" }
        ]
      },
      variants: {
        create: [
          { name: "S - Trắng", size: "S", color: "Trắng", stock: 50, sku: "POLO-W-S" },
          { name: "M - Trắng", size: "M", color: "Trắng", stock: 50, sku: "POLO-W-M" },
          { name: "S - Đen", size: "S", color: "Đen", stock: 50, sku: "POLO-B-S" },
          { name: "M - Đen", size: "M", color: "Đen", stock: 50, sku: "POLO-B-M" },
          { name: "L - Xanh Navy", size: "L", color: "Xanh Navy", stock: 50, sku: "POLO-N-L" },
          { name: "XL - Xanh Navy", size: "XL", color: "Xanh Navy", stock: 50, sku: "POLO-N-XL" }
        ]
      }
    }
  });
  console.log("Created sophisticated product ID:", p.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
