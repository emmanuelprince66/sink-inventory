"use client";

import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/api/noti/notification-counts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKey } from "@/constants/query-key";
import { useNotiHook } from "@/hooks/useNotiHook";
import { useQueryClient } from "@/lib/react-query";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { cn } from "@/lib/utils";
import { CheckCheck, CheckCircleIcon } from "lucide-react";
import { useState } from "react";
import { NotificationCard } from "./notification-card";

const FILTERS = ["All", "Unread"] as const;
type Filter = (typeof FILTERS)[number];

const NotificationSkeleton = () => (
  <div className="flex flex-col gap-3">
    {[0, 1, 2, 3, 4].map((i) => (
      <Skeleton key={i} className="h-[82px] w-full rounded-2xl bg-grey-5" />
    ))}
  </div>
);

const Notification = () => {
  const { NotificationData, NotificationDataLoading } = useNotiHook();
  const business_id = useBusinessStore((state) => state.business_id);
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<Filter>("All");
  /** Which row is mid-request, so only that one shows a pending label. */
  const [markingId, setMarkingId] = useState<string | null>(null);

  const refreshNotifications = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKey.notification.getNotification],
    });
    // The bell and sidebar badges read this one.
    queryClient.invalidateQueries({
      queryKey: [queryKey.notification.getUnreadCount],
    });
  };

  const { mutate: markRead } = useMarkNotificationReadMutation({
    onSuccess: () => {
      setMarkingId(null);
      refreshNotifications();
    },
    onError: () => setMarkingId(null),
  });

  const { mutate: markAllRead, isPending: markAllPending } =
    useMarkAllNotificationsReadMutation(business_id ?? "", {
      onSuccess: refreshNotifications,
    });

  /**
   * The endpoint returns an envelope — { unread_count, pending_orders_count,
   * notifications: [...] } — which the proxy nests under `data`. Read straight
   * as a list it was an object, so `.length` was undefined and `.map` threw;
   * and on an error `NotificationData` is undefined, which crashed the page
   * because only the loading case was guarded.
   */
  const payload = NotificationData?.data;
  const rawNotifications: any[] = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.notifications)
      ? payload.notifications
      : [];

  /**
   * The feed repeats rows — one order came back fifteen times under a single
   * id, a loyalty event five times, which looks like a join fanout on the
   * server. Deduping by id keeps the list honest; the reported unread count is
   * inflated by the same duplication and can only be fixed upstream.
   */
  const seen = new Set<string>();
  const notifications = rawNotifications.filter((n) => {
    const id = String(n?.id ?? "");
    if (!id) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  const unreadCount = notifications.filter((n) => !n?.is_read).length;
  const visible =
    filter === "Unread"
      ? notifications.filter((n) => !n?.is_read)
      : notifications;

  return (
    <div className="w-full min-w-0 flex flex-col gap-6">
      {/* Header — same shape as Customers and the loyalty screens: title and
          subtitle left, actions right at h-10, stacking on mobile. */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-grey-1">
            Notifications
          </h1>
          <p className="text-sm text-grey-3 mt-1">
            Orders, loyalty and referral activity across your business.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            className="h-10 w-full gap-1.5 rounded-xl sm:w-auto"
            disabled={markAllPending || !business_id}
            onClick={() => markAllRead()}
          >
            <CheckCheck className="h-4 w-4" />
            {markAllPending ? "Marking..." : "Mark all read"}
          </Button>
        )}
      </div>

      {/* Filter pills, matching the participant and status filters elsewhere. */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((option) => {
          const count =
            option === "Unread" ? unreadCount : notifications.length;
          return (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-colors cursor-pointer",
                filter === option
                  ? "bg-primary-green-300 text-white"
                  : "border border-grey-5 bg-white text-grey-3 hover:text-grey-1",
              )}
            >
              {option}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px]",
                  filter === option
                    ? "bg-white/20 text-white"
                    : "bg-grey-6 text-grey-3",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {NotificationDataLoading ? (
        <NotificationSkeleton />
      ) : visible.length > 0 ? (
        <div className="flex flex-col gap-3">
          {visible.map((notification: any, index: number) => (
            <NotificationCard
              key={notification.id ?? index}
              message={notification.message}
              created_at={notification.created_at}
              type={notification.type}
              isRead={Boolean(notification.is_read)}
              pending={markingId === notification.id}
              onRead={
                notification.id
                  ? () => {
                      setMarkingId(notification.id);
                      markRead(notification.id);
                    }
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-grey-5 bg-white px-4 py-14 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary-6">
            <CheckCircleIcon className="h-7 w-7 text-primary-green-300" />
          </div>
          <p className="text-sm font-bold text-grey-1">
            {filter === "Unread" ? "Nothing unread" : "All caught up"}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-grey-3">
            {filter === "Unread"
              ? "Every notification here has been read."
              : "New orders, loyalty rewards and referrals will appear here as they happen."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Notification;
