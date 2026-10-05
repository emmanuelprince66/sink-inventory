import type { CustomerAddress } from "@/app/(dashboard)/customers/types";
import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";
import { useQueryClient } from "@tanstack/react-query";

export interface UpdateCustomerPayload {
  name: string;
  phone: string;
  email?: string;
  gender?: string | null;
  date_of_birth?: string | null;
  birthday?: string | null;
  address?: Pick<CustomerAddress, "address" | "is_default"> &
    Partial<
      Pick<
        CustomerAddress,
        "city" | "state" | "country" | "phone" | "latitude" | "longitude"
      >
    >;
}

interface UpdateCustomerVariables {
  id: string;
  payload: UpdateCustomerPayload;
}

const updateCustomer = async ({ id, payload }: UpdateCustomerVariables) => {
  const response = await fetch(`/api/customers/${id}/customer-by-id`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }

  return response.json();
};

type QueryFnType = typeof updateCustomer;

export const useUpdateCustomerMutation = (
  config?: MutationConfig<QueryFnType>,
) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const {
    onError: configOnError,
    onSuccess: configOnSuccess,
    ...mutationConfig
  } = config ?? {};

  return useMutation({
    ...mutationConfig,
    mutationKey: [queryKey.customers.updateCustomer],
    mutationFn: updateCustomer,
    retry: false,
    onError: (error: any, variables, onMutateResult, context) => {
      const errorMessage =
        error?.error || error?.message || "Unable to update customer";
      showToast(errorMessage, "error");
      configOnError?.(error, variables, onMutateResult, context);
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      showToast("Customer details updated successfully", "success");
      void queryClient.invalidateQueries({
        queryKey: [queryKey.customers.getCustomerById, variables.id],
      });
      void queryClient.invalidateQueries({
        queryKey: [queryKey.customers.getAllCustomers],
      });
      configOnSuccess?.(data, variables, onMutateResult, context);
    },
  });
};
