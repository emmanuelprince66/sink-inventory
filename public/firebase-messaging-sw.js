// public/firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// Note: In service worker, we can't access process.env directly
// The config will be passed from the main thread or hardcoded
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
  console.log("✅ Firebase initialized in service worker");
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
}

const messaging = firebase.messaging();

// Enhanced background message handler with better error handling
messaging.onBackgroundMessage((payload) => {
  console.log("🔔 Received background message:", payload);

  try {
    const notificationTitle =
      payload.notification?.title || payload.data?.title || "New Notification";
    const notificationBody =
      payload.notification?.body ||
      payload.data?.body ||
      "You have a new message";

    const notificationOptions = {
      body: notificationBody,
      icon:
        payload.notification?.icon ||
        payload.data?.icon ||
        "/icons/notification-icon.png",
      badge: payload.data?.badge || "/icons/badge-icon.png",
      image: payload.notification?.image || payload.data?.image,
      tag: payload.data?.tag || "sync360-notification",
      data: {
        ...payload.data,
        fcm_message_id: payload.fcmMessageId,
        timestamp: new Date().toISOString(),
        click_action:
          payload.data?.click_action || payload.fcmOptions?.link || "/",
      },
      requireInteraction: false, // Changed to false for better UX
      actions: [
        {
          action: "view",
          title: "View",
        },
        {
          action: "dismiss",
          title: "Dismiss",
        },
      ],
    };

    console.log(
      "📱 Showing notification:",
      notificationTitle,
      notificationOptions
    );

    return self.registration.showNotification(
      notificationTitle,
      notificationOptions
    );
  } catch (error) {
    console.error("❌ Error showing notification:", error);
  }
});

// Enhanced notification click handler
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

      // Handle view action or default click
      console.log(
        event.action === "view"
          ? "👀 View action clicked"
          : "📱 Default notification click"
      );

      // Try to focus existing window first
      const windowClients = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // Check if there's already a window open
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

      // If no matching window, open new one
      const newWindow = await clients.openWindow(clickAction);
      if (newWindow) {
        // Send message after a brief delay to ensure window is ready
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

// Enhanced message listener
self.addEventListener("message", (event) => {
  console.log("📨 Service worker received message:", event.data);

  if (event.data && event.data.type === "FCM_MESSAGE") {
    const clients = event.ports[0];
    if (clients) {
      clients.postMessage({
        type: "notification",
        ...event.data.payload,
      });
    }
  }
});

// Add install and activate listeners for better service worker lifecycle management
self.addEventListener("install", (event) => {
  console.log("🔧 Service worker installing...");
  self.skipWaiting(); // Force the waiting service worker to become the active service worker
});

self.addEventListener("activate", (event) => {
  console.log("🔧 Service worker activating...");
  event.waitUntil(clients.claim()); // Claim all clients immediately
});

console.log("🔧 Firebase messaging service worker loaded successfully");
