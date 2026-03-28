import { queryKey } from "@/constants/query-key";
import { queryClient } from "@/lib/react-query";
import { useMutation } from "@tanstack/react-query";

interface UpdateAttendantBusinessesPayload {
  business_ids: string[];
}

interface UpdateAttendantBusinessesParams {
  attendantId: string;
  payload: UpdateAttendantBusinessesPayload;
}

export const updateAttendantBusinesses = async ({
  attendantId,
  payload,
}: UpdateAttendantBusinessesParams) => {
  const response = await fetch(`/api/attendants/${attendantId}/add-business`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update attendant businesses");
  }

  return response.json();
};

interface UseUpdateAttendantBusinessesMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useUpdateAttendantBusinessesMutation = (
  options?: UseUpdateAttendantBusinessesMutationOptions,
) => {
  return useMutation({
    mutationFn: updateAttendantBusinesses,
    onSuccess: (data) => {
      // Invalidate attendants queries to refetch updated data
      queryClient.invalidateQueries({
        queryKey: [queryKey.attendants.getAllAttendants],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKey.attendants.getAttendantById],
      });

      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error: Error) => {
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
};
