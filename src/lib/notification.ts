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

  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  async getToken(): Promise<string | null> {
    if (!messaging || !this.vapidKey) {
      console.error("Firebase messaging not initialized or VAPID key missing");
      return null;
    }

    try {
      const token = await getToken(messaging, {
        vapidKey: this.vapidKey,
      });

      if (token) {
        console.log("FCM Token:", token);
        // You can save this token to your backend here
        await this.saveTokenToBackend(token);
        return token;
      }

      return null;
    } catch (error) {
      console.error("An error occurred while retrieving token:", error);
      return null;
    }
  }

  async saveTokenToBackend(token: string): Promise<void> {
    try {
      // Replace with your API endpoint
      await fetch("/api/notifications/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });
    } catch (error) {
      console.error("Error saving token to backend:", error);
    }
  }

  onMessageListener(): Promise<any> {
    return new Promise((resolve) => {
      if (!messaging) {
        console.error("Firebase messaging not initialized");
        return;
      }

      onMessage(messaging, (payload) => {
        console.log("Message received: ", payload);
        resolve(payload);
      });
    });
  }

  showNotification(payload: NotificationPayload): void {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // ...existing code...
        registration.showNotification(
          payload.title,
          {
            body: payload.body,
            icon: payload.icon || "/icons/notification-icon.png",
            badge: payload.badge || "/icons/badge-icon.png",
            tag: payload.tag,
            data: payload.data,
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
          } as NotificationOptions // <-- type assertion here
        );
        // ...existing code...
      });
    }
  }
}

export const notificationService = new NotificationService();
