// stores/user-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, UserRole } from "./types";

type UserStore = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean; // Add hydration state
  login: (userData: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isHydrated: false,
      login: (userData) => {
        // Set cookies first
        document.cookie = `accessToken=${userData.tokens.access}; path=/; secure; samesite=strict`;
        document.cookie = `userRole=${userData.role}; path=/; secure; samesite=strict`;

        set({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
        });
      },
      logout: () => {
        // Clear cookies first
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie =
          "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
      setLoading: (loading) => set({ isLoading: loading }),
      hydrate: () => set({ isHydrated: true }),
    }),
    {
      name: "user-storage",
      onRehydrateStorage: () => (state) => {
        state?.hydrate();
      },
    }
  )
);

export const useUserRole = () => {
  const { user } = useUserStore();

  console.log("useUserRole: Current user role:", user?.role);

  return {
    user,
    role: user?.role,
    name: user?.name,
    isOwner: user?.role === "OWNER",
    isAdminAttendant: user?.role === "ADMIN-ATTENDANT",
    isAttendant: user?.role === "ATTENDANT",
    isVerified: user?.is_verified,
    isSubscribed: user?.is_subscribed,
    subscription: user?.subscription,
    hasPermission: (requiredRole: UserRole) => {
      if (!user) return false;

      const roleHierarchy: Record<UserRole, number> = {
        OWNER: 3,
        "ADMIN-ATTENDANT": 2,
        ATTENDANT: 1,
      };

      return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
    },
  };
};
