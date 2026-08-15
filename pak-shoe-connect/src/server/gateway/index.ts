/**
 * Zero Trust API Gateway — Anamon B2B Platform
 *
 * This is the ONLY public entry point. All internal services, engines,
 * databases, queues, and infrastructure are completely hidden behind this layer.
 *
 * Architecture:
 *   Browser/Mobile → HTTPS → API Gateway → Internal Services
 *
 * Security layers applied per-request (in order):
 *   1. Correlation ID
 *   2. Rate Limiting
 *   3. Request Validation
 *   4. Authentication (JWT)
 *   5. Authorization (RBAC + Ownership)
 *   6. Business Logic (internal services)
 *   7. Response DTO Mapping (strips internal fields)
 *   8. Error Normalization (never exposes internals)
 */

export * from "./gateway";
export * from "./middleware/correlation-id.middleware";
export * from "./middleware/auth.middleware";
export * from "./middleware/rate-limit.middleware";
export * from "./middleware/validate.middleware";
export * from "./middleware/error-handler.middleware";
export * from "./dto/common.dto";
