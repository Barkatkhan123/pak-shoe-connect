import https from "https";
import http from "http";

function checkUrl(urlStr) {
  return new Promise((resolve) => {
    const parsed = new URL(urlStr);
    const mod = parsed.protocol === "https:" ? https : http;
    const req = mod.get(
      urlStr,
      { timeout: 10000, headers: { "User-Agent": "Mozilla/5.0" } },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          const titleMatch = data.match(/<title>(.*?)<\/title>/i);
          const title = titleMatch ? titleMatch[1] : "No Title Tag Found";
          resolve({
            url: urlStr,
            status: res.statusCode,
            title,
            server: res.headers.server,
            length: data.length,
            snippet: data.slice(0, 300).replace(/\s+/g, " "),
          });
        });
      },
    );

    req.on("error", (err) => {
      resolve({ url: urlStr, error: err.message });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({ url: urlStr, error: "Connection Timeout (10s)" });
    });
  });
}

async function run() {
  console.log("🔍 Checking live endpoints...\n");
  const targets = [
    "https://anamonofficial-com-549724.hostingersite.com",
    "http://anamonofficial-com-549724.hostingersite.com",
    "https://anamonofficial.com",
    "http://anamonofficial.com",
  ];

  for (const t of targets) {
    const res = await checkUrl(t);
    console.log(`URL: ${res.url}`);
    if (res.error) {
      console.log(`  ❌ Error: ${res.error}`);
    } else {
      console.log(`  ✅ Status: ${res.status}`);
      console.log(`  🏷️  Title:  ${res.title}`);
      console.log(`  🖥️  Server: ${res.server || "N/A"}`);
      console.log(`  📄 Size:   ${res.length} bytes`);
      console.log(`  📝 Snippet: ${res.snippet}`);
    }
    console.log("--------------------------------------------------");
  }
}

run();
