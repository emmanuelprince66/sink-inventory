"use client";

import { Cell, Panel, RISK_TONES } from "./primitives";
import type { CustomerProfileData } from "./useCustomerProfile";

const EngagementTab = ({ profile }: { profile: CustomerProfileData }) => {
  const { engagement } = profile;

  return (
    <Panel title="Engagement Metrics">
      <Cell
        label="Churn Risk"
        value={engagement?.churn_risk}
        tone={RISK_TONES[engagement?.churn_risk ?? ""] ?? "text-grey-1"}
      />
      <Cell
        label="Retention Score"
        value={`${engagement?.retention_score ?? 0}/100`}
      />
      <Cell label="Current Streak" value={engagement?.current_streak} />
      <Cell label="Coupons Redeemed" value={engagement?.coupons_redeemed} />
    </Panel>
  );
};

export default EngagementTab;
