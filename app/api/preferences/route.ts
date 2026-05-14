import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResult = rateLimit(session.user.id, "authenticated");

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

    let preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    });

    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json(preferences, {
      headers: getRateLimitHeaders(rateLimitResult),
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResult = rateLimit(session.user.id, "authenticated");

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

    const body = await request.json();
    const {
      emailNotifications,
      activityEmailDigest,
      showRecentActivity,
      hasSeenWelcome,
      theme,
      language,
      timezone,
    } = body;

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(activityEmailDigest !== undefined && { activityEmailDigest }),
        ...(showRecentActivity !== undefined && { showRecentActivity }),
        ...(hasSeenWelcome !== undefined && { hasSeenWelcome }),
        ...(theme !== undefined && { theme }),
        ...(language !== undefined && { language }),
        ...(timezone !== undefined && { timezone }),
      },
      create: {
        userId: session.user.id,
        emailNotifications: emailNotifications ?? true,
        activityEmailDigest: activityEmailDigest ?? false,
        showRecentActivity: showRecentActivity ?? true,
        hasSeenWelcome: hasSeenWelcome ?? false,
        theme: theme ?? "system",
        language: language ?? "en",
        timezone: timezone ?? "UTC",
      },
    });

    return NextResponse.json(preferences, {
      headers: getRateLimitHeaders(rateLimitResult),
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
