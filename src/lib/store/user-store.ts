// stores/user-store.ts
import { getUserPermissions, hasPermission } from "@/utils/permissions";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Permission, Permissions, User, UserRole } from "./types";

// Cookie helper functions
const cookieHelpers = {
  set: (name: string, value: string, days: number = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
  },

  get: (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  },

  remove: (name: string) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  },

  removeAll: () => {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  },
};

type UserStoreState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  permissions: Permissions | null;
};

type UserStoreActions = {
  login: (userData: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => void;
  updatePermissions: (permissions: Permissions) => void;
  updateUser: (userData: Partial<User>) => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  getUserPermissions: () => Permission[];
};

type UserStore = UserStoreState & UserStoreActions;

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isHydrated: false,
      permissions: null,

      // Actions
      login: (userData) => {
        // Set cookies
        cookieHelpers.set("accessToken", userData.tokens.access);
        cookieHelpers.set("userRole", userData.role);
        if (userData.tokens.refresh) {
          cookieHelpers.set("refreshToken", userData.tokens.refresh);
        }

        set({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
          permissions: userData.permissions,
        });
      },

      logout: () => {
        // Clear all auth cookies
        cookieHelpers.remove("accessToken");
        cookieHelpers.remove("refreshToken");
        cookieHelpers.remove("userRole");

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          permissions: null,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      hydrate: () => set({ isHydrated: true }),

      updatePermissions: (permissions) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, permissions },
            permissions,
          });
        }
      },

      updateUser: (userData) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, ...userData };
          set({
            user: updatedUser,
            permissions: userData.permissions || user.permissions,
          });
        }
      },

      hasPermission: (permission: Permission): boolean => {
        const { user, permissions } = get();
        return hasPermission(
          permissions || user?.permissions || {},
          permission,
          user?.role === "OWNER",
        );
      },

      hasAnyPermission: (permissions: Permission[]): boolean => {
        const { user, permissions: userPermissions } = get();
        return permissions.some((permission) =>
          hasPermission(
            userPermissions || user?.permissions || {},
            permission,
            user?.role === "OWNER",
          ),
        );
      },

      hasAllPermissions: (permissions: Permission[]): boolean => {
        const { user, permissions: userPermissions } = get();
        return permissions.every((permission) =>
          hasPermission(
            userPermissions || user?.permissions || {},
            permission,
            user?.role === "OWNER",
          ),
        );
      },

      getUserPermissions: (): Permission[] => {
        const { user, permissions } = get();
        return getUserPermissions(
          permissions || user?.permissions || {},
          user?.role === "OWNER",
        );
      },
    }),
    {
      name: "user-storage",
      onRehydrateStorage: () => (state) => {
        state?.hydrate();
      },
    },
  ),
);

// Enhanced hook for user role and permission management
export const useUserRole = () => {
  const user = useUserStore((state) => state.user);
  const hasPermission = useUserStore((state) => state.hasPermission);
  const hasAnyPermission = useUserStore((state) => state.hasAnyPermission);
  const hasAllPermissions = useUserStore((state) => state.hasAllPermissions);
  const getUserPermissions = useUserStore((state) => state.getUserPermissions);

  const role = user?.role;
  const permissions = user?.permissions;

  // Role check helpers
  const roleChecks = {
    isOwner: role === "OWNER",
    isAdminAttendant: role === "ADMIN-ATTENDANT",
    isAttendant: role === "ATTENDANT",
    isPharmacist: role === "PHARMACIST",
    isInventoryManager: role === "INVENTORY-MANAGER",
    isAccountant: role === "ACCOUNTANT",

    // Role level check (for hierarchy-based permissions)
    hasRoleLevel: (requiredRole: UserRole): boolean => {
      if (!user) return false;

      const roleHierarchy: Record<UserRole, number> = {
        OWNER: 5,
        "ADMIN-ATTENDANT": 4,
        "INVENTORY-MANAGER": 3,
        "PRODUCTION-MANAGER": 3,
        PHARMACIST: 2,
        ACCOUNTANT: 2,
        ATTENDANT: 1,
      };

      const userLevel = roleHierarchy[user.role] || 0;
      const requiredLevel = roleHierarchy[requiredRole] || 0;

      return userLevel >= requiredLevel;
    },

    // Check if user has specific role
    hasRole: (targetRole: UserRole): boolean => {
      return user?.role === targetRole;
    },

    // Check if user has any of the specified roles
    hasAnyRole: (roles: UserRole[]): boolean => {
      if (!user) return false;
      return roles.includes(user.role);
    },
  };

  // Permission check helpers
  const permissionChecks = {
    // Check single permission
    can: (permission: Permission): boolean => {
      return hasPermission(permission);
    },

    // Check if user can perform any of the given permissions
    canAny: (permissions: Permission[]): boolean => {
      return hasAnyPermission(permissions);
    },

    // Check if user can perform all given permissions
    canAll: (permissions: Permission[]): boolean => {
      return hasAllPermissions(permissions);
    },

    // Get all user permissions
    getAll: (): Permission[] => {
      return getUserPermissions();
    },
  };

  // Common business logic checks
  const businessChecks = {
    // Sales related
    canProcessSales: (): boolean => hasPermission("process_sales"),
    canViewOrders: (): boolean => hasPermission("view_orders"),
    canApplyDiscounts: (): boolean => hasPermission("apply_discounts"),
    canReturnItems: (): boolean => hasPermission("return_items"),

    // Inventory related
    canManageInventory: (): boolean =>
      hasPermission("manage_inventory_across_branches"),
    canRestockProducts: (): boolean => hasPermission("restock_products"),
    canTransferItems: (): boolean => hasPermission("transfer_items"),
    canDamageItems: (): boolean => hasPermission("damage_items"),
    canManageSuppliers: (): boolean => hasPermission("manage_suppliers"),

    // Pharmacy related
    canDispenseDrugs: (): boolean => hasPermission("dispense_drugs"),
    canViewPrescriptions: (): boolean => hasPermission("view_prescriptions"),

    // Production related
    canMoveToProduction: (): boolean =>
      hasPermission("move_items_to_production"),

    // Financial related
    canViewTransactions: (): boolean => hasPermission("view_transactions"),
    canManageBankDetails: (): boolean => hasPermission("manage_bank_details"),

    // General
    canMakePresale: (): boolean => hasPermission("make_presale"),
    canSellWatchlist: (): boolean => hasPermission("sell_watchlist"),
  };

  return {
    // User data
    user,
    role,
    name: user?.name,
    kyc: user?.kyc,
    email: user?.email,
    id: user?.id,
    isVerified: user?.is_verified,
    isSubscribed: user?.is_subscribed,
    subscription: user?.subscription,
    permissions,

    // Role checks
    ...roleChecks,

    // Permission checks
    ...permissionChecks,

    // Business logic checks
    ...businessChecks,
  };
};

// Helper hook for permission-based rendering
export const usePermission = (permission: Permission) => {
  const hasPermission = useUserStore((state) => state.hasPermission);
  const user = useUserStore((state) => state.user);

  return {
    isAllowed: hasPermission(permission),
    isOwner: user?.role === "OWNER",
  };
};

// Helper hook for role-based rendering
export const useRole = (allowedRoles: UserRole | UserRole[]) => {
  const user = useUserStore((state) => state.user);

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const hasRole = user ? roles.includes(user.role) : false;

  return {
    hasRole,
    user,
    role: user?.role,
  };
};
