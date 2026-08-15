import { spawnSync } from "child_process";

const envs = {
  DATABASE_URL: "postgresql://postgres:postgres@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable__AFZcnPcx6PjXpFNiNlV0g_ciSSWNhy",
  VITE_SUPABASE_URL: "https://c--05c6c740-ba8c-4a01-bcbf-ad016f412410-prod.lovable.cloud",
  VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable__AFZcnPcx6PjXpFNiNlV0g_ciSSWNhy",
  EASYPAISA_STORE_ID: "EP_SHERSHA_STORE_10029",
  EASYPAISA_HASH_KEY: "ep_secret_b2b_hash_key_9921",
  JAZZCASH_MERCHANT_ID: "JC_SHERSHA_MCH_88192",
  JAZZCASH_SALT: "jc_secure_salt_b2b_wholesale_2026",
  PAYFAST_MERCHANT_ID: "PF_SHERSHA_CORP_10928",
  PAYFAST_SECURED_KEY: "pf_secure_key_b2b_wholesale_1link",
  SITE_URL: "https://pak-shoe-connect.vercel.app",
  VITE_SITE_URL: "https://pak-shoe-connect.vercel.app",
};

for (const [key, val] of Object.entries(envs)) {
  console.log(`Adding ${key}...`);
  const res = spawnSync("npx.cmd", ["vercel", "env", "add", key, "production,preview", "--value", val, "--yes", "--force"], {
    encoding: "utf-8",
    stdio: "pipe",
    shell: true,
  });
  if (res.error) {
    console.error(`Error adding ${key}:`, res.error.message);
  } else {
    console.log(`Success ${key}:`, (res.stdout || "").trim());
  }
}

console.log("Done adding all environment variables!");
