import { auth } from "@/lib/auth";
import { internalError, unauthorized } from "@/lib/apiResponse";
import { serverEnv } from "@/lib/env";
import { rateLimitByUser, rateLimitPresets } from "@/lib/security";
import { parseQuery, strictObject } from "@/lib/validation";
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized();
    }
    const limited = rateLimitByUser(req, session.user.id, rateLimitPresets.strictWrite, "calendar:connect");
    if (limited) return limited;

    const parsedQuery = parseQuery(req, strictObject({}));
    if (parsedQuery.response) return parsedQuery.response;

    if (!serverEnv.googleCalendarClientId || !serverEnv.googleCalendarClientSecret) {
      return NextResponse.json({ error: "Calendar integration is not configured" }, { status: 503 });
    }

    const origin = new URL(req.url).origin;
    const state = crypto.randomUUID();

    const oauth2Client = new google.auth.OAuth2(
      serverEnv.googleCalendarClientId,
      serverEnv.googleCalendarClientSecret,
      `${origin}/api/calendar/callback`
    );

    const scopes = ["https://www.googleapis.com/auth/calendar.readonly"];
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
      state,
    });

    const response = NextResponse.json({ url });
    response.cookies.set("fitsched_calendar_oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    return internalError(error, { route: "calendar:connect" }, "Failed to generate auth URL");
  }
}
