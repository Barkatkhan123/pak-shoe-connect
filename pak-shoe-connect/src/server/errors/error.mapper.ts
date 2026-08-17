import { AppError } from "./app-error";
import { ZodError } from "zod";

export function mapToAppError(error: any, correlationId?: string): AppError {
  if (error instanceof AppError) {
    return error;
  }

  // 1. Handle Zod validation errors
  if (error instanceof ZodError) {
    const message = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    return new AppError(`Validation failed: ${message}`, "VALIDATION_ERROR", 400, correlationId);
  }

  // 2. Handle Prisma errors
  if (error && typeof error.code === "string" && error.constructor.name.includes("Prisma")) {
    switch (error.code) {
      case "P2025":
        return new AppError("Requested resource not found", "NOT_FOUND", 404, correlationId);
      case "P2002":
        return new AppError(
          "A resource with that unique identifier already exists",
          "CONFLICT",
          409,
          correlationId,
        );
      case "P2003":
        return new AppError(
          "Reference constraint violation (invalid target referenced)",
          "INVALID_REFERENCE",
          400,
          correlationId,
        );
      default:
        // Generic Prisma code fallback
        return new AppError("Database operation failed", "DATABASE_ERROR", 500, correlationId);
    }
  }

  // 3. Handle Auth / JWT Errors
  if (
    error &&
    (error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.message?.includes("jwt"))
  ) {
    return new AppError(
      error.message || "Unauthorized access token validation failed",
      "UNAUTHORIZED",
      401,
      correlationId,
    );
  }

  // 4. Fallback unknown error
  const isProduction = process.env.NODE_ENV === "production";
  const publicMessage = isProduction
    ? "An internal server error occurred"
    : error.message || "Internal server error";

  return new AppError(
    publicMessage,
    "INTERNAL_SERVER_ERROR",
    500,
    correlationId,
    false, // Mark as non-operational
  );
}
