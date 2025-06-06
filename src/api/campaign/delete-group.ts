import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const DeleteGroup = async (id: string) => {
  const response = await fetch(`/api/campaign/${id}/delete-group`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof DeleteGroup;

interface useDeleteGroupProps extends MutationConfig<QueryFnType> {
  // Additional options can be added here if needed
}

export const useDeleteGroupMutation = (config?: useDeleteGroupProps) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.campaign.deleteGroup],
    mutationFn: (id: string) => {
      if (!id) {
        throw new Error("Group ID is required");
      }
      return DeleteGroup(id);
    },
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error deleting Group:", error);
      const errorMessage = error?.message || "Error deleting Group";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Group deleted successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
