/**
 * Which permission each page needs, from the staff permissions checklist
 * (module → actions). Shared by the sidebar, the server-side page guard and
 * the landing page after login, so they can't disagree.
 *
 * No browser-only code here: middleware imports it too.
 */

export type PermissionsMatrix = Record<string, string[]>;

/** "module:action" pairs; any one of them is enough. */
type Rule = string[];

/** Most specific first: the first prefix that matches decides. */
const PAGE_RULES: [string, Rule][] = [
  ["/inventory/restock-history", ["inventory:restock"]],
  ["/inventory/product-history", ["inventory:restock"]],
  ["/inventory/production-history", ["inventory:production"]],
  ["/inventory", ["inventory:view", "products:view"]],
  ["/new-add-product", ["products:create", "products:edit"]],
  ["/categories", ["products:edit"]],
  ["/departments", ["products:edit"]],
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

export const ruleForPath = (path: string): Rule | null => {
  const match = PAGE_RULES.find(
    ([prefix]) => path === prefix || path.startsWith(`${prefix}/`),
  );
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
    return parsed &&
      typeof parsed === "object" &&
      Object.values(parsed).every(Array.isArray)
      ? (parsed as PermissionsMatrix)
      : null;
  } catch {
    return null;
  }
};

/** The checklist from a login response's permissions, if it has one. */
export const matrixFromPermissions = (
  permissions: any,
): PermissionsMatrix | null => {
  const matrix = permissions?.permissions_matrix;
  return matrix &&
    typeof matrix === "object" &&
    Object.values(matrix).every(Array.isArray)
    ? (matrix as PermissionsMatrix)
    : null;
};
