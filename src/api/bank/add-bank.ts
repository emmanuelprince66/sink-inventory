import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface createBankPayload {
  // Define your bank creation payload type here
  [key: string]: any;
}

const createBank = async ({
  businessId,
  payload,
}: {
  businessId: any;
  payload: createBankPayload;
}) => {
  const response = await fetch(`/api/bank/${businessId}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof createBank;

interface UseCreateBankMutationOptions extends MutationConfig<QueryFnType> {
  businessId: string | null;
}

export const useCreateBankMutation = ({
  businessId,
  ...config
}: UseCreateBankMutationOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.bank.createBank, businessId],
    mutationFn: (payload: createBankPayload) =>
      createBank({ businessId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error creating bank:", error);

      const errorMessage =
        error?.message ||
        error?.error ||
        error?.message ||
        "Error creating bank";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Bank created successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
