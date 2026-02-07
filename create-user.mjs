import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import pg from "pg";

const [, , rawEmail, rawPassword, ...nameParts] = process.argv;

if (!rawEmail || !rawPassword) {
  console.error("Usage: npm run create:user -- <email> <password> [name]");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const email = rawEmail.toLowerCase();
const password = rawPassword;
const name = nameParts.join(" ").trim() || null;

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

try {
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
    },
    create: {
      email,
      name,
      passwordHash,
    },
  });

  console.log(`User ready: ${user.email} (${user.id})`);
} finally {
  await prisma.$disconnect();
  await pool.end();
}
