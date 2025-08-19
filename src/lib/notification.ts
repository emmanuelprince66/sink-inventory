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
  private showModalCallback: ((payload: NotificationPayload) => void) | null =
    null;

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
        // await this.saveTokenToBackend(token);
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

  // Register modal show callback
  setModalCallback(callback: (payload: NotificationPayload) => void): void {
    this.showModalCallback = callback;
  }

  // Show custom modal directly
  showCustomNotification(payload: NotificationPayload): void {
    console.log("📨 Showing custom notification modal:", payload);

    if (this.showModalCallback) {
      // check for the ttype of notifcation and revalidate a query

      this.showModalCallback(payload);
    } else {
      console.warn(
        "❌ Modal callback not registered. Make sure to call setModalCallback() first."
      );
    }
  }

  // Setup foreground message listener with custom modal
  setupForegroundListener(): void {
    this.onMessageListener()
      .then((payload) => {
        console.log("📨 Received foreground message:", payload);

        // Show custom modal instead of native notification
        this.showCustomNotification({
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
