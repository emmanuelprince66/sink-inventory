"use client";

import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOfflineSales } from "@/hooks/useOfflineSales";
import { setManualOfflineMode } from "@/lib/offline/offlineMode";
import {
  discardQueuedSale,
  QueuedOfflineSale,
} from "@/lib/offline/offlineSales";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import { format, isToday, isYesterday } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  ChevronDown,
  CloudOff,
  CloudUpload,
  Landmark,
  Receipt,
  Trash2,
  User,
  UserRound,
  WifiOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const METHOD = {
  CASH: { label: "Cash", Icon: Banknote },
  BANK: { label: "Bank Transfer", Icon: Landmark },
  CARD: { label: "Card", Icon: Banknote },
} as const;

const dayLabel = (date: Date) =>
  isToday(date)
    ? "Today"
    : isYesterday(date)
      ? "Yesterday"
      : format(date, "EEEE, dd MMM yyyy");

/** Oldest first, grouped under a heading per day. */
const groupByDay = (sales: QueuedOfflineSale[]) => {
  const groups: { label: string; sales: QueuedOfflineSale[] }[] = [];
  sales.forEach((sale) => {
    const label = dayLabel(new Date(sale.payload.occurred_at));
    const last = groups[groups.length - 1];
    if (last?.label === label) last.sales.push(sale);
    else groups.push({ label, sales: [sale] });
  });
  return groups;
};

/**
 * Sales taken offline and kept on this device. Nothing reaches the server
 * until someone presses Sync here, which needs Offline mode off and a
 * connection, so the cashier always knows which state the till is in.
 */
const OfflineSalesPage = () => {
  const router = useRouter();
  const {
    pending,
    pendingCount,
    loaded,
    syncing,
    syncBlockedReason,
    manualOffline,
    isOnline,
    syncNow,
  } = useOfflineSales();

  const total = pending.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const failedCount = pending.filter((sale) => sale.last_error).length;

  const status = manualOffline
    ? { label: "Offline mode on", dot: "bg-warning-1", tone: "bg-warning-2 text-grey-1" }
    : !isOnline
      ? { label: "No connection", dot: "bg-error-1", tone: "bg-error-2 text-error-1" }
      : { label: "Online", dot: "bg-success-1", tone: "bg-success-2 text-success-1" };

  return (
    <div className="mx-auto w-full max-w-4xl flex flex-col gap-5 pb-12">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/pos")}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-grey-5 bg-white px-3 py-2 text-sm font-bold text-grey-2 transition-colors hover:border-grey-4 hover:bg-grey-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="truncate text-xl font-extrabold text-grey-1">
            Offline Sales
          </h1>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold",
            status.tone,
          )}
        >
          <span className={cn("h-2 w-2 rounded-full", status.dot)} />
          {status.label}
        </span>
      </header>

      {!loaded ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-2xl bg-grey-5" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl bg-grey-5" />
            ))}
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl bg-grey-5" />
          ))}
        </div>
      ) : pendingCount === 0 ? (
        <EmptyState onBack={() => router.push("/pos")} />
      ) : (
        <>
          {/* Sync card */}
          <section
            className={cn(
              "rounded-2xl border p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
              syncBlockedReason
                ? "border-warning-1/30 bg-warning-2"
                : "border-primary-green-300/30 bg-secondary-6",
            )}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                  syncBlockedReason ? "bg-white text-warning-1" : "bg-white text-primary-green-300",
                )}
              >
                {manualOffline ? (
                  <CloudOff className="h-6 w-6" />
                ) : !isOnline ? (
                  <WifiOff className="h-6 w-6" />
                ) : (
                  <CloudUpload className="h-6 w-6" />
                )}
              </div>
              <div>
                <p className="text-base font-extrabold text-grey-1">
                  {syncBlockedReason ? "Sync paused" : "Ready to sync"}
                </p>
                <p className="mt-0.5 text-sm text-grey-2">
                  {syncBlockedReason ??
                    "These sales are only on this device. Sync them to add them to your sales and update stock."}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              {manualOffline && (
                <Button
                  variant="outline"
                  className="bg-white"
                  onClick={() => setManualOfflineMode(false)}
                >
                  Turn off Offline mode
                </Button>
              )}
              <Button
                className="bg-primary-green-300 text-white min-w-[150px]"
                disabled={!!syncBlockedReason || syncing}
                onClick={() => syncNow()}
              >
                {syncing ? (
                  <Spinner />
                ) : (
                  <>
                    <CloudUpload className="mr-2 h-4 w-4" />
                    Sync {pendingCount} sale{pendingCount === 1 ? "" : "s"}
                  </>
                )}
              </Button>
            </div>
          </section>

          {/* Summary */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat
              icon={<Receipt className="h-4 w-4" />}
              label="Waiting to sync"
              value={`${pendingCount} sale${pendingCount === 1 ? "" : "s"}`}
            />
            <Stat
              icon={<Banknote className="h-4 w-4" />}
              label="Total value"
              value={formatToNaira(total)}
            />
            <Stat
              icon={<AlertTriangle className="h-4 w-4" />}
              label="Need attention"
              value={failedCount ? `${failedCount} failed` : "None"}
              tone={failedCount ? "error" : "default"}
            />
          </section>

          {failedCount > 0 && !syncing && (
            <div className="flex items-start gap-3 rounded-2xl border border-error-1/30 bg-error-2 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-error-1" />
              <p className="text-sm text-error-1">
                {failedCount} sale{failedCount === 1 ? "" : "s"} couldn&apos;t
                sync. The reason is on each one. Fix it and sync again, or
                remove the sale if it can never go through.
              </p>
            </div>
          )}

          {/* Sales, grouped by day */}
          <section className="flex flex-col gap-5">
            {groupByDay(pending).map((group) => (
              <div key={group.label} className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-grey-3">
                    {group.label}
                  </p>
                  <span className="h-px flex-1 bg-grey-5" />
                  <p className="text-xs font-bold text-grey-3">
                    {formatToNaira(
                      group.sales.reduce((sum, sale) => sum + sale.total, 0),
                    )}
                  </p>
                </div>
                {group.sales.map((sale) => (
                  <SaleCard key={sale.client_sale_id} sale={sale} />
                ))}
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
};

const Stat = ({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "default" | "error";
}) => (
  <div className="rounded-2xl border border-grey-5 bg-white p-4">
    <div className="flex items-center gap-2 text-grey-3">
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full",
          tone === "error" ? "bg-error-2 text-error-1" : "bg-secondary-6 text-primary-green-300",
        )}
      >
        {icon}
      </span>
      <p className="text-xs font-medium">{label}</p>
    </div>
    <p
      className={cn(
        "mt-2 text-xl font-extrabold",
        tone === "error" ? "text-error-1" : "text-grey-1",
      )}
    >
      {value}
    </p>
  </div>
);

const SaleCard = ({ sale }: { sale: QueuedOfflineSale }) => {
  const [open, setOpen] = useState(false);
  const method = METHOD[sale.payload.method] ?? METHOD.CASH;
  const items = sale.display?.items ?? [];
  const itemCount = items.length || sale.payload.products.length;
  const failed = !!sale.last_error;

  const handleRemove = () => {
    const ok = window.confirm(
      "Remove this sale? It will NOT be recorded in your sales or stock. Only do this if it can't sync and you've recorded it another way.",
    );
    if (ok) discardQueuedSale(sale.client_sale_id).catch(() => undefined);
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-sm",
        failed ? "border-error-1/40" : "border-grey-5",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 p-4 text-left"
        aria-expanded={open}
      >
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            failed ? "bg-error-2 text-error-1" : "bg-secondary-6 text-primary-green-300",
          )}
        >
          <method.Icon className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-grey-1">
              {format(new Date(sale.payload.occurred_at), "h:mm a")}
            </p>
            <span className="rounded-full bg-grey-6 px-2 py-0.5 text-[10px] font-bold text-grey-2">
              {method.label}
            </span>
            {failed && (
              <span className="rounded-full bg-error-2 px-2 py-0.5 text-[10px] font-bold text-error-1">
                Failed
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-grey-3">
            <span>RC-{sale.client_sale_id.slice(0, 4)}</span>
            {sale.display?.attendant_name && (
              <span className="inline-flex items-center gap-1">
                <UserRound className="h-3 w-3" />
                {sale.display.attendant_name}
              </span>
            )}
            {sale.display?.customer_name && (
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" />
                {sale.display.customer_name}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-base font-extrabold text-grey-1">
            {formatToNaira(sale.total)}
          </p>
          <p className="text-xs text-grey-3">
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-grey-4 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {failed && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-error-1/20 bg-error-2 px-4 py-2.5">
          <p className="text-xs font-medium text-error-1">
            Couldn&apos;t sync: {sale.last_error}
          </p>
          <button
            type="button"
            onClick={handleRemove}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-error-1 hover:bg-white/60"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>
      )}

      {open && (
        <div className="border-t border-grey-6 bg-grey-6/40 px-4 py-3">
          {items.length ? (
            <ul className="space-y-1.5 text-sm">
              {items.map((item, index) => (
                <li key={index} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-grey-2">
                    <span className="font-bold text-grey-1">{item.quantity}×</span>{" "}
                    {item.name}
                  </span>
                  <span className="shrink-0 font-medium text-grey-1">
                    {formatToNaira(item.line_total)}
                  </span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-3 border-t border-grey-5 pt-1.5 font-bold text-grey-1">
                <span>Total</span>
                <span>{formatToNaira(sale.total)}</span>
              </li>
            </ul>
          ) : (
            <p className="text-xs text-grey-3">
              Item details weren&apos;t saved for this sale.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const EmptyState = ({ onBack }: { onBack: () => void }) => (
  <div className="flex flex-col items-center gap-3 rounded-2xl border border-grey-5 bg-white px-6 py-16 text-center">
    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary-6 text-primary-green-300">
      <CheckCircle2 className="h-8 w-8" />
    </span>
    <p className="text-lg font-extrabold text-grey-1">All caught up</p>
    <p className="max-w-sm text-sm text-grey-3">
      There are no offline sales on this device. Everything has been synced to
      your sales and stock.
    </p>
    <Button variant="outline" className="mt-2" onClick={onBack}>
      Back to POS
    </Button>
  </div>
);

export default OfflineSalesPage;
