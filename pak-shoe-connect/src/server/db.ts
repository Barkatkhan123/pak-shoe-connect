import { PrismaClient } from "@prisma/client";

// Global singleton pattern to prevent multiple instances during hot-reloading in dev
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// Maintain global singleton across all serverless invocations on warm containers
globalForPrisma.prisma = prisma;

export default prisma;
