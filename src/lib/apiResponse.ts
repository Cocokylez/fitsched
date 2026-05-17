import { NextResponse } from "next/server"
import { logError } from "@/lib/logger"

export type ApiResponse<T> = {
  success: boolean
  data: T | null
  error: string | null
}

/**
 * Creates a consistent successful JSON response for API routes.
 *
 * @param data - The payload returned to the client.
 * @param status - HTTP status code to send with the response.
 * @returns A Next.js JSON response with the shared API envelope.
 */
export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
      error: null,
    },
    { status },
  )
}

/**
 * Creates a consistent safe error JSON response for API routes.
 *
 * @param error - Public error message safe to show to the client.
 * @param status - HTTP status code to send with the response.
 * @returns A Next.js JSON response with the shared API envelope.
 */
export function apiError(error = "Invalid request", status = 400) {
  return NextResponse.json<ApiResponse<never>>(
    {
      success: false,
      data: null,
      error,
    },
    { status },
  )
}

/**
 * Creates a standard unauthorized response.
 *
 * @returns A 401 API error response.
 */
export function unauthorized() {
  return apiError("Unauthorized", 401)
}

/**
 * Logs an internal error and returns a safe public response.
 *
 * @param error - Unknown error thrown by backend code.
 * @param context - Non-sensitive metadata about the failed route.
 * @param message - Development-friendly error message.
 * @returns A 500 API error response.
 */
export function internalError(error: unknown, context: Record<string, unknown>, message = "Something went wrong") {
  logError(error, context)
  return apiError(process.env.NODE_ENV === "production" ? "Something went wrong" : message, 500)
}
