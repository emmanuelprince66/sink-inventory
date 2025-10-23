import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface CreateServiceApiPayload {
  // Define your customer creation apiPayload type here
  [key: string]: any;
}

const createSales = async ({
  businessId,
  apiPayload,
}: {
  businessId: any;
  apiPayload: CreateServiceApiPayload;
}) => {
  const response = await fetch(`/api/sales/${businessId}/create-sale`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(apiPayload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof createSales;

interface UsecreateSalesMutationOptions extends MutationConfig<QueryFnType> {
  businessId: string | null;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useCreateSalesMutation = ({
  businessId,
  ...config
}: UsecreateSalesMutationOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.sales.createSale, businessId],
    mutationFn: (apiPayload: CreateServiceApiPayload) =>
      createSales({ businessId, apiPayload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error creating sale:", error);

      const errorMessage =
        error?.message ||
        error?.error ||
        error?.message ||
        "Error creating sale";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast(" Transaction created successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
