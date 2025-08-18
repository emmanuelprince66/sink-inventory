// src/components/test-notification.tsx
"use client";

import { useNotification } from "@/components/providers/notification-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Send } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

export const TestNotification: React.FC = () => {
  const notificationContext = useNotification();
  const { token, permission } = notificationContext || {
    token: null,
    permission: null,
  };
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "Test Notification",
    body: "This is a test notification from your app!",
    url: "/",
    imageUrl: "",
  });

  // Early return if notification context is not available
  if (!notificationContext) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-red-400" />
            Test Notifications
          </CardTitle>
          <CardDescription className="text-red-600">
            Notification context not available. Make sure this component is
            wrapped in NotificationProvider.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Early return if no token
  if (!token) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-gray-400" />
            Test Notifications
          </CardTitle>
          <CardDescription>
            Please enable notifications first to test sending.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              No FCM token available. Enable notifications above to start
              testing.
            </p>
            <Button variant="outline" disabled className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Send Test Notification
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const sendTestNotification = async () => {
    if (!token) {
      toast.error("No FCM token available. Please enable notifications first.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          title: formData.title,
          body: formData.body,
          data: {
            url: formData.url,
            timestamp: new Date().toISOString(),
          },
          imageUrl: formData.imageUrl || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send notification");
      }

      const result = await response.json();
      console.log("Notification sent:", result);
      toast.success("Test notification sent successfully!");

      // Reset form after successful send
      setFormData({
        title: "Test Notification",
        body: "This is a test notification from your app!",
        url: "/",
        imageUrl: "",
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send test notification. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Test Notifications
        </CardTitle>
        <CardDescription>
          Send a test notification to this device
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Notification title"
            maxLength={50}
          />
          <span className="text-xs text-gray-500">
            {formData.title.length}/50
          </span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Body</Label>
          <Textarea
            id="body"
            value={formData.body}
            onChange={(e) => handleInputChange("body", e.target.value)}
            placeholder="Notification body"
            rows={3}
            maxLength={200}
          />
          <span className="text-xs text-gray-500">
            {formData.body.length}/200
          </span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">Click URL (optional)</Label>
          <Input
            id="url"
            type="url"
            value={formData.url}
            onChange={(e) => handleInputChange("url", e.target.value)}
            placeholder="https://example.com or /page"
          />
          <span className="text-xs text-gray-500">
            Where to navigate when clicked
          </span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL (optional)</Label>
          <Input
            id="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={(e) => handleInputChange("imageUrl", e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <span className="text-xs text-gray-500">
            Large image for rich notifications
          </span>
        </div>

        <Button
          onClick={sendTestNotification}
          disabled={
            isLoading || !formData.title.trim() || !formData.body.trim()
          }
          className="w-full"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Test Notification
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 mt-4 space-y-1">
          <p>• The notification will be sent to this device immediately</p>
          <p>
            • Switch tabs or minimize browser to test background notifications
          </p>
          <p>• Check browser settings if notifications don't appear</p>
        </div>

        {token && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 font-medium">Ready to send!</p>
            <p className="text-xs text-blue-600">FCM token is available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
