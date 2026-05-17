import { z } from "zod"

const OPTIONAL_SECRET_GROUPS = [
  ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  ["GOOGLE_CALENDAR_CLIENT_ID", "GOOGLE_CALENDAR_CLIENT_SECRET"],
  ["VAPID_SUBJECT", "VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY"],
] as const

const FIELD_ENCRYPTION_KEY_SCHEMA = z
  .string()
  .trim()
  .refine(
    (value) => /^[0-9a-f]{64}$/i.test(value) || /^[A-Za-z0-9+/=]{43,88}$/.test(value),
    "FIELD_ENCRYPTION_KEY must be 32 bytes as base64 or 64 hex characters",
  )

/**
 * Reads an environment variable as a trimmed string.
 *
 * @param key - Environment variable name to read.
 * @returns Trimmed value, or an empty string when missing.
 */
function readEnv(key: string) {
  return (process.env[key] || "").trim()
}

/**
 * Throws when some, but not all, variables in a secret group are configured.
 *
 * @param keys - Environment variable names that must be configured together.
 * @returns Nothing.
 */
function assertCompleteSecretGroup(keys: readonly string[]) {
  const present = keys.filter((key) => readEnv(key))
  if (present.length > 0 && present.length !== keys.length) {
    throw new Error(`Missing environment variables for secret group: ${keys.join(", ")}`)
  }
}

/**
 * Detects Next's production build phase, where route modules are evaluated
 * before runtime-only secrets may be available in local or preview builds.
 *
 * @returns True when Next.js is collecting production build data.
 */
function isNextProductionBuild() {
  return readEnv("NEXT_PHASE") === "phase-production-build"
}

/**
 * Validates required server-side environment variables at backend startup/import time.
 *
 * @returns A normalized subset of safe environment values.
 */
export function validateServerEnv() {
  const missing: string[] = []

  if (!readEnv("DATABASE_URL")) missing.push("DATABASE_URL")
  if (!readEnv("AUTH_SECRET") && !readEnv("NEXTAUTH_SECRET")) missing.push("AUTH_SECRET or NEXTAUTH_SECRET")

  for (const group of OPTIONAL_SECRET_GROUPS) {
    assertCompleteSecretGroup(group)
  }

  const hasCalendarSecrets = Boolean(readEnv("GOOGLE_CALENDAR_CLIENT_ID") && readEnv("GOOGLE_CALENDAR_CLIENT_SECRET"))
  const fieldEncryptionKey = readEnv("FIELD_ENCRYPTION_KEY")

  if (fieldEncryptionKey) {
    FIELD_ENCRYPTION_KEY_SCHEMA.parse(fieldEncryptionKey)
  }

  if (process.env.NODE_ENV === "production" && hasCalendarSecrets && !fieldEncryptionKey && !isNextProductionBuild()) {
    missing.push("FIELD_ENCRYPTION_KEY")
  }

  if (missing.length > 0) {
    throw new Error(`Missing required server environment variables: ${missing.join(", ")}`)
  }

  return {
    authSecret: readEnv("AUTH_SECRET") || readEnv("NEXTAUTH_SECRET"),
    fieldEncryptionKey: fieldEncryptionKey || null,
    googleClientId: readEnv("GOOGLE_CLIENT_ID") || null,
    googleClientSecret: readEnv("GOOGLE_CLIENT_SECRET") || null,
    googleCalendarClientId: readEnv("GOOGLE_CALENDAR_CLIENT_ID") || null,
    googleCalendarClientSecret: readEnv("GOOGLE_CALENDAR_CLIENT_SECRET") || null,
    googleApiKey: readEnv("GOOGLE_API_KEY") || null,
    vapidSubject: readEnv("VAPID_SUBJECT") || null,
    vapidPublicKey: readEnv("VAPID_PUBLIC_KEY") || null,
    vapidPrivateKey: readEnv("VAPID_PRIVATE_KEY") || null,
    allowedOrigins: readEnv("ALLOWED_ORIGINS"),
    appUrl: readEnv("NEXTAUTH_URL") || readEnv("AUTH_URL") || null,
    vercelUrl: readEnv("VERCEL_URL") || null,
    timeZone: readEnv("FITSCHED_TIME_ZONE") || "Asia/Singapore",
  }
}

export const serverEnv = validateServerEnv()
