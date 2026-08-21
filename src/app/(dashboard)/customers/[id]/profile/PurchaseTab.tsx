"use client";

import { Cell, Panel } from "./primitives";
import type { CustomerProfileData } from "./useCustomerProfile";

const PurchaseTab = ({ profile }: { profile: CustomerProfileData }) => {
  const { purchase, formatMoney } = profile;

  return (
    <Panel title="Purchase Behaviour">
      <Cell label="First Purchase" value={purchase?.first_purchase_date} />
      <Cell label="Last Purchase" value={purchase?.last_purchase_date} />
      <Cell
        label="Total Orders"
        value={purchase?.total_orders}
        tone="text-info-1"
      />
      <Cell
        label="Total Spend"
        value={formatMoney(Number(purchase?.total_spend ?? 0))}
        tone="text-primary-green-300"
      />
      <Cell
        label="Avg Basket"
        value={formatMoney(Number(purchase?.average_basket_size ?? 0))}
        tone="text-warning-1"
      />
      <Cell
        label="Lifetime Value"
        value={formatMoney(Number(purchase?.lifetime_value ?? 0))}
        tone="text-primary-green-300"
      />
      <Cell label="Favourite Category" value={purchase?.favourite_category} />
      <Cell label="Favourite Product" value={purchase?.favourite_product} />
      <Cell label="Preferred Payment" value={purchase?.preferred_payment} />
      <Cell
        label="Retention Score"
        value={`${purchase?.retention_score ?? 0}/100`}
      />
    </Panel>
  );
};

export default PurchaseTab;
