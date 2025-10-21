import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface createCategoryPayload {
  // Define your bank creation payload type here
  [key: string]: any;
}

const createCategory = async ({
  businessId,
  payload,
}: {
  businessId: any;
  payload: createCategoryPayload;
}) => {
  const response = await fetch(`/api/categories/${businessId}/create`, {
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

type QueryFnType = typeof createCategory;

interface UseCreateCategoryMutationOptions extends MutationConfig<QueryFnType> {
  businessId: string | null;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useCreateCategoryMutation = ({
  businessId,
  ...config
}: UseCreateCategoryMutationOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.categories.createCategory, businessId],
    mutationFn: (payload: createCategoryPayload) =>
      createCategory({ businessId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error creating bank:", error);

      const errorMessage =
        error?.message ||
        error?.error ||
        error?.message ||
        "Error creating Category";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Category created successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
