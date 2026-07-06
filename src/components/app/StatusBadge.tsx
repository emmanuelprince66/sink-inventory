import { cn } from "@/lib/utils";

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  PAID: "bg-success-2 text-success-1",
  PARTIAL: "bg-warning-2 text-warning-1",
  UNPAID: "bg-error-2 text-error-1",
};

const SHIPPING_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-warning-2 text-warning-1",
  SHIPPED: "bg-info-2 text-info-1",
  DELIVERED: "bg-success-2 text-success-1",
  RETURNED: "bg-error-2 text-error-1",
};

const DEFAULT_STATUS_STYLE = "bg-grey-6 text-grey-2";

interface StatusBadgeProps {
  status?: string | null;
  type: "payment" | "shipping";
  className?: string;
}

/**
 * Single source of truth for payment/shipping status colors, so the same
 * status renders identically across Orders, OrderCard, ViewOrder, etc.
 */
export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const styles =
    type === "payment" ? PAYMENT_STATUS_STYLES : SHIPPING_STATUS_STYLES;
  const key = status?.toUpperCase() ?? "";
  const style = styles[key] ?? DEFAULT_STATUS_STYLE;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase",
        style,
        className,
      )}
    >
      {status || "—"}
    </span>
  );
}
