"use client";

// ─── NOT RENDERED ───────────────────────────────────────────────────────────
// Unmounted from GeneralSettings.tsx. The KYC status it shows is real (read
// from the business record), but handleActivate only sets local state and
// toasts "activated" — nothing is persisted, so the merchant is told BNPL is
// live when the backend has no idea. Re-enable once activation has an endpoint.

import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/toast/useToast";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import {
  CheckCircle2,
  CreditCard,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const BnplCard = () => {
  const { showToast } = useToast();
  const business_id = useBusinessStore((state) => state.business_id);
  const { data: BusinessData } = useFetchBusinessById(business_id);
  const business = BusinessData?.data;

  // KYC signals — the codebase uses both. Treat either as "verified".
  const isKycVerified = Boolean(
    business?.kyc || business?.kyc_status === "verified",
  );

  const [active, setActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleToggle = (checked: boolean) => {
    if (checked) {
      setShowModal(true);
    } else {
      setActive(false);
      showToast("Akawopay BNPL deactivated.", "info");
    }
  };

  const handleActivate = () => {
    if (!agreedToTerms) return;
    setActive(true);
    setShowModal(false);
    setAgreedToTerms(false);
    showToast("Akawopay BNPL activated.", "success");
  };

  return (
    <>
      <div className="border border-slate-200 rounded-xl p-4 bg-white">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-violet-600" />
          </div>
          <Switch checked={active} onCheckedChange={handleToggle} />
        </div>

        <div className="flex items-center gap-2 mb-1">
          <h5 className="text-sm font-semibold text-slate-900">
            Akawopay — Buy Now, Pay Later
          </h5>
          {active && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
              Active
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Let your customers split a purchase into smaller payments while you
          get paid upfront. Akawopay handles credit risk, collection, and
          repayment scheduling.
        </p>
        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => setShowModal(true)}
            className="text-green-600 hover:underline font-medium cursor-pointer"
          >
            Learn More
          </button>
          <span className="text-slate-300">·</span>
          <button className="text-green-600 hover:underline font-medium cursor-pointer">
            Get Help
          </button>
        </div>
      </div>

      <CustomModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setAgreedToTerms(false);
        }}
        title="Activate Akawopay BNPL"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-violet-50 border border-violet-100 rounded-lg">
            <Sparkles className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700">
              Customers can spread a single purchase across up to 4 monthly
              instalments. You receive the full amount upfront — Akawopay
              recovers the balance from the customer over time.
            </p>
          </div>

          {!isKycVerified ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-lg">
                <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    KYC verification required
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Your business needs to complete KYC verification before you
                    can activate BNPL. This protects you and your customers from
                    fraud.
                  </p>
                </div>
              </div>

              <Link href="/kyc" className="block">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Set Up KYC
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg p-3">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>KYC verified — you're eligible to enable BNPL.</span>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">
                  Terms &amp; Conditions
                </h4>
                <div className="max-h-48 overflow-y-auto text-xs text-slate-600 space-y-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p>
                    By activating Akawopay Buy Now, Pay Later you agree to the
                    following:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5">
                    <li>
                      Akawopay performs a credit assessment on each customer
                      who applies for BNPL at checkout. Approval is at
                      Akawopay's discretion.
                    </li>
                    <li>
                      You are paid the full transaction amount within 1
                      business day, net of Akawopay's service fee.
                    </li>
                    <li>
                      Service fees, refund handling, and chargeback windows are
                      governed by the Akawopay merchant agreement.
                    </li>
                    <li>
                      Refunds must be processed through the same BNPL
                      transaction; partial refunds are supported.
                    </li>
                    <li>
                      You may deactivate BNPL at any time. Active instalment
                      plans continue until they are paid off in full.
                    </li>
                    <li>
                      You must comply with all applicable consumer credit
                      regulations in the jurisdictions where you operate.
                    </li>
                  </ul>
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <Checkbox
                  id="bnpl-terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) =>
                    setAgreedToTerms(checked === true)
                  }
                  className="mt-0.5"
                />
                <span className="text-xs text-slate-700">
                  I have read and agree to the Akawopay BNPL merchant terms
                  and conditions.
                </span>
              </label>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowModal(false);
                    setAgreedToTerms(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={!agreedToTerms}
                  onClick={handleActivate}
                >
                  Activate
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
