import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const deleteService = async (id: string) => {
  const response = await fetch(`/api/service/${id}/delete-service`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof deleteService;

interface useDeleteServiceProps extends MutationConfig<QueryFnType> {
  // Additional options can be added here if needed
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useDeleteServiceMutation = (config?: useDeleteServiceProps) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.inventory.deleteService],
    mutationFn: (id: string) => {
      if (!id) {
        throw new Error("Service ID is required");
      }
      return deleteService(id);
    },
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error deleting Service:", error);
      const errorMessage = error?.message || "Error deleting Service";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Service deleted successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
