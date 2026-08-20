import { requireEnv } from "./env";

/**
 * Comprehensive startup validation.
 *
 * Validates ALL required environment variables before the server accepts
 * traffic. Fails fast with a clear summary rather than crashing later
 * with cryptic errors during request handling.
 *
 * Called once at server boot (src/server.ts).
 */

interface EnvRequirement {
  name: string;
  group: string;
  requiredIn: "all" | "production";
  /** Optional predicate — skip this requirement when true */
  skipWhen?: () => boolean;
}

const isVercel = !!process.env.VERCEL;

const REQUIRED_ENV: EnvRequirement[] = [
  // ── Database & Cache ──────────────────────────────────────────────
  { name: "DATABASE_URL", group: "Database", requiredIn: "production" },
  {
    name: "REDIS_URL",
    group: "Cache & Queues",
    requiredIn: "production",
    skipWhen: () => isVercel,
  },

  // ── Payment Gateways (production only) ────────────────────────────
  { name: "EASYPAISA_STORE_ID", group: "Payment — EasyPaisa", requiredIn: "production" },
  { name: "EASYPAISA_HASH_KEY", group: "Payment — EasyPaisa", requiredIn: "production" },
  { name: "JAZZCASH_MERCHANT_ID", group: "Payment — JazzCash", requiredIn: "production" },
  { name: "JAZZCASH_SALT", group: "Payment — JazzCash", requiredIn: "production" },
  { name: "PAYFAST_MERCHANT_ID", group: "Payment — PayFast", requiredIn: "production" },
  { name: "PAYFAST_SECURED_KEY", group: "Payment — PayFast", requiredIn: "production" },
];

export function validateStartupEnvironment(): void {
  const isProd = process.env.NODE_ENV === "production";
  const missing: { name: string; group: string }[] = [];

  for (const req of REQUIRED_ENV) {
    if (req.requiredIn === "production" && !isProd) continue;
    if (req.skipWhen?.()) continue;

    if (!process.env[req.name]) {
      missing.push({ name: req.name, group: req.group });
    }
  }

  if (missing.length === 0) {
    console.info(
      JSON.stringify({
        event: "STARTUP_ENV_VALIDATED",
        checkedCount: REQUIRED_ENV.filter(
          (r) => (r.requiredIn === "all" || isProd) && !r.skipWhen?.(),
        ).length,
        environment: isProd ? "production" : "development",
        runtime: isVercel ? "vercel-serverless" : "node-server",
        ts: new Date().toISOString(),
      }),
    );
    return;
  }

  // Group missing vars by category for readable output
  const byGroup = new Map<string, string[]>();
  for (const m of missing) {
    const list = byGroup.get(m.group) ?? [];
    list.push(m.name);
    byGroup.set(m.group, list);
  }

  console.error("\n══════════════════════════════════════════════════════");
  console.error("  FATAL STARTUP ERROR: MISSING ENVIRONMENT VARIABLES");
  console.error("══════════════════════════════════════════════════════");
  for (const [group, vars] of byGroup) {
    console.error(`\n  [${group}]`);
    for (const v of vars) {
      console.error(`    ✗ ${v}`);
    }
  }
  console.error("\n══════════════════════════════════════════════════════");
  console.error(`  Total missing: ${missing.length} variable(s)`);
  console.error("  Server startup aborted. Fix the above before deploying.");
  console.error("══════════════════════════════════════════════════════\n");

  // Vercel serverless functions must not call process.exit — throw instead
  if (isVercel) {
    throw new Error(
      `Missing ${missing.length} required environment variable(s): ${missing.map((m) => m.name).join(", ")}`,
    );
  }

  process.exit(1);
}

// Keep backward compatibility — old callers used this name
export const validatePaymentConfig = validateStartupEnvironment;
