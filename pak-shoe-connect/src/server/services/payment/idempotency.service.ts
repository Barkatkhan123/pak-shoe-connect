import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { paymentRedis } from "./payment-redis.connection";
import prisma from "../../db";

/** TTL for completed idempotency records: 24 hours */
const IDEMPOTENCY_TTL_SECONDS = 86_400;

/** TTL for in-flight processing locks: 5 minutes */
const PROCESSING_LOCK_TTL_SECONDS = 300;

export interface IdempotencyRecord {
  key: string;
  requestHash: string;
  response: any;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
}

export class IdempotencyConflictError extends Error {
  constructor(message = "Request already being processed") {
    super(message);
    this.name = "IdempotencyConflictError";
  }
}

/**
 * Idempotency service with dual-backend support.
 *
 * - **Primary (Redis)**: Uses SET NX EX for atomic lock acquisition to prevent
 *   concurrent duplicate processing.
 * - **Fallback (PostgreSQL via Prisma)**: When Redis is unavailable, uses the
 *   `IdempotencyKey` table with unique constraint enforcement (P2002) for
 *   atomic lock semantics. This replaces the previous in-memory Map which
 *   was unsafe on serverless (data lost between cold starts).
 */
export class IdempotencyService {
  private static _testStore: Map<string, IdempotencyRecord> = new Map();

  private static isRedisAvailable(): boolean {
    return paymentRedis.status === "ready";
  }

  static hashPayload(payload: any): string {
    const str = typeof payload === "string" ? payload : JSON.stringify(payload || {});
    return crypto.createHash("sha256").update(str).digest("hex");
  }

  /**
   * Checks whether an idempotency key has already been completed.
   *
   * Redis path: GET key → parse JSON → check status.
   * DB fallback: findUnique on IdempotencyKey table → check status.
   */
  static async check(key: string): Promise<{ isDuplicate: boolean; cachedResponse?: any }> {
    if (this.isRedisAvailable()) {
      const raw = await paymentRedis.get(key);
      if (!raw) return { isDuplicate: false };
      const record: IdempotencyRecord = JSON.parse(raw);
      if (record.status === "COMPLETED") {
        return { isDuplicate: true, cachedResponse: record.response };
      }
      return { isDuplicate: false };
    }

    if (process.env.NODE_ENV === "test") {
      const existing = this._testStore.get(key);
      if (!existing) return { isDuplicate: false };
      if (existing.status === "COMPLETED") {
        return { isDuplicate: true, cachedResponse: existing.response };
      }
      return { isDuplicate: false };
    }

    // Database fallback: query the IdempotencyKey table
    const existing = await prisma.idempotencyKey.findUnique({ where: { key } });
    if (!existing) return { isDuplicate: false };
    if (existing.status === "COMPLETED") {
      return { isDuplicate: true, cachedResponse: existing.response };
    }
    return { isDuplicate: false };
  }

  /**
   * Atomically acquires a processing lock.
   *
   * Redis path: SET key value NX EX 300 for atomic lock.
   * DB fallback: INSERT with unique key — a P2002 (unique constraint violation)
   * means the lock is already held. Then checks if the existing record is COMPLETED.
   */
  static async acquireLock(key: string, payload?: any): Promise<{ acquired: boolean; cachedResponse?: any }> {
    const record: IdempotencyRecord = {
      key,
      requestHash: this.hashPayload(payload),
      response: null,
      status: "PROCESSING",
      createdAt: new Date().toISOString(),
    };

    if (this.isRedisAvailable()) {
      const lockResult = await paymentRedis.set(
        key,
        JSON.stringify(record),
        "EX",
        PROCESSING_LOCK_TTL_SECONDS,
        "NX",
      );

      if (lockResult === "OK") {
        return { acquired: true };
      }

      const raw = await paymentRedis.get(key);
      if (!raw) {
        return { acquired: false };
      }

      const existing: IdempotencyRecord = JSON.parse(raw);
      if (existing.status === "COMPLETED") {
        return { acquired: false, cachedResponse: existing.response };
      }

      return { acquired: false };
    }

    if (process.env.NODE_ENV === "test") {
      const existing = this._testStore.get(key);
      if (!existing) {
        this._testStore.set(key, record);
        return { acquired: true };
      }
      if (existing.status === "COMPLETED") {
        return { acquired: false, cachedResponse: existing.response };
      }
      return { acquired: false };
    }

    // Database fallback: attempt INSERT — unique constraint acts as the lock
    try {
      await prisma.idempotencyKey.create({
        data: {
          key,
          requestHash: record.requestHash,
          status: "PROCESSING",
          expiresAt: new Date(Date.now() + PROCESSING_LOCK_TTL_SECONDS * 1000),
        },
      });
      return { acquired: true };
    } catch (error) {
      // P2002 = unique constraint violation → key already exists (lock held)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const existing = await prisma.idempotencyKey.findUnique({ where: { key } });
        if (existing?.status === "COMPLETED") {
          return { acquired: false, cachedResponse: existing.response };
        }
        return { acquired: false };
      }
      throw error;
    }
  }

  /** @deprecated Use acquireLock instead */
  static async start(key: string, payload?: any): Promise<void> {
    const lock = await this.acquireLock(key, payload);
    if (!lock.acquired && !lock.cachedResponse) {
      throw new IdempotencyConflictError();
    }
  }

  /**
   * Marks an idempotency key as COMPLETED and stores the response.
   *
   * Redis path: SET key JSON EX 86400.
   * DB fallback: UPSERT into IdempotencyKey with COMPLETED status, response,
   * and a 24-hour expiry timestamp.
   */
  static async complete(key: string, response: any): Promise<void> {
    const record: IdempotencyRecord = {
      key,
      requestHash: "",
      response,
      status: "COMPLETED",
      createdAt: new Date().toISOString(),
    };

    if (this.isRedisAvailable()) {
      await paymentRedis.set(key, JSON.stringify(record), "EX", IDEMPOTENCY_TTL_SECONDS);
      return;
    }

    if (process.env.NODE_ENV === "test") {
      this._testStore.set(key, record);
      return;
    }

    // Database fallback: upsert with COMPLETED status and 24h TTL
    const jsonResponse = (response === undefined || response === null)
      ? Prisma.DbNull
      : (response as Prisma.InputJsonValue);

    await prisma.idempotencyKey.upsert({
      where: { key },
      update: {
        status: "COMPLETED",
        response: jsonResponse,
        expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_SECONDS * 1000),
      },
      create: {
        key,
        requestHash: record.requestHash,
        status: "COMPLETED",
        response: jsonResponse,
        expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_SECONDS * 1000),
      },
    });
  }

  static clear(): void {
    this._testStore.clear();
  }
}
