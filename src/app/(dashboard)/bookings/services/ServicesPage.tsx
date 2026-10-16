"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getServiceCategoryName } from "@/api/bookings/service-bookings";
import { useBookingServiceOptions } from "@/hooks/useBookingServiceOptions";
import { Clock3, Scissors } from "lucide-react";
import { useRouter } from "next/navigation";
import BookingPageHeader from "../BookingPageHeader";

const currency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const ServicesPage = () => {
  const router = useRouter();
  const {
    services,
    isLoading,
    error,
    total,
    refetch,
    hasBusiness,
  } = useBookingServiceOptions();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <BookingPageHeader
        title="Services & setup"

        trailing={
          <Button
            type="button"
            onClick={() => router.push("/inventory?tab=services")}
            className="w-full sm:w-auto"
          >
            <Scissors className="h-4 w-4" />
            Manage Inventory services
          </Button>
        }
      />

      <div className="flex items-start gap-3 rounded-xl border border-info-1/20 bg-info-2 px-4 py-3 text-xs leading-5 text-grey-2 sm:text-sm">
        <Scissors className="mt-0.5 h-4 w-4 shrink-0 text-info-1" />
        Services are managed in Inventory. Set each service&apos;s price,
        duration, minimum deposit, and staff there.
      </div>

      {error ? (
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
        <div className="rounded-2xl border border-dashed border-grey-5 bg-white px-6 py-12 text-center text-sm text-grey-3">
          Select a business to load its services.
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="space-y-2 rounded-2xl border border-grey-5 bg-white p-5"
            >
              <Skeleton className="h-5 w-1/3 bg-grey-5" />
              <Skeleton className="h-4 w-2/3 bg-grey-5" />
            </div>
          ))}
        </div>
      ) : services.length ? (
        <>
          <p className="text-xs font-semibold text-grey-3">
            {total} {total === 1 ? "service" : "services"} from Inventory
          </p>
          <div className="space-y-3">
            {services.map((service) => (
              <article
                key={service.id}
                className="flex flex-col gap-4 rounded-2xl border border-grey-5 bg-white p-4 sm:flex-row sm:items-center sm:p-5"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-success-2 text-success-1">
                  <Scissors className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-extrabold text-grey-1">{service.name}</h2>
                  {service.description && (
                    <p className="mt-1 text-sm text-grey-3">
                      {service.description}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-grey-3">
                    {getServiceCategoryName(service) || "Uncategorised"}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:shrink-0 sm:flex-col sm:items-end">
                  <span className="font-extrabold text-primary-green-300">
                    {currency(
                      Number(service.amount ?? service.selling_price ?? 0),
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-grey-3">
                    <Clock3 className="h-3.5 w-3.5" />
                    {service.duration ? `${service.duration} min` : "—"}
                    {" · "}
                    {service.min_deposit_percentage ?? 30}% deposit
                  </span>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-grey-5 bg-white px-6 py-12 text-center">
          <Scissors className="mx-auto h-7 w-7 text-grey-4" />
          <h2 className="mt-3 font-extrabold text-grey-1">No services yet</h2>
          <p className="mt-1 text-sm text-grey-3">
            Add services in Inventory to make them selectable for bookings.
          </p>
          <Button
            type="button"
            className="mt-4"
            onClick={() => router.push("/inventory?tab=services")}
          >
            Go to Inventory services
          </Button>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
