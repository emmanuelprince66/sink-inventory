import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface createDepartmentPayload {
  // Define your bank creation payload type here
  [key: string]: any;
}

const createDepartment = async ({
  businessId,
  payload,
}: {
  businessId: any;
  payload: createDepartmentPayload;
}) => {
  const response = await fetch(
    `/api/products/${businessId}/create-department`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof createDepartment;

interface UseCreateDepartmentMutationOptions extends MutationConfig<QueryFnType> {
  businessId: string | null;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useCreateDepartmentMutation = ({
  businessId,
  ...config
}: UseCreateDepartmentMutationOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.products.createDepartment, businessId],
    mutationFn: (payload: createDepartmentPayload) =>
      createDepartment({ businessId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error creating bank:", error);

      const errorMessage =
        error?.message ||
        error?.error ||
        error?.message ||
        "Error creating Department";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Department created successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
