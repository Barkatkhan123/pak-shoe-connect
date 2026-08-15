import * as esbuild from "esbuild";
import path from "path";

async function build() {
  console.log("🔨 Building client SPA bundle for static hosting (app-v3.js)...");
  await esbuild.build({
    entryPoints: ["src/entry-client.tsx"],
    bundle: true,
    minify: true,
    format: "esm",
    target: ["es2022"],
    outfile: "dist/client/assets/app-v3.js",
    define: {
      "process.env.NODE_ENV": '"production"',
      "import.meta.env": JSON.stringify({
        PROD: true,
        DEV: false,
        MODE: "production",
        VITE_SITE_URL: "https://anamonofficial.com",
        VITE_API_URL: "",
        VITE_SUPABASE_URL: "https://c--05c6c740-ba8c-4a01-bcbf-ad016f412410-prod.lovable.cloud",
        VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable__AFZcnPcx6PjXpFNiNlV0g_ciSSWNhy",
        VITE_SUPABASE_PROJECT_ID: "ydkdicudwhxrukppucxy",
      }),
      "import.meta.env.PROD": "true",
      "import.meta.env.DEV": "false",
      "import.meta.env.MODE": '"production"',
      "import.meta.env.VITE_API_URL": '""',
      "import.meta.env.VITE_SITE_URL": '"https://anamonofficial.com"',
      "import.meta.env.VITE_SUPABASE_URL": '"https://c--05c6c740-ba8c-4a01-bcbf-ad016f412410-prod.lovable.cloud"',
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": '"sb_publishable__AFZcnPcx6PjXpFNiNlV0g_ciSSWNhy"',
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": '"ydkdicudwhxrukppucxy"',
    },
    loader: {
      ".jpg": "file",
      ".png": "file",
      ".svg": "file",
      ".css": "empty",
    },
    alias: {
      "@": path.resolve("./src"),
    },
  });
  console.log("✅ Successfully built dist/client/assets/app-v3.js !");
}

build().catch((err) => {
  console.error("Bundle error:", err);
  process.exit(1);
});
