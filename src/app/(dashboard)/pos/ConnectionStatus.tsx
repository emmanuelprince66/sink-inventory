"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useManualOfflineMode } from "@/lib/offline/offlineMode";
import { cn } from "@/lib/utils";

/**
 * What state the till is in, at a glance. Offline mode wins the label when
 * both apply, since that's the one the cashier has to turn off themselves.
 */
const ConnectionStatus = ({ className }: { className?: string }) => {
  const isOnline = useOnlineStatus();
  const manualOffline = useManualOfflineMode();

  const status = manualOffline
    ? { label: "Offline mode", dot: "bg-warning-1", tone: "bg-warning-2 text-grey-1" }
    : !isOnline
      ? { label: "No connection", dot: "bg-error-1", tone: "bg-error-2 text-error-1" }
      : { label: "Online", dot: "bg-success-1", tone: "bg-success-2 text-success-1" };

  return (
    <span
      role="status"
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold",
        status.tone,
        className,
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", status.dot)} />
      {status.label}
    </span>
  );
};

export default ConnectionStatus;
