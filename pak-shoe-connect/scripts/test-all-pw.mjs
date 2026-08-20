import { PrismaClient } from "@prisma/client";

const host = "145.79.26.180";
const user = "u988207622_Anamon";
const db = "u988207622_Anamondb";

const pwList = [
  "sher@123%&B",
  "sher@123",
  "Anamon12&1marcH2007",
  "Anamon12&1march2007",
  "Anamon123456",
  "Anamon@123",
  "Anamon2026",
];

async function testAll() {
  for (let i = 0; i < pwList.length; i++) {
    const pw = pwList[i];
    const url = `mysql://${user}:${encodeURIComponent(pw)}@${host}:3306/${db}`;
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    try {
      console.log(`Testing key candidate ${i + 1}...`);
      const res = await prisma.$queryRawUnsafe("SELECT 1 as ok, USER() as u;");
      console.log(`🎉 SUCCESS on candidate ${i + 1}!`);
      console.log("Raw SQL:", res);
      await prisma.$disconnect();
      return pw;
    } catch (e) {
      await prisma.$disconnect();
    }
  }
  console.log("None of the common candidates authenticated.");
}

testAll();
