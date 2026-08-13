import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import { LoyaltyTier } from "@/types/loyalty";

export const updateLoyaltyTier = async ({
  tierId,
  payload,
}: {
  tierId: string;
  payload: Partial<LoyaltyTier>;
}) => {
  const response = await fetch(`/api/loyalty/tiers/${tierId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw errorData;
  }

  return response.json() as Promise<ApiResponse<LoyaltyTier>>;
};

// MutationConfig derives its variables type from Parameters<Fn>[0], so this
// mirrors what mutationFn actually receives (the payload), not the fetcher's args.
type MutationFnType = (payload: Partial<LoyaltyTier>) => ReturnType<typeof updateLoyaltyTier>;

interface UseUpdateLoyaltyTierOptions extends MutationConfig<MutationFnType> {
  tierId: string;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useUpdateLoyaltyTierMutation = ({
  tierId,
  ...config
}: UseUpdateLoyaltyTierOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.loyalty.updateLoyaltyTier, tierId],
    mutationFn: (payload: Partial<LoyaltyTier>) => updateLoyaltyTier({ tierId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      const errorMessage =
        error?.message || error?.error || "Error updating loyalty tier";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Loyalty tier updated successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
