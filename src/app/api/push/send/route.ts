import { auth } from "@/lib/auth";
import { internalError, unauthorized } from "@/lib/apiResponse";
import { db } from "@/lib/db";
import { serverEnv } from "@/lib/env";
import { rateLimitByUser, rateLimitPresets, safeError, validateSameOrigin } from "@/lib/security";
import { cleanStringSchema, optionalCleanStringSchema, parseJsonBody, strictObject } from "@/lib/validation";
import { NextResponse } from "next/server";
import webpush from "web-push";

const pushSendBodySchema = strictObject({
  title: cleanStringSchema(80, 1),
  body: cleanStringSchema(240, 1),
  icon: optionalCleanStringSchema(120),
})

function getWebpush() {
  const subject = serverEnv.vapidSubject;
  const publicKey = serverEnv.vapidPublicKey;
  const privateKey = serverEnv.vapidPrivateKey;
  if (!subject || !publicKey || !privateKey) return null;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return webpush;
}

export async function POST(req: Request) {
  try {
    const originError = validateSameOrigin(req);
    if (originError) return originError;

    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized();
    }
    const limited = rateLimitByUser(req, session.user.id, rateLimitPresets.strictWrite, "push:send");
    if (limited) return limited;

    const parsedBody = await parseJsonBody(req, pushSendBodySchema, 8_000);
    if (parsedBody.response) return parsedBody.response;
    const { title, body } = parsedBody.data;
    const requestedIcon = parsedBody.data.icon || "";
    const icon = requestedIcon.startsWith("/") || requestedIcon.startsWith("https://")
      ? requestedIcon
      : "/icon-512.png";

    if (!title || !body) return safeError("Notification title and body required");

    const subscriptions = await db.pushSubscription.findMany({
      where: { userId: session.user.id },
    });

    const payload = JSON.stringify({
      title,
      body,
      icon,
    });

    const wp = getWebpush();
    if (!wp) {
      return NextResponse.json({ error: "Push not configured" }, { status: 500 });
    }

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        wp.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        )
      )
    );

    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0 && failed.length === subscriptions.length) {
      return NextResponse.json(
        { error: "Failed to send notifications" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sent: results.filter((r) => r.status === "fulfilled").length,
    });
  } catch (error) {
    return internalError(error, { route: "push:send" }, "Failed to send notification");
  }
}
