import * as ftp from "basic-ftp";
import path from "path";

const FTP_HOST = "145.79.26.180";
const FTP_USER = "u988207622";
const FTP_PASS = "sher@123%&B";
const FTP_PORT = 21;

async function deploy() {
  const client = new ftp.Client(30000);
  client.ftp.verbose = true;

  try {
    console.log(`📡 Connecting to Hostinger FTP (${FTP_HOST}:${FTP_PORT})...`);
    
    // Try FTPS explicit TLS first
    try {
      await client.access({
        host: FTP_HOST,
        user: FTP_USER,
        password: FTP_PASS,
        port: FTP_PORT,
        secure: true,
        secureOptions: { rejectUnauthorized: false },
      });
      console.log("✅ Secure FTPS Connection Established!");
    } catch (ftpsErr) {
      console.log("⚠️ FTPS connection attempt failed, trying standard FTP...", ftpsErr.message);
      await client.access({
        host: FTP_HOST,
        user: FTP_USER,
        password: FTP_PASS,
        port: FTP_PORT,
        secure: false,
      });
      console.log("✅ Standard FTP Connection Established!");
    }

    console.log("📂 Navigating to public_html...");
    await client.cd("public_html");

    console.log("🚀 Uploading dist/client files directly to public_html...");
    const localDir = path.resolve("dist/client");
    await client.uploadFromDir(localDir);

    console.log("🎉 SUCCESS: All frontend files uploaded to Hostinger public_html!");
    const list = await client.list();
    console.log("\n📋 Remote public_html contents:");
    list.forEach(item => console.log(` - ${item.name} (${item.size} bytes)`));
  } catch (err) {
    console.error("🔴 FTP Deployment Error:", err);
  } finally {
    client.close();
  }
}

deploy();
