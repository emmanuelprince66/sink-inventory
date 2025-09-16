"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotiHook } from "@/hooks/useNotiHook";
import { BellIcon, CheckCircleIcon } from "lucide-react";
import { NotificationCard } from "./notification-card";

// Skeleton component for loading state
const NotificationSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, index) => (
      <Card key={index} className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const Notification = () => {
  const { NotificationData, NotificationDataLoading } = useNotiHook();

  // Show skeleton while loading
  if (NotificationDataLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                  <BellIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Notifications
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Recent transaction activity
                  </p>
                </div>
              </div>
              <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardHeader>
        </Card>

        {/* Skeleton notifications */}
        <NotificationSkeleton />
      </div>
    );
  }

  const notifications = NotificationData.data || [];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                <BellIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Notifications
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Recent transaction activity
                </p>
              </div>
            </div>
            <Badge className="bg-gray-100 text-gray-800 border-gray-200">
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
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              All caught up!
            </h3>
            <p className="text-gray-600">
              You have no new notifications at this time.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Notification;
