"use client";

import { useFetchLoyaltyRewardsQuery } from "@/api/loyalty/fetch-loyalty-rewards";
import { useRedeemRewardMutation } from "@/api/loyalty/redeem-reward";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryKey } from "@/constants/query-key";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useQueryClient } from "@/lib/react-query";
import { cn } from "@/lib/utils";
import { toList } from "@/types/api";
import type { LoyaltyReward } from "@/types/loyalty";
import { useFormatMoney } from "@/utils/formatMoney";
import { BadgeCheck, Search, Ticket } from "lucide-react";
import { useState } from "react";

const STATUS_FILTERS = ["ISSUED", "REDEEMED", "EXPIRED"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const STATUS_TONES: Record<string, string> = {
  ISSUED: "bg-primary-green-500 text-primary-green-300",
  REDEEMED: "bg-grey-6 text-grey-3",
  EXPIRED: "bg-error-2 text-error-1",
  REVOKED: "bg-error-2 text-error-1",
};

// Cashier-facing: find a customer's outstanding reward and mark it redeemed
// against the current sale.
const PointOfSale = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const formatMoney = useFormatMoney();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<StatusFilter>("ISSUED");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useFetchLoyaltyRewardsQuery({
    params: { id: business_id ?? "", status },
  });

  const rewards = toList<LoyaltyReward>(data?.data as never);

  const term = search.trim().toLowerCase();
  const visible = term
    ? rewards.filter(
        (r) =>
          r.member_name?.toLowerCase().includes(term) ||
          r.loyalty_code?.toLowerCase().includes(term) ||
          r.program_name?.toLowerCase().includes(term),
      )
    : rewards;

  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: [queryKey.loyalty.getLoyaltyRewards],
    });

  return (
    <div className="space-y-4">
      <p className="text-sm text-grey-3">
        Search for a customer&apos;s reward by name or loyalty code, then redeem
        it at checkout.
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex gap-1 bg-grey-6 rounded-full p-1 w-fit">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer capitalize transition-colors",
                status === s
                  ? "bg-white text-grey-1 shadow-sm"
                  : "text-grey-3 hover:text-grey-1",
              )}
            >
              {s.toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-grey-4 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or loyalty code…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-grey-5 overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-grey-5">
          <Ticket className="w-4 h-4 text-primary-green-300" />
          <h4 className="text-sm font-extrabold text-grey-1">
            {status.charAt(0) + status.slice(1).toLowerCase()} rewards (
            {visible.length})
          </h4>
        </div>

        {isLoading ? (
          <div className="w-full flex justify-center py-12">
            <Spinner className="text-primary-green-300" />
          </div>
        ) : visible.length === 0 ? (
          <p className="text-sm text-grey-3 text-center py-10">
            {term
              ? `No rewards match “${search}”.`
              : `No ${status.toLowerCase()} rewards.`}
          </p>
        ) : (
          visible.map((reward) => (
            <RewardRow
              key={reward.id}
              reward={reward}
              onRedeemed={refresh}
              formatMoney={formatMoney}
            />
          ))
        )}
      </div>
    </div>
  );
};

const RewardRow = ({
  reward,
  onRedeemed,
  formatMoney,
}: {
  reward: LoyaltyReward;
  onRedeemed: () => void;
  formatMoney: (amount: number) => string;
}) => {
  const { mutate: redeem, isPending } = useRedeemRewardMutation({
    rewardId: reward.id ?? "",
    onSuccess: onRedeemed,
  });

  // Percentage rewards carry a rate, everything else a currency amount.
  const value =
    reward.reward_type === "PERCENTAGE"
      ? `${Number(reward.value ?? 0)}% off`
      : formatMoney(Number(reward.value ?? 0));

  const canRedeem = reward.status === "ISSUED" && Boolean(reward.id);

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-grey-6 last:border-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-grey-1 truncate">
            {reward.member_name ?? "Unknown member"}
          </p>
          <span
            className={cn(
              "shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full",
              STATUS_TONES[reward.status ?? "ISSUED"] ?? "bg-grey-6 text-grey-3",
            )}
          >
            {reward.status ?? "ISSUED"}
          </span>
        </div>
        <p className="text-[11px] text-grey-3 truncate">
          {reward.program_name ?? "Loyalty reward"}
          {reward.loyalty_code ? ` · ${reward.loyalty_code}` : ""}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <p className="text-sm font-extrabold text-primary-green-300">{value}</p>
        {canRedeem ? (
          <Button
            size="sm"
            disabled={isPending}
            onClick={() =>
              redeem({ loyalty_code: reward.loyalty_code ?? "", sale_id: null })
            }
            className="gap-1.5"
          >
            {isPending ? (
              <Spinner className="w-3.5 h-3.5" />
            ) : (
              <BadgeCheck className="w-3.5 h-3.5" />
            )}
            Redeem
          </Button>
        ) : (
          <span className="text-[11px] text-grey-4 w-[76px] text-center">
            {reward.status === "REDEEMED" ? "Redeemed" : "—"}
          </span>
        )}
      </div>
    </div>
  );
};

export default PointOfSale;
