import { prisma } from '../src/config/prisma.js';

async function main() {
  const email = 'ntduonga15568@gmail.com';
  console.log(`Seeding custom order for ${email}...`);

  // 1. Get a product
  const product = await prisma.product.findFirst();
  if (!product) {
    console.error('No products found to create an order.');
    return;
  }

  // 2. Create the order
  const order = await prisma.order.create({
    data: {
      customerName: 'Người Dùng Test',
      customerEmail: email,
      customerPhone: '0123456789',
      address: '123 Đường ABC, Quận 1',
      city: 'Hồ Chí Minh',
      totalPrice: product.price * 1 + 30000, // Price + 30k shipping
      status: 'SHIPPING',
      shippingMethod: 'Giao hàng Nhanh',
      note: 'Giao trong giờ hành chính giúp em ạ',
      items: {
        create: [
          {
            productId: product.id,
            quantity: 1,
            price: product.price
          }
        ]
      }
    }
  });

  console.log(`✅ Order created successfully! ID: ${order.id}`);
  console.log(`Tracking Info:`);
  console.log(`Order ID: ${order.id}`);
  console.log(`Contact: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
