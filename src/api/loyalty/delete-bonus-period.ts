import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";
import { ApiResponse } from "@/types/api";

export const deleteBonusPeriod = async ({ bonusPeriodId }: { bonusPeriodId: string }) => {
  const response = await fetch(`/api/loyalty/bonus-periods/${bonusPeriodId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw errorData;
  }

  return response.json() as Promise<ApiResponse<null>>;
};

// MutationConfig derives its variables type from Parameters<Fn>[0], so this
// mirrors what mutationFn actually receives (the payload), not the fetcher's args.
type MutationFnType = (payload: void) => ReturnType<typeof deleteBonusPeriod>;

interface UseDeleteBonusPeriodOptions extends MutationConfig<MutationFnType> {
  bonusPeriodId: string;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useDeleteBonusPeriodMutation = ({
  bonusPeriodId,
  ...config
}: UseDeleteBonusPeriodOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.loyalty.deleteBonusPeriod, bonusPeriodId],
    mutationFn: () => deleteBonusPeriod({ bonusPeriodId }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      const errorMessage =
        error?.message || error?.error || "Error fetching bonus period";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Bonus period deleted successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
