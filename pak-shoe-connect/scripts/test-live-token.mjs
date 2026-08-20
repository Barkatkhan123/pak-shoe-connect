async function testLiveVercelCrud() {
  console.log("=================================================");
  console.log("🧪 TESTING LIVE VERCEL PRODUCTION TOKEN & CRUD");
  console.log("=================================================\n");

  // Step 1: Exchange Token on live Vercel
  console.log("1. Exchanging Admin Token at https://pak-shoe-connect.vercel.app/api/v1/admin/token ...");
  const tokenRes = await fetch("https://pak-shoe-connect.vercel.app/api/v1/admin/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "anamoontotrade@gmail.com",
      secret: "Anamon12&1marcH2007"
    })
  });
  console.log("Token Exchange Status:", tokenRes.status);
  const tokenData = await tokenRes.json();
  console.log("Token Response:", JSON.stringify(tokenData, null, 2));
}

testLiveVercelCrud();
