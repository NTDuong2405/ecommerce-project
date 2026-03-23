import { prisma } from './src/config/prisma.js';
import * as productService from './src/modules/product/product.service.js';

async function testFilter() {
  console.log('--- Testing Category Filter for "Fashion" ---');
  const results = await productService.getList({ category: 'Fashion', limit: 5 });
  console.log(`Found ${results.data.length} items.`);
  results.data.forEach(p => {
    console.log(`- ${p.name} (Category: ${p.category})`);
  });
  
  if (results.data.some(p => p.category !== 'Fashion')) {
    console.log('❌ FAILED: Found items outside requested category.');
  } else {
    console.log('✅ PASSED: All items are inside requested category.');
  }

  process.exit(0);
}

testFilter();
