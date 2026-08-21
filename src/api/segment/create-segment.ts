import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import { CustomerSegment, CustomerSegmentPayload } from "@/types/segment";

export const createSegment = async ({
  businessId,
  payload,
}: {
  businessId: string;
  payload: CustomerSegmentPayload;
}) => {
  const response = await fetch(`/api/customer/segment/${businessId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw errorData;
  }

  return response.json() as Promise<ApiResponse<CustomerSegment>>;
};

type MutationFnType = (
  payload: CustomerSegmentPayload
) => ReturnType<typeof createSegment>;

interface UseCreateSegmentOptions extends MutationConfig<MutationFnType> {
  businessId: string;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useCreateSegmentMutation = ({
  businessId,
  ...config
}: UseCreateSegmentOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.segment.createSegment, businessId],
    mutationFn: (payload: CustomerSegmentPayload) =>
      createSegment({ businessId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      showToast(
        error?.message || error?.error || "Error creating segment",
        "error"
      );
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Segment created successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
