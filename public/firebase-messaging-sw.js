// public/firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCGLjB-VYTsjcCHAOZxg7a57caGK0nfUWE", // Replace with your actual config
  authDomain: "sync360-78f4d.firebaseapp.com",
  projectId: "sync360-78f4d",
  storageBucket: "sync360-78f4d.firebasestorage.app",
  messagingSenderId: "178915188057",
  appId: "1:178915188057:web:085abf45b7f630cf868048",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("🔔 Received background message:", payload);

  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new message",
    icon: payload.notification?.icon || "/icons/notification-icon.png",
    badge: "/icons/badge-icon.png",
    image: payload.notification?.image,
    tag: payload.data?.tag || "default",
    data: {
      ...payload.data,
      fcm_message_id: payload.fcmMessageId,
      timestamp: new Date().toISOString(),
    },
    requireInteraction: true,
    actions: [
      {
        action: "view",
        title: "View",
        icon: "/icons/view-icon.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
        icon: "/icons/dismiss-icon.png",
      },
    ],
  };

  console.log(
    "📱 Showing notification:",
    notificationTitle,
    notificationOptions
  );
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("🖱️ Notification click received:", event);

  event.notification.close();

  if (event.action === "view") {
    // Handle view action
    console.log("👀 View action clicked");
    event.waitUntil(clients.openWindow(event.notification.data?.url || "/"));
  } else if (event.action === "dismiss") {
    // Handle dismiss action
    console.log("❌ Dismiss action clicked");
  } else {
    // Handle default click (clicking notification body)
    console.log("📱 Default notification click");
    event.waitUntil(clients.openWindow(event.notification.data?.url || "/"));
  }

  // Send message to all clients about the click
  event.waitUntil(
    clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: "notification_click",
          notification: {
            title: event.notification.title,
            body: event.notification.body,
            data: event.notification.data,
            action: event.action || "default",
          },
        });
      });
    })
  );
});

// Listen for messages from the main thread
self.addEventListener("message", (event) => {
  console.log("📨 Service worker received message:", event.data);

  if (event.data && event.data.type === "FCM_MESSAGE") {
    // Handle foreground messages forwarded from main thread
    const clients = event.ports[0];
    if (clients) {
      clients.postMessage({
        type: "notification",
        ...event.data.payload,
      });
    }
  }
});

console.log("🔧 Firebase messaging service worker loaded");
