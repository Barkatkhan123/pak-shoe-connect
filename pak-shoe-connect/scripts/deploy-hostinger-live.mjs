import { Client } from "basic-ftp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_DIST = path.resolve(__dirname, "../dist/client");

const TARGETS = [
  "/domains/anamonofficial.com/public_html",
  "/domains/anamonofficial-com-549724.hostingersite.com/public_html",
  "/public_html",
];

async function deployToAllDomains() {
  console.log("🚀 Starting Hostinger Direct Deployment to Live Web Roots...\n");
  console.log(`Local Build Directory: ${LOCAL_DIST}`);

  const client = new Client(60000);
  client.ftp.verbose = false;

  console.log("🔒 Connecting to 145.79.26.180 via FTPS...");
  await client.access({
    host: "145.79.26.180",
    port: 21,
    user: "u988207622",
    password: "sher@123%&B",
    secure: true,
    secureOptions: { rejectUnauthorized: false },
  });
  console.log("✅ FTPS Connected successfully!\n");

  for (const remoteDir of TARGETS) {
    console.log(`=======================================================`);
    console.log(`📁 Deploying to: ${remoteDir}`);
    console.log(`=======================================================`);

    try {
      await client.ensureDir(remoteDir);
      await client.cd(remoteDir);

      // 1. Upload using basic-ftp uploadFromDir
      console.log(`  ⬆️  Uploading full dist/client tree...`);
      await client.uploadFromDir(LOCAL_DIST);

      // 2. Explicitly ensure index.html and .htaccess and assets are overwritten
      console.log(`  ⬆️  Verifying critical root files upload...`);
      await client.uploadFrom(path.join(LOCAL_DIST, "index.html"), "index.html");
      if (fs.existsSync(path.join(LOCAL_DIST, ".htaccess"))) {
        await client.uploadFrom(path.join(LOCAL_DIST, ".htaccess"), ".htaccess");
      }
      if (fs.existsSync(path.join(LOCAL_DIST, "favicon.jpg"))) {
        await client.uploadFrom(path.join(LOCAL_DIST, "favicon.jpg"), "favicon.jpg");
      }

      // Also ensure assets directory
      const localAssetsDir = path.join(LOCAL_DIST, "assets");
      if (fs.existsSync(localAssetsDir)) {
        await client.ensureDir(`${remoteDir}/assets`);
        await client.cd(`${remoteDir}/assets`);
        await client.uploadFromDir(localAssetsDir);
        await client.cd(remoteDir);
      }

      // Verify remote listing
      console.log(`  📋 Verifying Remote Files in ${remoteDir}:`);
      const list = await client.list();
      list.forEach((item) => {
        if (item.name.endsWith(".html") || item.name.endsWith(".js") || item.name === ".htaccess" || item.name === "assets") {
          console.log(`     ✓ ${item.name} (${item.size} bytes) [${item.isDirectory ? "DIR" : "FILE"}]`);
        }
      });

      console.log(`✅ Completed deployment to ${remoteDir}\n`);
    } catch (err) {
      console.error(`❌ Error deploying to ${remoteDir}:`, err.message);
    }
  }

  client.close();
  console.log("🎉 All domains successfully deployed and verified on Hostinger!");
}

deployToAllDomains().catch(console.error);
