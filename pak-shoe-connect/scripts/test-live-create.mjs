async function testLiveVercelProductCreate() {
  // 1. Get Token
  const tokenRes = await fetch("https://pak-shoe-connect.vercel.app/api/v1/admin/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "anamoontotrade@gmail.com",
      secret: "Anamon12&1marcH2007"
    })
  });
  const tokenData = await tokenRes.json();
  const token = tokenData?.data?.token;

  // 2. Create Product on live Vercel
  const uniqueId = Date.now();
  const payload = {
    name: `Live Live Test Shoe ${uniqueId}`,
    slug: `live-live-test-shoe-${uniqueId}`,
    sku: `LIVE-${uniqueId.toString().slice(-6)}`,
    categorySlug: "men-formal",
    gender: "men",
    moq: 12,
    cartonQty: 12,
    leadTimeDays: "3-5 Days",
    image: "https://images.unsplash.com/photo-1614252369475-531eda835eb1?q=80&w=800",
    images: ["https://images.unsplash.com/photo-1614252369475-531eda835eb1?q=80&w=800"],
    priceTiers: [{ moq: 12, pricePerPair: 2500, label: "Wholesale Tier" }]
  };

  console.log("Creating product on live Vercel endpoint...");
  const createRes = await fetch("https://pak-shoe-connect.vercel.app/api/v1/admin/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  console.log("Create Status:", createRes.status);
  const createData = await createRes.json();
  console.log("Create Response:", JSON.stringify(createData, null, 2));
}

testLiveVercelProductCreate();
