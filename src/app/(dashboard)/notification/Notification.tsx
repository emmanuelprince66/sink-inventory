"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotiHook } from "@/hooks/useNotiHook";
import { AlertCircleIcon, BellIcon, CheckCircleIcon } from "lucide-react";
import { NotificationCard } from "./notification-card";

const Notification = () => {
  const { NotificationData } = useNotiHook();

  if (!NotificationData?.success) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircleIcon className="w-5 h-5" />
            <p>Failed to load notifications</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const notifications = NotificationData.data || [];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <BellIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-card-foreground">
                  Notifications
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Recent transaction activity
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-accent/10 text-accent">
              {notifications.length}{" "}
              {notifications.length === 1 ? "notification" : "notifications"}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification: any, index: any) => (
            <NotificationCard
              key={index}
              message={notification.message}
              created_at={notification.created_at}
            />
          ))}
        </div>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-card-foreground mb-2">
              All caught up!
            </h3>
            <p className="text-muted-foreground">
              You have no new notifications at this time.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Notification;
