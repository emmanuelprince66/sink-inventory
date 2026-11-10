// stores/utils/permissions.ts

import { matrixFromPermissions } from "./pageAccess";
import { Permission, Permissions } from "@/lib/store/types";

/**
 * The old on/off flags and where each lives in the staff permissions
 * checklist. With a checklist, it decides; the flags are only read for logins
 * that don't have one.
 */
const FLAG_TO_MATRIX: Record<string, [string, string]> = {
  manage_inventory_across_branches: ["inventory", "manage_branches"],
  restock_products: ["inventory", "restock"],
  move_items_to_production: ["inventory", "production"],
  transfer_items: ["inventory", "transfer"],
  return_items: ["inventory", "return"],
  damage_items: ["inventory", "damage"],
  raw_material: ["inventory", "raw_material"],
  view_inventory: ["inventory", "view"],
  process_sales: ["sales", "create"],
  apply_discounts: ["sales", "discount"],
  make_presale: ["sales", "presale"],
  dispense_drugs: ["sales", "dispense"],
  view_prescriptions: ["sales", "view_prescriptions"],
  view_transactions: ["sales", "view"],
  sell_watchlist: ["products", "sell_watchlist"],
  view_orders: ["orders", "view"],
  manage_suppliers: ["suppliers", "manage"],
  manage_bank_details: ["banking", "manage"],
  can_log_expenses: ["expenses", "create"],
  can_initiate_expense_transfer: ["expenses", "transfer"],
  can_approve_expenses: ["expenses", "approve"],
};

// Check if user has a specific permission
export const hasPermission = (
  permissions: Permissions,
  permission: Permission,
  isOwner: boolean = false,
): boolean => {
  // Owners have all permissions
  if (isOwner) return true;

  // Check if permissions object exists
  if (!permissions) return false;

  const matrix = matrixFromPermissions(permissions);
  const mapped = FLAG_TO_MATRIX[permission];
  if (matrix && mapped) {
    return matrix[mapped[0]]?.includes(mapped[1]) ?? false;
  }

  // Return the permission value (default to false if not present)
  return permissions[permission] === true;
};

// Get all permissions as an array
export const getUserPermissions = (
  permissions: Permissions,
  isOwner: boolean = false,
): Permission[] => {
  if (isOwner) {
    // Return all possible permissions for owners
    return [
      "manage_inventory_across_branches",
      "restock_products",
      "move_items_to_production",
      "apply_discounts",
      "damage_items",
      "dispense_drugs",
      "make_presale",
      "manage_bank_details",
      "manage_suppliers",
      "process_sales",
      "return_items",
      "sell_watchlist",
      "transfer_items",
      "view_orders",
      "view_prescriptions",
      "view_transactions",
      "can_log_expenses",
      "can_initiate_expense_transfer",
      "can_approve_expenses",
    ];
  }

  if (!permissions) return [];

  if (matrixFromPermissions(permissions)) {
    return (Object.keys(FLAG_TO_MATRIX) as Permission[]).filter((flag) =>
      hasPermission(permissions, flag),
    );
  }

  return Object.entries(permissions)
    .filter(([_, value]) => value === true)
    .map(([key]) => key as Permission);
};

// Check if user has any of the given permissions
export const hasAnyPermission = (
  permissions: Permissions,
  requiredPermissions: Permission[],
  isOwner: boolean = false,
): boolean => {
  if (isOwner) return true;
  if (!permissions) return false;

  return requiredPermissions.some((permission) =>
    hasPermission(permissions, permission),
  );
};

// Check if user has all of the given permissions
export const hasAllPermissions = (
  permissions: Permissions,
  requiredPermissions: Permission[],
  isOwner: boolean = false,
): boolean => {
  if (isOwner) return true;
  if (!permissions) return false;

  return requiredPermissions.every((permission) =>
    hasPermission(permissions, permission),
  );
};

// Check user role with hierarchy
export const userHasRole = (
  userRole: string,
  requiredRole: string,
  roleHierarchy: Record<string, number>,
): boolean => {
  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  return userLevel >= requiredLevel;
};
