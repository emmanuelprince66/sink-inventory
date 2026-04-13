import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const createCombo = async ({
  businessId,
  payload,
}: {
  businessId: string;
  payload: FormData;
}) => {
  const response = await fetch(`/api/combo/${businessId}/create`, {
    method: "POST",
    body: payload,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof createCombo;

interface UseCreateComboOptions extends MutationConfig<QueryFnType> {
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useCreateComboMutation = (config?: UseCreateComboOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.products.createCombo],
    mutationFn: createCombo,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      const errorMessage =
        error?.message || error?.error || "Error creating combo";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Combo created successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
