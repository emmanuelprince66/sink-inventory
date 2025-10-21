import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface CreateCustomerPayload {
  // Define your customer creation payload type here
  [key: string]: any;
}

const createCustomer = async ({
  businessId,
  payload,
}: {
  businessId: any;
  payload: CreateCustomerPayload;
}) => {
  const response = await fetch(`/api/customers/${businessId}/create`, {
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

type QueryFnType = typeof createCustomer;

interface UseCreateCustomerMutationOptions extends MutationConfig<QueryFnType> {
  businessId: string | null;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useCreateCustomerMutation = ({
  businessId,
  ...config
}: UseCreateCustomerMutationOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.customers.createCustomer, businessId],
    mutationFn: (payload: CreateCustomerPayload) =>
      createCustomer({ businessId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error creating customer:", error);

      const errorMessage =
        error?.message ||
        error?.error ||
        error?.message ||
        "Error creating customer";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Customer created successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
