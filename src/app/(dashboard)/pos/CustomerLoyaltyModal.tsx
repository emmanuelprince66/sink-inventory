"use client";

import { useFetchLoyaltyProgressQuery } from "@/api/loyalty/fetch-loyalty-progress";
import { CustomModal } from "@/components/app/CustomModal";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Gift, Trophy } from "lucide-react";

/**
 * A customer's loyalty standing, opened from a row in the customer drawer or
 * after scanning their card.
 *
 * Backed by GET /loyalty/progress/{loyalty_code}/ — the reward wallet for one
 * programme. It is keyed by loyalty code, which is exactly what the QR
 * encodes, and it returns the tier, streak, next-tier progress and any
 * unredeemed rewards pre-formatted, so nothing here is derived.
 */

/** "6784/50000 Spend" or "3/5 Visits" → [3, 5]. */
const parseProgress = (display?: string | null): [number, number] => {
  const match = String(display ?? "").match(/([\d.]+)\s*\/\s*([\d.]+)/);
  if (!match) return [0, 0];
  return [Number(match[1]), Number(match[2])];
};

/** Stamps only make sense for a visit streak, and only at a sane length. */
const MAX_STAMPS = 10;

const CustomerLoyaltyModal = ({
  loyaltyCode,
  customer,
  open,
  onClose,
  onAddToSale,
  onApplyReward,
  appliedRewardId,
}: {
  loyaltyCode: string | null;
  /** The row this was opened from, when there is one — used for Add to Sale. */
  customer?: any;
  open: boolean;
  onClose: () => void;
  onAddToSale: (customer: any) => void;
  /** Attaches a reward to the current sale; null clears it. */
  onApplyReward?: (reward: any | null, wallet: any) => void;
  /** Which reward, if any, this sale is already redeeming. */
  appliedRewardId?: string | null;
}) => {
  const { data, isLoading } = useFetchLoyaltyProgressQuery({
    params: { loyaltyCode: loyaltyCode ?? "" },
    enabled: Boolean(loyaltyCode) && open,
  } as any);

  const wallet = data?.data;
  const enrollment = wallet?.enrollment;
  const nextTier = wallet?.next_tier_info;

  const [current, target] = parseProgress(enrollment?.progress_display);
  const isVisitStreak = /visit/i.test(enrollment?.progress_display ?? "");
  const showStamps = isVisitStreak && target > 0 && target <= MAX_STAMPS;

  const rewards = (wallet?.available_rewards ?? []) as any[];
  const rewardReady = rewards.length > 0;

  const [tierCurrent, tierTarget] = parseProgress(
    nextTier?.next_tier_progress_display,
  );
  const tierPct =
    tierTarget > 0 ? Math.min(100, (tierCurrent / tierTarget) * 100) : 0;

  return (
    <CustomModal
      isOpen={open}
      onClose={onClose}
      trigger={false}
      title="Loyalty Details"
    >
      <div className="flex w-full min-w-0 flex-col gap-4">
        {isLoading ? (
          <div className="flex min-h-[220px] w-full items-center justify-center">
            <Spinner className="text-primary-green-300" />
          </div>
        ) : !wallet ? (
          <p className="py-10 text-center text-sm text-grey-3">
            No loyalty record found for {loyaltyCode ?? "this customer"}.
          </p>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-grey-5">
              {/* Identity */}
              <div className="flex items-center gap-3 bg-primary-green-300 px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-extrabold text-white">
                  {(wallet.name || "?")
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join("")
                    .toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-white">
                    {wallet.name}
                  </p>
                  <p className="truncate text-[11px] text-white/70">
                    {wallet.phone}
                  </p>
                </div>
                {wallet.tier && (
                  <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">
                    {wallet.tier}
                  </span>
                )}
              </div>

              {/* Streak */}
              <div className="bg-warning-2 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex min-w-0 items-center gap-1.5 text-xs font-extrabold text-grey-1">
                    <Trophy className="h-3.5 w-3.5 shrink-0 text-warning-1" />
                    <span className="truncate">
                      Loyalty Streak — {wallet.program}
                    </span>
                  </p>
                  {target > 0 && (
                    <span className="shrink-0 text-[11px] font-bold text-grey-2">
                      {showStamps
                        ? `${Math.min(current + 1, target)}/${target} after this visit`
                        : enrollment?.progress_display}
                    </span>
                  )}
                </div>

                {showStamps ? (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {Array.from({ length: target }, (_, i) => {
                      const stamped = i < current;
                      const isNext = i === current;
                      return (
                        <span
                          key={i}
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
                            stamped && "bg-primary-green-300 text-white",
                            isNext &&
                              "bg-warning-1 text-white ring-2 ring-warning-1/30",
                            !stamped && !isNext && "bg-white text-grey-4",
                          )}
                        >
                          {stamped ? "✓" : i + 1}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  target > 0 && (
                    <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-warning-1"
                        style={{
                          width: `${Math.min(100, (current / target) * 100)}%`,
                        }}
                      />
                    </div>
                  )
                )}

                {enrollment?.remaining_message && !rewardReady && (
                  <p className="mt-2 text-[11px] text-grey-2">
                    {enrollment.remaining_message}
                  </p>
                )}
              </div>

              {/* Reward ready — the one thing a cashier must not miss. */}
              {rewardReady && (
                <div className="flex items-center gap-2 bg-primary-green-300 px-4 py-2.5">
                  <Gift className="h-4 w-4 shrink-0 text-white" />
                  <p className="min-w-0 truncate text-xs font-extrabold text-white">
                    REWARD READY
                    {enrollment?.reward_description
                      ? ` — ${enrollment.reward_description} will be applied!`
                      : ""}
                  </p>
                </div>
              )}
            </div>

            {/* Redeeming a reward. Only its id goes to the sale — the backend
                zeroes the price, deducts the stock and marks it REDEEMED — so
                nothing here calculates a discount. */}
            {!rewardReady && onApplyReward && (
              <div className="rounded-xl border border-grey-5 bg-grey-6/60 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
                  Available Rewards
                </p>
                <p className="mt-1.5 text-xs font-bold text-grey-1">
                  Nothing to redeem yet
                </p>
                {/* Says why, rather than leaving the cashier with an empty
                    panel. A reward has to be issued by the backend before it
                    can be applied, and that only happens once the condition is
                    met — so there is nothing to press here yet.

                    remaining_message is deliberately not repeated: it already
                    sits under the streak bar above, where the progress it
                    describes is on screen. This line explains the mechanism
                    instead, and only falls back to the progress string when
                    there is no streak card to read it from. */}
                <p className="mt-0.5 text-[11px] leading-relaxed text-grey-3">
                  {enrollment?.remaining_message
                    ? "A reward becomes redeemable once the streak above is complete."
                    : enrollment?.progress_display
                      ? `${enrollment.progress_display} on ${
                          enrollment.program_name ?? "this programme"
                        } — a reward is issued once it completes.`
                      : "This customer has no rewards waiting on their account."}
                </p>
              </div>
            )}

            {rewardReady && onApplyReward && (
              <div className="rounded-xl border border-primary-green-300/40 bg-primary-green-500 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary-green-300">
                  Available Rewards
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  {rewards.map((reward: any, index: number) => {
                    const id = String(reward?.id ?? index);
                    const applied = appliedRewardId === id;
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-grey-1">
                            {reward?.reward_description ??
                              reward?.description ??
                              reward?.reward_summary ??
                              reward?.reward_type ??
                              "Reward"}
                          </p>
                          {reward?.program_name && (
                            <p className="truncate text-[10px] text-grey-3">
                              {reward.program_name}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            onApplyReward(
                              applied ? null : { ...reward, id },
                              wallet,
                            )
                          }
                          className={cn(
                            "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold cursor-pointer transition-colors",
                            applied
                              ? "bg-grey-6 text-grey-2 hover:bg-grey-5"
                              : "bg-primary-green-300 text-white hover:bg-primary-green-300/90",
                          )}
                        >
                          {applied ? "Remove" : "Apply to sale"}
                        </button>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-grey-3">
                  Applying attaches the reward to this sale. It is only marked
                  redeemed once the sale goes through.
                </p>
              </div>
            )}

            {/* Tier progress */}
            {nextTier && !nextTier.is_max_tier && nextTier.next_tier_name && (
              <div className="rounded-xl border border-grey-5 bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-grey-1">
                    Progress to {nextTier.next_tier_name}
                  </p>
                  <p className="text-[11px] font-bold text-grey-2">
                    {nextTier.next_tier_progress_display}
                  </p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-grey-6">
                  <div
                    className="h-full rounded-full bg-primary-green-300"
                    style={{ width: `${tierPct}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Visits", value: String(wallet.total_visits ?? 0) },
                { label: "Points", value: String(wallet.points_balance ?? 0) },
                {
                  label: "Streak",
                  value: String(enrollment?.current_streak ?? 0),
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-grey-5 bg-white py-2.5 text-center"
                >
                  <p className="text-base font-extrabold text-grey-1">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-grey-3">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Only offered when we have a customer record to attach — the
                wallet endpoint returns a loyalty profile, not a customer. */}
            {customer && (
              <Button
                className="h-11 w-full rounded-xl"
                onClick={() => {
                  onAddToSale(customer);
                  onClose();
                }}
              >
                Add to Sale
              </Button>
            )}
          </>
        )}
      </div>
    </CustomModal>
  );
};

export default CustomerLoyaltyModal;
