import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

// In production: reuse singleton. In dev: always create fresh to avoid stale models after migrations.
export const prisma =
  process.env.NODE_ENV === "production"
    ? (global.__prisma ?? (global.__prisma = createPrismaClient()))
    : createPrismaClient();
