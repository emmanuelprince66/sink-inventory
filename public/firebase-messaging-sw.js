importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGLjB-VYTsjcCHAOZxg7a57caGK0nfUWE",
  authDomain: "sync360-78f4d.firebaseapp.com",
  projectId: "sync360-78f4d",
  storageBucket: "sync360-78f4d.firebasestorage.app",
  messagingSenderId: "178915188057",
  appId: "1:178915188057:web:085abf45b7f630cf868048",
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
}

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("🔔 Received background message:", payload);

  try {
    // Prepare the payload to match NotificationPayload interface
    const notificationPayload = {
      title:
        payload.notification?.title ||
        payload.data?.title ||
        "New Notification",
      body:
        payload.notification?.body ||
        payload.data?.body ||
        "You have a new message",
      icon:
        payload.notification?.icon ||
        payload.data?.icon ||
        "/icons/notification-icon.png",
      badge: payload.data?.badge || "/icons/badge-icon.png",
      tag: payload.data?.tag || "sync360-notification",
      data: {
        ...payload.data,
        fcm_message_id: payload.fcmMessageId,
        timestamp: new Date().toISOString(),
        click_action:
          payload.data?.click_action || payload.fcmOptions?.link || "/",
      },
    };

    // Send the payload to all open clients
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        if (clients.length === 0) {
          console.log("❌ No open clients to send notification");
          // Fallback to native notification if no clients are open
          return self.registration.showNotification(notificationPayload.title, {
            body: notificationPayload.body,
            icon: notificationPayload.icon,
            badge: notificationPayload.badge,
            tag: notificationPayload.tag,
            data: notificationPayload.data,
            requireInteraction: false,
          });
        }

        clients.forEach((client) => {
          client.postMessage({
            type: "BACKGROUND_NOTIFICATION",
            payload: notificationPayload,
          });
        });
      });
  } catch (error) {
    console.error("❌ Error handling background message:", error);
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("🖱️ Notification click received:", event);

  event.notification.close();

  const clickAction = event.notification.data?.click_action || "/";

  const handleClick = async () => {
    try {
      if (event.action === "dismiss") {
        console.log("❌ Dismiss action clicked");
        return;
      }

      console.log(
        event.action === "view"
          ? "👀 View action clicked"
          : "📱 Default notification click"
      );

      // Try to focus existing window
      const windowClients = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of windowClients) {
        if (
          client.url.includes(
            new URL(clickAction, self.location.origin).pathname
          )
        ) {
          await client.focus();
          client.postMessage({
            type: "notification_click",
            notification: {
              title: event.notification.title,
              body: event.notification.body,
              data: event.notification.data,
              action: event.action || "default",
            },
          });
          return;
        }
      }

      // Open new window if no matching window exists
      const newWindow = await clients.openWindow(clickAction);
      if (newWindow) {
        setTimeout(() => {
          newWindow.postMessage({
            type: "notification_click",
            notification: {
              title: event.notification.title,
              body: event.notification.body,
              data: event.notification.data,
              action: event.action || "default",
            },
          });
        }, 1000);
      }
    } catch (error) {
      console.error("❌ Error handling notification click:", error);
    }
  };

  event.waitUntil(handleClick());
});

// Service worker lifecycle management
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});
