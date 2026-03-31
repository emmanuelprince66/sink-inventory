// stores/types/business.ts
export interface BusinessStore {
  business_id: string | null;
  setBusinessId: (id: string) => void;
  clearBusinessId: () => void;
}

// types/index.ts

// User role types
export type UserRole =
  | "OWNER"
  | "ADMIN-ATTENDANT"
  | "ATTENDANT"
  | "PHARMACIST"
  | "PRODUCTION-MANAGER"
  | "ACCOUNTANT"
  | "INVENTORY-MANAGER";

// Permission type - defines all possible permissions a user can have
export type Permission =
  | "manage_inventory_across_branches"
  | "restock_products"
  | "move_items_to_production"
  | "apply_discounts"
  | "damage_items"
  | "dispense_drugs"
  | "make_presale"
  | "manage_bank_details"
  | "manage_suppliers"
  | "process_sales"
  | "return_items"
  | "sell_watchlist"
  | "transfer_items"
  | "view_orders"
  | "view_prescriptions"
  | "view_transactions";

// Permissions can be an object with boolean flags for each permission
export type Permissions = {
  manage_inventory_across_branches?: boolean;
  restock_products?: boolean;
  move_items_to_production?: boolean;
  apply_discounts?: boolean;
  damage_items?: boolean;
  dispense_drugs?: boolean;
  make_presale?: boolean;
  manage_bank_details?: boolean;
  manage_suppliers?: boolean;
  process_sales?: boolean;
  return_items?: boolean;
  sell_watchlist?: boolean;
  transfer_items?: boolean;
  view_orders?: boolean;
  view_prescriptions?: boolean;
  view_transactions?: boolean;
};

export type Subscription = {
  name: string;
  id: number;
  end_date?: string; // Added optional end_date as seen in your data
};

export type User = {
  id: string;
  email: string;
  kyc: string;
  name: string;
  role: UserRole;
  is_verified: boolean;
  is_subscribed: boolean;
  permissions: Permissions; // Now properly typed
  subscription: Subscription;
  tokens: {
    access: string;
    refresh?: string;
  };
};
