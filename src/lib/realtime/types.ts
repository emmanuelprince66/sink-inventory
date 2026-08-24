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

/** The server answers our ping with this; it carries no payload. */
export interface RealtimePong {
  type: "pong";
}

export type RealtimeMessage = RealtimeOrderNotification | RealtimePong;

export const isOrderNotification = (
  message: unknown,
): message is RealtimeOrderNotification =>
  typeof message === "object" &&
  message !== null &&
  (message as RealtimeOrderNotification).type === "order_notification" &&
  typeof (message as RealtimeOrderNotification).data?.notification_id ===
    "string";

export interface NotificationCounts {
  unreadNotifications: number;
  pendingOrders: number;
}
