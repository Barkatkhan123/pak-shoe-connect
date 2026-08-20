import { Client } from "basic-ftp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_DIST = path.resolve(__dirname, "../dist/client");

const TARGETS = [
  "/domains/anamonofficial.com/public_html",
  "/public_html",
];

async function deployDirect() {
  console.log("🚀 Starting Fast Hostinger Live Web Deployment...\n");

  const client = new Client(30000);
  client.ftp.verbose = true;

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
    console.log(`📁 Target: ${remoteDir}`);
    await client.ensureDir(remoteDir);
    await client.cd(remoteDir);

    // Upload index.html, .htaccess, favicon
    console.log("  ⬆️ Uploading index.html...");
    await client.uploadFrom(path.join(LOCAL_DIST, "index.html"), "index.html");

    if (fs.existsSync(path.join(LOCAL_DIST, ".htaccess"))) {
      console.log("  ⬆️ Uploading .htaccess...");
      await client.uploadFrom(path.join(LOCAL_DIST, ".htaccess"), ".htaccess");
    }

    // Upload assets dir
    const localAssets = path.join(LOCAL_DIST, "assets");
    if (fs.existsSync(localAssets)) {
      await client.ensureDir(`${remoteDir}/assets`);
      await client.cd(`${remoteDir}/assets`);
      console.log("  ⬆️ Uploading assets folder...");
      await client.uploadFromDir(localAssets);
      await client.cd(remoteDir);
    }

    console.log(`✅ Upload complete for ${remoteDir}\n`);
  }

  client.close();
  console.log("🎉 Frontend deployment to Hostinger completed!");
}

deployDirect().catch(console.error);
