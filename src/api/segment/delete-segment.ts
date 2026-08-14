import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";
import { ApiResponse } from "@/types/api";

export const deleteSegment = async ({ segmentId }: { segmentId: string }) => {
  const response = await fetch(`/api/customer/segment/single/${segmentId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw errorData;
  }

  return response.json() as Promise<ApiResponse<null>>;
};

type MutationFnType = () => ReturnType<typeof deleteSegment>;

interface UseDeleteSegmentOptions extends MutationConfig<MutationFnType> {
  segmentId: string;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useDeleteSegmentMutation = ({
  segmentId,
  ...config
}: UseDeleteSegmentOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.segment.deleteSegment, segmentId],
    mutationFn: () => deleteSegment({ segmentId }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      showToast(
        error?.message || error?.error || "Error deleting segment",
        "error"
      );
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Segment deleted", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
