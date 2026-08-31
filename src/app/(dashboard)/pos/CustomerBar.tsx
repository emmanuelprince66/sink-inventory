"use client";

import { useFetchLoyaltyProgressQuery } from "@/api/loyalty/fetch-loyalty-progress";
import { useFetchLoyaltyProgramsQuery } from "@/api/loyalty/fetch-loyalty-programs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/toast/useToast";
import { useActiveCartState, useCartStore } from "@/lib/store/cart-store";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { cn } from "@/lib/utils";
import { toList, type Paginated } from "@/types/api";
import type { LoyaltyProgram } from "@/types/loyalty";
import { Gift, ScanLine, UserPlus, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import CustomerDrawer, { avatarTone, initialsOf, tierStyle } from "./CustomersDrawer";
import CustomerLoyaltyModal from "./CustomerLoyaltyModal";
import LoyaltyScanner from "./LoyaltyScanner";
import {
  buildRewardCartLine,
  parseProgress,
  resolveRewardItem,
  rewardIdOf,
  rewardLabelOf,
} from "./loyaltyReward";

/**
 * The customer on this sale, above the product grid and always on screen.
 *
 * A cashier's first move when someone walks up is to find out who they are and
 * what they have earned — not to ring anything up. These controls used to live
 * inside the checkout panel, which only renders once the cart has something in
 * it, so a returning customer could not be looked up until after the till had
 * already started a purchase they might not be making. Coming first, a scan
 * answers "do they have a reward waiting?" before a single item is tapped, and
 * a redemption can be handed over as a sale of its own.
 *
 * The wallet is fetched here rather than only inside the modal, so the streak
 * and any ready reward are visible without opening anything.
 */
const CustomerBar = () => {
  const { state: cartState, update: updateCartState } = useActiveCartState();
  const customer = cartState.customer;
  const appliedReward = cartState.loyaltyReward;

  const addToCart = useCartStore((s) => s.addToCart);
  const clearRewardLines = useCartStore((s) => s.clearRewardLines);

  const [isCustomerDrawerOpen, setIsCustomerDrawerOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  // Set by a scan, or by tapping a row in the customer drawer.
  const [loyaltyView, setLoyaltyView] = useState<{
    /** Null when the customer holds no loyalty card — the modal still opens. */
    code: string | null;
    customer?: any;
  } | null>(null);

  const { showToast } = useToast();

  const loyaltyCode = customer?.loyalty_code ?? null;
  const { data: walletResponse, isLoading: walletLoading } =
    useFetchLoyaltyProgressQuery({
      params: { loyaltyCode: loyaltyCode ?? "" },
      enabled: Boolean(loyaltyCode),
    } as any);

  const wallet = walletResponse?.data;
  const enrollment = wallet?.enrollment;
  const availableRewards = (wallet?.available_rewards ?? []) as any[];
  // Only a reward carrying its own id can be redeemed — loyalty_reward_id is a
  // UUID the sale endpoint looks up, so one without an id is not offered.
  const readyReward = availableRewards.find((reward) => rewardIdOf(reward));

  /**
   * The programmes, purely to find out what a reward hands over: the wallet
   * says a reward is a FREE_ITEM but never which item, and reward_product_detail
   * lives on the programme. Only fetched once someone with a card is on the
   * sale, and cached by react-query for the rest of the shift.
   */
  const business_id = useBusinessStore((state) => state.business_id);
  const { data: programsResponse } = useFetchLoyaltyProgramsQuery({
    params: { id: business_id ?? "" },
    enabled: Boolean(business_id) && Boolean(loyaltyCode),
  } as any);

  const programs = useMemo(
    () =>
      toList<LoyaltyProgram>(
        programsResponse?.data as unknown as Paginated<LoyaltyProgram>,
      ),
    [programsResponse],
  );

  const rewardItemOf = useCallback(
    (reward: any) => resolveRewardItem(reward, { programs, enrollment }),
    [programs, enrollment],
  );

  /**
   * What to call a reward. The item's own name is the clearest thing to put in
   * front of a cashier; the enrollment's wording is the fallback, since the
   * reward itself carries no description.
   */
  const rewardTitle = useCallback(
    (reward: any) =>
      rewardItemOf(reward)?.name ??
      rewardLabelOf(reward, enrollment?.reward_description),
    [rewardItemOf, enrollment],
  );

  const [current, target] = parseProgress(enrollment?.progress_display);
  const progressPct = target > 0 ? Math.min(100, (current / target) * 100) : 0;

  const tier = tierStyle(wallet?.tier ?? customer?.tier_name);
  const TierIcon = tier.icon;

  /**
   * Puts a reward on the sale, and its free item in the cart.
   *
   * Passing null clears the redemption. Reward and customer move in one update
   * because they belong together: a reward can only be redeemed against its
   * owner, and dropping the customer has to drop the reward with them.
   */
  const applyReward = (reward: any | null, walletForOwner?: any) => {
    // Only one reward redeems per sale, so any earlier line goes first —
    // including when this call is clearing the redemption outright.
    clearRewardLines();

    if (!reward) {
      updateCartState({ loyaltyReward: null });
      return;
    }

    const rewardId = rewardIdOf(reward);
    if (!rewardId) {
      showToast("This reward can't be redeemed — it has no reward id", "error");
      return;
    }

    const source = walletForOwner ?? wallet;
    const owner =
      customer ??
      loyaltyView?.customer ??
      (source
        ? {
            name: source.name,
            phone: source.phone,
            loyalty_code: source.loyalty_code,
          }
        : null);

    updateCartState({
      loyaltyReward: { ...reward, id: rewardId },
      ...(owner ? { customer: owner } : {}),
    });

    // The modal opens over the customer drawer and leaves it standing, so that
    // Cancel goes back to the list. Redeeming settles who the sale is for, the
    // same as Add to Sale does, so the list closes with it — otherwise it is
    // still there underneath when the modal goes, and reads as the drawer
    // reopening itself.
    setIsCustomerDrawerOpen(false);

    const item = rewardItemOf(reward);
    if (item) {
      addToCart(
        buildRewardCartLine(
          reward,
          item,
          rewardId,
          enrollment?.reward_description,
        ),
      );
      showToast(`${item.name} added free to this sale`, "success");
      return;
    }

    // Either the reward hands over nothing to put in a cart — points, wallet
    // credit, a percentage — or its programme could not be matched to an item.
    // Either way the reward still goes up on the sale for the backend to apply;
    // the cashier just hands the item over without a line for it.
    showToast(
      `${rewardLabelOf(reward, enrollment?.reward_description)} applied to this sale`,
      "success",
    );
  };

  /** Dropping the customer drops what was being redeemed for them. */
  const clearCustomer = () => {
    clearRewardLines();
    updateCartState({ customer: null, loyaltyReward: null });
  };

  const openLoyaltyFor = (selected: any) => {
    if (!selected?.loyalty_code) {
      // Nothing to show a cashier about someone with no card — the modal would
      // only say "not enrolled" over a button they already pressed.
      updateCartState({ customer: selected, loyaltyReward: null });
      setIsCustomerDrawerOpen(false);
      return;
    }
    setLoyaltyView({ code: selected.loyalty_code, customer: selected });
  };

  const drawers = (
    <>
      <CustomerDrawer
        variant="pos"
        open={isCustomerDrawerOpen}
        onOpenChange={setIsCustomerDrawerOpen}
        onCustomerSelect={(selected: any) => {
          clearRewardLines();
          updateCartState({ customer: selected, loyaltyReward: null });
        }}
        onViewLoyalty={openLoyaltyFor}
      />

      {/* A scan resolves the code to a customer, then hands off to the same
          modal the drawer opens. */}
      <LoyaltyScanner
        open={isScannerOpen}
        onOpenChange={setIsScannerOpen}
        onResolved={(code: string, matched?: any) =>
          setLoyaltyView({ code, customer: matched })
        }
      />

      <CustomerLoyaltyModal
        loyaltyCode={loyaltyView?.code ?? null}
        customer={loyaltyView?.customer}
        open={Boolean(loyaltyView)}
        onClose={() => setLoyaltyView(null)}
        onAddToSale={(selected: any) => {
          clearRewardLines();
          updateCartState({ customer: selected, loyaltyReward: null });
          setIsCustomerDrawerOpen(false);
        }}
        appliedRewardId={appliedReward?.id ?? null}
        onApplyReward={(reward: any | null, walletForOwner: any) => {
          applyReward(reward, walletForOwner);
          // Once it is applied the bar and the cart both show it, so the modal
          // is only in the way. Removing one leaves it open, since the cashier
          // is still looking at what else this customer has.
          if (reward) setLoyaltyView(null);
        }}
      />
    </>
  );

  if (!customer) {
    return (
      <div className="w-full rounded-2xl border border-grey-5 bg-white px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-grey-1">Customer</p>
            <p className="text-[11px] text-grey-3">
              Add or scan a card first — any reward waiting shows up before a
              single item is rung up.
            </p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              variant="outline"
              className="h-10 flex-1 gap-2 border-grey-5 hover:border-primary-green-300 hover:bg-secondary-6 sm:flex-none"
              onClick={() => setIsCustomerDrawerOpen(true)}
            >
              <UserPlus size={16} className="shrink-0" />
              <span className="truncate text-xs">Add Customer</span>
            </Button>
            <Button
              className="h-10 flex-1 gap-2 sm:flex-none"
              onClick={() => setIsScannerOpen(true)}
            >
              <ScanLine size={16} className="shrink-0" />
              <span className="truncate text-xs">Scan Loyalty</span>
            </Button>
          </div>
        </div>
        {drawers}
      </div>
    );
  }

  const rewardReady = Boolean(readyReward) && !appliedReward;

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl border bg-white",
        rewardReady ? "border-primary-green-300" : "border-grey-5",
      )}
    >
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white",
            avatarTone(customer.id ?? customer.name ?? ""),
          )}
        >
          {customer.initials || initialsOf(customer.name)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-extrabold text-grey-1">
              {customer.name}
            </p>
            {(wallet?.tier || customer.tier_name) && (
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                  tier.className,
                )}
              >
                <TierIcon className="h-3 w-3" />
                {wallet?.tier ?? customer.tier_name}
              </span>
            )}
          </div>

          <p className="mt-0.5 truncate text-[11px] text-grey-3">
            {customer.phone || wallet?.phone || "No phone"}
            {wallet?.program ? ` · ${wallet.program}` : ""}
            {enrollment?.progress_display
              ? ` · ${enrollment.progress_display}`
              : loyaltyCode
                ? walletLoading
                  ? " · loading loyalty…"
                  : ""
                : " · No loyalty card"}
          </p>

          {target > 0 && (
            <div className="mt-1.5 h-1.5 max-w-xs overflow-hidden rounded-full bg-grey-6">
              <div
                className="h-full rounded-full bg-primary-green-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {loyaltyCode && (
            <Button
              variant="outline"
              className="h-9 border-grey-5 px-3 text-[11px] hover:border-primary-green-300 hover:bg-secondary-6"
              onClick={() =>
                setLoyaltyView({ code: loyaltyCode, customer })
              }
            >
              View loyalty
            </Button>
          )}
          <Button
            variant="outline"
            className="h-9 border-grey-5 px-3 text-[11px] hover:border-primary-green-300 hover:bg-secondary-6"
            onClick={() => setIsCustomerDrawerOpen(true)}
          >
            Change
          </Button>
          <button
            type="button"
            aria-label="Remove customer from this sale"
            className="cursor-pointer rounded-full p-1.5 text-grey-4 hover:bg-error-2 hover:text-error-1"
            onClick={clearCustomer}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* The one thing a cashier must not miss. */}
      {rewardReady && (
        <div className="flex flex-wrap items-center gap-2 bg-primary-green-300 px-4 py-2.5">
          <Gift className="h-4 w-4 shrink-0 text-white" />
          <p className="min-w-0 flex-1 truncate text-xs font-extrabold text-white">
            REWARD READY — {rewardTitle(readyReward)}
          </p>
          <Button
            className="h-8 shrink-0 bg-white px-3 text-[11px] font-bold text-primary-green-300 hover:bg-white/90"
            onClick={() => applyReward(readyReward)}
          >
            {rewardItemOf(readyReward) ? "Add free item to sale" : "Apply to sale"}
          </Button>
        </div>
      )}

      {appliedReward && (
        <div className="flex flex-wrap items-center gap-2 border-t border-primary-green-300/40 bg-primary-green-500 px-4 py-2.5">
          <Gift className="h-4 w-4 shrink-0 text-primary-green-300" />
          <p className="min-w-0 flex-1 truncate text-xs font-bold text-grey-1">
            Redeeming {rewardTitle(appliedReward)} on this sale
          </p>
          <button
            type="button"
            className="shrink-0 cursor-pointer rounded-full bg-white px-3 py-1 text-[11px] font-bold text-grey-2 hover:bg-grey-6"
            onClick={() => applyReward(null)}
          >
            Remove
          </button>
        </div>
      )}

      {drawers}
    </div>
  );
};

export default CustomerBar;
