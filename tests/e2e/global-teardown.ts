import { prisma } from "../../prisma";

import { E2E_PROJECT_SLUG_PREFIX } from "./constants";

async function globalTeardown() {
  if (!process.env.DATABASE_URL) {
    return;
  }

  try {
    await prisma.project.deleteMany({
      where: {
        slug: {
          startsWith: E2E_PROJECT_SLUG_PREFIX,
        },
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

export default globalTeardown;
