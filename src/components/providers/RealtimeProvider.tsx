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
import { isOrderNotification } from "@/lib/realtime/types";
import type {
  NotificationCounts,
  RealtimeMessage,
  RealtimeOrderNotification,
} from "@/lib/realtime/types";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface RealtimeContextValue extends NotificationCounts {
  isConnected: boolean;
  /** Most recent order event, for anything that wants to react to it. */
  lastEvent: RealtimeOrderNotification | null;
  /**
   * Lets a surface that has just shown these notifications zero the badge
   * without waiting for the next socket frame.
   */
  clearUnread: () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

/** Keeps the dedupe set from growing without bound on a long-lived till tab. */
const SEEN_LIMIT = 200;

/**
 * The single live layer: one socket, one set of badge counts, one alert per
 * event.
 *
 * Mounted in the dashboard shell rather than the root layout so it never opens
 * a socket on /login or the public /loyalty/join pages.
 *
 * FCM stays in place alongside this. They cover different states — the socket
 * while a tab is open, FCM when it is closed — and both carry the same
 * notification_id, which is what lets `markSeen` stop one order alerting twice.
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

  const seenRef = useRef<Set<string>>(new Set());

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

  /** True the first time an id is seen, false on every repeat. */
  const markSeen = useCallback((id: string) => {
    if (seenRef.current.has(id)) return false;
    seenRef.current.add(id);
    if (seenRef.current.size > SEEN_LIMIT) {
      // Sets iterate in insertion order, so the first key is the oldest.
      const oldest = seenRef.current.values().next().value;
      if (oldest) seenRef.current.delete(oldest);
    }
    return true;
  }, []);

  const handleMessage = useCallback(
    (message: RealtimeMessage) => {
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
    [business_id, markSeen, queryClient],
  );

  const { isConnected } = useRealtimeSocket(handleMessage);

  const clearUnread = useCallback(
    () => setCounts((prev) => ({ ...prev, unreadNotifications: 0 })),
    [],
  );

  const value = useMemo(
    () => ({ ...counts, isConnected, lastEvent, clearUnread }),
    [counts, isConnected, lastEvent, clearUnread],
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
    clearUnread: () => {},
  };
