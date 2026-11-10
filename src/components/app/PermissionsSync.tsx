"use client";

import { useUserStore } from "@/lib/store/user-store";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

/** How often to pick up permission changes the owner made. */
const REFRESH_MS = 2 * 60 * 1000;

const fetchMyPermissions = async () => {
  const response = await fetch("/api/user/me/permissions", {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not load permissions");
  const body = await response.json();
  return body?.data?.data ?? body?.data ?? body;
};

/**
 * Keeps the signed-in staff member's permissions current, so a change the
 * owner makes applies within a couple of minutes (or when the tab is next
 * opened) instead of at their next login. Renders nothing.
 */
const PermissionsSync = () => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const role = useUserStore((state) => state.user?.role);

  const { data } = useQuery({
    queryKey: ["my-permissions"],
    queryFn: fetchMyPermissions,
    // Owners can do everything; nothing to keep current.
    enabled: isAuthenticated && Boolean(role) && role !== "OWNER",
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: true,
    retry: false,
  });

  useEffect(() => {
    if (!data?.permissions_matrix) return;
    const { role: freshRole, ...permissions } = data;
    const { user, permissions: current, updateUser } = useUserStore.getState();
    if (!user) return;

    const roleChanged = Boolean(freshRole) && freshRole !== user.role;
    const permissionsChanged =
      JSON.stringify(permissions) !== JSON.stringify(current ?? user.permissions);
    if (!roleChanged && !permissionsChanged) return;

    updateUser({
      ...(roleChanged && { role: freshRole }),
      permissions,
    });
  }, [data]);

  return null;
};

export default PermissionsSync;
