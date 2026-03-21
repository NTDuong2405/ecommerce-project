import { prisma } from '../src/config/prisma.js';

async function main() {
  console.log('Seeding data...');

  // Check if seeded
  const existingProducts = await prisma.product.count();
  if (existingProducts > 0) {
    console.log('Database already seeded!');
    return;
  }

  // Seed Products
  const pt1 = await prisma.product.create({
    data: {
      name: 'Minimalist Watch',
      description: 'Elegant titanium watch with leather strap',
      price: 129.00,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' }] },
      variants: { create: [{ name: 'Standard', price: 129.00, stock: 45, sku: 'MW-001' }] }
    }
  });

  const pt2 = await prisma.product.create({
    data: {
      name: 'Premium Headphones',
      description: 'Noise-cancelling over-ear headphones',
      price: 249.00,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' }] },
      variants: { create: [{ name: 'Black', price: 249.00, stock: 12, sku: 'PH-002' }] }
    }
  });

  const pt3 = await prisma.product.create({
    data: {
      name: 'Running Sneakers X',
      description: 'Lightweight performance sneakers',
      price: 189.00,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80' }] },
      variants: { create: [{ name: 'Size 42', price: 189.00, stock: 8, sku: 'RSX-042' }] }
    }
  });

  const pt4 = await prisma.product.create({
    data: {
      name: 'Vintage Camera',
      description: 'Classic 35mm film camera in perfect condition',
      price: 890.00,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80' }] },
      variants: { create: [{ name: 'Silver', price: 890.00, stock: 3, sku: 'VC-SLV' }] }
    }
  });

  // Seed Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vibecart.com' },
    update: {},
    create: { email: 'admin@vibecart.com', password: 'hashedpassword', role: 'ADMIN' }
  });

  const c1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: { email: 'john@example.com', password: 'hashedpassword', role: 'USER' }
  });

  const c2 = await prisma.user.upsert({
    where: { email: 'sarah@example.com' },
    update: {},
    create: { email: 'sarah@example.com', password: 'hashedpassword', role: 'USER' }
  });

  // Seed Orders
  await prisma.order.create({
    data: {
      userId: c1.id,
      totalPrice: 249.00,
      status: 'PENDING',
      items: { create: [{ productId: pt2.id, quantity: 1, price: 249.00 }] }
    }
  });

  await prisma.order.create({
    data: {
      userId: c2.id,
      totalPrice: 129.00,
      status: 'CONFIRMED',
      items: { create: [{ productId: pt1.id, quantity: 1, price: 129.00 }] }
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
