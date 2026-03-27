import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const count = await prisma.product.count({
    where: {
      subCategory: {
        equals: 'Streetwear',
        mode: 'insensitive'
      }
    }
  })
  console.log(`Products with subCategory 'Streetwear': ${count}`)
  
  const allSubs = await prisma.product.findMany({
    select: { subCategory: true },
    distinct: ['subCategory']
  })
  console.log('Distinct subCategories:', allSubs.map(s => s.subCategory))
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
