"use client";

import { Cell, Panel } from "./primitives";
import type { CustomerProfileData } from "./useCustomerProfile";

const LoyaltyTab = ({ profile }: { profile: CustomerProfileData }) => {
  const { loyalty, formatMoney } = profile;

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
      <Cell label="Streak Progress" value={loyalty?.streak_progress} />
      <Cell label="Coupons Redeemed" value={loyalty?.coupons_redeemed} />
    </Panel>
  );
};

export default LoyaltyTab;
