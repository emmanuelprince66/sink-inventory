import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const deleteComboById = async (id: string) => {
  const response = await fetch(`/api/combo/${id}/delete`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof deleteComboById;

interface UseDeleteComboOptions extends MutationConfig<QueryFnType> {
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useDeleteComboMutation = (config?: UseDeleteComboOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.products.deleteCombo],
    mutationFn: (id: string) => {
      if (!id) throw new Error("Combo ID is required");
      return deleteComboById(id);
    },
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      const errorMessage = error?.message || "Error deleting combo";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Combo deleted successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
