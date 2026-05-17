import { NextResponse } from "next/server"
import { apiError } from "@/lib/apiResponse"

type RateLimitPreset = {
  windowMs: number
  max: number
}

type RateLimitOptions = RateLimitPreset & {
  key: string
  name: string
}

type RateLimitBucket = {
  count: number
  resetAt: number
}

declare global {
  // In-memory limits are useful on a single Node runtime. Configure Redis,
  // Upstash, Vercel KV, or another shared store before relying on this for
  // multi-region production abuse prevention.
  var __fitschedRateLimits: Map<string, RateLimitBucket> | undefined
}

const buckets = globalThis.__fitschedRateLimits ?? new Map<string, RateLimitBucket>()
globalThis.__fitschedRateLimits = buckets

export const rateLimitPresets = {
  auth: { windowMs: 15 * 60 * 1000, max: 20 },
  unauthenticated: { windowMs: 60 * 1000, max: 20 },
  read: { windowMs: 60 * 1000, max: 120 },
  write: { windowMs: 60 * 1000, max: 40 },
  strictWrite: { windowMs: 60 * 1000, max: 12 },
  expensive: { windowMs: 60 * 60 * 1000, max: 10 },
} satisfies Record<string, RateLimitPreset>

/**
 * Gets the best available client IP from trusted proxy headers.
 *
 * @param req - Incoming request to inspect.
 * @returns A client IP string, or "unknown" when unavailable.
 */
function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    forwardedFor ||
    "unknown"
  )
}

/**
 * Applies an in-memory rate limit to the request.
 *
 * @param req - Incoming request being limited.
 * @param options - Rate limit window, max count, bucket key, and bucket name.
 * @returns A 429 response when limited, otherwise null.
 */
export function rateLimit(req: Request, options: RateLimitOptions) {
  const now = Date.now()
  const bucketKey = `${options.name}:${options.key}`
  const current = buckets.get(bucketKey)

  if (!current || current.resetAt <= now) {
    buckets.set(bucketKey, {
      count: 1,
      resetAt: now + options.windowMs,
    })
    return null
  }

  current.count += 1

  if (current.count <= options.max) return null

  const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000))
  logSecurityEvent("rate_limit_hit", {
    route: new URL(req.url).pathname,
    name: options.name,
    retryAfter,
  })

  return NextResponse.json(
    {
      success: false,
      data: null,
      error: "Too many requests. Please try again later.",
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
      },
    },
  )
}

/**
 * Applies a rate limit bucket keyed by client IP.
 *
 * @param req - Incoming request being limited.
 * @param preset - Window and max settings.
 * @param name - Stable name for this limit bucket.
 * @returns A 429 response when limited, otherwise null.
 */
export function rateLimitByIp(req: Request, preset: RateLimitPreset, name: string) {
  return rateLimit(req, {
    ...preset,
    key: getClientIp(req),
    name,
  })
}

/**
 * Applies a rate limit bucket keyed by authenticated user ID.
 *
 * @param req - Incoming request being limited.
 * @param userId - Authenticated user ID.
 * @param preset - Window and max settings.
 * @param name - Stable name for this limit bucket.
 * @returns A 429 response when limited, otherwise null.
 */
export function rateLimitByUser(req: Request, userId: string, preset: RateLimitPreset, name: string) {
  return rateLimit(req, {
    ...preset,
    key: userId,
    name,
  })
}

/**
 * Blocks unsafe cross-origin state-changing requests.
 *
 * @param req - Incoming request to validate.
 * @returns A 403 response when blocked, otherwise null.
 */
export function validateSameOrigin(req: Request) {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return null

  const origin = req.headers.get("origin")
  if (!origin) return null

  const host = req.headers.get("host")
  if (!host) return null

  try {
    if (new URL(origin).host === host) return null
  } catch {
    return apiError("Invalid request origin", 403)
  }

  logSecurityEvent("cross_origin_blocked", {
    route: new URL(req.url).pathname,
  })
  return apiError("Invalid request origin", 403)
}

/**
 * Reads and parses a JSON request body with a maximum byte limit.
 *
 * @param req - Incoming request containing JSON.
 * @param maxBytes - Maximum allowed body size in bytes.
 * @returns Parsed JSON value.
 */
export async function readJsonBody(req: Request, maxBytes = 32_000) {
  const contentLength = Number(req.headers.get("content-length") || 0)
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new Error("REQUEST_TOO_LARGE")
  }

  try {
    const raw = await req.text()
    if (new TextEncoder().encode(raw).length > maxBytes) {
      throw new Error("REQUEST_TOO_LARGE")
    }
    return JSON.parse(raw)
  } catch (error) {
    if (error instanceof Error && error.message === "REQUEST_TOO_LARGE") throw error
    throw new Error("INVALID_JSON")
  }
}

/**
 * Converts known body parsing errors into safe client responses.
 *
 * @param error - Unknown caught error from request parsing.
 * @returns A safe error response for known parsing failures, otherwise null.
 */
export function requestBodyErrorResponse(error: unknown) {
  if (!(error instanceof Error)) return null
  if (error.message === "REQUEST_TOO_LARGE") return safeError("Request body is too large", 413)
  if (error.message === "INVALID_JSON") return safeError("Invalid JSON body")
  return null
}

/**
 * Normalizes untrusted text input into a single safe line.
 *
 * @param value - Unknown value to sanitize.
 * @param maxLength - Maximum output length.
 * @returns A cleaned string, or an empty string for non-string input.
 */
export function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return ""
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength)
}

/**
 * Checks whether a value matches the local YYYY-MM-DD date identifier format.
 *
 * @param value - Unknown value to validate.
 * @returns True when the value is a valid date identifier string.
 */
export function isDateId(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

/**
 * Parses and clamps an integer-like value.
 *
 * @param value - Unknown value to parse.
 * @param min - Minimum allowed integer.
 * @param max - Maximum allowed integer.
 * @param fallback - Value returned when parsing fails.
 * @returns A clamped integer.
 */
export function clampInt(value: unknown, min: number, max: number, fallback: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(min, Math.round(parsed)))
}

/**
 * Creates a safe public error response.
 *
 * @param message - Public error message.
 * @param status - HTTP status code.
 * @returns A JSON error response.
 */
export function safeError(message = "Invalid request", status = 400) {
  return apiError(message, status)
}

/**
 * Logs a security event without including secrets or sensitive values.
 *
 * @param event - Stable event name.
 * @param details - Non-sensitive metadata about the event.
 * @returns Nothing.
 */
export function logSecurityEvent(event: string, details: Record<string, unknown> = {}) {
  console.warn(`[security] ${event}`, details)
}
