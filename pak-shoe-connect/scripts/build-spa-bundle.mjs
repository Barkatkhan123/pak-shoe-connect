import * as esbuild from "esbuild";
import path from "path";

async function build() {
  console.log("🔨 Building client SPA bundle for static hosting...");
  await esbuild.build({
    entryPoints: ["src/entry-client.tsx"],
    bundle: true,
    minify: true,
    format: "esm",
    target: ["es2022"],
    outfile: "dist/client/assets/app.js",
    define: {
      "process.env.NODE_ENV": '"production"',
      "import.meta.env.PROD": "true",
      "import.meta.env.DEV": "false",
      "import.meta.env.MODE": '"production"',
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
  console.log("✅ Successfully built dist/client/assets/app.js !");
}

build().catch((err) => {
  console.error("Bundle error:", err);
  process.exit(1);
});
