import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import pg from "pg";

const args = process.argv.slice(2);
const roleArgIndex = args.findIndex((arg) => arg.startsWith("--role="));

let role = "USER";
if (roleArgIndex >= 0) {
  const parsedRole = args[roleArgIndex].split("=")[1]?.toUpperCase();
  if (parsedRole === "ADMIN" || parsedRole === "USER") {
    role = parsedRole;
  } else {
    console.error("Role must be USER or ADMIN.");
    process.exit(1);
  }

  args.splice(roleArgIndex, 1);
}

const [rawEmail, rawPassword, ...nameParts] = args;

if (!rawEmail || !rawPassword) {
  console.error(
    "Usage: npm run create:user -- <email> <password> [name] [--role=ADMIN]",
  );
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
      role,
    },
    create: {
      email,
      name,
      passwordHash,
      role,
    },
  });

  console.log(`User ready: ${user.email} (${user.id})`);
} finally {
  await prisma.$disconnect();
  await pool.end();
}
