"use client";

import { Cell, Panel } from "./primitives";
import type { CustomerProfileData } from "./useCustomerProfile";

const ShoppingTab = ({ profile }: { profile: CustomerProfileData }) => {
  const { shopping } = profile;

  return (
    <Panel title="Shopping Behaviour">
      <Cell label="Visit Frequency" value={shopping?.visit_frequency} />
      <Cell label="Purchase Frequency" value={shopping?.purchase_frequency} />
      <Cell
        label="Shopping Time"
        value={shopping?.shopping_time}
        tone="text-info-1"
      />
      <Cell
        label="Shopping Day"
        value={shopping?.shopping_day}
        tone="text-primary-green-300"
      />
      <Cell label="Preferred Payment" value={shopping?.preferred_payment} />
    </Panel>
  );
};

export default ShoppingTab;
