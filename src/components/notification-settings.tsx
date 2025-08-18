// src/components/notification-settings.tsx
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
import { Bell, BellOff, Check, Copy } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

export const NotificationSettings: React.FC = () => {
  const { isSupported, permission, token, requestPermission, getToken } =
    useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        toast.success("Notifications enabled successfully!");
      } else {
        toast.error(
          "Permission denied. Please enable notifications in your browser settings."
        );
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      toast.error("Failed to enable notifications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetToken = async () => {
    setIsLoading(true);
    try {
      const newToken = await getToken();
      if (newToken) {
        toast.success("Token retrieved successfully!");
      } else {
        toast.error("Failed to retrieve token.");
      }
    } catch (error) {
      console.error("Error getting token:", error);
      toast.error("Failed to retrieve token. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyTokenToClipboard = async () => {
    if (token) {
      try {
        await navigator.clipboard.writeText(token);
        setCopied(true);
        toast.success("Token copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy token:", error);
        toast.error("Failed to copy token to clipboard.");
      }
    }
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case "granted":
        return <Badge className="bg-green-100 text-green-800">Granted</Badge>;
      case "denied":
        return <Badge className="bg-red-100 text-red-800">Denied</Badge>;
      case "default":
        return <Badge className="bg-yellow-100 text-yellow-800">Default</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  if (!isSupported) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notifications Not Supported
          </CardTitle>
          <CardDescription>
            Your browser doesn't support push notifications.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>Manage your notification preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Permission Status:</span>
          {getPermissionBadge()}
        </div>

        {permission !== "granted" && (
          <Button
            onClick={handleEnableNotifications}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Requesting..." : "Enable Notifications"}
          </Button>
        )}

        {permission === "granted" && !token && (
          <Button
            onClick={handleGetToken}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Getting Token..." : "Get FCM Token"}
          </Button>
        )}

        {token && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">FCM Token:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={copyTokenToClipboard}
                className="h-8 px-2"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="p-2 bg-gray-50 rounded text-xs font-mono break-all">
              {token.substring(0, 50)}...
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-4">
          <p>• Notifications will appear even when the app is closed</p>
          <p>• You can disable notifications anytime in browser settings</p>
        </div>
      </CardContent>
    </Card>
  );
};
