import { auth } from "@/lib/auth";
import { internalError, unauthorized } from "@/lib/apiResponse";
import { db } from "@/lib/db";
import { rateLimitByUser, rateLimitPresets, safeError, validateSameOrigin } from "@/lib/security";
import { cleanStringSchema, parseJsonBody, strictObject, z } from "@/lib/validation";
import { NextResponse } from "next/server";

const pushSubscriptionSchema = strictObject({
  endpoint: cleanStringSchema(2_000, 1).refine((value) => value.startsWith("https://")),
  expirationTime: z.union([z.number(), z.string(), z.null()]).optional(),
  keys: strictObject({
    p256dh: cleanStringSchema(256, 1),
    auth: cleanStringSchema(256, 1),
  }),
})

export async function POST(req: Request) {
  try {
    const originError = validateSameOrigin(req);
    if (originError) return originError;

    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized();
    }
    const limited = rateLimitByUser(req, session.user.id, rateLimitPresets.write, "push:subscribe");
    if (limited) return limited;

    const parsedBody = await parseJsonBody(req, pushSubscriptionSchema, 16_000);
    if (parsedBody.response) return parsedBody.response;
    const { endpoint, keys } = parsedBody.data;
    const { p256dh, auth: authKey } = keys;

    const existing = await db.pushSubscription.findUnique({
      where: { endpoint },
      select: { userId: true },
    });

    if (existing && existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Subscription already registered" }, { status: 409 });
    }

    await db.pushSubscription.upsert({
      where: { endpoint },
      create: {
        userId: session.user.id,
        endpoint,
        p256dh,
        auth: authKey,
      },
      update: {
        p256dh,
        auth: authKey,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return internalError(error, { route: "push:subscribe" }, "Failed to subscribe");
  }
}
