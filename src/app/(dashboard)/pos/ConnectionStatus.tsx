"use client";

import { usePosOffline } from "@/lib/offline/offlineMode";
import { cn } from "@/lib/utils";

/** Whether the till is online or taking sales offline, at a glance. */
const ConnectionStatus = ({ className }: { className?: string }) => {
  const offline = usePosOffline();

  const status = offline
    ? { label: "Offline", dot: "bg-warning-1", tone: "bg-warning-2 text-grey-1" }
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
