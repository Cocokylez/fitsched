import { logger } from "@/lib/logger"
import { NextResponse, type NextRequest } from "next/server"

/**
 * Adds a request ID and emits a safe structured log for API requests.
 *
 * @param req - Incoming Next.js request.
 * @returns The response passed through to the matched route.
 */
export function proxy(req: NextRequest) {
  const requestId = crypto.randomUUID()
  const response = NextResponse.next()

  response.headers.set("X-Request-Id", requestId)

  logger.info(
    {
      event: "request",
      method: req.method,
      path: req.nextUrl.pathname,
      status: response.status,
      requestId,
      timestamp: new Date().toISOString(),
    },
    "request",
  )

  return response
}

export const config = {
  matcher: ["/api/:path*"],
}
