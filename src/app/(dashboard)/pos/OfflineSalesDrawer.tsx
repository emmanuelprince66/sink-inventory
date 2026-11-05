"use client";

import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/toast/useToast";
import { useOfflineSales } from "@/hooks/useOfflineSales";
import { useBusinessDataStore } from "@/lib/store/useBusinessDataStore";
import {
  discardQueuedSale,
  QueuedOfflineSale,
} from "@/lib/offline/offlineSales";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import { format, isToday, isYesterday } from "date-fns";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  ChevronDown,
  CloudUpload,
  Printer,
  Landmark,
  Receipt,
  Trash2,
  User,
  UserRound,
  WifiOff,
} from "lucide-react";
import { useState } from "react";
import { printOfflineReceipt } from "./printOfflineReceipt";
import ConnectionStatus from "./ConnectionStatus";

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
 * Sales taken offline and kept on this device until they sync, which happens
 * on its own once the internet is back. Sync now is the backup.
 *
 * A drawer imported directly by the POS rather than a route of its own: a page
 * that hadn't been loaded yet can't be reached with no connection, which is
 * exactly when it's needed. Keep it out of next/dynamic for the same reason.
 */
const OfflineSalesDrawer = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const {
    pending,
    pendingCount,
    loaded,
    syncing,
    syncBlockedReason,
    isOnline,
    syncNow,
    failedCount,
    issue,
  } = useOfflineSales();

  const total = pending.reduce((sum, sale) => sum + (sale.total || 0), 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto border-grey-5 bg-white p-0 sm:max-w-xl">
        {/* Right padding keeps the pill clear of the sheet's close button. */}
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-grey-5 bg-white py-4 pl-4 pr-12">
          <SheetTitle className="text-lg font-extrabold text-grey-1">
            Offline Sales
          </SheetTitle>
          <ConnectionStatus />
          <SheetDescription className="sr-only">
            Sales saved on this device and waiting to sync.
          </SheetDescription>
        </div>

        <div className="flex flex-col gap-4 p-4 pb-8">
          {!loaded ? (
            <div className="space-y-4">
              <Skeleton className="h-28 w-full rounded-2xl bg-grey-5" />
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-2xl bg-grey-5" />
                ))}
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-20 w-full rounded-2xl bg-grey-5"
                />
              ))}
            </div>
          ) : pendingCount === 0 ? (
            <EmptyState onClose={() => onOpenChange(false)} />
          ) : (
            <>
              {/* Sync card */}
              <section
                className={cn(
                  "flex flex-col gap-4 rounded-2xl border p-4",
                  syncBlockedReason
                    ? "border-warning-1/30 bg-warning-2"
                    : "border-primary-green-300/30 bg-secondary-6",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white",
                      syncBlockedReason
                        ? "text-warning-1"
                        : "text-primary-green-300",
                    )}
                  >
                    {!isOnline ? (
                      <WifiOff className="h-5 w-5" />
                    ) : (
                      <CloudUpload className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-extrabold text-grey-1">
                      {syncBlockedReason
                        ? "Waiting for internet"
                        : syncing
                          ? "Syncing…"
                          : issue
                            ? "Couldn't sync yet"
                            : "Syncing automatically"}
                    </p>
                    <p className="mt-0.5 text-sm text-grey-2">
                      {syncBlockedReason ??
                        issue?.message ??
                        "These sales sync on their own. You don't need to do anything."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    className="min-w-[150px] flex-1 bg-primary-green-300 text-white"
                    disabled={!!syncBlockedReason || syncing}
                    onClick={() => syncNow()}
                  >
                    {syncing ? (
                      <Spinner />
                    ) : (
                      <>
                        <CloudUpload className="mr-2 h-4 w-4" />
                        Sync now
                      </>
                    )}
                  </Button>
                </div>
              </section>

              {/* Summary */}
              <section className="grid grid-cols-1 gap-2 sm:grid-cols-3">
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
      </SheetContent>
    </Sheet>
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
  <div className="min-w-0 rounded-2xl border border-grey-5 bg-white p-3">
    <div className="flex items-center gap-2 text-grey-3">
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
          tone === "error"
            ? "bg-error-2 text-error-1"
            : "bg-secondary-6 text-primary-green-300",
        )}
      >
        {icon}
      </span>
      <p className="truncate text-xs font-medium">{label}</p>
    </div>
    <p
      className={cn(
        "mt-2 break-words text-base font-extrabold",
        tone === "error" ? "text-error-1" : "text-grey-1",
      )}
    >
      {value}
    </p>
  </div>
);

const SaleCard = ({ sale }: { sale: QueuedOfflineSale }) => {
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();
  const business = useBusinessDataStore((state) => state.businessData);

  const handleReprint = () => {
    printOfflineReceipt(sale, business).catch(() =>
      showToast("Couldn't open printing. Please try again.", "error"),
    );
  };
  const method = METHOD[sale.payload.method] ?? METHOD.CASH;
  const items = sale.display?.items ?? [];
  const itemCount = items.length || sale.payload.products.length;
  const failed = !!sale.rejected;

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
        className="flex w-full cursor-pointer items-center gap-3 p-3 text-left"
        aria-expanded={open}
      >
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            failed
              ? "bg-error-2 text-error-1"
              : "bg-secondary-6 text-primary-green-300",
          )}
        >
          <method.Icon className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-sm font-bold text-grey-1">
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
              <span className="inline-flex min-w-0 items-center gap-1">
                <UserRound className="h-3 w-3 shrink-0" />
                <span className="truncate">{sale.display.attendant_name}</span>
              </span>
            )}
            {sale.display?.customer_name && (
              <span className="inline-flex min-w-0 items-center gap-1">
                <User className="h-3 w-3 shrink-0" />
                <span className="truncate">{sale.display.customer_name}</span>
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-extrabold text-grey-1">
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
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-error-1/20 bg-error-2 px-3 py-2.5">
          <p className="min-w-0 text-xs font-medium text-error-1">
            Couldn&apos;t sync: {sale.last_error}
          </p>
          <button
            type="button"
            onClick={handleRemove}
            className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-error-1 hover:bg-white/60"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>
      )}

      {open && (
        <div className="border-t border-grey-6 bg-grey-6/40 px-3 py-3">
          {items.length ? (
            <ul className="space-y-1.5 text-sm">
              {items.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="min-w-0 truncate text-grey-2">
                    <span className="font-bold text-grey-1">
                      {item.quantity}×
                    </span>{" "}
                    {item.name}
                  </span>
                  <span className="shrink-0 font-medium text-grey-1">
                    {formatToNaira(item.line_total)}
                  </span>
                </li>
              ))}
              {sale.display?.vat_amount ? (
                <li className="flex items-center justify-between gap-3 text-grey-2">
                  <span>VAT</span>
                  <span>{formatToNaira(sale.display.vat_amount)}</span>
                </li>
              ) : null}
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
          {items.length > 0 && (
            <button
              type="button"
              onClick={handleReprint}
              className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-grey-5 bg-white px-2.5 py-1.5 text-xs font-bold text-grey-2 hover:bg-grey-6"
            >
              <Printer className="h-3.5 w-3.5" />
              Reprint receipt
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const EmptyState = ({ onClose }: { onClose: () => void }) => (
  <div className="flex flex-col items-center gap-3 rounded-2xl border border-grey-5 bg-white px-6 py-16 text-center">
    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary-6 text-primary-green-300">
      <CheckCircle2 className="h-8 w-8" />
    </span>
    <p className="text-lg font-extrabold text-grey-1">All caught up</p>
    <p className="max-w-sm text-sm text-grey-3">
      There are no offline sales on this device. Everything has been synced to
      your sales and stock.
    </p>
    <Button variant="outline" className="mt-2" onClick={onClose}>
      Back to POS
    </Button>
  </div>
);

export default OfflineSalesDrawer;
