import { z } from "zod";

/**
 * Request Validation Middleware — Zero Trust API Gateway
 *
 * All requests are validated BEFORE business logic executes.
 * Invalid requests are rejected immediately with a normalized error.
 *
 * Validation enforces:
 *   - Type safety (Zod schemas)
 *   - Length limits (prevent payload bombs)
 *   - Enum constraints
 *   - Business rules (MOQ, quantity sanity checks)
 *   - Ownership fields are STRIPPED (identity comes from JWT only)
 */

export interface ValidationResult {
  valid: boolean;
  data?: any;
  errors?: string[];
}

/** Strips fields that must NEVER come from the client */
const FORBIDDEN_CLIENT_FIELDS = [
  "userId", "supplierId", "walletId", "ledgerId",
  "role", "isAdmin", "internalStatus", "escrowId",
  "platformFee", "commissionRate", "adminApproved",
];

function stripForbiddenFields(body: Record<string, any>): Record<string, any> {
  const cleaned = { ...body };
  for (const field of FORBIDDEN_CLIENT_FIELDS) {
    delete cleaned[field];
  }
  return cleaned;
}

/** Validates and sanitizes request body against a Zod schema */
export function validateBody<T>(
  body: any,
  schema: z.ZodSchema<T>
): ValidationResult {
  if (!body || typeof body !== "object") {
    return { valid: false, errors: ["Request body is required"] };
  }

  // Strip identity fields before validation — Zero Trust
  const cleaned = stripForbiddenFields(body as Record<string, any>);

  const result = schema.safeParse(cleaned);
  if (!result.success) {
    const errors = result.error.issues.map(
      (i) => `${i.path.join(".")}: ${i.message}`
    );
    return { valid: false, errors };
  }

  return { valid: true, data: result.data };
}

/** Validates query parameters against simple constraints */
export function validateQueryParams(
  params: Record<string, string>,
  rules: Record<string, { type: "string" | "number" | "boolean"; required?: boolean; maxLength?: number }>
): ValidationResult {
  const errors: string[] = [];

  for (const [key, rule] of Object.entries(rules)) {
    const value = params[key];
    if (rule.required && !value) {
      errors.push(`Query parameter '${key}' is required`);
      continue;
    }
    if (!value) continue;

    if (rule.type === "number" && isNaN(Number(value))) {
      errors.push(`Query parameter '${key}' must be a number`);
    }
    if (rule.maxLength && value.length > rule.maxLength) {
      errors.push(`Query parameter '${key}' exceeds maximum length of ${rule.maxLength}`);
    }
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}

// ── Public Request Schemas ──────────────────────────────────────────────────

/** Pagination shared schema */
export const PaginationSchema = z.object({
  page:  z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/** Payment intent request — clients can only choose provider + amount */
export const CreatePaymentIntentSchema = z.object({
  orderId:     z.string().min(3).max(100),
  amount:      z.number().positive("Amount must be positive").max(100_000_000, "Amount exceeds limit"),
  currency:    z.string().default("PKR"),
  provider:    z.string(),
  customerPhone: z.string().regex(/^\+92[0-9]{10}$/, "Phone must be E.164 format (+92XXXXXXXXXX)").optional(),
  customerEmail: z.string().email().optional(),
});

/** RFQ creation — buyer facing only */
export const CreateRfqPublicSchema = z.object({
  targetQuantity: z.number().int().min(12).max(100_000),
  customBranding: z.boolean().default(false),
  notes:          z.string().max(1000).optional(),
  items: z.array(z.object({
    productSlug: z.string().min(1).max(200),
    color:       z.string().min(1).max(100),
    quantity:    z.number().int().min(12).max(100_000),
  })).min(1).max(20),
});

/** Withdrawal request — supplier facing */
export const WithdrawalRequestSchema = z.object({
  amount:           z.number().positive().min(5000, "Minimum withdrawal is PKR 5,000"),
  bankAccountIndex: z.number().int().min(0).max(9).default(0),
});

/** Pricing calculation — public */
export const PricingCalculateSchema = z.object({
  productSlug:     z.string().min(1).max(200).optional(),
  productId:       z.string().uuid().optional(),
  quantity:        z.number().int().min(12).max(100_000),
  destinationCity: z.string().min(1).max(100),
}).refine((data) => data.productSlug || data.productId, {
  message: "Either productSlug or productId must be provided",
});

/** Order creation — buyer facing (buyerId injected from JWT) */
export const CreateOrderPublicSchema = z.object({
  rfqId: z.string().uuid().optional(),
  shippingCity: z.string(),
  shippingAddress: z.string().min(5),
  items: z.array(z.object({
    productId: z.string().uuid(),
    color: z.string(),
    sizeRun: z.string(),
    quantityPairs: z.number().int().min(1),
    variantSku: z.string().optional(),
  })).min(1),
});

/** Admin manual payment confirmation — requires reason + audit trail */
export const ManualPaymentConfirmSchema = z.object({
  orderId: z.string().uuid(),
  paymentTxId: z.string().min(1).max(200),
  amount: z.number().positive().max(100_000_000),
  provider: z.enum(["JAZZCASH", "EASYPAISA", "ONE_LINK_PAYFAST", "DIRECT_BANK_TRANSFER"]),
  reason: z.string().min(10).max(500),
});

/** Cart calculation */
export const CalculateCartPublicSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid().optional(),
    productSlug: z.string().optional(),
    quantityPairs: z.coerce.number().int().positive(),
    color: z.string().optional().default("Black"),
    sizeRun: z.string().optional().default("EU 39-44 Assorted"),
    variantSku: z.string().optional(),
  }).refine((data) => data.productId || data.productSlug, {
    message: "Either productId or productSlug must be provided",
  })).min(1),
  destinationCity: z.string().default("Karachi"),
});

/** Search query */
export const SearchQuerySchema = z.object({
  q:           z.string().max(200).default(""),
  category:    z.string().max(100).optional(),
  gender:      z.enum(["men", "women", "kids", "unisex"]).optional(),
  verified:    z.coerce.boolean().optional(),
  maxMoq:      z.coerce.number().int().min(1).max(10_000).optional(),
  city:        z.string().max(100).optional(),
  minPrice:    z.coerce.number().min(0).optional(),
  maxPrice:    z.coerce.number().max(100_000_000).optional(),
  page:        z.coerce.number().int().min(1).max(1000).default(1),
  limit:       z.coerce.number().int().min(1).max(100).default(20),
});
