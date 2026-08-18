import https from "node:https";
import http from "node:http";

async function fetchUrl(targetUrl) {
  return new Promise((resolve, reject) => {
    const client = targetUrl.startsWith("https") ? https : http;
    const req = client.get(targetUrl, { headers: { "User-Agent": "SherSha-Test-Bot/1.0" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
        });
      });
    });
    req.on("error", reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
  });
}

async function runLiveProductListingTests() {
  console.log("==================================================");
  console.log("🧪 RUNNING LIVE PRODUCTION PRODUCT LISTING TESTS");
  console.log("==================================================");

  const endpoints = [
    { name: "Live Hostinger Homepage", url: "https://anamonofficial.com" },
    { name: "Live Hostinger Products Catalog", url: "https://anamonofficial.com/products" },
    { name: "Live Hostinger Buyer Dashboard", url: "https://anamonofficial.com/dashboard/buyer" },
    { name: "Live Hostinger Staging", url: "https://anamonofficial-com-549724.hostingersite.com/products" },
    { name: "Live Vercel Production", url: "https://pak-shoe-connect-77m13b5c0-barkat1.vercel.app/products" },
  ];

  let allPassed = true;

  for (const ep of endpoints) {
    process.stdout.write(`Testing ${ep.name} (${ep.url})... `);
    try {
      const res = await fetchUrl(ep.url);
      if (res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302) {
        console.log(`✅ [HTTP ${res.statusCode}] OK (${res.data.length} bytes)`);
      } else {
        console.log(`❌ [HTTP ${res.statusCode}] Failed`);
        allPassed = false;
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
      allPassed = false;
    }
  }

  console.log("\n==================================================");
  if (allPassed) {
    console.log("🎉 ALL LIVE ENDPOINTS RETURNED SUCCESSFUL STATUS!");
  } else {
    console.log("⚠️ SOME ENDPOINTS FAILED");
  }
  console.log("==================================================");
}

runLiveProductListingTests();
