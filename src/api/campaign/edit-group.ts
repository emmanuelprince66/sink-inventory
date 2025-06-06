import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface UpdateGroupProps {
  [key: string]: any;
}

const editGroup = async ({
  groupId,
  payload,
}: {
  groupId: any;
  payload: UpdateGroupProps;
}) => {
  const response = await fetch(`/api/campaign/${groupId}/edit-group`, {
    method: "PATCH",
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

type QueryFnType = typeof editGroup;

// Simplified interface - no need for groupId in config
interface editGroupOptions extends MutationConfig<QueryFnType> {
  // Add any additional options here if needed
}

export const useEditGroupMutation = (config?: editGroupOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.campaign.editGroup],
    mutationFn: ({
      groupId,
      payload,
    }: {
      groupId: string;
      payload: UpdateGroupProps;
    }) => {
      if (!groupId) {
        throw new Error("group ID is required");
      }
      return editGroup({ groupId, payload });
    },
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error editing Group:", error);
      const errorMessage = error?.message || "Error editing Group";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Group updated successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
