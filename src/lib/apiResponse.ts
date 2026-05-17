import { NextResponse } from "next/server"

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
