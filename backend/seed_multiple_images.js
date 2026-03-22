import { prisma } from './src/config/prisma.js';

const genericImagePool = [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544117518-2b49c71e3984?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508685096489-7abac8f1baad?auto=format&fit=crop&w=800&q=80'
];

async function seed() {
    console.log('🚀 Starting to seed multiple images for products...');
    
    try {
        const products = await prisma.product.findMany();
        console.log(`Found ${products.length} products.`);

        for (const product of products) {
            console.log(`Updating product: ${product.name} (ID: ${product.id})`);
            
            // Xóa ảnh cũ
            await prisma.productImage.deleteMany({
                where: { productId: product.id }
            });

            // Chọn ngẫu nhiên 3-4 ảnh từ pool
            const shuffled = [...genericImagePool].sort(() => 0.5 - Math.random());
            const selectedImages = shuffled.slice(0, 3 + Math.floor(Math.random() * 2));

            // Thêm ảnh mới
            await prisma.product.update({
                where: { id: product.id },
                data: {
                    images: {
                        create: selectedImages.map(url => ({ url }))
                    }
                }
            });
        }

        console.log('✅ Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error during seeding:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
