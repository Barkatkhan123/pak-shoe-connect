import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkTables() {
  console.log("=================================================");
  console.log("📋 QUERYING HOSTINGER MYSQL CREATED TABLES");
  console.log("=================================================\n");

  const tables = await prisma.$queryRawUnsafe(`
    SELECT TABLE_NAME, TABLE_ROWS, CREATE_TIME 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = 'u988207622_Anamondb'
    ORDER BY TABLE_NAME;
  `);

  console.log("Raw SQL Tables Output:");
  console.log(JSON.stringify(tables, (_k, v) => typeof v === "bigint" ? v.toString() : v, 2));

  console.log("\nTotal tables created in Hostinger MySQL:", tables.length);
  await prisma.$disconnect();
}

checkTables().catch(console.error);
