import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { useBusinessStore } from "@/lib/store/useBusinessStore";

export const useStoreHook = () => {
  const business_id = useBusinessStore((state) => state.business_id);

  const { data: BusinessData, isLoading: BusinessDataLoading } =
    useFetchBusinessById(business_id);

  return { BusinessData, BusinessDataLoading, business_id };
};
