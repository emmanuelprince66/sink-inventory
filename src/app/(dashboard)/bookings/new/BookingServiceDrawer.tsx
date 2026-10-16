"use client";

import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useBookingServiceOptions, BookingServiceOption } from "@/hooks/useBookingServiceOptions";
import { Check, Clock3, Scissors } from "lucide-react";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

interface BookingServiceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onServiceSelect: (service: BookingServiceOption) => void;
  selectedServiceId?: string;
}

const BookingServiceDrawer = ({
  open,
  onOpenChange,
  onServiceSelect,
  selectedServiceId,
}: BookingServiceDrawerProps) => {
  const {
    services,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    isLoading,
    error,
    refetch,
    hasBusiness,
  } = useBookingServiceOptions();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-[92vw] flex-col border-l border-grey-5 bg-white p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-grey-5 p-5 pr-12">
          <SheetTitle className="text-lg font-extrabold text-grey-1">
            Select a service
          </SheetTitle>
          <SheetDescription>
            Choose one of the services configured in your Inventory.
          </SheetDescription>
        </SheetHeader>

        <div className="p-4 pb-2">
          <SearchInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search services..."
          />
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 pt-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="space-y-2 rounded-xl border border-grey-5 p-4"
              >
                <Skeleton className="h-4 w-2/3 bg-grey-5" />
                <Skeleton className="h-3 w-1/2 bg-grey-5" />
              </div>
            ))
          ) : error ? (
            <div className="rounded-xl border border-error-1/20 bg-error-2 p-4 text-center">
              <p className="text-sm text-error-1">
                Could not load services from this business.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => refetch()}
              >
                Try again
              </Button>
            </div>
          ) : !hasBusiness ? (
            <div className="rounded-xl border border-dashed border-grey-5 p-5 text-center text-sm text-grey-3">
              Select a business to load its services.
            </div>
          ) : services.length ? (
            services.map((service) => {
              const selected = selectedServiceId === service.id;
              const amount = Number(service.amount ?? service.selling_price ?? 0);
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => {
                    onServiceSelect(service);
                    onOpenChange(false);
                  }}
                  className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                    selected
                      ? "border-primary-green-300 bg-secondary-6"
                      : "border-grey-5 hover:border-primary-green-300/60 hover:bg-grey-6"
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-2 text-success-1">
                    <Scissors className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="truncate text-sm font-extrabold text-grey-1">
                        {service.name}
                      </span>
                      {selected && (
                        <Check className="h-4 w-4 shrink-0 text-primary-green-300" />
                      )}
                    </span>
                    {service.description && (
                      <span className="mt-1 line-clamp-2 block text-xs leading-5 text-grey-3">
                        {service.description}
                      </span>
                    )}
                    <span className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                      <span className="font-extrabold text-primary-green-300">
                        {formatCurrency(amount)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-grey-3">
                        <Clock3 className="h-3.5 w-3.5" />
                        {service.duration} min
                      </span>
                    </span>
                  </span>
                </button>
              );
            })
          ) : (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-grey-5 px-5 py-10 text-center">
              <Scissors className="h-6 w-6 text-grey-4" />
              <p className="mt-3 text-sm font-bold text-grey-1">
                No services found
              </p>
              <p className="mt-1 text-xs leading-5 text-grey-3">
                Add services from Inventory before creating a booking.
              </p>
            </div>
          )}
        </div>

        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-grey-5 p-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-xs text-grey-3">
              Page {page} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default BookingServiceDrawer;
