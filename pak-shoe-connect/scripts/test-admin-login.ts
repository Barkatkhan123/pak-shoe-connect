import { apiGateway } from "../src/server/gateway/gateway.ts";

async function testAdminLogin() {
  console.log("Testing Admin login with database credentials via /api/v1/auth/login...");
  
  const loginRes = await apiGateway("/api/v1/auth/login", "POST", {
    email: "anamoontotrade@gmail.com",
    password: "Anamon12&1marcH2007"
  });

  console.log("Login Response Status:", loginRes.status);
  console.log("Login Response Body:", JSON.stringify(loginRes.body, null, 2));
}

testAdminLogin();
