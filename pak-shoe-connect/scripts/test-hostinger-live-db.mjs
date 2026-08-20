import { PrismaClient } from "@prisma/client";

const host = "145.79.26.180";
const user = "u988207622_Anamon";
const db = "u988207622_Anamondb";
const password = "Anamon12&1marcH2007";

const url = `mysql://${user}:${encodeURIComponent(password)}@${host}:3306/${db}`;

async function runTest() {
  console.log("Connecting to Hostinger MySQL at " + host + " (db: " + db + ")...");
  const prisma = new PrismaClient({
    datasources: { db: { url } },
  });

  try {
    const res = await prisma.$queryRawUnsafe("SELECT 1 as connected, VERSION() as mysql_version, DATABASE() as current_db, USER() as curr_user;");
    console.log("✅ Successfully connected to Hostinger MySQL!");
    console.log("Raw SQL Query Output:", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
