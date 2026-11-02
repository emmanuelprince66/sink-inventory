import { useUserRole } from "@/lib/store/user-store";

const STOCK_ROLES = new Set(["OWNER", "ADMIN-ATTENDANT"]);

/** Whether this login may see stock counts on the POS. */
export const useCanSeeStock = (): boolean => {
  const { user } = useUserRole();
  return STOCK_ROLES.has(user?.role ?? "");
};
