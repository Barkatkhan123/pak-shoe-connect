import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

console.log("=== RAW DATABASE CONNECTION TEST ===");
console.log("DATABASE_URL in .env:", process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ":[REDACTED_PASSWORD]@"));

const prisma = new PrismaClient();

try {
  const result = await prisma.$queryRawUnsafe("SELECT version(), current_database(), current_user;");
  console.log("SUCCESS: Query returned:");
  console.log(result);
} catch (err) {
  console.log("RAW ERROR CAUGHT:");
  console.log("Error Name:", err.name);
  console.log("Error Code:", err.code);
  console.log("Error Message:\n", err.message);
} finally {
  await prisma.$disconnect();
}
