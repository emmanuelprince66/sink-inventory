"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { useWarnBeforeOfflineRefresh } from "@/hooks/useWarnBeforeOfflineRefresh";
import {
  countAllQueuedSales,
  subscribeOfflineSales,
} from "@/lib/offline/offlineSales";
import { AlertTriangle, CheckCircle2, CloudOff, Wifi } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";

const Point = ({
  icon,
  tone,
  children,
}: {
  icon: ReactNode;
  tone: string;
  children: ReactNode;
}) => (
  <li className="flex items-start gap-3">
    <span
      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${tone}`}
    >
      {icon}
    </span>
    <p className="text-sm leading-relaxed text-grey-2">{children}</p>
  </li>
);

/**
 * The POS's own "reload while offline?" dialog, opened by F5 / Ctrl+R while
 * the till has no connection. See useWarnBeforeOfflineRefresh.
 */
const OfflineReloadDialog = () => {
  const { open, close, reloadAnyway } = useWarnBeforeOfflineRefresh();
  const [waiting, setWaiting] = useState<number | null>(null);

  // Only read while the dialog is up: it's the reassurance that sales are safe.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = () =>
      countAllQueuedSales()
        .then((count) => !cancelled && setWaiting(Number(count) || 0))
        .catch(() => !cancelled && setWaiting(null));
    load();
    const unsubscribe = subscribeOfflineSales(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [open]);

  return (
    <CustomModal
      isOpen={open}
      onClose={close}
      trigger={false}
      size="sm"
      title="You're offline. Reload anyway?"
      headerIcon={
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-2 text-warning-1">
          <CloudOff className="h-5 w-5" />
        </span>
      }
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={reloadAnyway}
            className="w-full sm:w-auto"
          >
            Reload anyway
          </Button>
          <Button type="button" onClick={close} className="w-full sm:w-auto">
            Keep selling
          </Button>
        </div>
      }
    >
      <ul className="space-y-4">
        <Point
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="bg-success-2 text-success-1"
        >
          {waiting
            ? `Your ${waiting} offline ${waiting === 1 ? "sale is" : "sales are"} saved on this device and won't be lost.`
            : "Sales you take offline are saved on this device and won't be lost."}
        </Point>
        <Point
          icon={<AlertTriangle className="h-4 w-4" />}
          tone="bg-warning-2 text-warning-1"
        >
          Without internet, the page may not open again after reloading — the
          till would be stuck until the connection comes back.
        </Point>
        <Point
          icon={<Wifi className="h-4 w-4" />}
          tone="bg-secondary-6 text-primary-green-300"
        >
          You don&apos;t need to reload. Keep selling — the POS reconnects and
          syncs your sales on its own.
        </Point>
      </ul>
    </CustomModal>
  );
};

export default OfflineReloadDialog;
