/**
 * Order events broadcast over Django Channels at /ws/user/.
 *
 * Field names follow the backend exactly. The first revision of the integration
 * guide spelled several of these "notifcation"; these are the corrected forms,
 * cross-checked against the swagger definitions.
 */

export type RealtimeOrderEvent =
  | "NEW_ORDER"
  | "ORDER_PAID"
  | "ORDER_STATUS_CHANGED";

export interface RealtimeOrderData {
  /** Also present on the FCM payload, which is what makes deduping possible. */
  notification_id: string;
  order_id: string;
  /** Human-facing order reference, e.g. "2026082101". */
  reference: string;
  customer_name: string | null;
  customer_phone: string | null;
  /** Decimal string, e.g. "25000.00". */
  total_price: string;
  channel: "OUTSTORE" | "INSTORE" | "STORE" | (string & {});
  method: "CASH" | "BANK-TRANSFER" | "CARD" | "CREDIT" | (string & {});
  payment_status: "PAID" | "UNPAID" | "PARTIAL" | (string & {});
  shipping_status:
    | "PENDING"
    | "SHIPPED"
    | "DELIVERED"
    | "RETURNED"
    | null
    | (string & {});
  created_at: string;
  /** Authoritative counts — the socket is the source of truth once connected. */
  unread_notifications_count: number;
  pending_orders_count: number;
}

export interface RealtimeOrderNotification {
  type: "order_notification";
  event: RealtimeOrderEvent;
  business_id: string;
  /** Pre-composed summary; used verbatim as the toast body. */
  message: string;
  data: RealtimeOrderData;
}

/** Money landing in a business account, broadcast on the same socket. */
export type RealtimePaymentEvent = "PAYMENT_RECEIVED" | (string & {});

export interface RealtimePaymentData {
  /** Same dedupe handle the order events carry. */
  notification_id: string;
  /** Decimal string, e.g. "25000.00". */
  amount: string;
  /** Who sent it, as the bank reported them. Absent on some rails. */
  sender_name: string | null;
  sender_account?: string | null;
  bank_name?: string | null;
  /** The business account credited — not the sender's. */
  account_number?: string | null;
  reference?: string | null;
  narration?: string | null;
  created_at: string;
  unread_notifications_count: number;
  pending_orders_count: number;
}

export interface RealtimePaymentNotification {
  type: "payment_notification";
  event: RealtimePaymentEvent;
  business_id: string;
  /** Pre-composed and already currency-formatted; used verbatim. */
  message: string;
  data: RealtimePaymentData;
}

/**
 * Sent when a notification is marked read — single or bulk — so every open tab
 * drops its badge without a refetch. Counts only: there is no notification_id,
 * no message, and nothing to alert about.
 */
export interface RealtimeBadgeUpdate {
  type: "badge_count_update";
  business_id: string;
  data: {
    unread_notifications_count: number;
    /** The same number under the feed endpoint's name, sent for convenience. */
    unread_count?: number;
    pending_orders_count: number;
  };
}

/** The server answers our ping with this; it carries no payload. */
export interface RealtimePong {
  type: "pong";
}

export type RealtimeMessage =
  | RealtimeOrderNotification
  | RealtimePaymentNotification
  | RealtimeBadgeUpdate
  | RealtimePong;

export const isOrderNotification = (
  message: unknown,
): message is RealtimeOrderNotification =>
  typeof message === "object" &&
  message !== null &&
  (message as RealtimeOrderNotification).type === "order_notification" &&
  typeof (message as RealtimeOrderNotification).data?.notification_id ===
    "string";

export const isPaymentNotification = (
  message: unknown,
): message is RealtimePaymentNotification =>
  typeof message === "object" &&
  message !== null &&
  (message as RealtimePaymentNotification).type === "payment_notification" &&
  typeof (message as RealtimePaymentNotification).data?.notification_id ===
    "string";

export const isBadgeUpdate = (
  message: unknown,
): message is RealtimeBadgeUpdate =>
  typeof message === "object" &&
  message !== null &&
  (message as RealtimeBadgeUpdate).type === "badge_count_update";

export interface NotificationCounts {
  unreadNotifications: number;
  pendingOrders: number;
}
