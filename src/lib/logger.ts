import pino from "pino"

export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
  redact: {
    paths: [
      "password",
      "token",
      "access_token",
      "refresh_token",
      "authorization",
      "cookie",
      "*.password",
      "*.token",
      "*.access_token",
      "*.refresh_token",
      "*.authorization",
      "*.cookie",
    ],
    censor: "[redacted]",
  },
})

/**
 * Logs a backend request event without sensitive headers or request bodies.
 *
 * @param details - Safe request metadata to emit.
 * @returns Nothing.
 */
export function logRequest(details: { method: string; path: string; status?: number; requestId?: string }) {
  logger.info(
    {
      event: "request",
      method: details.method,
      path: details.path,
      status: details.status,
      requestId: details.requestId,
      timestamp: new Date().toISOString(),
    },
    "request",
  )
}

/**
 * Logs an application error with safe context metadata.
 *
 * @param error - Unknown error thrown by backend code.
 * @param context - Non-sensitive metadata about where the error occurred.
 * @returns Nothing.
 */
export function logError(error: unknown, context: Record<string, unknown> = {}) {
  logger.error(
    {
      event: "error",
      error,
      ...context,
      timestamp: new Date().toISOString(),
    },
    "backend error",
  )
}
