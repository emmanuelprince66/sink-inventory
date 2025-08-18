// src/components/notification-tester.tsx
"use client";

import { useNotification } from "@/components/providers/notification-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Bell,
  CheckCircle,
  Eye,
  MessageSquare,
  Monitor,
  Smartphone,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface ReceivedNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: "foreground" | "background";
  data?: any;
}

export const NotificationTester: React.FC = () => {
  const { token, permission } = useNotification();
  const [receivedNotifications, setReceivedNotifications] = useState<
    ReceivedNotification[]
  >([]);

  console.log("receivedNotifications", receivedNotifications);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (permission === "granted" && token) {
      startListening();
    }
  }, [permission, token]);

  const startListening = () => {
    if (typeof window === "undefined") return;

    setIsListening(true);
    console.log("🔔 Started listening for notifications...");

    // Listen for foreground messages (when app is active)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        console.log("📱 Foreground notification received:", event.data);

        if (event.data && event.data.type === "notification") {
          const notification: ReceivedNotification = {
            id: Date.now().toString(),
            title: event.data.title || "Notification",
            body: event.data.body || "No content",
            timestamp: new Date().toISOString(),
            type: "foreground",
            data: event.data.data,
          };

          setReceivedNotifications((prev) => [notification, ...prev]);

          // Show toast
          toast(notification.title, {
            description: notification.body,
            action: notification.data?.url
              ? {
                  label: "Open",
                  onClick: () => window.open(notification.data.url, "_blank"),
                }
              : undefined,
          });
        }
      });
    }

    // Listen for notification clicks
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener(
        "notificationclick",
        (event: any) => {
          console.log("🖱️ Notification clicked:", event);

          const notification: ReceivedNotification = {
            id: Date.now().toString(),
            title: "Notification Clicked",
            body: `User clicked on: ${event.notification?.title}`,
            timestamp: new Date().toISOString(),
            type: "background",
            data: event.notification?.data,
          };

          setReceivedNotifications((prev) => [notification, ...prev]);
        }
      );
    }
  };

  const sendTestNotification = async (type: "simple" | "rich" | "action") => {
    if (!token) {
      toast.error("No FCM token available");
      return;
    }

    const testData = {
      simple: {
        title: "🔔 Simple Test",
        body: "This is a basic notification test",
        data: { type: "simple", timestamp: new Date().toISOString() },
      },
      rich: {
        title: "🖼️ Rich Notification",
        body: "This notification includes an image and rich content",
        imageUrl:
          "https://via.placeholder.com/400x200/4f46e5/ffffff?text=Rich+Notification",
        data: { type: "rich", url: "https://example.com" },
      },
      action: {
        title: "⚡ Action Required",
        body: "Click this notification to perform an action",
        data: { type: "action", url: "/", action: "view_dashboard" },
      },
    };

    try {
      const payload = testData[type];

      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...payload }),
      });

      if (!response.ok) {
        throw new Error("Failed to send notification");
      }

      toast.success(`${type} notification sent!`);

      // Add to received list for tracking
      const notification: ReceivedNotification = {
        id: Date.now().toString(),
        title: payload.title,
        body: payload.body,
        timestamp: new Date().toISOString(),
        type: "foreground",
        data: payload.data,
      };

      setReceivedNotifications((prev) => [notification, ...prev]);
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification");
    }
  };

  const clearHistory = () => {
    setReceivedNotifications([]);
    toast.success("Notification history cleared");
  };

  const getNotificationInstructions = () => {
    if (permission !== "granted") {
      return {
        icon: AlertCircle,
        color: "text-red-500",
        text: "Enable notifications first to start testing",
      };
    }

    if (!token) {
      return {
        icon: AlertCircle,
        color: "text-yellow-500",
        text: "Waiting for FCM token...",
      };
    }

    return {
      icon: CheckCircle,
      color: "text-green-500",
      text: "Ready to receive notifications!",
    };
  };

  const instructions = getNotificationInstructions();
  const IconComponent = instructions.icon;

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Testing
          </CardTitle>
          <CardDescription>
            Test and monitor incoming notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <IconComponent className={`h-5 w-5 ${instructions.color}`} />
            <span className="text-sm">{instructions.text}</span>
          </div>

          {isListening && (
            <Badge className="bg-green-100 text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Listening for notifications
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Test Buttons */}
      {permission === "granted" && token && (
        <Card>
          <CardHeader>
            <CardTitle>Send Test Notifications</CardTitle>
            <CardDescription>
              Try different notification types to see how they appear
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Button
                onClick={() => sendTestNotification("simple")}
                variant="outline"
                className="h-auto flex-col p-4"
              >
                <MessageSquare className="h-6 w-6 mb-2" />
                <span className="font-medium">Simple</span>
                <span className="text-xs text-gray-500">
                  Basic notification
                </span>
              </Button>

              <Button
                onClick={() => sendTestNotification("rich")}
                variant="outline"
                className="h-auto flex-col p-4"
              >
                <Eye className="h-6 w-6 mb-2" />
                <span className="font-medium">Rich</span>
                <span className="text-xs text-gray-500">With image</span>
              </Button>

              <Button
                onClick={() => sendTestNotification("action")}
                variant="outline"
                className="h-auto flex-col p-4"
              >
                <Smartphone className="h-6 w-6 mb-2" />
                <span className="font-medium">Action</span>
                <span className="text-xs text-gray-500">Clickable</span>
              </Button>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Testing Tips:
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>
                  • <strong>Foreground:</strong> Keep this tab active -
                  notifications show as toasts
                </li>
                <li>
                  • <strong>Background:</strong> Switch tabs or minimize browser
                  - notifications show in system tray
                </li>
                <li>
                  • <strong>Click test:</strong> Click on system notifications
                  to see click handling
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Received Notifications History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Received Notifications</CardTitle>
              <CardDescription>
                History of notifications received by this device
              </CardDescription>
            </div>
            {receivedNotifications.length > 0 && (
              <Button onClick={clearHistory} variant="outline" size="sm">
                Clear History
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {receivedNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications received yet</p>
              <p className="text-sm">
                Send a test notification to see it appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {receivedNotifications.map((notification, index) => (
                <div key={notification.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {notification.body}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          notification.type === "foreground"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {notification.type === "foreground" ? (
                          <Monitor className="h-3 w-3 mr-1" />
                        ) : (
                          <Smartphone className="h-3 w-3 mr-1" />
                        )}
                        {notification.type}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </span>
                    {notification.data?.url && (
                      <span className="text-blue-600">
                        Has URL: {notification.data.url}
                      </span>
                    )}
                  </div>

                  {index < receivedNotifications.length - 1 && (
                    <Separator className="mt-3" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
