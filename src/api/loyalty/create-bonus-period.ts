import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import { LoyaltyBonusPeriod } from "@/types/loyalty";

export const createBonusPeriod = async ({
  programId,
  payload,
}: {
  programId: string;
  payload: LoyaltyBonusPeriod;
}) => {
  const response = await fetch(`/api/loyalty/programs/${programId}/bonus-periods`, {
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

  return response.json() as Promise<ApiResponse<LoyaltyBonusPeriod>>;
};

// MutationConfig derives its variables type from Parameters<Fn>[0], so this
// mirrors what mutationFn actually receives (the payload), not the fetcher's args.
type MutationFnType = (payload: LoyaltyBonusPeriod) => ReturnType<typeof createBonusPeriod>;

interface UseCreateBonusPeriodOptions extends MutationConfig<MutationFnType> {
  programId: string;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useCreateBonusPeriodMutation = ({
  programId,
  ...config
}: UseCreateBonusPeriodOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.loyalty.createBonusPeriod, programId],
    mutationFn: (payload: LoyaltyBonusPeriod) => createBonusPeriod({ programId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      const errorMessage =
        error?.message || error?.error || "Error creating bonus period";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Bonus period created successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
