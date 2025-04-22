// stores/types/business.ts
export interface BusinessStore {
  business_id: string | null;
  setBusinessId: (id: string) => void;
  clearBusinessId: () => void;
}
