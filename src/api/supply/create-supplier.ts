import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface CreateSuppplierPayload {
  // Define your customer creation payload type here
  [key: string]: any;
}

const createSupplier = async ({
  businessId,
  payload,
}: {
  businessId: any;
  payload: CreateSuppplierPayload;
}) => {
  const response = await fetch(`/api/supplier/${businessId}/create`, {
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

type QueryFnType = typeof createSupplier;

interface useCreateSupplierMutation extends MutationConfig<QueryFnType> {
  businessId: string | null;
}

export const useCreateSupplierMutation = ({
  businessId,
  ...config
}: useCreateSupplierMutation) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.supplier.createSupplier, businessId],
    mutationFn: (payload: CreateSuppplierPayload) =>
      createSupplier({ businessId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error creating supplier:", error);

      const errorMessage =
        error?.message ||
        error?.error ||
        error?.message ||
        "Error creating supplier";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Supplier created successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
