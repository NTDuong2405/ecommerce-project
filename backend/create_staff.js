import pkgPrisma from '@prisma/client';
import bcrypt from 'bcryptjs';
import pkgPg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const { PrismaClient } = pkgPrisma;
const { Pool } = pkgPg;

const pool = new Pool({
  connectionString: "postgresql://postgres:123456@localhost:5432/ecommerce_db?schema=public",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function create() {
  try {
    const email = 'staff@vibecart.com';
    const password = 'staff123456';
    const role = 'STAFF';

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log("❌ Staff account already exists!");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role
      }
    });

    console.log("✅ STAFF ACCOUNT CREATED!");
    console.log("📧 Email: " + email);
    console.log("🔑 Password: " + password);
    console.log("🛡️ Role: " + role);
  } catch (err) {
    console.error("Lỗi:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

create();
