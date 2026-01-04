import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation, useQueryClient } from "@/lib/react-query";

interface updateOrderPaymentStatusPayload {
  orderId: any;
  payload: any;
}

const editOrderStatus = async ({
  orderId,
  payload,
}: updateOrderPaymentStatusPayload) => {
  console.log("payload----4", payload);
  console.log("orderId--903993", orderId);
  const response = await fetch(`/api/orders/${orderId}/update-payment`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

interface UseUpdateOrderPaymentStatusMutationOptions {
  orderId: any; // Remove null from type
  config?: MutationConfig<QueryFnTypeUpdateStatus>;
}

type QueryFnTypeUpdateStatus = typeof editOrderStatus;

export const useUpdateOrderPaymentStatusMutation = ({
  orderId,
  config,
}: UseUpdateOrderPaymentStatusMutationOptions) => {
  console.log("useUpdateOrderPaymentStatusMutation - orderId:", orderId);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Capture orderId from closure and inject it; expect only { payload } from mutate()
  const mutationFnWithOrderId = (variables: { payload: any }) => {
    return editOrderStatus({ orderId, payload: variables.payload });
  };

  return useMutation({
    mutationKey: [queryKey.orders.updateOrderPaymentStatus, orderId],
    mutationFn: mutationFnWithOrderId, // Use the wrapped fn
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error updating order payment status:", error);
      const errorMessage =
        error?.message || error?.error || "Error updating order payment status";
      showToast(errorMessage, "error");
      // config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: [queryKey.orders.getOrderById, orderId],
      });
      showToast("Payment status updated successfully", "success");
      // config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
