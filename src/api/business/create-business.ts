import { handleSubscriptionError } from "@/api/sub/subscription-interceptor";
import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";
import { useQueryClient } from "@tanstack/react-query";

const createBusiness = async (body: any) => {
  const response = await fetch(`/api/businesses/create-business`, {
    method: "POST",
    body: body,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

const updateBusiness = async (body: FormData) => {
  const response = await fetch(`/api/businesses/update-business`, {
    method: "POST",
    body: body,
    // Don't set Content-Type header - browser will set it automatically with boundary for FormData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

// JSON-only update path for nested writable fields — multipart can't carry a
// nested object cleanly, so DRF reads it as a string and silently drops it.
// The write field is `shipbubble_settings` per swagger; reads come back under
// `shipbubble`.
interface ShipbubbleUpdatePayload {
  business_id: string;
  shipbubble_settings?: Record<string, unknown> | null;
  shipping_companies?: string[];
}
const updateBusinessShipbubble = async (body: ShipbubbleUpdatePayload) => {
  const response = await fetch(`/api/businesses/update-shipbubble`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof createBusiness;
type QueryFnTypeTwo = typeof updateBusiness;
type QueryFnTypeThree = typeof updateBusinessShipbubble;

interface CreateBusinessProps extends MutationConfig<QueryFnType> {
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

interface UpdateBusinessProps extends MutationConfig<QueryFnTypeTwo> {
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

interface UpdateShipbubbleProps extends MutationConfig<QueryFnTypeThree> {
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useCreateBusinessMutation = (config?: CreateBusinessProps) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.business.createBusiness],
    mutationFn: createBusiness,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error creating business:", error);

      // Codes "1" | "2" | "3" mean subscription/plan-limit — the global
      // SubscriptionNotificationModal handles those, so skip the toast.
      const isSubscriptionError = handleSubscriptionError(error);

      if (!isSubscriptionError) {
        const errorMessage =
          error?.details?.message ||
          error?.error ||
          error?.message ||
          "Error creating business";

        showToast(errorMessage, "error");
      }
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Business Created Successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};

export const useUpdateBusinessMutation = (config?: UpdateBusinessProps) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [queryKey.business.updateBusiness],
    mutationFn: updateBusiness,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error updating business:", error);

      const errorMessage =
        error?.details?.message ||
        error?.error ||
        error?.message ||
        "Error updating business";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Business Updated Successfully", "success");

      // Invalidate and refetch business data
      queryClient.invalidateQueries({
        queryKey: [queryKey.business.getBusinessById],
      });

      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};

export const useUpdateBusinessShipbubbleMutation = (
  config?: UpdateShipbubbleProps,
) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [queryKey.business.updateBusiness, "shipbubble"],
    mutationFn: updateBusinessShipbubble,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error updating Shipbubble settings:", error);

      const errorMessage =
        error?.details?.message ||
        error?.error ||
        error?.message ||
        "Error updating Shipbubble settings";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Shipbubble settings updated successfully.", "success");
      queryClient.invalidateQueries({
        queryKey: [queryKey.business.getBusinessById],
      });
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
