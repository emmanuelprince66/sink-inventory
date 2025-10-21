import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface CreateCampaignPayload {
  // Define your campaign creation payload type here
  [key: string]: any;
}

const CreateCampaign = async ({
  businessId,
  payload,
}: {
  businessId: any;
  payload: CreateCampaignPayload;
}) => {
  const response = await fetch(`/api/campaign/${businessId}/create-campaign`, {
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

type QueryFnType = typeof CreateCampaign;

interface UseCreateCampaignMutationOptions extends MutationConfig<QueryFnType> {
  businessId: string | null;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useCreateCampaignMutation = ({
  businessId,
  ...config
}: UseCreateCampaignMutationOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.campaign.createCampaign, businessId],
    mutationFn: (payload: CreateCampaignPayload) =>
      CreateCampaign({ businessId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error creating campaign:", error);

      const errorMessage =
        error?.message ||
        error?.error ||
        error?.message ||
        "Error creating Sender id";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Campaign created successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
