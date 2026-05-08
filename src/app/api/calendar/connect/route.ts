import { auth } from "@/lib/auth";
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CALENDAR_CLIENT_ID,
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/calendar/callback`
    );

    const scopes = ["https://www.googleapis.com/auth/calendar.readonly"];
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
      state: session.user.id,
    });

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate auth URL" },
      { status: 500 }
    );
  }
}
