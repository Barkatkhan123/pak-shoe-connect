import * as ftp from "basic-ftp";
import path from "path";
import fs from "fs";

const FTP_CONFIG = {
  host: "145.79.26.180",
  user: "u988207622",
  password: "sher@123%&B",
  port: 21,
};

async function uploadToHostinger() {
  const client = new ftp.Client(60000);
  client.ftp.verbose = true;

  console.log("📡 Connecting to Hostinger FTP (145.79.26.180:21)...");

  try {
    // Attempt 1: FTPS with TLS
    try {
      await client.access({
        host: FTP_CONFIG.host,
        user: FTP_CONFIG.user,
        password: FTP_CONFIG.password,
        port: FTP_CONFIG.port,
        secure: true,
        secureOptions: { rejectUnauthorized: false },
      });
      console.log("✅ Secure FTPS Connection Established!");
    } catch (ftpsErr) {
      console.log("⚠️ FTPS failed, trying standard FTP...", ftpsErr.message);
      await client.access({
        host: FTP_CONFIG.host,
        user: FTP_CONFIG.user,
        password: FTP_CONFIG.password,
        port: FTP_CONFIG.port,
        secure: false,
      });
      console.log("✅ Standard FTP Connection Established!");
    }

    console.log("📂 Navigating to public_html...");
    await client.cd("public_html");

    const localDir = path.resolve("dist/client");
    console.log(`🚀 Uploading all files from ${localDir} into public_html/ ...`);
    await client.uploadFromDir(localDir);

    console.log("\n🎉 SUCCESS: All files successfully uploaded to Hostinger public_html!");
    const list = await client.list();
    console.log("\n📋 Current Remote public_html Files:");
    list.forEach((item) => {
      console.log(`  - ${item.name} (${item.size} bytes) [${item.isDirectory ? 'DIR' : 'FILE'}]`);
    });

  } catch (err) {
    console.error("🔴 Upload Error:", err);
  } finally {
    client.close();
  }
}

uploadToHostinger();
