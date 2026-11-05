import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface CreateServiceApiPayload {
  // Define your customer creation apiPayload type here
  [key: string]: any;
}

/** Past this, the POS stops waiting and saves the sale on the device. */
const SALE_TIMEOUT_MS = 10_000;

const createSales = async ({
  businessId,
  apiPayload,
}: {
  businessId: any;
  apiPayload: CreateServiceApiPayload;
}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SALE_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`/api/sales/${businessId}/create-sale`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiPayload),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    // Bad gateway and the like: the API itself can't be reached.
    throw response.status >= 502
      ? { ...errorData, unreachable: true }
      : errorData;
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
