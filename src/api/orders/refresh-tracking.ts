import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { useMutation, useQueryClient } from "@/lib/react-query";

const refreshOrderTracking = async (orderId: string) => {
  const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/refresh-tracking`, {
    method: "POST",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(
      result?.error || result?.message || "Unable to refresh shipment tracking",
    );
  }
  return result;
};

export const useRefreshOrderTrackingMutation = (orderId: string) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [queryKey.orders.refreshOrderTracking, orderId],
    mutationFn: () => refreshOrderTracking(orderId),
    retry: false,
    onError: (error: Error) => {
      showToast(error.message || "Unable to refresh shipment tracking", "error");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [queryKey.orders.getOrderById, orderId],
      });
      void queryClient.invalidateQueries({
        queryKey: [queryKey.orders.getAllOrders],
      });
      showToast("Shipment tracking refreshed", "success");
    },
  });
};
