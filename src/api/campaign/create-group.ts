import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface CreateGroupPayload {
  // Define your campaign creation payload type here
  [key: string]: any;
}

const CreateGroup = async ({
  businessId,
  payload,
}: {
  businessId: any;
  payload: CreateGroupPayload;
}) => {
  const response = await fetch(`/api/campaign/${businessId}/create-group`, {
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

type QueryFnType = typeof CreateGroup;

interface UseCreateGroupMutationOptions extends MutationConfig<QueryFnType> {
  businessId: string | null;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useCreateGroupMutation = ({
  businessId,
  ...config
}: UseCreateGroupMutationOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.campaign.createGroup, businessId],
    mutationFn: (payload: CreateGroupPayload) =>
      CreateGroup({ businessId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error creating group:", error);

      const errorMessage =
        error?.message ||
        error?.error ||
        error?.message ||
        "Error creating Sender id";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Group created successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
