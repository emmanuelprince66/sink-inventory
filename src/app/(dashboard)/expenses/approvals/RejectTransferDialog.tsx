"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

/**
 * Declining a request, with the reason recorded against it.
 *
 * The reason is required rather than optional: it is the only thing the person
 * who raised the transfer sees explaining why it did not go out, and "rejected"
 * with no note reads as the system losing it.
 */
const RejectTransferDialog = ({
  open,
  onClose,
  onConfirm,
  loading,
  reference,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
  reference?: string;
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
      setError("");
    }
  }, [open]);

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Say why, so whoever raised it knows what to fix.");
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <CustomModal
      isOpen={open}
      onClose={onClose}
      trigger={false}
      size="sm"
      title="Reject this transfer"
      description={
        reference ? `Request ${reference} will not be sent.` : undefined
      }
    >
      <div className="w-full space-y-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
            Reason
          </label>
          <Textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError("");
            }}
            disabled={loading}
            rows={3}
            placeholder="e.g. Invoice price is higher than the agreed quote."
            className="mt-2 rounded-xl"
          />
          {error && (
            <p className="mt-1.5 text-xs font-bold text-error-1">{error}</p>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-error-1 hover:bg-error-1/90"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? <Spinner className="mr-2" size="sm" /> : "Reject"}
          </Button>
        </div>
      </div>
    </CustomModal>
  );
};

export default RejectTransferDialog;
