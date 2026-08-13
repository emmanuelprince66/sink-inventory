import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import { LoyaltyProgram } from "@/types/loyalty";

export const createLoyaltyProgram = async ({
  id,
  payload,
}: {
  id: string;
  payload: LoyaltyProgram;
}) => {
  const response = await fetch(`/api/loyalty/${id}/programs`, {
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

  return response.json() as Promise<ApiResponse<LoyaltyProgram>>;
};

// MutationConfig derives its variables type from Parameters<Fn>[0], so this
// mirrors what mutationFn actually receives (the payload), not the fetcher's args.
type MutationFnType = (payload: LoyaltyProgram) => ReturnType<typeof createLoyaltyProgram>;

interface UseCreateLoyaltyProgramOptions extends MutationConfig<MutationFnType> {
  id: string;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useCreateLoyaltyProgramMutation = ({
  id,
  ...config
}: UseCreateLoyaltyProgramOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.loyalty.createLoyaltyProgram, id],
    mutationFn: (payload: LoyaltyProgram) => createLoyaltyProgram({ id, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      const errorMessage =
        error?.message || error?.error || "Error creating loyalty program";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Loyalty program created successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
