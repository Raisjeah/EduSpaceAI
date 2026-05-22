import { getSessionUser } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for both keys, prioritize GEMINI_API_KEY_2 for Live features
    const apiKey = process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("Gemini API key is missing in environment variables.");
      return NextResponse.json(
        { error: "Live session is not configured on the server." },
        { status: 503 }
      );
    }

    // In a production environment, you might want to return a session-specific token
    // or use a proxy to keep the API key hidden. For now, we provide the key
    // to the authenticated user to establish the Bidi connection.
    return NextResponse.json({ token: apiKey });
  } catch (error) {
    console.error("Error in live route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
