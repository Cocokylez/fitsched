import { NextResponse } from "next/server"

/**
 * Adds a request ID and emits a safe structured log for API requests.
 *
 * @returns The response passed through to the matched route.
 */
export function proxy() {
  const requestId = crypto.randomUUID()
  const response = NextResponse.next()

  response.headers.set("X-Request-Id", requestId)

  return response
}

export const config = {
  matcher: ["/api/:path*"],
}
