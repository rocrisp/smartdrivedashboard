import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleDriveClient } from "@/lib/google-drive";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const pageToken = searchParams.get("pageToken") || undefined;

    if (!query) {
      return NextResponse.json({ error: "Query parameter required" }, { status: 400 });
    }

    const driveClient = new GoogleDriveClient(session.accessToken);
    const result = await driveClient.searchFiles(query, pageSize, pageToken);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error searching files:", error);
    return NextResponse.json(
      { error: "Failed to search files" },
      { status: 500 }
    );
  }
}
