async function testLiveVercel() {
  console.log("=================================================");
  console.log("🌐 TESTING LIVE PRODUCTION VERCEL API");
  console.log("=================================================\n");

  // 1. Health check
  console.log("1. GET https://pak-shoe-connect.vercel.app/api/v1/health ...");
  try {
    const healthRes = await fetch("https://pak-shoe-connect.vercel.app/api/v1/health");
    console.log("Health Status:", healthRes.status);
    const healthData = await healthRes.json();
    console.log("Health Body:", JSON.stringify(healthData, null, 2));
  } catch (err) {
    console.log("Health error:", err.message);
  }

  // 2. Catalog check
  console.log("\n2. GET https://pak-shoe-connect.vercel.app/api/v1/catalog/products ...");
  try {
    const catRes = await fetch("https://pak-shoe-connect.vercel.app/api/v1/catalog/products");
    console.log("Catalog Status:", catRes.status);
    const catData = await catRes.json();
    console.log("Catalog Response (Total products):", catData?.data?.products?.length || 0);
    console.log("Catalog Product Titles:", catData?.data?.products?.map((p) => p.name));
  } catch (err) {
    console.log("Catalog error:", err.message);
  }
}

testLiveVercel();
