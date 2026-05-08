self.addEventListener("push", (event: any) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || "You have a new notification",
    icon: data.icon || "/icon-512.png",
    badge: "/icon-192.png",
    tag: "fitsched-notification",
    renotify: true,
    actions: [
      { action: "view", title: "View", icon: "/icon-192.png" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "FitSched", options)
  );
});

self.addEventListener("notificationclick", (event: any) => {
  event.notification.close();

  if (event.action === "view") {
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes("/schedule") && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow("/schedule");
        }
      })
    );
  }
});

self.addEventListener("install", (event: any) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event: any) => {
  event.waitUntil(self.clients.claim());
});

export {};
