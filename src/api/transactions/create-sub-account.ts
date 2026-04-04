import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const createSubAccount = async ({
  body,
  businessId,
}: {
  body: { previous_account: string; branch: string };
  businessId: string;
}) => {
  const response = await fetch(
    `/api/transactions/${businessId}/create-sub-account`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof createSubAccount;
interface UseCreateSubAccountOptions extends MutationConfig<QueryFnType> {
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useCreateSubAccountMutation = (
  config?: UseCreateSubAccountOptions,
) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.transactions.createSubAccount],
    mutationFn: createSubAccount,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      const errorMessage =
        error?.details?.message ||
        error?.error ||
        error?.message ||
        "Error creating sub account";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Sub account created successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
