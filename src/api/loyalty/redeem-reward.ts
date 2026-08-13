import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import { LoyaltyRedeem } from "@/types/loyalty";

export const redeemReward = async ({
  rewardId,
  payload,
}: {
  rewardId: string;
  payload: LoyaltyRedeem;
}) => {
  const response = await fetch(`/api/loyalty/rewards/${rewardId}/redeem`, {
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

  return response.json() as Promise<ApiResponse<LoyaltyRedeem>>;
};

// MutationConfig derives its variables type from Parameters<Fn>[0], so this
// mirrors what mutationFn actually receives (the payload), not the fetcher's args.
type MutationFnType = (payload: LoyaltyRedeem) => ReturnType<typeof redeemReward>;

interface UseRedeemRewardOptions extends MutationConfig<MutationFnType> {
  rewardId: string;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useRedeemRewardMutation = ({
  rewardId,
  ...config
}: UseRedeemRewardOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.loyalty.redeemReward, rewardId],
    mutationFn: (payload: LoyaltyRedeem) => redeemReward({ rewardId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      const errorMessage =
        error?.message || error?.error || "Error creating reward";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Reward redeemed successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
