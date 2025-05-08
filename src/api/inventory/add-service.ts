import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface CreateServicePayload {
  // Define your customer creation payload type here
  [key: string]: any;
}

const addService = async ({
  businessId,
  payload,
}: {
  businessId: any;
  payload: CreateServicePayload;
}) => {
  const response = await fetch(`/api/inventory/${businessId}/create-service`, {
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

type QueryFnType = typeof addService;

interface UseAddServiceMutationOptions extends MutationConfig<QueryFnType> {
  businessId: string | null;
}

export const useAddServiceMutation = ({
  businessId,
  ...config
}: UseAddServiceMutationOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.inventory.addService, businessId],
    mutationFn: (payload: CreateServicePayload) =>
      addService({ businessId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error creating service:", error);

      const errorMessage =
        error?.message ||
        error?.error ||
        error?.message ||
        "Error creating service";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Service created successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
