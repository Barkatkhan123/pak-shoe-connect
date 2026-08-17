import { PrismaClient } from "@prisma/client";

const password = "kMvayKeE9dFgBOxn";
const projectId = "ydkdicudwhxrukppucxy";

const regions = [
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "eu-central-1",
  "eu-west-1",
  "eu-west-2",
  "eu-west-3",
  "eu-north-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-northeast-1",
  "ap-northeast-2",
  "ap-south-1",
  "sa-east-1",
  "ca-central-1",
  "me-central-1",
  "af-south-1",
];

async function scanRegions() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const connectionString = `postgresql://postgres.${projectId}:${encodeURIComponent(password)}@${host}:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1`;
    console.log(`Checking ${region}...`);

    const prisma = new PrismaClient({
      datasources: { db: { url: connectionString } },
    });

    try {
      const res = await prisma.$queryRawUnsafe("SELECT 1 as connected;");
      console.log(`\n🎉 FOUND WORKING REGION: ${region} (${host})!`);
      console.log("Full connection string:", connectionString);
      await prisma.$disconnect();
      return { region, host, connectionString };
    } catch (err) {
      // console.log(`  Failed: ${err.message.split("\n")[0]}`);
      await prisma.$disconnect();
    }
  }
  console.log("No pooler region matched.");
  return null;
}

scanRegions();
