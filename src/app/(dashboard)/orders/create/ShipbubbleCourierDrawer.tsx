"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NormalizedCourier } from "@/hooks/useOrderDeliveryHook";
import { AlertCircle, Star, Truck } from "lucide-react";

const formatFee = (amount: string, currency = "NGN") => {
  const symbol = currency === "NGN" ? "₦" : currency || "₦";
  return `${symbol}${Number(amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

interface ShipbubbleCourierDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  couriers: NormalizedCourier[];
  selectedCourier: NormalizedCourier | null;
  onSelect: (courier: NormalizedCourier) => void;
  isFetchingRates?: boolean;
  ratesError?: string | null;
  onRetry?: () => void;
}

const ShipbubbleCourierDrawer = ({
  open,
  onOpenChange,
  couriers,
  selectedCourier,
  onSelect,
  isFetchingRates = false,
  ratesError,
  onRetry,
}: ShipbubbleCourierDrawerProps) => {
  const handleSelect = (courier: NormalizedCourier) => {
    onSelect(courier);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-white border border-grey-5 flex flex-col w-full sm:max-w-md">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-xl font-semibold">
            Select Delivery Option
          </SheetTitle>
          <SheetDescription>
            Live rates from Shipbubble for this delivery address
          </SheetDescription>
        </SheetHeader>

        <div className="flex-grow overflow-y-auto flex flex-col gap-4 p-5">
          {isFetchingRates ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-grey-5 p-3"
                >
                  <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-grey-6" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-28 animate-pulse rounded bg-grey-6" />
                    <div className="h-2.5 w-20 animate-pulse rounded bg-grey-6" />
                  </div>
                  <div className="h-3 w-12 animate-pulse rounded bg-grey-6" />
                </div>
              ))}
              <p className="pt-1 text-center text-sm text-grey-4">
                Fetching delivery options…
              </p>
            </div>
          ) : ratesError ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3 text-center">
              <AlertCircle className="w-10 h-10 text-error-1" />
              <p className="text-sm text-grey-3 px-4">{ratesError}</p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="rounded-full bg-primary-green-300 px-5 py-2 text-sm font-medium text-white hover:bg-primary-green-200 transition-colors cursor-pointer"
                >
                  Try again
                </button>
              )}
            </div>
          ) : couriers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Truck className="w-12 h-12 text-grey-5" />
              <p className="text-sm font-medium text-grey-1">
                No delivery options available
              </p>
            </div>
          ) : (
            couriers.map((courier) => {
              const isSelected = selectedCourier?.id === courier.id;
              return (
                <button
                  key={courier.id}
                  type="button"
                  onClick={() => handleSelect(courier)}
                  className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary-green-300 bg-secondary-6"
                      : "border-grey-5 hover:border-grey-4 hover:bg-grey-6"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white border border-grey-5">
                    {courier.image ? (
                      <img
                        src={courier.image}
                        alt={courier.location}
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <Truck className="w-4 h-4 text-grey-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-grey-1">
                        {courier.location}
                      </p>
                      {!!courier.discountPercentage && (
                        <span className="shrink-0 rounded-full bg-error-2 px-1.5 py-0.5 text-[10px] font-semibold text-error-1">
                          -{courier.discountPercentage}%
                        </span>
                      )}
                    </div>
                    {courier.description && (
                      <p className="truncate text-xs text-grey-4">
                        {courier.description}
                      </p>
                    )}
                    <div className="mt-0.5 flex items-center gap-2">
                      {typeof courier.rating === "number" && (
                        <span className="flex items-center gap-0.5 text-[11px] text-grey-4">
                          <Star className="w-3 h-3 fill-warning-1 text-warning-1" />
                          {courier.rating}
                        </span>
                      )}
                      {courier.codAvailable && (
                        <span className="rounded-full bg-secondary-6 px-1.5 py-0.5 text-[10px] font-medium text-primary-green-100">
                          COD
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-sm font-bold text-grey-1 shrink-0">
                    {formatFee(courier.amount, courier.currency)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ShipbubbleCourierDrawer;
