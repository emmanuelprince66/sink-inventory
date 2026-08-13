"use client";

import { useFetchLoyaltyProgramDetailQuery } from "@/api/loyalty/fetch-loyalty-program-detail";
import { useFetchLoyaltyProgramQrQuery } from "@/api/loyalty/fetch-loyalty-program-qr";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/toast/useToast";
import { Copy, ExternalLink } from "lucide-react";

// Members join by scanning the QR or opening the landing page; both are derived
// from the programme's join token.
const ProgramQrModal = ({ programId }: { programId: string }) => {
  const { showToast } = useToast();
  // The list payload returns qr_url: null, so read the QR from its dedicated
  // endpoint and fall back to the detail payload's embedded qr_details.
  const { data: qrRes, isLoading: qrLoading } = useFetchLoyaltyProgramQrQuery({
    params: { programId },
  });
  const { data, isLoading } = useFetchLoyaltyProgramDetailQuery({
    params: { programId },
  });

  if (qrLoading || isLoading) {
    return (
      <div className="w-full flex justify-center py-16">
        <Spinner className="text-primary-green-300" />
      </div>
    );
  }

  const qr = qrRes?.data ?? data?.data?.qr_details;
  const programName = data?.data?.program_info?.name;

  if (!qr?.token) {
    return (
      <p className="text-sm text-grey-3 text-center py-10">
        No QR code has been generated for this campaign yet.
      </p>
    );
  }

  const joinUrl = `${window.location.origin}/loyalty/join/${qr.token}`;

  const copy = (value: string, label: string) => {
    navigator.clipboard
      .writeText(value)
      .then(() => showToast(`${label} copied`, "success"))
      .catch(() => showToast(`Could not copy ${label.toLowerCase()}`, "error"));
  };

  return (
    <div className="space-y-4">
      {programName && (
        <p className="text-sm text-grey-3 text-center">{programName}</p>
      )}

      <div className="flex justify-center">
        {qr.qr_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qr.qr_url}
            alt={`QR code for ${programName ?? "loyalty campaign"}`}
            className="w-52 h-52 rounded-xl border border-grey-5 bg-white object-contain p-2"
          />
        ) : (
          <div className="w-52 h-52 rounded-xl border border-dashed border-grey-5 flex items-center justify-center text-center px-4">
            <p className="text-xs text-grey-3">
              QR image not returned by the API — share the link below instead.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-xs font-bold text-grey-2 mb-1">Landing page</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={joinUrl}
              className="flex-1 h-9 px-3 rounded-lg border border-grey-5 bg-grey-6 text-xs text-grey-2 truncate"
            />
            <Button
              type="button"
              variant="outline"
              className="h-9 px-3 gap-1.5"
              onClick={() => copy(joinUrl, "Link")}
            >
              <Copy className="w-3.5 h-3.5" />
              Copy
            </Button>
            <a href={joinUrl} target="_blank" rel="noopener noreferrer">
              <Button type="button" variant="outline" className="h-9 px-3">
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-grey-2 mb-1">Join token</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={qr.token}
              className="flex-1 h-9 px-3 rounded-lg border border-grey-5 bg-grey-6 text-xs font-mono text-grey-2 truncate"
            />
            <Button
              type="button"
              variant="outline"
              className="h-9 px-3 gap-1.5"
              onClick={() => copy(qr.token, "Token")}
            >
              <Copy className="w-3.5 h-3.5" />
              Copy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramQrModal;
