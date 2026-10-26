"use client";

import {
  MerchantBooking,
  useDisburseBookingRefundMutation,
} from "@/api/bookings/service-bookings";
import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/toast/useToast";
import { cn } from "@/lib/utils";
import { Banknote, Landmark } from "lucide-react";
import { useEffect, useState } from "react";

type DisbursementMethod = "BANK_TRANSFER" | "CASH";

const METHODS: { value: DisbursementMethod; label: string; icon: typeof Banknote }[] = [
  { value: "BANK_TRANSFER", label: "Bank transfer", icon: Landmark },
  { value: "CASH", label: "Cash", icon: Banknote },
];

export const refundAmountOf = (booking: MerchantBooking) =>
  Number(booking.refundable_amount ?? booking.amount_paid ?? 0);

export const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount);

/** Records that the merchant has paid a pending refund back to the customer. */
const DisburseRefundModal = ({
  booking,
  onClose,
}: {
  booking: MerchantBooking | null;
  onClose: () => void;
}) => {
  const { showToast } = useToast();
  const { mutateAsync: disburseRefund, isPending } =
    useDisburseBookingRefundMutation();
  const [method, setMethod] = useState<DisbursementMethod>("BANK_TRANSFER");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  // Fresh form for each booking opened.
  useEffect(() => {
    if (!booking) return;
    setMethod("BANK_TRANSFER");
    setReference("");
    setNotes("");
  }, [booking?.id]);

  const handleSubmit = async () => {
    if (!booking) return;
    try {
      await disburseRefund({
        bookingId: booking.id,
        payload: {
          disbursement_method: method,
          reference: reference.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      });
      showToast("Refund recorded as disbursed.", "success");
      onClose();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not record refund.",
        "error",
      );
    }
  };

  return (
    <CustomModal
      isOpen={Boolean(booking)}
      onClose={() => !isPending && onClose()}
      title="Record refund"
      description="Confirm you've paid this refund to the customer. This is saved to the booking's history and can't be undone."
      preventOutsideClose={isPending}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving..." : "Mark as refunded"}
          </Button>
        </div>
      }
    >
      {booking && (
        <div className="space-y-5">
          <div className="rounded-xl border border-grey-5 bg-grey-6 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-grey-1">
                  {booking.customer_name}
                </p>
                <p className="mt-0.5 truncate text-xs text-grey-3">
                  {booking.service_name} · {booking.reference}
                </p>
                {booking.customer_phone && (
                  <p className="mt-0.5 text-xs text-grey-3">
                    {booking.customer_phone}
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
                  To refund
                </p>
                <p className="text-lg font-extrabold text-grey-1">
                  {formatNaira(refundAmountOf(booking))}
                </p>
              </div>
            </div>
            {booking.cancellation_reason && (
              <p className="mt-3 border-t border-grey-5 pt-3 text-xs text-grey-2">
                <span className="font-semibold">Cancellation reason:</span>{" "}
                {booking.cancellation_reason}
              </p>
            )}
          </div>

          <fieldset className="space-y-1.5">
            <legend className="mb-1.5 text-sm font-semibold text-grey-2">
              How did you refund?
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {METHODS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={method === value}
                  onClick={() => setMethod(value)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors",
                    method === value
                      ? "border-primary-green-300 bg-secondary-6 text-primary-green-300"
                      : "border-grey-5 text-grey-2 hover:bg-grey-6",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          {method === "BANK_TRANSFER" && (
            <label className="block space-y-1.5 text-sm font-semibold text-grey-2">
              Transfer reference{" "}
              <span className="font-normal text-grey-3">Optional</span>
              <Input
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="e.g. TRX-REF-998822"
                className="h-10"
              />
            </label>
          )}

          <label className="block space-y-1.5 text-sm font-semibold text-grey-2">
            Note <span className="font-normal text-grey-3">Optional</span>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. Transferred to customer's GTB account"
              rows={3}
            />
          </label>
        </div>
      )}
    </CustomModal>
  );
};

export default DisburseRefundModal;
