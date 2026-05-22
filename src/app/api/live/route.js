import { getSessionUser } from "@/lib/session";
import { NextResponse } from "next/server";

/**
 * API Route: /api/live
 * Provides the Gemini API Key for Gemini Live (WebSocket)
 * Security: Requires active user session.
 */
export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      console.warn("[API Live] Unauthorized access attempt.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prioritize GEMINI_API_KEY_2 for multimodal/live features
    const apiKey = process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("[API Live] GEMINI_API_KEY is not configured on the server.");
      return NextResponse.json(
        { error: "Live API key is not configured on the server." },
        { status: 503 }
      );
    }

    console.log(`[API Live] Providing token for user: ${user.email}`);
    return NextResponse.json({ token: apiKey });
  } catch (error) {
    console.error("[API Live] Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
