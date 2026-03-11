import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const deleteCategoryById = async (id: string) => {
  const response = await fetch(`/api/categories/${id}/delete`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof deleteCategoryById;

interface UseDeleteCategoryOptions extends MutationConfig<QueryFnType> {
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useDeleteCategoryMutation = (
  config?: UseDeleteCategoryOptions,
) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.categories.deleteCategory],
    mutationFn: (id: string) => {
      if (!id) {
        throw new Error("Category ID is required");
      }
      return deleteCategoryById(id);
    },
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error deleting category:", error);
      const errorMessage = error?.message || "Error deleting category";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Category deleted successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
