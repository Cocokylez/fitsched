import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, body, icon } = await req.json();

    const subscriptions = await db.pushSubscription.findMany({
      where: { userId: session.user.id },
    });

    const payload = JSON.stringify({
      title,
      body,
      icon: icon || "/icon-512.png",
    });

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
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
    console.error("Push send error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
