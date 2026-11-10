import { useCan } from "./useCan";

const STOCK_ROLES = new Set(["OWNER", "ADMIN-ATTENDANT", "MANAGER"]);

/**
 * Whether this login may see stock counts on the POS: inventory "view" in the
 * staff permissions checklist, or Owner and Admin Attendant without one.
 */
export const useCanSeeStock = (): boolean => {
  const { can, role } = useCan();
  return can("inventory", "view", STOCK_ROLES.has(role ?? ""));
};
