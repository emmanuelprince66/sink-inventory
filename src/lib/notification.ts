// src/lib/notifications.ts
import { getToken, onMessage } from "firebase/messaging";
import { messaging, messagingReady } from "./firebase";

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
    const ready = await messagingReady();
    if (!ready || !this.vapidKey) {
      console.error(
        "❌ Firebase messaging not initialized or VAPID key missing"
      );
      console.log("VAPID key present:", !!this.vapidKey);
      return null;
    }

    try {
      // Ensure service worker is registered first
      await this.init();

      const token = await getToken(ready, {
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

  /**
   * Subscribes to foreground messages and returns an unsubscribe.
   *
   * onMessageListener below wraps onMessage in a Promise, and a Promise settles
   * exactly once — so it delivers the FIRST foreground message of a session and
   * silently drops every one after it. Anything that needs a stream of messages
   * must use this instead.
   */
  onForegroundMessage(handler: (payload: any) => void): () => void {
    // Subscribing has to wait for support detection, so the real unsubscribe
    // only exists later. Hand back one that cancels either way — otherwise an
    // unmount before readiness leaks the listener.
    let inner: (() => void) | undefined;
    let cancelled = false;

    messagingReady().then((ready) => {
      if (!ready || cancelled) return;
      inner = onMessage(ready, (payload) => handler(payload));
    });

    return () => {
      cancelled = true;
      inner?.();
    };
  }

  /** @deprecated Resolves once; use onForegroundMessage for a stream. */
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

  /**
   * Shows the custom modal for every foreground message, not just the first —
   * this used to chain off the single-shot onMessageListener.
   */
  setupForegroundListener(): () => void {
    return this.onForegroundMessage((payload) => {
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
    });
  }
}

export const notificationService = new NotificationService();
