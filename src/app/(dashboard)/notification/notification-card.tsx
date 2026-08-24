import { cn } from "@/lib/utils";
import { Bell, Gift, ShoppingBag, Users, Wallet } from "lucide-react";
import moment from "moment";

interface NotificationCardProps {
  message: string;
  created_at: string;
  /** Backend enum — ORDER, LOYALTY, REFERRAL, WALLET and so on. */
  type?: string;
  isRead?: boolean;
  /** Omitted for an already-read row, which has nothing left to do. */
  onRead?: () => void;
  pending?: boolean;
}

/**
 * Icon and tint per notification type. Anything unrecognised still renders,
 * just in the neutral treatment — the enum can grow without this list.
 */
const TYPE_STYLES: Record<
  string,
  { icon: typeof Bell; iconClass: string; chipClass: string }
> = {
  ORDER: {
    icon: ShoppingBag,
    iconClass: "bg-secondary-6 text-primary-green-300",
    chipClass: "bg-primary-green-500 text-primary-green-300",
  },
  LOYALTY: {
    icon: Gift,
    iconClass: "bg-violet-100 text-violet-700",
    chipClass: "bg-violet-100 text-violet-700",
  },
  REFERRAL: {
    icon: Users,
    iconClass: "bg-info-2 text-info-1",
    chipClass: "bg-info-2 text-info-1",
  },
  WALLET: {
    icon: Wallet,
    iconClass: "bg-warning-2 text-warning-1",
    chipClass: "bg-warning-2 text-warning-1",
  },
};

const styleFor = (type?: string) =>
  TYPE_STYLES[(type ?? "").toUpperCase()] ?? {
    icon: Bell,
    iconClass: "bg-grey-6 text-grey-3",
    chipClass: "bg-grey-6 text-grey-3",
  };

const formatDate = (dateString: string) => {
  const messageTime = moment(dateString);
  const now = moment();

  if (messageTime.isSame(now, "day")) return messageTime.format("h:mm A");
  if (messageTime.isSame(now.clone().subtract(1, "day"), "day"))
    return `Yesterday ${messageTime.format("h:mm A")}`;
  if (messageTime.isSame(now, "year"))
    return messageTime.format("MMM D, h:mm A");
  return messageTime.format("MMM D, YYYY h:mm A");
};

export function NotificationCard({
  message,
  created_at,
  type,
  isRead = false,
  onRead,
  pending = false,
}: NotificationCardProps) {
  const { icon: Icon, iconClass, chipClass } = styleFor(type);
  const clickable = Boolean(onRead) && !isRead && !pending;

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onRead : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onRead?.();
              }
            }
          : undefined
      }
      className={cn(
        "flex w-full min-w-0 items-start gap-3 rounded-2xl border bg-white p-4 transition-colors",
        // Every card is white; unread is carried by the left edge and weight
        // alone, which is enough to scan the list by.
        isRead
          ? "border-grey-5"
          : "border-grey-5 border-l-4 border-l-primary-green-300",
        clickable && "cursor-pointer hover:border-primary-green-300",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          iconClass,
        )}
      >
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm leading-relaxed",
            isRead ? "text-grey-2" : "font-bold text-grey-1",
          )}
        >
          {message}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {type && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                chipClass,
              )}
            >
              {type}
            </span>
          )}
          <span className="text-[11px] text-grey-4">
            {formatDate(created_at)}
          </span>
        </div>
      </div>

      {!isRead && (
        <span className="mt-1 shrink-0 whitespace-nowrap text-[10px] font-bold text-primary-green-300">
          {pending ? "Marking..." : "Mark read"}
        </span>
      )}
    </div>
  );
}
