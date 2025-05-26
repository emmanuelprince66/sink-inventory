// hooks/useLogout.ts
import { useToast } from "@/hooks/toast/useToast";
import { useUserStore } from "@/lib/store/user-store";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const { logout } = useUserStore();

  const handleLogout = () => {
    // Clear cookies
    document.cookie =
      "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    logout();
    showToast("You have been logged out", "success");
    router.push("/login");
    router.refresh();
  };

  return { logout: handleLogout };
};
