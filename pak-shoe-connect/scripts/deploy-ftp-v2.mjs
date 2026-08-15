/**
 * deploy-ftp-v2.mjs — Multi-port Hostinger deployment script
 * Tries ports 21 → 990 → 2121 with FTPS and plain FTP fallback
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
  remotePath: "/public_html",
  localPath: path.resolve(__dirname, "../dist/client"),
};

// Ports to try in order
const PORT_ATTEMPTS = [
  { port: 21, secure: true, label: "FTPS port 21" },
  { port: 21, secure: false, label: "Plain FTP port 21" },
  { port: 990, secure: true, label: "FTPS Implicit port 990" },
  { port: 2121, secure: false, label: "Plain FTP port 2121" },
  { port: 8021, secure: false, label: "Plain FTP port 8021" },
];

async function tryConnect(cfg) {
  const client = new Client(8000); // 8s timeout
  client.ftp.verbose = false;
  try {
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
    throw err;
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
      process.stdout.write(`  ↑ ${entry.name}\n`);
      await client.uploadFrom(localPath, remotePath);
    }
  }
}

async function deploy() {
  console.log("🚀 Anamon — Hostinger Multi-Port Deploy");
  console.log(`   Local:  ${CONFIG.localPath}`);
  console.log(`   Remote: ${CONFIG.host}${CONFIG.remotePath}\n`);

  let connected = false;

  for (const attempt of PORT_ATTEMPTS) {
    console.log(`🔌 Trying ${attempt.label}...`);
    try {
      const client = await tryConnect({
        host: CONFIG.host,
        port: attempt.port,
        user: CONFIG.user,
        password: CONFIG.password,
        secure: attempt.secure,
      });
      console.log(`✅ Connected via ${attempt.label}!\n`);
      connected = true;

      console.log(`📂 Navigating to ${CONFIG.remotePath}...`);
      await client.ensureDir(CONFIG.remotePath);
      await client.cd(CONFIG.remotePath);

      console.log("📤 Uploading production build...\n");
      await uploadDir(client, CONFIG.localPath, CONFIG.remotePath);

      console.log("\n🎉 SUCCESS — All files uploaded to Hostinger!");
      client.close();
      break;
    } catch (err) {
      console.log(`   ✗ Failed: ${err.message}\n`);
    }
  }

  if (!connected) {
    console.error("❌ All connection attempts failed.");
    console.error("   Your ISP/network is blocking all FTP ports.");
    console.error("\n📋 Manual upload options:");
    console.error("   1. Hostinger hPanel → File Manager → public_html");
    console.error("   2. FileZilla on your PC (not through this agent)");
    console.error(`\n   Local files ready at: ${CONFIG.localPath}`);
    process.exit(1);
  }
}

deploy().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
