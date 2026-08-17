import { execSync } from "child_process";
import crypto from "crypto";

const jwtSecret = crypto.randomBytes(32).toString("hex");

const secrets = [
  { key: "JWT_SECRET", value: jwtSecret },
  {
    key: "DATABASE_URL",
    value:
      "postgresql://postgres:postgres@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1",
  },
  { key: "EASYPAISA_STORE_ID", value: "EP_SHERSHA_STORE_10029" },
  { key: "EASYPAISA_HASH_KEY", value: "ep_secret_b2b_hash_key_9921" },
  { key: "JAZZCASH_MERCHANT_ID", value: "JC_SHERSHA_MCH_88192" },
  { key: "JAZZCASH_SALT", value: "jc_secure_salt_b2b_wholesale_2026" },
  { key: "PAYFAST_MERCHANT_ID", value: "PF_SHERSHA_CORP_10928" },
  { key: "PAYFAST_SECURED_KEY", value: "pf_secure_key_b2b_wholesale_1link" },
  { key: "NODE_ENV", value: "production" },
];

for (const { key, value } of secrets) {
  try {
    console.log(`Setting ${key}...`);
    execSync(`npx vercel env add ${key} production,preview --value "${value}" --yes --force`, {
      stdio: "inherit",
    });
  } catch (err) {
    console.error(`Failed to set ${key}:`, err.message);
  }
}

console.log("All production secrets added to Vercel successfully!");
