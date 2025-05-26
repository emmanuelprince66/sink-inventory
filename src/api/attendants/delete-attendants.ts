import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const deleteAttendantById = async (id: string) => {
  console.log("Deleting Attendant with ID:", id);
  const response = await fetch(`/api/attendants/${id}/delete`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof deleteAttendantById;

interface UseDeleteAttendantOptions extends MutationConfig<QueryFnType> {
  // Additional options can be added here if needed
}

export const useDeleteAttendantMutation = (
  config?: UseDeleteAttendantOptions
) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.attendants.deleteAttendant],
    mutationFn: (id: string) => {
      if (!id) {
        throw new Error("Attendant ID is required");
      }
      return deleteAttendantById(id);
    },
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error deleting Bank:", error);
      const errorMessage = error?.message || "Error deleting Staff";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Staff deleted successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
