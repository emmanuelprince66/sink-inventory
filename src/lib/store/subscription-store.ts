// lib/store/useSubscriptionStore.ts
import { isSeparatelyBilled } from "@/utils/branchSubscription";
import { create } from "zustand";
import { useBusinessDataStore } from "./useBusinessDataStore";

export type SubscriptionNotificationType =
  | "upgrade_required"
  | "subscription_expired"
  | "feature_limit_reached"
  | null;

interface SubscriptionNotification {
  type: SubscriptionNotificationType;
  title: string;
  message: string;
  ctaText: string;
  ctaAction: () => void;
  additionalInfo?: string;
}

interface SubscriptionStore {
  notification: SubscriptionNotification | null;
  isModalOpen: boolean;
  navigate: ((path: string) => void) | null;

  // Actions
  setNavigate: (navigate: (path: string) => void) => void;
  showNotification: (
    type: SubscriptionNotificationType,
    additionalData?: any,
  ) => void;
  closeNotification: () => void;
  handleUpgrade: () => void;
  handleSubscribe: () => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  notification: null,
  isModalOpen: false,
  navigate: null,

  setNavigate: (navigate) => set({ navigate }),

  showNotification: (type, additionalData) => {
    if (!type) return;

    // On a branch billed on its own, "1"/"2" are about that branch's plan, not
    // the account's — say so, or an owner with an active account plan is told
    // they have none.
    const branch = useBusinessDataStore.getState().businessData;
    const branchName = isSeparatelyBilled(branch)
      ? branch?.name || "This branch"
      : null;

    const notifications = {
      subscription_expired: {
        // Error code "1" - User is not subscribed at all
        type: "subscription_expired" as const,
        title: branchName ? "Branch Subscription Required" : "Subscription Required",
        message: branchName
          ? `${branchName} needs its own subscription. Your account plan covers your first business only.`
          : "You need an active subscription to perform this action. Subscribe now to unlock all features and grow your business.",
        ctaText: "Subscribe Now",
        ctaAction: () => get().handleSubscribe(),
        additionalInfo: "No active subscription found.",
      },
      feature_limit_reached: {
        // Error code "2" - Current plan limit reached for specific feature
        type: "feature_limit_reached" as const,
        title: "Plan Limit Reached",
        message: branchName
          ? `${branchName} has reached the limit for this feature on its plan. Upgrade this branch's plan to continue.`
          : "You've reached the maximum limit for this feature on your current plan. Upgrade to a higher plan to continue adding more.",
        ctaText: "Upgrade Plan",
        ctaAction: () => get().handleUpgrade(),
        additionalInfo:
          additionalData?.message || "Current plan limit reached.",
      },
      upgrade_required: {
        // Error code "3" - Generic upgrade required
        type: "upgrade_required" as const,
        title: "Upgrade Required",
        message:
          "This feature is not available on your current plan. Upgrade now to unlock this functionality and do more.",
        ctaText: "Upgrade Plan",
        ctaAction: () => get().handleUpgrade(),
        additionalInfo: additionalData?.message,
      },
    };

    set({
      notification: notifications[type] as SubscriptionNotification,
      isModalOpen: true,
    });
  },

  closeNotification: () => {
    set({
      notification: null,
      isModalOpen: false,
    });
  },

  handleUpgrade: () => {
    const { navigate } = get();
    if (navigate) {
      navigate("/settings?tab=plans");
    } else {
      window.location.href = "/settings?tab=plans";
    }
    get().closeNotification();
  },

  handleSubscribe: () => {
    const { navigate } = get();
    if (navigate) {
      navigate("/settings?tab=plans");
    } else {
      window.location.href = "/settings?tab=plans";
    }
    get().closeNotification();
  },
}));
