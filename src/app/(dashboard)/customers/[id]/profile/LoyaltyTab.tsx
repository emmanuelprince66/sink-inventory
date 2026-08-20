"use client";

import { Cell, Panel } from "./primitives";
import type { CustomerProfileData } from "./useCustomerProfile";

const LoyaltyTab = ({ profile }: { profile: CustomerProfileData }) => {
  const { loyalty, row, formatMoney } = profile;

  return (
    <Panel title="Loyalty & Rewards">
      <Cell
        label="Loyalty Tier"
        value={loyalty?.loyalty_tier}
        tone="text-violet-600"
      />
      <Cell
        label="Reward Points"
        value={Number(loyalty?.reward_points ?? 0).toLocaleString()}
        tone="text-warning-1"
      />
      <Cell
        label="Reward Balance"
        value={formatMoney(Number(loyalty?.reward_balance ?? 0))}
        tone="text-primary-green-300"
      />
      <Cell
        label="Cashback Earned"
        value={formatMoney(Number(loyalty?.cashback_earned ?? 0))}
        tone="text-primary-green-300"
      />
      <Cell label="Referrals" value={loyalty?.referral_count} />
      <Cell label="Streak" value={loyalty?.streak} />
      {/* Rewards earned, not raw visit progress: a completed reward is the
          outcome a merchant acts on, and the visit count behind it is already
          in Purchase. Falls back to the streak progress string while the
          field is absent. */}
      <Cell
        label="Rewards Earned"
        value={row?.reward_count ?? loyalty?.streak_progress}
        tone="text-primary-green-300"
      />
      <Cell label="Coupons Redeemed" value={loyalty?.coupons_redeemed} />
    </Panel>
  );
};

export default LoyaltyTab;
