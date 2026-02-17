import { Prisma } from "@prisma/client";

export function isMissingTableError(error: unknown, tablePrefix?: string) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  if (error.code !== "P2021") {
    return false;
  }

  if (!tablePrefix) {
    return true;
  }

  const meta = error.meta as { table?: string } | undefined;
  return String(meta?.table ?? "").includes(tablePrefix);
}
