// stores/types/business.ts
export interface BusinessStore {
  business_id: string | null;
  setBusinessId: (id: string) => void;
  clearBusinessId: () => void;
}

// types/index.ts
export type UserRole = "OWNER" | "ADMIN-ATTENDANT" | "ATTENDANT";

export type Subscription = {
  name: string;
  id: number;
};

export type User = {
  id: string;
  email: string;
  kyc: string;
  name: string;
  role: UserRole;
  is_verified: boolean;
  is_subscribed: boolean;
  subscription: Subscription;
  tokens: {
    access: string;
    refresh?: string;
  };
};
