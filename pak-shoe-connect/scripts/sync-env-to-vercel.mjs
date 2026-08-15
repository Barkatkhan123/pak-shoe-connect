import { execSync } from "child_process";

const envVars = [
  { key: "SUPABASE_URL", value: "https://c--05c6c740-ba8c-4a01-bcbf-ad016f412410-prod.lovable.cloud" },
  { key: "SUPABASE_PUBLISHABLE_KEY", value: "sb_publishable__AFZcnPcx6PjXpFNiNlV0g_ciSSWNhy" },
  { key: "VITE_SUPABASE_URL", value: "https://c--05c6c740-ba8c-4a01-bcbf-ad016f412410-prod.lovable.cloud" },
  { key: "VITE_SUPABASE_PUBLISHABLE_KEY", value: "sb_publishable__AFZcnPcx6PjXpFNiNlV0g_ciSSWNhy" },
  { key: "SUPABASE_PROJECT_ID", value: "ydkdicudwhxrukppucxy" },
  { key: "VITE_SUPABASE_PROJECT_ID", value: "ydkdicudwhxrukppucxy" },
  { key: "SITE_URL", value: "https://pak-shoe-connect.vercel.app" },
  { key: "VITE_SITE_URL", value: "https://pak-shoe-connect.vercel.app" },
];

for (const { key, value } of envVars) {
  try {
    console.log(`Setting ${key}...`);
    execSync(`npx vercel env add ${key} production,preview --value "${value}" --yes --force`, {
      stdio: "inherit",
    });
  } catch (err) {
    console.error(`Failed to set ${key}:`, err.message);
  }
}

console.log("All environment variables synced to Vercel!");
