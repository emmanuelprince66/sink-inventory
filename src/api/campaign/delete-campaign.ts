import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const deleteCampaign = async (id: string) => {
  const response = await fetch(`/api/campaign/${id}/delete-campaign`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof deleteCampaign;

interface useDeleteCampaignProps extends MutationConfig<QueryFnType> {
  // Additional options can be added here if needed
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useDeleteCampaignMutation = (config?: useDeleteCampaignProps) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.campaign.deleteCampaign],
    mutationFn: (id: string) => {
      if (!id) {
        throw new Error("Campaign ID is required");
      }
      return deleteCampaign(id);
    },
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error deleting Campaign:", error);
      const errorMessage = error?.message || "Error deleting Campaign";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Campaign deleted successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
