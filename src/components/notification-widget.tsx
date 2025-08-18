// src/components/notification-widget.tsx
"use client";

import { useNotification } from "@/components/providers/notification-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, BellRing } from "lucide-react";
import React from "react";
import { toast } from "sonner";

export const NotificationWidget: React.FC = () => {
  const { permission, requestPermission, isSupported } = useNotification();

  const handleQuickEnable = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success("Notifications enabled!");
    } else {
      toast.error("Permission denied");
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
        <BellOff className="h-4 w-4 text-gray-400" />
        <span className="text-xs text-gray-500">Not Supported</span>
      </div>
    );
  }

  const getStatusInfo = () => {
    switch (permission) {
      case "granted":
        return {
          icon: BellRing,
          color: "bg-green-100 text-green-800",
          text: "Enabled",
        };
      case "denied":
        return {
          icon: BellOff,
          color: "bg-red-100 text-red-800",
          text: "Denied",
        };
      default:
        return {
          icon: Bell,
          color: "bg-yellow-100 text-yellow-800",
          text: "Click to Enable",
        };
    }
  };

  const status = getStatusInfo();
  const IconComponent = status.icon;

  return (
    <div className="flex items-center gap-2">
      {permission === "granted" ? (
        <Badge className={status.color}>
          <IconComponent className="h-3 w-3 mr-1" />
          {status.text}
        </Badge>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleQuickEnable}
          className="h-8 px-3"
        >
          <IconComponent className="h-4 w-4 mr-1" />
          {status.text}
        </Button>
      )}
    </div>
  );
};
