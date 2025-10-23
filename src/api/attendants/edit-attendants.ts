import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface UpdateAttendantPayload {
  [key: string]: any;
}

const EditAttendant = async ({
  attendantId,
  payload,
}: {
  attendantId: string;
  payload: UpdateAttendantPayload;
}) => {
  const response = await fetch(`/api/attendants/${attendantId}/edit`, {
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

type QueryFnType = typeof EditAttendant;

// Simplified interface - no need for attendantId in config
interface EditAttendantOptions extends MutationConfig<QueryFnType> {
  // Add any additional options here if needed
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useEditAttendantMutation = (config?: EditAttendantOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.attendants.editAttendant],
    mutationFn: ({
      attendantId,
      payload,
    }: {
      attendantId: string;
      payload: UpdateAttendantPayload;
    }) => {
      if (!attendantId) {
        throw new Error("Wallet ID is required");
      }
      return EditAttendant({ attendantId, payload });
    },
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error editing Attendant:", error);
      const errorMessage = error?.message || "Error editing Attendant";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Attendant updated successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
