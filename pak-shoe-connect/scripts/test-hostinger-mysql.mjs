import { PrismaClient } from "@prisma/client";

const host = "145.79.26.180";
const user = "u988207622_Anamon";
const db = "u988207622_Anamondb";

async function testConnection(pwd) {
  const url = `mysql://${user}:${encodeURIComponent(pwd)}@${host}:3306/${db}`;
  const prisma = new PrismaClient({
    datasources: { db: { url } }
  });

  try {
    const res = await prisma.$queryRawUnsafe("SELECT 1 as ok;");
    console.log("SUCCESS:", res);
  } catch (err) {
    console.log("ERROR MESSAGE:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection("sher@123%&B");
