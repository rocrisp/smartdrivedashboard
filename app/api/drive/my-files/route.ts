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
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const pageToken = searchParams.get("pageToken") || undefined;
    const mimeType = searchParams.get("mimeType") || undefined;

    const driveClient = new GoogleDriveClient(session.accessToken);
    const result = await driveClient.getMyFiles(mimeType, pageSize, pageToken);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching my files:", error);
    return NextResponse.json(
      { error: "Failed to fetch my files" },
      { status: 500 }
    );
  }
}
