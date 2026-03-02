import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface AddTaxPayload {
  // Define your bank creation payload type here
  [key: string]: any;
}

const AddTax = async ({
  businessId,
  payload,
}: {
  businessId: any;
  payload: AddTaxPayload;
}) => {
  const response = await fetch(`/api/tax/${businessId}/create-tax`, {
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

type QueryFnType = typeof AddTax;

interface UseAddTaxMutationOptions extends MutationConfig<QueryFnType> {
  businessId: string | null;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useAddTaxMutation = ({
  businessId,
  ...config
}: UseAddTaxMutationOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.tax.addTax, businessId],
    mutationFn: (payload: AddTaxPayload) => AddTax({ businessId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error creating bank:", error);

      const errorMessage =
        error?.message ||
        error?.error ||
        error?.message ||
        "Error creating tax";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Tax updated successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
