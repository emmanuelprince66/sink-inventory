// stores/utils/permissions.ts

import { Permission, Permissions } from "@/lib/store/types";

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
    ];
  }

  if (!permissions) return [];

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

  return requiredPermissions.some(
    (permission) => permissions[permission] === true,
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

  return requiredPermissions.every(
    (permission) => permissions[permission] === true,
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
