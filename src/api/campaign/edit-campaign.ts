import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface UpdateCampaignProps {
  [key: string]: any;
}

const editCampaign = async ({
  campaignId,
  payload,
}: {
  campaignId: any;
  payload: UpdateCampaignProps;
}) => {
  const response = await fetch(`/api/campaign/${campaignId}/edit-campaign`, {
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

type QueryFnType = typeof editCampaign;

// Simplified interface - no need for campaignId in config
interface editCampaignOptions extends MutationConfig<QueryFnType> {
  // Add any additional options here if needed
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useEditCampaignMutation = (config?: editCampaignOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.campaign.editCampaign],
    mutationFn: ({
      campaignId,
      payload,
    }: {
      campaignId: string;
      payload: UpdateCampaignProps;
    }) => {
      if (!campaignId) {
        throw new Error("Campaign ID is required");
      }
      return editCampaign({ campaignId, payload });
    },
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error editing Campaign:", error);
      const errorMessage = error?.message || "Error editing Campaign";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Campaign updated successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
