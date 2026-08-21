import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import { LoyaltyTier } from "@/types/loyalty";

export const createLoyaltyTier = async ({
  id,
  payload,
}: {
  id: string;
  payload: LoyaltyTier;
}) => {
  const response = await fetch(`/api/loyalty/${id}/tiers`, {
    method: "POST",
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
type MutationFnType = (payload: LoyaltyTier) => ReturnType<typeof createLoyaltyTier>;

interface UseCreateLoyaltyTierOptions extends MutationConfig<MutationFnType> {
  id: string;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useCreateLoyaltyTierMutation = ({
  id,
  ...config
}: UseCreateLoyaltyTierOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.loyalty.createLoyaltyTier, id],
    mutationFn: (payload: LoyaltyTier) => createLoyaltyTier({ id, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      const errorMessage =
        error?.message || error?.error || "Error creating loyalty tier";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Loyalty tier created successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
