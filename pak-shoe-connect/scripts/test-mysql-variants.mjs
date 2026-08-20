import { PrismaClient } from "@prisma/client";

const host = "145.79.26.180";
const password = "Anamon12&1marcH2007";

const userVariants = [
  "u988207622_Anamon",
  "u988207622_anamon",
  "u988207622_Anamondb",
  "u988207622_anamondb",
  "u988207622",
];

const dbVariants = [
  "u988207622_Anamondb",
  "u988207622_anamondb",
];

async function checkCombinations() {
  for (const u of userVariants) {
    for (const d of dbVariants) {
      const url = `mysql://${u}:${encodeURIComponent(password)}@${host}:3306/${d}`;
      const prisma = new PrismaClient({
        datasources: { db: { url } },
      });

      try {
        console.log(`Trying User: ${u} | DB: ${d}...`);
        const res = await prisma.$queryRawUnsafe("SELECT 1 as ok, USER() as usr, DATABASE() as db;");
        console.log(`🎉 SUCCESS with User: ${u} | DB: ${d}!`);
        console.log("Result:", res);
        await prisma.$disconnect();
        return { user: u, db: d };
      } catch (err) {
        console.log(`  Failed: ${err.message.split("\n").filter(l => l.includes("Authentication") || l.includes("Access denied") || l.includes("database"))[0] || err.message.split("\n")[0]}`);
        await prisma.$disconnect();
      }
    }
  }
  return null;
}

checkCombinations();
