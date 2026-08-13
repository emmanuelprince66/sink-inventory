import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import { LoyaltyJoin } from "@/types/loyalty";

export const joinLoyalty = async ({
  token,
  payload,
}: {
  token: string;
  payload: LoyaltyJoin;
}) => {
  const response = await fetch(`/api/loyalty/join/${token}`, {
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

  return response.json() as Promise<ApiResponse<LoyaltyJoin>>;
};

// MutationConfig derives its variables type from Parameters<Fn>[0], so this
// mirrors what mutationFn actually receives (the payload), not the fetcher's args.
type MutationFnType = (payload: LoyaltyJoin) => ReturnType<typeof joinLoyalty>;

interface UseJoinLoyaltyOptions extends MutationConfig<MutationFnType> {
  token: string;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useJoinLoyaltyMutation = ({
  token,
  ...config
}: UseJoinLoyaltyOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.loyalty.joinLoyalty, token],
    mutationFn: (payload: LoyaltyJoin) => joinLoyalty({ token, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      const errorMessage =
        error?.message || error?.error || "Error creating loyalty programme";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Loyalty programme joined successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
