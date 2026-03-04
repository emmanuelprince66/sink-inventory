import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface EditServiceProps {
  productId: any;
  payload: FormData;
}
const editService = async ({ productId, payload }: EditServiceProps) => {
  console.log("payload", payload);

  const response = await fetch(`/api/service/${productId}/edit`, {
    method: "PATCH",
    body: payload,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof editService;

interface UseEditProductMutationOptions extends MutationConfig<QueryFnType> {
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}
export const useEditServiceMutation = (
  productId: any,
  config?: UseEditProductMutationOptions,
) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.products.editService, productId],
    mutationFn: editService,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error editing Service:", error);
      const errorMessage =
        error?.message || error?.error || "Error editing Service";
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      // showToast("Service Updated successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
