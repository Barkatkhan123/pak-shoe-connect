import { Client } from "basic-ftp";

async function inspectDomains() {
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

  const targets = [
    "/domains/anamonofficial.com/public_html",
    "/domains/anamonofficial-com-549724.hostingersite.com/public_html",
    "/public_html",
  ];

  for (const target of targets) {
    try {
      console.log(`\nListing ${target}:`);
      await client.cd(target);
      const list = await client.list();
      for (const item of list.slice(0, 10)) {
        console.log(`- ${item.name} (${item.isDirectory ? "DIR" : "FILE"})`);
      }
    } catch (e) {
      console.log(`Error on ${target}:`, e.message);
    }
  }

  client.close();
}

inspectDomains().catch(console.error);
