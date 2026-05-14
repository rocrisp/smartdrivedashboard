import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const identifier = request.headers.get("x-forwarded-for") || "anonymous";
  const rateLimitResult = rateLimit(identifier, "public");

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        retryAfter: new Date(rateLimitResult.resetTime).toISOString(),
      },
      {
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "my-google-dashboard",
        version: "0.1.0",
        database: "connected",
      },
      { headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        service: "my-google-dashboard",
        version: "0.1.0",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 503,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  }
}
