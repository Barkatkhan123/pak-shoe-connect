import * as ftp from "basic-ftp";
import path from "path";

const FTP_HOST = "145.79.26.180";
const FTP_USER = "u988207622";
const FTP_PASS = "sher@123%&B";
const FTP_PORT = 21;

async function run() {
  const client = new ftp.Client(30000);
  client.ftp.verbose = true;
  try {
    console.log(`Connecting to ${FTP_HOST}:${FTP_PORT}...`);
    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password: FTP_PASS,
      port: FTP_PORT,
      secure: "implicit" === false, // false for port 21 explicit
      secureOptions: { rejectUnauthorized: false },
    });
    console.log("Connected successfully!");
    const list = await client.list("public_html");
    console.log(
      "Files in public_html:",
      list.map((f) => f.name),
    );
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    client.close();
  }
}

run();
