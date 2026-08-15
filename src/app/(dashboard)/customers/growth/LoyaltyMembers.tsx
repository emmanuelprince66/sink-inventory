"use client";

import { useFetchLoyaltyCustomersQuery } from "@/api/loyalty/fetch-loyalty-customers";
import { useFetchLoyaltyMembersQuery } from "@/api/loyalty/fetch-loyalty-members";
import { Spinner } from "@/components/app/Spinner";
import { Input } from "@/components/ui/input";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { cn } from "@/lib/utils";
import { toList } from "@/types/api";
import type {
  BusinessCustomerLoyaltyOverview,
  LoyaltyMember,
} from "@/types/loyalty";
import { useFormatMoney } from "@/utils/formatMoney";
import { Search, Users } from "lucide-react";
import { useState } from "react";

const TABS = ["Members", "Customers"] as const;
type Tab = (typeof TABS)[number];

const initials = (name?: string) =>
  (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "?";

const TierPill = ({ tier }: { tier?: string | null }) =>
  tier ? (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-green-500 text-primary-green-300">
      {tier}
    </span>
  ) : (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-grey-6 text-grey-3">
      No tier
    </span>
  );

const Avatar = ({ name }: { name?: string }) => (
  <span className="w-9 h-9 shrink-0 rounded-full bg-grey-6 text-grey-2 flex items-center justify-center text-[11px] font-extrabold">
    {initials(name)}
  </span>
);

// Members are people enrolled in a programme; customers are everyone the
// business has on file with their loyalty standing attached — different
// endpoints, so they get their own sub-tabs rather than one merged list.
const LoyaltyMembers = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const formatMoney = useFormatMoney();
  const [tab, setTab] = useState<Tab>("Members");
  const [search, setSearch] = useState("");

  const { data: membersRes, isLoading: membersLoading } =
    useFetchLoyaltyMembersQuery({ params: { id: business_id ?? "" } });

  const { data: customersRes, isLoading: customersLoading } =
    useFetchLoyaltyCustomersQuery({
      params: { id: business_id ?? "", search: search || undefined },
    });

  const members = toList<LoyaltyMember>(membersRes?.data as never);
  const customers = toList<BusinessCustomerLoyaltyOverview>(
    customersRes?.data as never,
  );

  // The members endpoint takes no search param, so filter that list locally.
  const term = search.trim().toLowerCase();
  const visibleMembers = term
    ? members.filter(
        (m) =>
          m.name?.toLowerCase().includes(term) ||
          m.phone?.toLowerCase().includes(term) ||
          m.referral_code?.toLowerCase().includes(term),
      )
    : members;

  const isLoading = tab === "Members" ? membersLoading : customersLoading;
  const count = tab === "Members" ? visibleMembers.length : customers.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex gap-1 bg-grey-6 rounded-full p-1 w-fit">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors",
                tab === t
                  ? "bg-white text-grey-1 shadow-sm"
                  : "text-grey-3 hover:text-grey-1",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-grey-4 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${tab.toLowerCase()}…`}
            className="pl-9"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-grey-5 overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-grey-5">
          <Users className="w-4 h-4 text-primary-green-300" />
          <h4 className="text-sm font-extrabold text-grey-1">
            {tab} ({count})
          </h4>
        </div>

        {isLoading ? (
          <div className="w-full flex justify-center py-12">
            <Spinner className="text-primary-green-300" />
          </div>
        ) : count === 0 ? (
          <p className="text-sm text-grey-3 text-center py-10">
            {term
              ? `No ${tab.toLowerCase()} match “${search}”.`
              : `No ${tab.toLowerCase()} yet.`}
          </p>
        ) : tab === "Members" ? (
          visibleMembers.map((m) => (
            <div
              key={m.id ?? m.referral_code ?? m.name}
              className="flex items-center justify-between gap-3 px-4 py-3 border-b border-grey-6 last:border-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={m.name} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-grey-1 truncate">
                      {m.name ?? "Unnamed"}
                    </p>
                    <TierPill tier={m.tier_name} />
                  </div>
                  <p className="text-[11px] text-grey-3 truncate">
                    {m.phone ?? "No phone"}
                    {m.referral_code ? ` · ${m.referral_code}` : ""}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-extrabold text-grey-1">
                  {formatMoney(Number(m.total_spend ?? 0))}
                </p>
                <p className="text-[11px] text-grey-3">
                  {Number(m.total_visits ?? 0)} visits
                </p>
              </div>
            </div>
          ))
        ) : (
          customers.map((c) => {
            const current = Number(c.progress_visits ?? 0);
            const target = Number(c.progress_target ?? 0);
            const pct =
              target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

            return (
              <div
                key={c.id ?? c.loyalty_code ?? c.name}
                className="flex items-center justify-between gap-3 px-4 py-3 border-b border-grey-6 last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={c.name} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-grey-1 truncate">
                        {c.name}
                      </p>
                      <TierPill tier={c.tier_name} />
                    </div>
                    <p className="text-[11px] text-grey-3 truncate">
                      {c.phone ?? "No phone"}
                      {c.loyalty_code ? ` · ${c.loyalty_code}` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 w-32">
                  <p className="text-sm font-extrabold text-grey-1">
                    {formatMoney(Number(c.total_spend ?? 0))}
                  </p>
                  {target > 0 && (
                    <>
                      <div className="h-1.5 rounded-full bg-grey-6 mt-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary-green-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-grey-3 mt-0.5">
                        {current}/{target} to reward
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LoyaltyMembers;
