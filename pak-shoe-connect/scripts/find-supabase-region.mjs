import { PrismaClient } from "@prisma/client";

const projectRef = "ydkdicudwhxrukppucxy";
const password = "kMvayKeE9dFgBOxn";
const regions = [
  "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "eu-central-1", "eu-west-1", "eu-west-2", "eu-west-3",
  "ap-southeast-1", "ap-south-1", "sa-east-1",
];

async function findWorkingRegion() {
  console.log("=== STEP 1: Finding Active Supabase Region ===");
  console.log("Project Ref:", projectRef);
  console.log("Username format: postgres." + projectRef);
  console.log("");

  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const url = `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@${host}:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1`;

    const prisma = new PrismaClient({ datasources: { db: { url } } });
    try {
      const res = await prisma.$queryRawUnsafe("SELECT version() as pg_version, current_database() as db_name, current_user as db_user;");
      console.log(`✅ FOUND WORKING REGION: ${region}`);
      console.log("Pooler Host:", host);
      console.log("Query Result:", res);

      // Now test direct connection
      const directUrl = `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`;
      console.log("\n--- Testing direct connection (for DIRECT_URL) ---");
      console.log("Direct Host: db." + projectRef + ".supabase.co:5432");

      const directPrisma = new PrismaClient({ datasources: { db: { url: directUrl } } });
      try {
        const directRes = await directPrisma.$queryRawUnsafe("SELECT current_database() as db_name;");
        console.log("✅ Direct connection also works:", directRes);
        await directPrisma.$disconnect();
      } catch (directErr) {
        console.log("❌ Direct connection failed:", directErr.message.split("\n").slice(0,3).join("\n"));
        await directPrisma.$disconnect();
      }

      // Check if tables exist
      console.log("\n--- Checking for Prisma schema tables ---");
      try {
        const tables = await prisma.$queryRawUnsafe(`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema = 'public' 
          ORDER BY table_name;
        `);
        console.log("Tables found:", tables.map(t => t.table_name));
      } catch (tblErr) {
        console.log("Table query error:", tblErr.message.split("\n")[0]);
      }

      // Check Supabase REST API health
      console.log("\n--- Testing Supabase REST API ---");
      try {
        const apiRes = await fetch(`https://${projectRef}.supabase.co/rest/v1/`, {
          headers: { apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlka2RpY3Vkd2h4cnVrcHB1Y3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NTUyMTAsImV4cCI6MjA1NjMzMTIxMH0.placeholder" }
        });
        console.log("REST API Status:", apiRes.status);
      } catch (apiErr) {
        console.log("REST API Error:", apiErr.message);
      }

      console.log("\n=== RECOMMENDED VERCEL ENV VARS ===");
      const poolerUrlRedacted = `postgresql://postgres.${projectRef}:[REDACTED]@${host}:6543/postgres?pgbouncer=true&connection_limit=1`;
      const directUrlRedacted = `postgresql://postgres.${projectRef}:[REDACTED]@db.${projectRef}.supabase.co:5432/postgres`;
      console.log("DATABASE_URL=" + poolerUrlRedacted);
      console.log("DIRECT_URL=" + directUrlRedacted);

      await prisma.$disconnect();
      return { region, host };
    } catch (err) {
      const msg = err.message.split("\n")[0];
      if (!msg.includes("ECONNREFUSED") && !msg.includes("timeout")) {
        console.log(`  ${region}: ${msg}`);
      }
      await prisma.$disconnect();
    }
  }
  console.log("❌ No pooler region matched for project ref:", projectRef);
}

findWorkingRegion().catch(console.error);
