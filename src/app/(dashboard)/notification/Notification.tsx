"use client";

import { CustomCard } from "@/components/app/CustomCard";
import { useNotiHook } from "@/hooks/useNotiHook";
import { BellIcon, CheckCircleIcon } from "lucide-react";
import { NotificationCard } from "./notification-card";

// Skeleton component for loading state
const NotificationSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, index) => (
      <CustomCard
        key={index}
        className="rounded-2xl border-grey-5"
        contentClassName="p-4"
      >
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-grey-5 rounded w-3/4"></div>
          <div className="h-3 bg-grey-5 rounded w-1/4"></div>
        </div>
      </CustomCard>
    ))}
  </div>
);

const Notification = () => {
  const { NotificationData, NotificationDataLoading } = useNotiHook();

  // Show skeleton while loading
  if (NotificationDataLoading) {
    return (
      <div className="w-full flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary-6 rounded-full flex items-center justify-center shrink-0">
              <BellIcon className="w-5 h-5 text-primary-green-300" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-grey-1">
                Notifications
              </h1>
              <p className="text-sm text-grey-3">
                Recent transaction activity
              </p>
            </div>
          </div>
          <div className="w-24 h-6 bg-grey-5 rounded-full animate-pulse shrink-0"></div>
        </div>

        {/* Skeleton notifications */}
        <NotificationSkeleton />
      </div>
    );
  }

  const notifications = NotificationData.data || [];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary-6 rounded-full flex items-center justify-center shrink-0">
            <BellIcon className="w-5 h-5 text-primary-green-300" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-grey-1">
              Notifications
            </h1>
            <p className="text-sm text-grey-3">Recent transaction activity</p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-secondary-6 text-primary-green-100 whitespace-nowrap shrink-0">
          {notifications.length}{" "}
          {notifications.length === 1 ? "notification" : "notifications"}
        </span>
      </div>

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
        <CustomCard
          className="rounded-2xl border-grey-5"
          contentClassName="p-8 text-center"
        >
          <div className="w-16 h-16 bg-secondary-6 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-8 h-8 text-primary-green-300" />
          </div>
          <h3 className="text-lg font-bold text-grey-1 mb-2">
            All caught up!
          </h3>
          <p className="text-grey-3">
            You have no new notifications at this time.
          </p>
        </CustomCard>
      )}
    </div>
  );
};

export default Notification;
