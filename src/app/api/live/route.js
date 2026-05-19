import { getSessionUser } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientToken = process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY_2;

  if (!clientToken) {
    return NextResponse.json(
      { error: "Live token is not configured on the server." },
      { status: 503 }
    );
  }

  return NextResponse.json({ token: clientToken });
}
