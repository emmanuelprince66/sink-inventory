// src/lib/notifications.ts
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

class NotificationService {
  private vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized || typeof window === "undefined") return;

    try {
      // Register service worker
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
          {
            scope: "/",
          }
        );
        console.log("✅ Service Worker registered:", registration);
        this.isInitialized = true;
      }
    } catch (error) {
      console.error("❌ Service Worker registration failed:", error);
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.log("❌ This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      console.log("❌ Notification permission denied");
      return false;
    }

    const permission = await Notification.requestPermission();
    console.log(`🔔 Notification permission: ${permission}`);
    return permission === "granted";
  }

  async getToken(): Promise<string | null> {
    if (!messaging || !this.vapidKey) {
      console.error(
        "❌ Firebase messaging not initialized or VAPID key missing"
      );
      console.log("VAPID key present:", !!this.vapidKey);
      return null;
    }

    try {
      // Ensure service worker is registered first
      await this.init();

      const token = await getToken(messaging, {
        vapidKey: this.vapidKey,
      });

      if (token) {
        console.log("✅ FCM Token obtained:", token.substring(0, 20) + "...");
        await this.saveTokenToBackend(token);
        return token;
      } else {
        console.log("❌ No registration token available");
        return null;
      }
    } catch (error) {
      console.error("❌ Error retrieving FCM token:", error);
      return null;
    }
  }

  async saveTokenToBackend(token: string): Promise<void> {
    try {
      const response = await fetch("/api/notifications/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("✅ Token saved to backend");
    } catch (error) {
      console.error("❌ Error saving token to backend:", error);
    }
  }

  onMessageListener(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!messaging) {
        console.error("❌ Firebase messaging not initialized");
        reject(new Error("Firebase messaging not initialized"));
        return;
      }

      onMessage(messaging, (payload) => {
        console.log("📨 Foreground message received:", payload);
        resolve(payload);
      });
    });
  }

  showNotification(payload: NotificationPayload): void {
    if (!("serviceWorker" in navigator)) {
      console.log("❌ Service Worker not supported");
      return;
    }

    navigator.serviceWorker.ready
      .then((registration) => {
        const options: NotificationOptions = {
          body: payload.body,
          icon: payload.icon || "/icons/notification-icon.png",
          badge: payload.badge || "/icons/badge-icon.png",
          tag: payload.tag || "sync360-notification",
          data: payload.data,
          requireInteraction: false,
          // actions: [
          //   {
          //     action: "view",
          //     title: "View",
          //   },
          //   {
          //     action: "dismiss",
          //     title: "Dismiss",
          //   },
          // ],
        };

        return registration.showNotification(payload.title, options);
      })
      .catch((error) => {
        console.error("❌ Error showing notification:", error);
      });
  }

  // Setup foreground message listener
  setupForegroundListener(): void {
    this.onMessageListener()
      .then((payload) => {
        console.log("📨 Received foreground message:", payload);

        // Show notification even when app is in foreground
        this.showNotification({
          title:
            payload.notification?.title || payload.data?.title || "New Message",
          body:
            payload.notification?.body ||
            payload.data?.body ||
            "You have a new message",
          icon: payload.notification?.icon,
          data: payload.data,
        });
      })
      .catch((error) => {
        console.error("❌ Error setting up foreground listener:", error);
      });
  }
}

export const notificationService = new NotificationService();
