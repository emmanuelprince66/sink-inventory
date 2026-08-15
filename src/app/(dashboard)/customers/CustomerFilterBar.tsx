"use client";

import { useFetchLoyaltyTiersQuery } from "@/api/loyalty/fetch-loyalty-tiers";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { toList } from "@/types/api";
import type { LoyaltyTier } from "@/types/loyalty";
import { Download, Search } from "lucide-react";

/**
 * Its own block, deliberately separate from both the summary cards above and
 * the table card below — in the design these are three distinct surfaces, not
 * a toolbar welded onto the top of the table.
 *
 * Search, tier and status all hit the server: the customer endpoint documents
 * `search`, `tier` and `status` query parameters, so none of this filters
 * client-side. Segment is the one exception — there is no segment parameter,
 * so that control is not rendered.
 */
const CustomerFilterBar = ({
  search,
  onSearchChange,
  statusOptions,
  activeStatus,
  onStatusChange,
  activeTier,
  onTierChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  statusOptions: readonly string[];
  activeStatus: string;
  onStatusChange: (value: string) => void;
  activeTier: string;
  onTierChange: (value: string) => void;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);

  // Tier names come from the loyalty tiers the business actually configured —
  // the endpoint accepts a tier ID or name.
  const { data: tiersRes } = useFetchLoyaltyTiersQuery({
    params: { id: business_id ?? "" },
  });
  const tiers = toList<LoyaltyTier>(tiersRes?.data as never);

  const selectClass =
    "shrink-0 h-9 rounded-lg border border-grey-5 bg-white px-3 text-xs font-medium text-grey-2 cursor-pointer focus:outline-none focus:border-primary-green-300";

  return (
    <div className="w-full rounded-2xl border border-grey-5 bg-white p-3">
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 text-grey-4 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, phone, ID, email..."
            className="w-full h-9 rounded-lg border border-grey-5 bg-white pl-9 pr-3 text-sm text-grey-1 placeholder:text-grey-4 focus:outline-none focus:border-primary-green-300"
          />
        </div>

        <select
          value={activeTier}
          onChange={(e) => onTierChange(e.target.value)}
          className={selectClass}
        >
          <option value="">All Tiers</option>
          {tiers.map((tier) => (
            <option key={tier.id ?? tier.name} value={tier.name}>
              {tier.name}
            </option>
          ))}
        </select>

        <select
          value={activeStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className={selectClass}
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option === "All" ? "All Statuses" : option}
            </option>
          ))}
        </select>

        <button
          type="button"
          title="Export"
          className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg border border-grey-5 bg-white text-grey-3 hover:bg-grey-6 cursor-pointer"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {search.length > 0 && search.length < 3 && (
        <p className="mt-2 text-[11px] text-grey-4">
          Type at least 3 characters to search
        </p>
      )}
    </div>
  );
};

export default CustomerFilterBar;
