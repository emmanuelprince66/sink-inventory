// src/components/providers/notification-provider.tsx
"use client";

import { notificationService } from "@/lib/notification";
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner"; // or your preferred toast library

// Define the structure for received notifications
interface ReceivedNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: "foreground" | "background" | "click";
  data?: any;
  read?: boolean;
}

interface NotificationContextType {
  isSupported: boolean;
  permission: NotificationPermission | null;
  token: string | null;
  isLoading: boolean;
  receivedNotifications: ReceivedNotification[];
  unreadCount: number;
  requestPermission: () => Promise<boolean>;
  getToken: () => Promise<string | null>;
  initializeNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  removeNotification: (notificationId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(
    null
  );
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [receivedNotifications, setReceivedNotifications] = useState<
    ReceivedNotification[]
  >([]);

  // Calculate unread count
  const unreadCount = receivedNotifications.filter(
    (notification) => !notification.read
  ).length;

  // Helper function to add received notification
  const addReceivedNotification = (
    payload: any,
    type: "foreground" | "background" | "click"
  ) => {
    const notification: ReceivedNotification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // More unique ID
      title: payload.notification?.title || payload.title || "New Notification",
      body: payload.notification?.body || payload.body || "",
      timestamp: new Date().toISOString(),
      type,
      data: payload.data,
      read: false,
    };

    setReceivedNotifications((prev) => [notification, ...prev]);
    return notification;
  };

  // Initialize notifications silently (no auto-request)
  const initializeNotifications = async () => {
    try {
      setIsLoading(true);

      // Check if notifications are supported
      if (typeof window !== "undefined" && "Notification" in window) {
        setIsSupported(true);
        setPermission(Notification.permission);

        // Only get token if permission is already granted (no auto-request)
        if (Notification.permission === "granted") {
          const fcmToken = await notificationService.getToken();
          setToken(fcmToken);
          console.log("🔑 FCM Token obtained (existing permission):", fcmToken);
        }
      } else {
        console.log("❌ Notifications not supported in this browser");
      }
    } catch (error) {
      console.error("❌ Error initializing notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initialize silently without requesting permission
    initializeNotifications();

    // Set up service worker message listener for notification clicks
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        console.log("📨 Received message from service worker:", event.data);

        if (event.data?.type === "notification_click") {
          // Add to received notifications when clicked
          addReceivedNotification(event.data.notification, "click");

          toast.success("Notification clicked!", {
            description: `Clicked: ${event.data.notification.title}`,
          });
        }
      });
    }

    // Listen for foreground messages using your notification service
    let unsubscribe: (() => void) | undefined;

    if (typeof window !== "undefined") {
      notificationService
        .onMessageListener()
        .then((payload: any) => {
          console.log("🔔 Foreground message received:", payload);

          // Add to received notifications list for tracking
          const notification = addReceivedNotification(payload, "foreground");

          // Show toast notification for foreground messages
          toast(payload.notification?.title || "New Notification", {
            description: payload.notification?.body,
            action: payload.data?.url
              ? {
                  label: "Open",
                  onClick: () => {
                    // Mark as read when action is clicked
                    markAsRead(notification.id);

                    if (payload.data.url.startsWith("http")) {
                      window.open(payload.data.url, "_blank");
                    } else {
                      window.location.href = payload.data.url;
                    }
                  },
                }
              : undefined,
          });

          // Forward message to service worker for tracking
          if ("serviceWorker" in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
              registration.active?.postMessage({
                type: "FCM_MESSAGE",
                payload: payload,
              });
            });
          }
        })
        .catch((error: any) => {
          console.error("Error setting up foreground message listener:", error);
        });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    try {
      const granted = await notificationService.requestPermission();
      if (granted) {
        setPermission("granted");
        // Get token after permission is granted
        const newToken = await notificationService.getToken();
        setToken(newToken);
        console.log("🔑 FCM Token obtained after manual request:", newToken);
      } else {
        setPermission("denied");
      }
      return granted;
    } catch (error) {
      console.error("❌ Error requesting permission:", error);
      return false;
    }
  };

  const getToken = async (): Promise<string | null> => {
    try {
      if (permission !== "granted") {
        const granted = await requestPermission();
        if (!granted) return null;
      }

      const newToken = await notificationService.getToken();
      setToken(newToken);
      return newToken;
    } catch (error) {
      console.error("❌ Error getting token:", error);
      return null;
    }
  };

  // Notification management functions
  const markAsRead = (notificationId: string) => {
    setReceivedNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setReceivedNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const clearNotifications = () => {
    setReceivedNotifications([]);
  };

  const removeNotification = (notificationId: string) => {
    setReceivedNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

  const value: NotificationContextType = {
    isSupported,
    permission,
    token,
    isLoading,
    receivedNotifications,
    unreadCount,
    requestPermission,
    getToken,
    initializeNotifications,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    removeNotification,
  };

  console.log("NotificationProvider initialized with values:", {
    isSupported,
    permission,
    token: token ? "***TOKEN_PRESENT***" : null,
    isLoading,
    receivedNotifications: receivedNotifications.length,
    unreadCount,
  });

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
