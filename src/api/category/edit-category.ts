import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface UpdateCategoryPayload {
  [key: string]: any;
}

const EditCategory = async ({
  catId,
  payload,
}: {
  catId: string;
  payload: UpdateCategoryPayload;
}) => {
  const response = await fetch(`/api/categories/${catId}/edit`, {
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

type QueryFnType = typeof EditCategory;

// Simplified interface - no need for catId in config
interface editCategoryOptions extends MutationConfig<QueryFnType> {
  // Add any additional options here if needed
}

export const useEditCategoryMutation = (config?: editCategoryOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.categories.updateCategory],
    mutationFn: ({
      catId,
      payload,
    }: {
      catId: string;
      payload: UpdateCategoryPayload;
    }) => {
      if (!catId) {
        throw new Error("Wallet ID is required");
      }
      return EditCategory({ catId, payload });
    },
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error editing category:", error);
      const errorMessage = error?.message || "Error editing category";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Category updated successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
