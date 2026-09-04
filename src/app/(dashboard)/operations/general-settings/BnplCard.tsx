"use client";

import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { useSetBnplMutation } from "@/api/business/set-bnpl";
import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useKycHook } from "@/hooks/useKycHook";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { CheckCircle2, CreditCard, ShieldAlert, Store } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import BnplTerms from "./BnplTerms";

/**
 * Why a merchant may or may not offer BNPL.
 *
 * Akawopay lends against the merchant's verified identity, so the bar is a
 * fully upgraded wallet — Tier 3 for a sole trader, approved documents for a
 * company. Worked out here as well as upstream so the card can say what is
 * missing before the merchant flips a switch and is refused; the API's answer
 * is still the one that decides, and its message is shown verbatim when the
 * two disagree.
 */
const eligibilityOf = ({
  wallet,
  tier,
  accountType,
  corporateApproved,
}: {
  wallet: any;
  tier: number;
  accountType?: "individual" | "corporate";
  corporateApproved: boolean;
}): { ready: boolean; reason: string | null } => {
  // consent_given is the customer agreeing to the wallet provider's terms; a
  // wallet without it exists but cannot move money.
  const walletLive =
    Boolean(wallet) &&
    wallet?.is_active !== false &&
    wallet?.consent_given !== false;

  if (!walletLive) {
    return {
      ready: false,
      reason:
        "You must create and activate your Sync360 wallet before offering BNPL.",
    };
  }

  if (accountType === "corporate") {
    return corporateApproved
      ? { ready: true, reason: null }
      : {
          ready: false,
          reason:
            "Your corporate verification documents must be approved before offering BNPL.",
        };
  }

  // Individual, and anything not yet typed — the stricter of the two rules is
  // the safer default when the account type has not come back.
  return tier >= 3
    ? { ready: true, reason: null }
    : {
        ready: false,
        reason:
          "Your wallet must be upgraded to Tier 3 (BVN, NIN, and Address verified) to offer BNPL.",
      };
};

const BnplCard = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const { data: BusinessData } = useFetchBusinessById(business_id);
  const business = BusinessData?.data;

  const { verification, corporateReview } = useKycHook();

  const [showModal, setShowModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [apiError, setApiError] = useState("");

  // Server state, not local: the previous build kept this in useState and
  // toasted "activated" without persisting anything, so a refresh silently
  // turned BNPL back off while the merchant believed it was live.
  const active = Boolean(business?.enable_bnpl);

  const { ready, reason } = eligibilityOf({
    wallet: verification.wallet,
    tier: verification.tier,
    accountType: verification.accountType,
    corporateApproved: corporateReview.isApproved,
  });

  const closeModal = () => {
    setShowModal(false);
    setAgreedToTerms(false);
    setApiError("");
  };

  const { mutate: setBnpl, isPending } = useSetBnplMutation({
    onSuccess: closeModal,
    onError: setApiError,
  });

  const handleToggle = (checked: boolean) => {
    if (!business_id) return;

    // Turning it on is an agreement, so it goes through the terms. Turning it
    // off is not, and asking someone to re-accept terms to stop using a thing
    // would be a trap.
    if (checked) {
      setShowModal(true);
      return;
    }

    setBnpl({ businessId: business_id, enabled: false });
  };

  const handleActivate = () => {
    if (!agreedToTerms || !business_id) return;
    setApiError("");
    setBnpl({ businessId: business_id, enabled: true });
  };

  return (
    <>
      <div className="rounded-xl border border-grey-5 bg-white p-4">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-6">
            <CreditCard className="h-5 w-5 text-primary-green-300" />
          </div>
          <Switch
            checked={active}
            onCheckedChange={handleToggle}
            disabled={isPending || !business_id}
          />
        </div>

        <div className="mb-1 flex items-center gap-2">
          <h5 className="text-sm font-bold text-grey-1">
            Akawopay — Buy Now, Pay Later
          </h5>
          {active && (
            <span className="rounded-full bg-success-2 px-2 py-0.5 text-[10px] font-bold text-success-1">
              Active
            </span>
          )}
        </div>

        <p className="mb-3 text-xs text-grey-3">
          Let customers Buy Now and Pay Later, in-store and online. Akawopay
          decides who qualifies and collects the repayments — you are settled
          within 24 hours.
        </p>

        {/* Said on the card, not only inside the modal: a merchant who cannot
            switch this on should find that out before reaching for it. */}
        {!ready && !active && (
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-warning-1/30 bg-warning-2 p-2.5">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning-1" />
            <p className="text-[11px] text-grey-2">
              Upgrade your KYC verification to Tier 3 to unlock Buy Now Pay
              Later for your customers.{" "}
              <Link
                href="/kyc"
                className="font-bold text-primary-green-300 hover:underline"
              >
                Verify now
              </Link>
            </p>
          </div>
        )}

        <button
          onClick={() => setShowModal(true)}
          className="cursor-pointer text-xs font-bold text-primary-green-300 hover:underline"
        >
          Learn more
        </button>
      </div>

      <CustomModal
        isOpen={showModal}
        onClose={closeModal}
        trigger={false}
        title="Activate BNPL with Akawopay"
      >
        <div className="space-y-4">
          <div className="space-y-2 text-xs text-grey-2">
            <p>
              Offer your customers the flexibility to Buy Now and Pay Later,
              both in-store and online.
            </p>
            <p>
              With Sync360, you can connect your business to Akawopay and offer
              BNPL to eligible customers.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2 rounded-lg bg-grey-6 p-2.5">
              <Store className="mt-0.5 h-3.5 w-3.5 shrink-0 text-grey-3" />
              <p className="text-[11px] text-grey-2">
                <span className="font-bold">In-store:</span> Customers can
                choose BNPL when purchasing directly from your business.
              </p>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-grey-6 p-2.5">
              <CreditCard className="mt-0.5 h-3.5 w-3.5 shrink-0 text-grey-3" />
              <p className="text-[11px] text-grey-2">
                <span className="font-bold">Online:</span> Customers can access
                BNPL when purchasing through your online store.
              </p>
            </div>
          </div>

          <p className="rounded-lg border border-primary-green-300/30 bg-primary-green-500 p-3 text-xs font-bold text-grey-1">
            Fee: 1.5% per successful disbursement, capped at ₦1,000.
          </p>

          {!ready ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-warning-1/30 bg-warning-2 p-4">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning-1" />
                <div>
                  <p className="text-sm font-bold text-grey-1">
                    Verification required
                  </p>
                  <p className="mt-1 text-xs text-grey-2">{reason}</p>
                </div>
              </div>

              <Link href="/kyc" className="block">
                <Button className="h-11 w-full">Go to verification</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg border border-success-1/30 bg-success-2 p-3 text-xs text-success-1">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Your account is verified — you can activate BNPL.</span>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-bold text-grey-1">
                  BNPL Merchant Terms &amp; Conditions
                </h4>
                <div className="max-h-56 overflow-y-auto rounded-lg border border-grey-5 bg-grey-6 p-3">
                  <BnplTerms />
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-2">
                <Checkbox
                  id="bnpl-terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) =>
                    setAgreedToTerms(checked === true)
                  }
                  className="mt-0.5"
                />
                <span className="text-xs text-grey-2">
                  I have read and agree to the BNPL Merchant Terms &amp;
                  Conditions.
                </span>
              </label>

              {apiError && (
                <p className="text-xs font-bold text-error-1">{apiError}</p>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="h-11 flex-1"
                  onClick={closeModal}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  className="h-11 flex-1"
                  disabled={!agreedToTerms || isPending}
                  onClick={handleActivate}
                >
                  {isPending ? <Spinner /> : "Activate BNPL"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CustomModal>
    </>
  );
};

export default BnplCard;
