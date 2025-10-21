import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface createSenderIdPayload {
  // Define your bank creation payload type here
  [key: string]: any;
}

const CreateSenderId = async ({
  businessId,
  payload,
}: {
  businessId: any;
  payload: createSenderIdPayload;
}) => {
  const response = await fetch(`/api/campaign/${businessId}/create-sender-id`, {
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

type QueryFnType = typeof CreateSenderId;

interface UseCreateSenderIdMutationOptions extends MutationConfig<QueryFnType> {
  businessId: string | null;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useCreateSenderIdMutation = ({
  businessId,
  ...config
}: UseCreateSenderIdMutationOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.campaign.createSenderID, businessId],
    mutationFn: (payload: createSenderIdPayload) =>
      CreateSenderId({ businessId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error creating bank:", error);

      const errorMessage =
        error?.message ||
        error?.error ||
        error?.message ||
        "Error creating Sender id";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Sender id created successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
