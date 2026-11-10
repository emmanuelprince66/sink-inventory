/**
 * What a staff member can do: module → the actions switched on. Anything not
 * listed is off, e.g. { sales: ["view", "create"], orders: ["view"] }.
 */
export type PermissionsMatrix = Record<string, string[]>;

export interface RolePermissionDefaults {
  /** Every module and the actions it offers. */
  modules: PermissionsMatrix;
  role_defaults: Record<string, PermissionsMatrix>;
}

const MODULE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  reports: "Reports",
  inventory: "Inventory",
  products: "Products",
  sales: "Sales & POS",
  orders: "Orders",
  bookings: "Bookings",
  suppliers: "Suppliers",
  expenses: "Expenses",
  customers: "Customers",
  banking: "Banking",
  campaigns: "Campaigns",
  loyalty: "Loyalty",
  staff: "Staff",
  attendance: "Attendance",
  settings: "Settings",
};

const ACTION_LABELS: Record<string, string> = {
  "inventory.restock": "Restock",
  "inventory.transfer": "Transfer stock",
  "inventory.return": "Log supplier returns",
  "inventory.damage": "Write off damaged goods",
  "inventory.production": "Move to production",
  "inventory.raw_material": "Raw materials",
  "inventory.manage_branches": "Manage across branches",
  "products.edit": "Edit, including prices and bulk discounts",
  "products.sell_watchlist": "Sell watchlist items",
  "sales.create": "Make sales",
  "sales.discount": "Give manual discounts",
  "sales.reverse": "Reverse sales",
  "sales.presale": "Create presales",
  "sales.dispense": "Dispense drugs",
  "sales.view_prescriptions": "View prescriptions",
  "expenses.create": "Record expenses",
  "expenses.transfer": "Start expense transfers",
  "expenses.approve": "Approve expenses",
  "staff.invite": "Invite staff",
  "staff.manage_roles": "Change roles and permissions",
};

const titleCase = (key: string) =>
  key.replace(/_/g, " ").replace(/^\w/, (first) => first.toUpperCase());

export const moduleLabel = (module: string) =>
  MODULE_LABELS[module] ?? titleCase(module);

export const actionLabel = (module: string, action: string) =>
  ACTION_LABELS[`${module}.${action}`] ?? titleCase(action);

/** Same permissions, whatever order they're listed in. */
export const sameMatrix = (a: PermissionsMatrix, b: PermissionsMatrix) => {
  const modules = new Set([...Object.keys(a), ...Object.keys(b)]);
  return Array.from(modules).every((module) => {
    const left = [...(a[module] ?? [])].sort();
    const right = [...(b[module] ?? [])].sort();
    return left.join() === right.join();
  });
};

const isMatrix = (value: unknown): value is PermissionsMatrix =>
  Boolean(value) &&
  typeof value === "object" &&
  Object.values(value as object).every(Array.isArray);

/** Reads role_permission_defaults through however many { data } wrappers. */
export const readRoleDefaults = (
  body: any,
): RolePermissionDefaults | null => {
  const payload = body?.modules ? body : (body?.data?.data ?? body?.data);
  return isMatrix(payload?.modules) && payload?.role_defaults
    ? (payload as RolePermissionDefaults)
    : null;
};

/** A staff member's saved matrix from attendant_permissions, if it has one. */
export const readSavedMatrix = (body: any): PermissionsMatrix | null => {
  const payload = body?.data?.data ?? body?.data ?? body;
  const matrix =
    payload?.permissions?.permissions_matrix ?? payload?.permissions_matrix;
  return isMatrix(matrix) ? matrix : null;
};
