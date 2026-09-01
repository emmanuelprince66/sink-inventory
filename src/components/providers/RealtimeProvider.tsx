"use client";

import {
  normaliseCounts,
  useNotificationCountsQuery,
} from "@/api/noti/notification-counts";
import { CustomNotificationModal } from "@/components/CustomNotificationModal";
import { queryKey } from "@/constants/query-key";
import { useRealtimeSocket } from "@/hooks/useRealtimeSocket";
import { useQueryClient } from "@/lib/react-query";
import { playChime, primeChime } from "@/lib/realtime/chime";
import { markSeen } from "@/lib/realtime/seen";
import {
  isBadgeUpdate,
  isOrderNotification,
  isPaymentNotification,
} from "@/lib/realtime/types";
import type {
  NotificationCounts,
  RealtimeMessage,
  RealtimeOrderNotification,
  RealtimePaymentNotification,
} from "@/lib/realtime/types";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface RealtimeContextValue extends NotificationCounts {
  isConnected: boolean;
  /** Most recent order event, for anything that wants to react to it. */
  lastEvent: RealtimeOrderNotification | null;
  /**
   * Most recent money-in event. Kept apart from `lastEvent` rather than folded
   * into it: the two carry different payloads, and every existing consumer of
   * `lastEvent` reads order fields off it.
   */
  lastPayment: RealtimePaymentNotification | null;
  /**
   * Lets a surface that has just shown these notifications zero the badge
   * without waiting for the next socket frame.
   */
  clearUnread: () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

/**
 * The single live layer: one socket, one set of badge counts, one alert per
 * event.
 *
 * Mounted in the dashboard shell rather than the root layout so it never opens
 * a socket on /login or the public /loyalty/join pages.
 *
 * FCM stays in place alongside this. They mostly cover different states — the
 * socket while a tab is open, FCM when it is closed — but they overlap on a
 * foreground push, and both carry the same notification_id. The shared
 * `markSeen` is what stops that overlap becoming two modals for one event.
 */
export const RealtimeProvider = ({ children }: { children: ReactNode }) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const queryClient = useQueryClient();

  const [counts, setCounts] = useState<NotificationCounts>({
    unreadNotifications: 0,
    pendingOrders: 0,
  });
  const [lastEvent, setLastEvent] = useState<RealtimeOrderNotification | null>(
    null,
  );
  const [lastPayment, setLastPayment] =
    useState<RealtimePaymentNotification | null>(null);
  /**
   * A modal rather than a toast: a till is often unattended for a minute, and
   * a toast that auto-dismisses after five seconds is exactly the alert a
   * cashier misses. This waits to be closed.
   */
  const [alert, setAlert] = useState<{
    title: string;
    body: string;
    data?: any;
  } | null>(null);

  // Autoplay is blocked until the user has interacted with the page, so arm
  // the audio element on the first gesture rather than on the first order.
  useEffect(() => primeChime(), []);

  // Seed from REST so the badge is right on first paint, before the socket
  // has anything to say.
  const { data: seedData } = useNotificationCountsQuery(business_id ?? "");

  useEffect(() => {
    const seed = seedData?.data ?? seedData;
    if (seed) setCounts(normaliseCounts(seed));
  }, [seedData]);

  const handleMessage = useCallback(
    (message: RealtimeMessage) => {
      // Marking read — here or in another tab — broadcasts new counts and
      // nothing else. No id, no message, so it must not reach the dedupe or
      // the alert path; it only moves the numbers.
      if (isBadgeUpdate(message)) {
        if (business_id && message.business_id !== business_id) return;
        setCounts({
          unreadNotifications: Number(
            message.data.unread_notifications_count ??
              message.data.unread_count ??
              0,
          ),
          pendingOrders: Number(message.data.pending_orders_count ?? 0),
        });
        // The feed's own is_read flags are now stale in every open tab.
        queryClient.invalidateQueries({
          queryKey: [queryKey.notification.getNotification],
        });
        return;
      }

      // Money landing in the account. Deliberately not folded into the order
      // path below: a transfer moves the balance and the transaction ledger
      // rather than the order book, and it always alerts — unlike an order,
      // where only NEW_ORDER does — because there is no such thing as a
      // payment arriving that the business does not want to know about.
      if (isPaymentNotification(message)) {
        if (business_id && message.business_id !== business_id) return;

        setCounts({
          unreadNotifications: Number(
            message.data.unread_notifications_count ?? 0,
          ),
          pendingOrders: Number(message.data.pending_orders_count ?? 0),
        });

        [
          queryKey.notification.getNotification,
          queryKey.notification.getUnreadCount,
          queryKey.transactions.getAllTransactions,
          queryKey.analytics.getBankAnalyticsBreakdown,
        ].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));

        setLastPayment(message);

        if (markSeen(message.data.notification_id)) {
          setAlert({
            title: "Payment received",
            // The backend composes and formats this — "₦25,000.00 received
            // from Jane Doe." — so re-deriving it here would only risk
            // disagreeing with the notification feed about the same event.
            body: message.message,
            data: message.data,
          });
          playChime();
        }
        return;
      }

      if (!isOrderNotification(message)) return;

      // Events arrive for every business the user belongs to; only the one
      // currently in scope should move this dashboard's numbers.
      if (business_id && message.business_id !== business_id) return;

      // Counts are authoritative on every frame, deduped or not — a repeat
      // still carries the current totals.
      setCounts({
        unreadNotifications: Number(
          message.data.unread_notifications_count ?? 0,
        ),
        pendingOrders: Number(message.data.pending_orders_count ?? 0),
      });

      // Anything showing orders, sales or the notification feed is now stale.
      queryClient.invalidateQueries({
        queryKey: [queryKey.notification.getNotification],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKey.notification.getUnreadCount],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKey.orders.getAllOrders],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKey.sales.getAllSalesHistory],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKey.transactions.getAllTransactions],
      });

      const isFirstTime = markSeen(message.data.notification_id);
      setLastEvent(message);

      // Alert once per notification, and only for a genuinely new order — a
      // status change should not chime across every open till.
      if (isFirstTime && message.event === "NEW_ORDER") {
        setAlert({
          title: "New order received",
          body: message.message,
          data: message.data,
        });
        playChime();
      }
    },
    [business_id, queryClient],
  );

  const { isConnected } = useRealtimeSocket(handleMessage);

  const clearUnread = useCallback(
    () => setCounts((prev) => ({ ...prev, unreadNotifications: 0 })),
    [],
  );

  const value = useMemo(
    () => ({ ...counts, isConnected, lastEvent, lastPayment, clearUnread }),
    [counts, isConnected, lastEvent, lastPayment, clearUnread],
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
      <CustomNotificationModal
        notification={alert}
        isVisible={Boolean(alert)}
        onClose={() => setAlert(null)}
      />
    </RealtimeContext.Provider>
  );
};

/**
 * Returns zeroed counts outside the provider rather than throwing — the TopBar
 * renders on screens that sit outside the dashboard shell, and a missing
 * badge is a better failure than a crashed header.
 */
export const useRealtime = (): RealtimeContextValue =>
  useContext(RealtimeContext) ?? {
    unreadNotifications: 0,
    pendingOrders: 0,
    isConnected: false,
    lastEvent: null,
    lastPayment: null,
    clearUnread: () => {},
  };
