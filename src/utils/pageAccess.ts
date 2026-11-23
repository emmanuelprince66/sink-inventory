/**
 * Which permission each page needs, from the staff permissions checklist
 * (module → actions). Shared by the sidebar, the server-side page guard and
 * the landing page after login, so they can't disagree.
 *
 * No browser-only code here: middleware imports it too.
 */

import { isMatrix, type PermissionsMatrix } from "./permissionsMatrix";

export type { PermissionsMatrix };

/** "module:action" pairs; any one of them is enough. */
type Rule = string[];

/** Most specific first: the first prefix that matches decides. */
// Matched in order, first prefix wins — so a sub-page that needs more than
// viewing comes before its section. `*` stands for one path segment (an id).
const PAGE_RULES: [string, Rule][] = [
  ["/inventory/*/restock", ["inventory:restock"]],
  ["/inventory/combo/*", ["products:edit"]],
  ["/inventory/combo", ["products:create"]],
  ["/product/upload-product", ["products:create"]],
  ["/inventory/restock-history", ["inventory:restock"]],
  ["/inventory/product-history", ["inventory:restock"]],
  ["/inventory/production-history", ["inventory:production"]],
  ["/inventory", ["inventory:view", "products:view"]],
  ["/new-add-product/*/edit-product", ["products:edit"]],
  ["/new-add-product", ["products:create"]],
  ["/categories", ["products:edit"]],
  ["/departments", ["products:edit"]],
  ["/orders/create", ["orders:manage"]],
  ["/bookings/new", ["bookings:manage"]],
  ["/bookings/availability", ["bookings:manage"]],
  ["/bookings/blocked-times", ["bookings:manage"]],
  ["/customers/upload", ["customers:create"]],
  ["/customers/loyalty/create", ["loyalty:manage"]],
  ["/expenses/approvals", ["expenses:approve", "expenses:transfer"]],
  ["/expenses/transfer", ["expenses:transfer"]],
  ["/expenses/budgets", ["expenses:view"]],
  ["/expenses/categories", ["expenses:view"]],
  // /expenses/<id> is the edit form.
  ["/expenses/*", ["expenses:create"]],
  ["/campaign/new", ["campaigns:create"]],
  ["/campaign/fund", ["campaigns:create"]],
  ["/pos", ["sales:create"]],
  ["/payment-terminal", ["sales:create"]],
  ["/overview", ["dashboard:view"]],
  ["/sales", ["sales:view"]],
  ["/transactions", ["banking:view", "sales:view"]],
  ["/analytics", ["reports:view"]],
  ["/expenses", ["expenses:view"]],
  ["/supply", ["suppliers:view"]],
  ["/orders", ["orders:view"]],
  ["/bookings", ["bookings:view"]],
  ["/customers/growth", ["loyalty:view"]],
  ["/customers", ["customers:view"]],
  ["/campaign", ["campaigns:view"]],
  ["/store-info", ["settings:view"]],
  ["/shipping", ["settings:view"]],
  ["/online-payment", ["settings:view"]],
  ["/e-setup", ["settings:view"]],
  ["/operations", ["settings:view"]],
];

/** Where to land, in order of preference: the first page they may open. */
const HOME_PAGES = [
  "/pos",
  "/overview",
  "/sales",
  "/inventory",
  "/orders",
  "/bookings",
  "/expenses",
  "/transactions",
  "/customers",
];

const prefixMatches = (prefix: string, path: string) => {
  if (!prefix.includes("*")) {
    return path === prefix || path.startsWith(`${prefix}/`);
  }
  const want = prefix.split("/");
  const have = path.split("/");
  return (
    have.length >= want.length &&
    want.every((part, i) => part === "*" ? have[i] !== "" : part === have[i])
  );
};

export const ruleForPath = (path: string): Rule | null => {
  const match = PAGE_RULES.find(([prefix]) => prefixMatches(prefix, path));
  return match ? match[1] : null;
};

export const matrixAllows = (matrix: PermissionsMatrix, rule: Rule) =>
  rule.some((pair) => {
    const [module, action] = pair.split(":");
    return matrix[module]?.includes(action) ?? false;
  });

/**
 * Whether this login may open the page, or null when the checklist doesn't
 * decide (no checklist, or a page without a rule): the caller then uses the
 * old role rules.
 */
export const pageAllowed = (
  path: string,
  role: string | undefined,
  matrix: PermissionsMatrix | null,
): boolean | null => {
  if (role === "OWNER") return true;
  if (!matrix) return null;
  const rule = ruleForPath(path);
  return rule ? matrixAllows(matrix, rule) : null;
};

/** Roles that, without a checklist, get the Admin Attendant's access. */
export const isAdminLike = (role: string | undefined) =>
  role === "OWNER" || role === "ADMIN-ATTENDANT" || role === "MANAGER";

export const homePathFor = (
  role: string | undefined,
  matrix: PermissionsMatrix | null,
  fallback: string,
) => {
  if (role === "OWNER" || !matrix) return fallback;
  return (
    HOME_PAGES.find((page) => pageAllowed(page, role, matrix)) ??
    "/notification"
  );
};

/* The checklist rides in a cookie so the server-side page guard can read it. */

export const PERMISSIONS_COOKIE = "permMatrix";

export const encodeMatrix = (matrix: PermissionsMatrix) =>
  encodeURIComponent(JSON.stringify(matrix));

export const decodeMatrix = (
  value: string | undefined | null,
): PermissionsMatrix | null => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(value));
    return isMatrix(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/** The checklist from a login response's permissions, if it has one. */
export const matrixFromPermissions = (
  permissions: any,
): PermissionsMatrix | null => {
  const matrix = permissions?.permissions_matrix;
  return isMatrix(matrix) ? matrix : null;
};
