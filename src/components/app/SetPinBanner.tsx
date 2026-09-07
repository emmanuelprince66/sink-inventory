"use client";

import {
  hasPinFrom,
  pinRequiredFrom,
  useUserPinStatusQuery,
} from "@/api/user/pin";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

/**
 * Tells someone who moves money that they still need a transaction PIN.
 *
 * The PIN dialog already creates one on the spot if it is missing, so this is
 * not the only path — but discovering it mid-payout, with a customer or an
 * invoice waiting, is a bad moment to be inventing and confirming a PIN. This
 * says so beforehand, when there is time.
 *
 * Deliberately silent for anyone who cannot move money: `pin_required` is the
 * backend's own answer to "does this person need one", and someone who only
 * logs expenses never enters a PIN, so nagging them would be noise. The extra
 * `relevant` gate exists because `pin_required` defaults to true when the
 * field is absent, and that default must not turn into a prompt for a cashier
 * on an older deployment.
 */
const SetPinBanner = ({ relevant }: { relevant: boolean }) => {
  const { data, isLoading } = useUserPinStatusQuery({ enabled: relevant });

  if (!relevant || isLoading) return null;
  if (hasPinFrom(data) || !pinRequiredFrom(data)) return null;

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-warning-1/30 bg-warning-2 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning-1" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-grey-1">
            Set your transaction PIN
          </p>
          <p className="mt-0.5 text-xs text-grey-3">
            You&apos;ll need one to send or approve a payout. Setting it now
            saves doing it with someone waiting at the counter.
          </p>
        </div>
      </div>

      <Link
        href="/settings?tab=transaction-pin"
        className="shrink-0 rounded-xl bg-grey-1 px-4 py-2 text-center text-xs font-bold text-white hover:bg-grey-2"
      >
        Set PIN
      </Link>
    </div>
  );
};

export default SetPinBanner;
