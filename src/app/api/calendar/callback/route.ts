import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { encryptSecret } from "@/lib/fieldEncryption";
import { serverEnv } from "@/lib/env";
import { rateLimitByUser, rateLimitPresets } from "@/lib/security";
import { cleanStringSchema, parseQuery, strictObject } from "@/lib/validation";
import { google } from "googleapis";
import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";

const calendarCallbackQuerySchema = strictObject({
  code: cleanStringSchema(4_000, 1),
  state: cleanStringSchema(128, 1),
  scope: cleanStringSchema(2_000).optional(),
  authuser: cleanStringSchema(20).optional(),
  prompt: cleanStringSchema(80).optional(),
  hd: cleanStringSchema(255).optional(),
  error: cleanStringSchema(255).optional(),
  error_description: cleanStringSchema(1_000).optional(),
})

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      const origin = new URL(req.url).origin;
      return NextResponse.redirect(`${origin}/login`);
    }
    const limited = rateLimitByUser(req, session.user.id, rateLimitPresets.strictWrite, "calendar:callback");
    if (limited) return limited;

    const parsedQuery = parseQuery(req, calendarCallbackQuerySchema);
    const code = parsedQuery.data?.code;
    const state = parsedQuery.data?.state;
    const storedState = req.headers
      .get("cookie")
      ?.split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith("fitsched_calendar_oauth_state="))
      ?.split("=")[1];

    const origin = new URL(req.url).origin;

    if (parsedQuery.response || !code || !state || !storedState || state !== decodeURIComponent(storedState)) {
      return NextResponse.redirect(
        `${origin}/settings?error=invalid_state`
      );
    }

    if (!serverEnv.googleCalendarClientId || !serverEnv.googleCalendarClientSecret) {
      return NextResponse.redirect(`${origin}/settings?error=calendar_not_configured`);
    }

    const oauth2Client = new google.auth.OAuth2(
      serverEnv.googleCalendarClientId,
      serverEnv.googleCalendarClientSecret,
      `${origin}/api/calendar/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.redirect(
        `${origin}/settings?error=missing_tokens`
      );
    }

    const expiry = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600000);

    await db.calendarConnection.upsert({
      where: {
        userId_calendarId: {
          userId: session.user.id,
          calendarId: "primary",
        },
      },
      create: {
        userId: session.user.id,
        googleToken: encryptSecret(tokens.access_token),
        refreshToken: encryptSecret(tokens.refresh_token),
        tokenExpiry: expiry,
        calendarId: "primary",
      },
      update: {
        googleToken: encryptSecret(tokens.access_token),
        refreshToken: encryptSecret(tokens.refresh_token),
        tokenExpiry: expiry,
      },
    });

    const response = NextResponse.redirect(
      `${origin}/schedule?connected=true`
    );
    response.cookies.delete("fitsched_calendar_oauth_state");

    return response;
  } catch (error) {
    logError(error, { route: "calendar:callback" });
    const origin = new URL(req.url).origin;
    return NextResponse.redirect(
      `${origin}/settings?error=auth_failed`
    );
  }
}
