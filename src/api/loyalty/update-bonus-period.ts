import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import { LoyaltyBonusPeriod } from "@/types/loyalty";

export const updateBonusPeriod = async ({
  bonusPeriodId,
  payload,
}: {
  bonusPeriodId: string;
  payload: Partial<LoyaltyBonusPeriod>;
}) => {
  const response = await fetch(`/api/loyalty/bonus-periods/${bonusPeriodId}`, {
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

  return response.json() as Promise<ApiResponse<LoyaltyBonusPeriod>>;
};

// MutationConfig derives its variables type from Parameters<Fn>[0], so this
// mirrors what mutationFn actually receives (the payload), not the fetcher's args.
type MutationFnType = (payload: Partial<LoyaltyBonusPeriod>) => ReturnType<typeof updateBonusPeriod>;

interface UseUpdateBonusPeriodOptions extends MutationConfig<MutationFnType> {
  bonusPeriodId: string;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useUpdateBonusPeriodMutation = ({
  bonusPeriodId,
  ...config
}: UseUpdateBonusPeriodOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.loyalty.updateBonusPeriod, bonusPeriodId],
    mutationFn: (payload: Partial<LoyaltyBonusPeriod>) => updateBonusPeriod({ bonusPeriodId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      const errorMessage =
        error?.message || error?.error || "Error updating bonus period";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Bonus period updated successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
