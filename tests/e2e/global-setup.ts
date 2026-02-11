import bcrypt from "bcryptjs";
import { prisma } from "../../prisma";

import { E2E_USER_EMAIL, E2E_USER_PASSWORD } from "./constants";

async function globalSetup() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for E2E tests.");
  }

  try {
    const passwordHash = await bcrypt.hash(E2E_USER_PASSWORD, 12);

    await prisma.user.upsert({
      where: { email: E2E_USER_EMAIL },
      update: {
        passwordHash,
        role: "ADMIN",
      },
      create: {
        email: E2E_USER_EMAIL,
        name: "E2E Admin",
        passwordHash,
        role: "ADMIN",
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

export default globalSetup;
