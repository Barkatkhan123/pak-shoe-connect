import https from "https";
import http from "http";

function testPath(pathStr) {
  return new Promise((resolve) => {
    const urlStr = `https://anamonofficial-com-549724.hostingersite.com${pathStr}`;
    const req = https.get(
      urlStr,
      { timeout: 8000, headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          resolve({
            path: pathStr,
            statusCode: res.statusCode,
            title: (data.match(/<title>(.*?)<\/title>/i) || [])[1] || "No title",
            snippet: data.slice(0, 200).replace(/\s+/g, " "),
          });
        });
      },
    );
    req.on("error", (e) => resolve({ path: pathStr, error: e.message }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ path: pathStr, error: "Timeout" });
    });
  });
}

async function run() {
  const paths = [
    "/",
    "/index.html",
    "/favicon.ico",
    "/robots.txt",
    "/assets/styles-CnXLnDEf.css",
    "/hostinger_public_html/",
    "/hostinger_public_html/index.html",
    "/dist/client/index.html",
    "/public_html/index.html",
  ];

  console.log("Checking path structures on Hostinger preview domain...\n");
  for (const p of paths) {
    const r = await testPath(p);
    console.log(`Path: ${r.path}`);
    if (r.error) {
      console.log(`  Error: ${r.error}`);
    } else {
      console.log(`  Status: ${r.statusCode} | Title: ${r.title} | Snippet: ${r.snippet}`);
    }
  }
}

run();
