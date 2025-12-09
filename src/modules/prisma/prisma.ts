import "dotenv/config";
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});

export const prismaClient = new PrismaClient({
  adapter,
});

(async () => {
  try {
    await prismaClient.$queryRawUnsafe("SELECT 1");
    console.log("✅ Prisma connected to MariaDB successfully!");
  } catch (err) {
    console.error("❌ Prisma connection failed:", err);
  }
})();
