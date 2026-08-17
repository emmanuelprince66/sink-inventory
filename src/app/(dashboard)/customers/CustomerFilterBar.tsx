"use client";

import { useFetchLoyaltyTiersQuery } from "@/api/loyalty/fetch-loyalty-tiers";
import { useFetchSegmentsQuery } from "@/api/segment/fetch-segments";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { toList } from "@/types/api";
import type { LoyaltyTier } from "@/types/loyalty";
import type { CustomerSegment } from "@/types/segment";
import { Download } from "lucide-react";

// Keep all controls aligned at the same height.
const CONTROL = "h-10 min-h-10 rounded-xl";

/**
 * Its own block, separate from the summary cards above and the table below.
 * Controls follow the Orders screen: the shared SearchInput and outline
 * triggers rather than bespoke inputs.
 *
 * Mobile: everything stacks full width. From `sm` the three selects share a
 * row two-up, and from `lg` the whole thing is a single line.
 */
const CustomerFilterBar = ({
  search,
  onSearchChange,
  statusOptions,
  activeStatus,
  onStatusChange,
  activeTier,
  onTierChange,
  activeSegment,
  onSegmentChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  statusOptions: readonly string[];
  activeStatus: string;
  onStatusChange: (value: string) => void;
  activeTier: string;
  onTierChange: (value: string) => void;
  activeSegment: string;
  onSegmentChange: (value: string) => void;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);

  // Tier accepts an ID or a name; segment accepts an ID, type or name.
  const { data: tiersRes } = useFetchLoyaltyTiersQuery({
    params: { id: business_id ?? "" },
  });
  const tiers = toList<LoyaltyTier>(tiersRes?.data as never);

  const { data: segmentsRes } = useFetchSegmentsQuery({
    params: { id: business_id ?? "" },
  });
  const segments = toList<CustomerSegment>(segmentsRes?.data as never);

  const triggerClass = `${CONTROL} w-full border-grey-5 bg-white text-sm text-grey-2`;

  return (
    <div className="w-full rounded-2xl border border-grey-5 bg-white p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <SearchInput
            placeholder="Search by name, phone, ID, email..."
            value={search}
            onValueChange={onSearchChange}
            className={CONTROL}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:items-center">
          <Select
            value={activeTier || "all"}
            onValueChange={(v) => onTierChange(v === "all" ? "" : v)}
          >
            <SelectTrigger className={`${triggerClass} lg:w-32 `}>
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              {tiers.map((tier) => (
                <SelectItem key={tier.id ?? tier.name} value={tier.name}>
                  {tier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={activeStatus} onValueChange={onStatusChange}>
            <SelectTrigger className={`${triggerClass} lg:w-36`}>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option === "All" ? "All Statuses" : option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* The endpoint accepts a segment ID, segment type (VIP_CUSTOMERS,
              FREQUENT_BUYERS, INACTIVE_CUSTOMERS, LOST_CUSTOMERS,
              BIG_SPENDERS, NEW_CUSTOMERS) or segment name. Options come from
              the business's own segments, so the ID is sent. */}
          <Select
            value={activeSegment || "all"}
            onValueChange={(v) => onSegmentChange(v === "all" ? "" : v)}
          >
            <SelectTrigger className={`${triggerClass} lg:w-40`}>
              <SelectValue placeholder="All Segments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Segments</SelectItem>
              {segments.map((segment) => (
                <SelectItem
                  key={segment.id ?? segment.name}
                  value={segment.id ?? segment.name}
                >
                  {segment.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className={`${CONTROL} w-full border-grey-5 text-grey-2 hover:bg-grey-6 hover:text-grey-2 lg:w-auto`}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {search.length > 0 && search.length < 3 && (
        <p className="mt-2 text-xs font-medium text-grey-3">
          Type at least 3 characters to search
        </p>
      )}
    </div>
  );
};

export default CustomerFilterBar;
