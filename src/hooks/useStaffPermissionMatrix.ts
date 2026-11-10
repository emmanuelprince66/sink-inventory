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
import { useToast } from "./toast/useToast";

const fetchRoleDefaults = async () => {
  const response = await fetch("/api/business/role-permission-defaults");
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error("Could not load role permissions");
  return body;
};

/**
 * The permission checklist on Add/Edit Staff. A role fills it with that role's
 * defaults, and the owner fine-tunes from there. Picking a role replaces the
 * checklist; ticking boxes doesn't change the role.
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
  const { showToast } = useToast();
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
  const edited = useRef(false);
  const appliedRole = useRef<string | undefined>(undefined);

  const roleDefault = role ? (defaults?.role_defaults[role] ?? null) : null;
  const isSavedRole = isEdit && role === savedRole;

  useEffect(() => {
    if (!role) {
      setMatrix(null);
      return;
    }
    // Same role with boxes already ticked: a refetch mustn't undo them.
    if (appliedRole.current === role && edited.current) return;
    if (isEdit && savedQuery.isLoading) return;

    const failedToReadSaved = isSavedRole && savedQuery.isError;
    const next = failedToReadSaved
      ? null
      : isSavedRole
        ? (savedMatrix ?? roleDefault)
        : roleDefault;

    appliedRole.current = role;
    edited.current = false;
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
    edited.current = true;
    setMatrix(next);
  }, []);

  const resetToDefaults = useCallback(() => {
    if (!roleDefault) return;
    edited.current = false;
    setMatrix(roleDefault);
  }, [roleDefault]);

  /**
   * What to send with the form. Left out when it matches the role's defaults,
   * which is how the backend re-applies them. On Edit, nothing can be sent
   * until the saved permissions are known: leaving it out would wipe them.
   */
  const resolveForSave = useCallback((): {
    ok: boolean;
    setPermissions?: { permissions_matrix: PermissionsMatrix };
  } => {
    if (!matrix) {
      if (!isEdit) return { ok: true };
      showToast(
        "Staff permissions haven't loaded yet. Try again in a moment.",
        "error",
      );
      return { ok: false };
    }
    if (roleDefault && sameMatrix(matrix, roleDefault)) return { ok: true };
    return { ok: true, setPermissions: { permissions_matrix: matrix } };
  }, [matrix, isEdit, roleDefault, showToast]);

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
