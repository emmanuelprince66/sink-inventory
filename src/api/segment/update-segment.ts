import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import { CustomerSegment, CustomerSegmentPayload } from "@/types/segment";

export const updateSegment = async ({
  segmentId,
  payload,
}: {
  segmentId: string;
  payload: Partial<CustomerSegmentPayload>;
}) => {
  const response = await fetch(`/api/customer/segment/single/${segmentId}`, {
    method: "PATCH",
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
  payload: Partial<CustomerSegmentPayload>
) => ReturnType<typeof updateSegment>;

interface UseUpdateSegmentOptions extends MutationConfig<MutationFnType> {
  segmentId: string;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useUpdateSegmentMutation = ({
  segmentId,
  ...config
}: UseUpdateSegmentOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.segment.updateSegment, segmentId],
    mutationFn: (payload: Partial<CustomerSegmentPayload>) =>
      updateSegment({ segmentId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      showToast(
        error?.message || error?.error || "Error updating segment",
        "error"
      );
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Segment updated successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
