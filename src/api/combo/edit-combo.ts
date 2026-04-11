import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const editCombo = async ({
  comboId,
  payload,
}: {
  comboId: string;
  payload: FormData;
}) => {
  const response = await fetch(`/api/combo/${comboId}/edit`, {
    method: "PATCH",
    body: payload,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof editCombo;

interface UseEditComboOptions extends MutationConfig<QueryFnType> {
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useEditComboMutation = (config?: UseEditComboOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.products.editCombo],
    mutationFn: editCombo,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      const errorMessage =
        error?.message || error?.error || "Error updating combo";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Combo updated successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
