import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface fundCampaignPayload {
  // Define your bank creation payload type here
  [key: string]: any;
}

const CreateSenderId = async ({
  businessId,
  payload,
}: {
  businessId: any;
  payload: fundCampaignPayload;
}) => {
  const response = await fetch(`/api/campaign/${businessId}/fund-campaign`, {
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

interface useFundCampaignProps extends MutationConfig<QueryFnType> {
  businessId: string | null;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useFundCampaignMutation = ({
  businessId,
  ...config
}: useFundCampaignProps) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.campaign.fundCampaign, businessId],
    mutationFn: (payload: fundCampaignPayload) =>
      CreateSenderId({ businessId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error funding campaign:", error);

      const errorMessage =
        error?.message ||
        error?.error ||
        error?.message ||
        "Error funding campaign";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Campaign funded successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
