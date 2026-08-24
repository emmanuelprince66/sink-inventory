import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import {
  ExtractFnReturnType,
  MutationConfig,
  QueryConfigType,
  useMutation,
  useQuery,
} from "@/lib/react-query";
import type { NotificationCounts } from "@/lib/realtime/types";

/**
 * Badge counts and read-state, used to seed the UI before the socket connects
 * and as the fallback whenever it is down.
 *
 * The two endpoints disagree on naming: unread-count returns
 * `unread_notifications_count` while the feed returns `unread_count` for the
 * same number. Both are normalised here so nothing downstream has to care
 * which one answered.
 */
export const normaliseCounts = (payload: any): NotificationCounts => ({
  unreadNotifications: Number(
    payload?.unread_notifications_count ?? payload?.unread_count ?? 0,
  ),
  pendingOrders: Number(payload?.pending_orders_count ?? 0),
});

export const fetchNotificationCounts = async (businessId: string) => {
  const response = await fetch(
    `/api/notification/unread-count/${businessId}`,
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || "Error fetching badge counts");
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
};

type CountsFnType = typeof fetchNotificationCounts;

export const useNotificationCountsQuery = (
  businessId: string,
  config?: QueryConfigType<CountsFnType>,
) =>
  useQuery<ExtractFnReturnType<CountsFnType>>({
    // A business with no notifications yet 404s; retrying only delays the zero.
    retry: (failureCount, error: any) =>
      [401, 404].includes(error?.status) ? false : failureCount < 1,
    queryKey: [queryKey.notification.getUnreadCount, businessId],
    queryFn: () => fetchNotificationCounts(businessId),
    enabled: Boolean(businessId),
    // Seed only — the socket is authoritative once connected, so there is no
    // reason to poll this.
    staleTime: 1000 * 60,
    ...config,
  });

// ─── Mark read ───────────────────────────────────────────────────────────────

export const markNotificationRead = async (notificationId: string) => {
  const response = await fetch(
    `/api/notification/mark-read/${notificationId}`,
    { method: "PATCH", headers: { "Content-Type": "application/json" } },
  );
  if (!response.ok) throw await response.json().catch(() => ({}));
  return response.json();
};

export const useMarkNotificationReadMutation = (
  config?: MutationConfig<typeof markNotificationRead> & {
    onSuccess?: (data: any, variables: any, context: any) => void;
    onError?: (error: any, variables: any, context: any) => void;
  },
) => {
  const { showToast } = useToast();
  return useMutation({
    mutationKey: [queryKey.notification.markRead],
    mutationFn: (notificationId: string) =>
      markNotificationRead(notificationId),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      showToast(
        error?.message || error?.error || "Could not mark as read",
        "error",
      );
      config?.onError?.(error, variables, context);
    },
    ...config,
  });
};

// ─── Mark all read ───────────────────────────────────────────────────────────

export const markAllNotificationsRead = async (businessId: string) => {
  const response = await fetch(
    `/api/notification/mark-all-read/${businessId}`,
    { method: "POST", headers: { "Content-Type": "application/json" } },
  );
  if (!response.ok) throw await response.json().catch(() => ({}));
  return response.json();
};

/**
 * The business id is captured in the closure, so the mutate call takes no
 * arguments — typing it off markAllNotificationsRead would demand a string
 * that callers have no reason to pass twice.
 */
// `void` rather than no parameter at all: MutationConfig reads
// Parameters<Fn>[0], and only void makes TanStack's mutate() callable with no
// argument.
type MarkAllFn = (variables: void) => ReturnType<
  typeof markAllNotificationsRead
>;

export const useMarkAllNotificationsReadMutation = (
  businessId: string,
  config?: MutationConfig<MarkAllFn> & {
    onSuccess?: (data: any, variables: any, context: any) => void;
    onError?: (error: any, variables: any, context: any) => void;
  },
) => {
  const { showToast } = useToast();
  return useMutation({
    mutationKey: [queryKey.notification.markAllRead, businessId],
    mutationFn: () => markAllNotificationsRead(businessId),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      showToast(
        error?.message || error?.error || "Could not mark all as read",
        "error",
      );
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("All notifications marked as read", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
