"use client";

import { useFetchAttendantPermissionsQuery } from "@/api/attendants/attendant-permissions";
import {
  PermissionsMatrix,
  readRoleDefaults,
  readSavedMatrix,
  sameMatrix,
} from "@/utils/permissionsMatrix";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const fetchRoleDefaults = async () => {
  const response = await fetch("/api/business/role-permission-defaults");
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error("Could not load role permissions");
  return body;
};

const sameActions = (a: string[] = [], b: string[] = []) =>
  [...a].sort().join() === [...b].sort().join();

export interface MatrixSave {
  /** Full replacement to send, or none to keep or re-apply the defaults. */
  setPermissions?: { permissions_matrix: PermissionsMatrix };
  /** The saved permissions couldn't be read: leave them as they are. */
  keepSaved?: boolean;
}

/**
 * The permission checklist on Add/Edit Staff. A role fills it with that role's
 * defaults, and the owner fine-tunes from there. Picking a role replaces the
 * checklist; ticking boxes doesn't change the role.
 *
 * Only the modules ticked here are sent as changed. The rest come from the
 * latest saved copy at save time, so permissions saved elsewhere on the screen
 * in the meantime (the expense section) aren't undone.
 */
export const useStaffPermissionMatrix = ({
  role,
  attendantId,
  savedRole,
}: {
  role?: string;
  attendantId?: string;
  savedRole?: string;
}) => {
  const isEdit = Boolean(attendantId);

  const defaultsQuery = useQuery({
    queryKey: ["role-permission-defaults"],
    queryFn: fetchRoleDefaults,
    staleTime: 10 * 60 * 1000,
  });
  const savedQuery = useFetchAttendantPermissionsQuery({
    params: { id: attendantId ?? "" },
  });

  const defaults = useMemo(
    () => readRoleDefaults(defaultsQuery.data),
    [defaultsQuery.data],
  );
  const savedMatrix = useMemo(
    () => readSavedMatrix(savedQuery.data),
    [savedQuery.data],
  );

  const [matrix, setMatrix] = useState<PermissionsMatrix | null>(null);
  /** Modules changed by hand since the checklist was last filled in. */
  const touched = useRef(new Set<string>());
  /** True after Reset or a role change: the base is the role's defaults. */
  const fromDefaults = useRef(false);
  const appliedRole = useRef<string | undefined>(undefined);

  const roleDefault = role ? (defaults?.role_defaults[role] ?? null) : null;
  const isSavedRole = isEdit && role === savedRole;

  useEffect(() => {
    if (!role) {
      setMatrix(null);
      return;
    }
    // Same role with boxes already ticked: a refetch mustn't undo them.
    if (appliedRole.current === role && touched.current.size) return;
    if (isEdit && savedQuery.isLoading) return;

    const useSaved = isSavedRole && !fromDefaults.current;
    const next = useSaved
      ? savedQuery.isError
        ? null
        : (savedMatrix ?? roleDefault)
      : roleDefault;

    if (appliedRole.current !== role) {
      // A different role starts from its own defaults.
      fromDefaults.current = !isSavedRole;
      touched.current.clear();
    }
    appliedRole.current = role;
    setMatrix(next);
  }, [
    role,
    isEdit,
    isSavedRole,
    savedMatrix,
    roleDefault,
    savedQuery.isLoading,
    savedQuery.isError,
  ]);

  const onChange = useCallback((next: PermissionsMatrix) => {
    setMatrix((current) => {
      const modules = new Set([
        ...Object.keys(current ?? {}),
        ...Object.keys(next),
      ]);
      modules.forEach((module) => {
        if (!sameActions(current?.[module], next[module])) {
          touched.current.add(module);
        }
      });
      return next;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    if (!roleDefault) return;
    touched.current.clear();
    fromDefaults.current = true;
    setMatrix(roleDefault);
  }, [roleDefault]);

  const resolveForSave = useCallback((): MatrixSave => {
    const base = fromDefaults.current || !isSavedRole ? roleDefault : savedMatrix;

    // Nothing known to build on: on an unchanged role, leave what's saved;
    // otherwise the backend applies the new role's defaults.
    if (!base) return isSavedRole ? { keepSaved: true } : {};

    const final: PermissionsMatrix = { ...base };
    touched.current.forEach((module) => {
      final[module] = matrix?.[module] ?? [];
    });

    // Matching the role's defaults: leaving it out re-applies them.
    if (roleDefault && sameMatrix(final, roleDefault)) return {};
    if (isSavedRole && !touched.current.size && !fromDefaults.current) {
      return { keepSaved: true };
    }
    return { setPermissions: { permissions_matrix: final } };
  }, [isSavedRole, roleDefault, savedMatrix, matrix]);

  return {
    resolveForSave,
    editor: {
      role,
      modules: defaults?.modules ?? null,
      value: matrix,
      onChange,
      onReset: resetToDefaults,
      isCustom: Boolean(matrix && roleDefault && !sameMatrix(matrix, roleDefault)),
      canReset: Boolean(roleDefault),
      isLoading:
        Boolean(role) &&
        (defaultsQuery.isLoading || (isEdit && savedQuery.isLoading)),
      isError: defaultsQuery.isError || (isSavedRole && savedQuery.isError),
      onRetry: () => {
        defaultsQuery.refetch();
        if (isEdit) savedQuery.refetch();
      },
    },
  };
};
