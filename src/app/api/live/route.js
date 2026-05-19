import { getSessionUser } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Providing the API Key to the frontend for the direct WebSocket connection.
  // In a production environment, this could be a short-lived token or a proxy.
  return NextResponse.json({
    apiKey: process.env.GEMINI_API_KEY
  });
}
