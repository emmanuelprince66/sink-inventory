"use client";

import { InitialsAvatar } from "@/components/app/InitialsAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCreateMerchantBookingMutation,
} from "@/api/bookings/service-bookings";
import { useFetchAttendants } from "@/api/attendants/get-all-attendants";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import BookingServiceDrawer from "./BookingServiceDrawer";
import CustomerDrawer from "../../pos/CustomersDrawer";
import { BookingServiceOption } from "@/hooks/useBookingServiceOptions";
import { useToast } from "@/hooks/toast/useToast";
import BookingPageHeader from "../BookingPageHeader";
import { addMinutes, format } from "date-fns";
import {
  CalendarClock,
  Check,
  Scissors,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type SelectedCustomer = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  total_sales?: number;
};

const toLocalDateTimeInput = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const getDefaultBookingTime = () => {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);
  return toLocalDateTimeInput(date);
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const CreateBookingPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const businessId = useBusinessStore((state) => state.business_id);
  const { mutateAsync: createBooking, isPending } =
    useCreateMerchantBookingMutation();
  const { data: attendantsResponse, isLoading: attendantsLoading } =
    useFetchAttendants(businessId ?? "", { enabled: Boolean(businessId) });
  const [customer, setCustomer] = useState<SelectedCustomer | null>(null);
  const [isCustomerPanelOpen, setIsCustomerPanelOpen] = useState(false);
  const [isServicePanelOpen, setIsServicePanelOpen] = useState(false);
  const [selectedService, setSelectedService] =
    useState<BookingServiceOption | null>(null);
  const [staffId, setStaffId] = useState("");
  const [startsAt, setStartsAt] = useState(getDefaultBookingTime);
  const [notes, setNotes] = useState("");

  const serviceAmount = useMemo(
    () => Number(selectedService?.amount ?? selectedService?.selling_price ?? 0),
    [selectedService],
  );
  const serviceDuration = selectedService?.duration ?? 30;
  const attendants = attendantsResponse?.data ?? [];
  const assignedStaff = selectedService?.assigned_staff_ids?.length
    ? attendants.filter((attendant: any) =>
        selectedService.assigned_staff_ids.includes(attendant.id),
      )
    : attendants;
  useEffect(() => {
    if (!selectedService || attendantsLoading || staffId) return;
    setStaffId(assignedStaff[0]?.id ?? attendants[0]?.id ?? "");
  }, [assignedStaff, attendants, attendantsLoading, selectedService, staffId]);

  const handleServiceSelect = (service: BookingServiceOption) => {
    setSelectedService(service);
    const serviceStaffIds = service.assigned_staff_ids ?? [];
    const eligibleAttendant = serviceStaffIds.length
      ? attendants.find((attendant: any) =>
          serviceStaffIds.includes(attendant.id),
        )
      : attendants[0];
    setStaffId(eligibleAttendant?.id ?? serviceStaffIds[0] ?? "");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!businessId || !customer || !selectedService || !staffId) {
      showToast(
        !businessId
          ? "Select a business to continue."
          : !customer
            ? "Select a customer to continue."
            : !selectedService
              ? "Select an active service."
              : "No eligible staff member is available for this service.",
        "error",
      );
      return;
    }
    const startDate = new Date(startsAt);
    if (Number.isNaN(startDate.getTime())) {
      showToast("Choose a valid appointment date and time.", "error");
      return;
    }
    const endDate = addMinutes(startDate, serviceDuration);
    try {
      const response = await createBooking({
        businessId,
        payload: {
          reference: `BK-${Date.now()}`,
          service_id: selectedService.id,
          customer_id: customer.id,
          customer_name: customer.name,
          customer_phone: customer.phone ?? "",
          customer_email: customer.email ?? "",
          booking_date: format(startDate, "yyyy-MM-dd"),
          start_time: format(startDate, "HH:mm"),
          end_time: format(endDate, "HH:mm"),
          duration_minutes: serviceDuration,
          service_price: serviceAmount.toFixed(2),
          staff_id: staffId,
          notes: notes.trim(),
        },
      });
      const bookingResult = response.data as {
        id?: string;
        booking?: { id?: string };
      };
      const bookingId = bookingResult.booking?.id ?? bookingResult.id;
      showToast("Booking created successfully.", "success");
      router.push(
        bookingId ? `/bookings/${encodeURIComponent(bookingId)}` : "/bookings",
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not create the booking.",
        "error",
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <BookingPageHeader
        title="Create a booking"
        description="Book an appointment on behalf of a customer."
      />

      <div className="flex items-start gap-3 rounded-xl border border-info-1/20 bg-info-2 px-4 py-3">
        <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-info-1" />
        <p className="text-xs leading-5 text-grey-2 sm:text-sm">
          Booking details will be submitted to your business booking schedule.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="rounded-2xl border border-grey-5 bg-white p-4 sm:p-6">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-extrabold text-grey-1">
                Customer
              </h2>
              <p className="mt-1 text-sm text-grey-3">
                Choose who this appointment is for.
              </p>
            </div>
            <Button
              type="button"
              variant={customer ? "outline" : "default"}
              onClick={() => setIsCustomerPanelOpen(true)}
              className="w-full sm:w-auto"
            >
              <UserRound className="h-4 w-4" />
              {customer ? "Change customer" : "Select customer"}
            </Button>
          </div>

          {customer ? (
            <div className="flex min-w-0 items-center gap-3 rounded-xl border border-primary-green-300/30 bg-secondary-6 p-3.5">
              <InitialsAvatar name={customer.name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-grey-1">
                  {customer.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-grey-3">
                  {customer.phone || "No phone number"}
                  {customer.email ? ` · ${customer.email}` : ""}
                </p>
              </div>
              <Check className="h-5 w-5 shrink-0 text-primary-green-300" />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsCustomerPanelOpen(true)}
              className="flex min-h-20 w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-grey-5 px-4 text-sm font-semibold text-grey-3 transition-colors hover:border-primary-green-300 hover:bg-secondary-6"
            >
              Select an existing customer or create a customer
            </button>
          )}
        </section>

        <section className="rounded-2xl border border-grey-5 bg-white p-4 sm:p-6">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-extrabold text-grey-1">
                Choose a service
              </h2>
              <p className="mt-1 text-sm text-grey-3">
                Select a service from your Inventory service list.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsServicePanelOpen(true)}
              className="w-full sm:w-auto"
            >
              <Scissors className="h-4 w-4" />
              {selectedService ? "Change service" : "Select service"}
            </Button>
          </div>

          {selectedService ? (
            <div className="flex flex-col gap-3 rounded-xl border border-primary-green-300/30 bg-secondary-6 p-4 sm:flex-row sm:items-center">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary-green-300">
                <Scissors className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-grey-1">
                  {selectedService.name}
                </p>
                <p className="mt-0.5 text-xs text-grey-3">
                  {selectedService.description || "Service"} ·{" "}
                  {selectedService.duration} min
                </p>
              </div>
              <span className="text-sm font-extrabold text-primary-green-300">
                {formatCurrency(serviceAmount)}
              </span>
            </div>
          ) : (
            <div className="flex min-h-20 items-center justify-center rounded-xl border border-dashed border-grey-5 px-4 text-center text-sm text-grey-3">
              Choose a service to add it to this booking.
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-grey-5 bg-white p-4 sm:p-6">
          <h2 className="text-base font-extrabold text-grey-1">
            Appointment details
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-semibold text-grey-2">
              Date and time
              <Input
                type="datetime-local"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
                required
                className="h-10 rounded-lg text-sm"
              />
            </label>
            <label className="space-y-1.5 text-sm font-semibold text-grey-2 sm:col-span-2">
              Notes <span className="font-normal text-grey-3">Optional</span>
              <Input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="h-10 rounded-lg text-sm"
              />
            </label>
          </div>
          {selectedService && startsAt && (
            <p className="mt-3 text-xs text-grey-3">
              Appointment ends around{" "}
              {format(
                addMinutes(new Date(startsAt), serviceDuration),
                "h:mm a",
              )}
              .
            </p>
          )}
        </section>

        <div className="flex flex-col-reverse gap-3 border-t border-border-tint pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/bookings")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              !customer ||
              !selectedService ||
              !staffId ||
              isPending
            }
            className="w-full sm:w-auto"
          >
            <CalendarClock className="h-4 w-4" />
            {isPending ? "Creating…" : "Create booking"}
          </Button>
        </div>
      </form>

      <CustomerDrawer
        open={isCustomerPanelOpen}
        onOpenChange={setIsCustomerPanelOpen}
        onCustomerSelect={(selected: SelectedCustomer) => {
          setCustomer(selected);
          setIsCustomerPanelOpen(false);
        }}
      />
      <BookingServiceDrawer
        open={isServicePanelOpen}
        onOpenChange={setIsServicePanelOpen}
        selectedServiceId={selectedService?.id}
        onServiceSelect={handleServiceSelect}
      />
    </div>
  );
};

export default CreateBookingPage;
