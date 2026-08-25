import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * The native app talks to this API with no origin, so CORS never came up. The
 * browser build does have one, and `x-api-key` is not a CORS-safelisted header,
 * so every call is preceded by a preflight OPTIONS. That preflight carries no
 * api key, so letting it reach a route handler would just earn it a 401 from
 * requireApiKey -- it has to be answered here instead.
 *
 * Set WEB_ORIGIN to lock this down to your deployed web origin (comma-separate
 * for several, e.g. previews). Left unset it allows any origin, which is only
 * reasonable because the api key is the actual gate.
 */
const ALLOWED_ORIGINS = (process.env.WEB_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

function allowedOrigin(request: NextRequest): string | null {
  const origin = request.headers.get("origin")
  if (!origin) return null
  if (ALLOWED_ORIGINS.length === 0) return origin
  return ALLOWED_ORIGINS.includes(origin) ? origin : null
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  }
}

export function middleware(request: NextRequest) {
  const origin = allowedOrigin(request)

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: origin ? corsHeaders(origin) : undefined,
    })
  }

  const response = NextResponse.next()
  if (origin) {
    for (const [header, value] of Object.entries(corsHeaders(origin))) {
      response.headers.set(header, value)
    }
  }
  return response
}

export const config = {
  matcher: "/api/:path*",
}
