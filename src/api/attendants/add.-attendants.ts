import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface createStaffPayload {
  // Define your bank creation payload type here
  [key: string]: any;
}

const createStaff = async ({
  businessId,
  payload,
}: {
  businessId: any;
  payload: createStaffPayload;
}) => {
  const response = await fetch(`/api/attendants/${businessId}/create`, {
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

type QueryFnType = typeof createStaff;

interface UseCreateStaffMutationOptions extends MutationConfig<QueryFnType> {
  businessId: string | null;
}

export const useCreateStaffMutation = ({
  businessId,
  ...config
}: UseCreateStaffMutationOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.attendants.createAttendant, businessId],
    mutationFn: (payload: createStaffPayload) =>
      createStaff({ businessId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      const errorMessage =
        error?.message ||
        error?.error ||
        error?.message ||
        "Error creating Staff";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Staff created successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
