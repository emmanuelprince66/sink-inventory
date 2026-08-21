import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import { LoyaltyProgram } from "@/types/loyalty";

export const updateLoyaltyProgram = async ({
  programId,
  payload,
}: {
  programId: string;
  payload: Partial<LoyaltyProgram>;
}) => {
  const response = await fetch(`/api/loyalty/programs/${programId}`, {
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

  return response.json() as Promise<ApiResponse<LoyaltyProgram>>;
};

// MutationConfig derives its variables type from Parameters<Fn>[0], so this
// mirrors what mutationFn actually receives (the payload), not the fetcher's args.
type MutationFnType = (payload: Partial<LoyaltyProgram>) => ReturnType<typeof updateLoyaltyProgram>;

interface UseUpdateLoyaltyProgramOptions extends MutationConfig<MutationFnType> {
  programId: string;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useUpdateLoyaltyProgramMutation = ({
  programId,
  ...config
}: UseUpdateLoyaltyProgramOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.loyalty.updateLoyaltyProgram, programId],
    mutationFn: (payload: Partial<LoyaltyProgram>) => updateLoyaltyProgram({ programId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      const errorMessage =
        error?.message || error?.error || "Error updating loyalty program";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Loyalty program updated successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
