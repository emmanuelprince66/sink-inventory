"use client";

import { useUserStore } from "@/lib/store/user-store";
import { matrixFromPermissions } from "@/utils/pageAccess";
import { useCallback, useMemo } from "react";

/**
 * can(module, action, fallback): what the staff permissions checklist says.
 * Owners can do everything. A login with no checklist (an older session)
 * gets `fallback`, which should be the old role rule for the same thing.
 */
export const useCan = () => {
  const user = useUserStore((state) => state.user);
  const storedPermissions = useUserStore((state) => state.permissions);
  const role = user?.role;

  const matrix = useMemo(
    () => matrixFromPermissions(storedPermissions ?? user?.permissions),
    [storedPermissions, user?.permissions],
  );

  const can = useCallback(
    (module: string, action: string, fallback: boolean) => {
      if (role === "OWNER") return true;
      if (!matrix) return fallback;
      return matrix[module]?.includes(action) ?? false;
    },
    [role, matrix],
  );

  return { can, role, matrix };
};
