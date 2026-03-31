// components/shared/permission-guard.tsx
"use client";

import { Permission } from "@/lib/store/types";
import { useUserRole } from "@/lib/store/user-store";
import { ReactNode } from "react";
import { NotAuthorized } from "./NotAuthorized";

interface PermissionGuardProps {
  children: ReactNode;
  permission: Permission;
  fallback?: ReactNode;
  title?: string;
  message?: string;
}

export function PermissionGuard({
  children,
  permission,
  fallback,
  title,
  message,
}: PermissionGuardProps) {
  const { can } = useUserRole();

  if (!can(permission)) {
    return (
      fallback || (
        <NotAuthorized
          title={title}
          message={message}
          requiredPermission={permission}
        />
      )
    );
  }

  return <>{children}</>;
}
