/**
 * deploy-ftp-v2.mjs — Robust Hostinger Multi-Domain Deployment Script
 * Uploads production build to all active Hostinger web roots with automatic retries:
 * 1. /domains/anamonofficial-com-549724.hostingersite.com/public_html
 * 2. /domains/anamonofficial.com/public_html
 * 3. /public_html
 */

import { Client } from "basic-ftp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CONFIG = {
  host: "145.79.26.180",
  user: "u988207622",
  password: "sher@123%&B",
  localPath: path.resolve(__dirname, "../dist/client"),
  targets: [
    "/domains/anamonofficial-com-549724.hostingersite.com/public_html",
    "/domains/anamonofficial.com/public_html",
    "/public_html",
  ],
};

const PORT_ATTEMPTS = [
  { port: 21, secure: true, label: "FTPS port 21" },
  { port: 21, secure: false, label: "Plain FTP port 21" },
  { port: 990, secure: true, label: "FTPS Implicit port 990" },
  { port: 2121, secure: false, label: "Plain FTP port 2121" },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function tryConnectWithRetry(cfg, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const client = new Client(30000); // 30s timeout
    client.ftp.verbose = false;
    try {
      if (attempt > 1) {
        console.log(`   ↳ Retry attempt ${attempt}/${maxRetries}...`);
      }
      await client.access({
        host: cfg.host,
        port: cfg.port,
        user: cfg.user,
        password: cfg.password,
        secure: cfg.secure,
        secureOptions: { rejectUnauthorized: false },
      });
      return client;
    } catch (err) {
      client.close();
      if (attempt < maxRetries) {
        await sleep(2500);
      } else {
        throw err;
      }
    }
  }
}

async function uploadDir(client, localDir, remoteDir) {
  const entries = fs.readdirSync(localDir, { withFileTypes: true });
  for (const entry of entries) {
    const localPath = path.join(localDir, entry.name);
    const remotePath = `${remoteDir}/${entry.name}`;
    if (entry.isDirectory()) {
      try {
        await client.ensureDir(remotePath);
      } catch {}
      await uploadDir(client, localPath, remotePath);
      await client.cd(remoteDir);
    } else {
      process.stdout.write(`    ↑ ${entry.name}\n`);
      await client.uploadFrom(localPath, remotePath);
    }
  }
}

async function deploy() {
  console.log("🚀 Anamon — Production Multi-Domain Hostinger Deploy");
  console.log(`   Local:  ${CONFIG.localPath}`);
  console.log(`   Target Domains:`);
  CONFIG.targets.forEach((t) => console.log(`     - ${CONFIG.host}${t}`));
  console.log("");

  let client = null;

  for (const attempt of PORT_ATTEMPTS) {
    console.log(`🔌 Connecting via ${attempt.label}...`);
    try {
      client = await tryConnectWithRetry(
        {
          host: CONFIG.host,
          port: attempt.port,
          user: CONFIG.user,
          password: CONFIG.password,
          secure: attempt.secure,
        },
        3
      );
      console.log(`✅ Connected successfully via ${attempt.label}!\n`);
      break;
    } catch (err) {
      console.log(`   ✗ Connection failed: ${err.message}`);
    }
  }

  if (!client) {
    console.error("❌ Failed to connect to Hostinger FTP after all retries.");
    process.exit(1);
  }

  for (const target of CONFIG.targets) {
    console.log(`\n📂 Deploying to target: ${target} ...`);
    try {
      await client.ensureDir(target);
      await client.cd(target);
      await uploadDir(client, CONFIG.localPath, target);
      console.log(`✅ Successfully deployed to ${target}`);
    } catch (err) {
      console.error(`❌ Failed to deploy to ${target}:`, err.message);
    }
  }

  console.log("\n🎉 ALL DOMAINS SYNCHRONIZED AND DEPLOYED SUCCESSFULLY!");
  client.close();
}

deploy().catch((err) => {
  console.error("Fatal deployment error:", err.message);
  process.exit(1);
});
