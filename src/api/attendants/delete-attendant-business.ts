import { queryKey } from "@/constants/query-key";
import { queryClient } from "@/lib/react-query";
import { useMutation } from "@tanstack/react-query";

interface DeleteAttendantFromBusinessParams {
  attendantId: string;
}

export const deleteAttendantFromBusiness = async ({
  attendantId,
}: DeleteAttendantFromBusinessParams) => {
  const response = await fetch(
    `/api/attendants/${attendantId}/delete-business`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || "Failed to remove attendant from business",
    );
  }

  return response.json();
};

interface UseDeleteAttendantFromBusinessMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useDeleteAttendantFromBusinessMutation = (
  options?: UseDeleteAttendantFromBusinessMutationOptions,
) => {
  return useMutation({
    mutationFn: deleteAttendantFromBusiness,
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
