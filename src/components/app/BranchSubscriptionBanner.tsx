"use client";

import { useBusinessDataStore } from "@/lib/store/useBusinessDataStore";
import { useUserStore } from "@/lib/store/user-store";
import { isBranchLocked, subscribeHrefFor } from "@/utils/branchSubscription";
import { Lock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Shown while the branch in scope is a non-founding one without its own plan.
 * The backend refuses staff, uploads, customers, campaigns, bookings and a
 * custom domain there, so this says why before the first action fails.
 *
 * Reads the business snapshot BusinessDataSync keeps fresh, so it clears on
 * its own once the payment lands and the business is refetched.
 */
const BranchSubscriptionBanner = () => {
  const business = useBusinessDataStore((state) => state.businessData);
  const role = useUserStore((state) => state.user?.role);
  const pathname = usePathname();

  // Already on the plan picker — the banner would only repeat it.
  if (!isBranchLocked(business) || pathname?.startsWith("/plan")) return null;

  const isOwner = role === "OWNER";

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-warning-1/30 bg-warning-2 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-warning-1">
          <Lock className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-extrabold text-grey-1">
            {business?.name || "This branch"} needs its own subscription
          </p>
          <p className="mt-0.5 text-xs text-grey-2">
            {isOwner
              ? "Your account plan covers your first business only. Subscribe this branch to add staff, upload products and services, add customers, run campaigns and take bookings."
              : "Adding staff, products, customers, campaigns and bookings is paused on this branch until the business owner subscribes it."}
          </p>
        </div>
      </div>
      {isOwner && (
        <Link
          href={subscribeHrefFor(business)}
          className="shrink-0 rounded-lg bg-primary-green-300 px-4 py-2 text-center text-xs font-bold text-white hover:bg-primary-green-300/90"
        >
          Subscribe this branch
        </Link>
      )}
    </div>
  );
};

export default BranchSubscriptionBanner;
