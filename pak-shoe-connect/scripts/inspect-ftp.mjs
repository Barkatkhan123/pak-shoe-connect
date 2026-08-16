import { Client } from "basic-ftp";

async function inspect() {
  const client = new Client(10000);
  client.ftp.verbose = false;
  await client.access({
    host: "145.79.26.180",
    port: 21,
    user: "u988207622",
    password: "sher@123%&B",
    secure: true,
    secureOptions: { rejectUnauthorized: false },
  });

  console.log("Root directory listing:");
  const list = await client.list();
  for (const item of list) {
    console.log(`- ${item.name} (${item.isDirectory ? "DIR" : "FILE"})`);
  }

  // Check domains directory if exists
  try {
    console.log("\nChecking /domains:");
    await client.cd("/domains");
    const domainList = await client.list();
    for (const item of domainList) {
      console.log(`- /domains/${item.name} (${item.isDirectory ? "DIR" : "FILE"})`);
    }
  } catch (e) {
    console.log("No /domains or error:", e.message);
  }

  client.close();
}

inspect().catch(console.error);
