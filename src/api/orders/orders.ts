import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import {
  ExtractFnReturnType,
  MutationConfig,
  QueryConfigType,
  useMutation,
  useQuery,
  useQueryClient,
} from "@/lib/react-query";

interface FetchOrdersParams {
  page?: number;
  limit?: number;
  id: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  status?: string;
  order_type?: string;
  shipping_status?: string;
  payment_status?: string;
}

export const fetchAllOrders = async ({
  page = 1,
  limit = 20,
  id,
  search = "",
  order_type = "",
  shipping_status = "",
  payment_status = "",
  start_date = "",
  end_date = "",
}: FetchOrdersParams) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(order_type && { order_type }),
    ...(shipping_status && { shipping_status }),
    ...(payment_status && { payment_status }),
    ...(start_date && { start_date }),
    ...(end_date && { end_date }),
  });

  const response = await fetch(`/api/orders/${id}/all?${queryParams}`);
  if (!response.ok) throw new Error("Error fetching orders");
  return response.json();
};

type FetchOrdersQueryFnType = typeof fetchAllOrders;

interface UseFetchAllOrdersOptions
  extends QueryConfigType<FetchOrdersQueryFnType> {
  params: FetchOrdersParams;
  enabled?: boolean;
  staleTime?: number;
}

export const useFetchAllOrdersQuery = ({
  params,
  enabled = true,
  staleTime = 1000 * 60 * 5,
  ...config
}: UseFetchAllOrdersOptions) => {
  return useQuery<ExtractFnReturnType<FetchOrdersQueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error?.status)) return false;
      else if (failureCount < 1) return true;
      else return false;
    },
    queryKey: [queryKey.orders.getAllOrders, params],
    queryFn: () => fetchAllOrders(params),
    enabled: enabled && !!params.id,
    staleTime,
    ...config,
  });
};

export const FetchOrderById = async (id: string) => {
  console.log("id--33", id);
  // console.log("useQuery:", useQuery); //
  const response = await fetch(`/api/orders/${id}/view`);
  if (!response.ok) throw new Error("Error fetching order data");
  return response.json();
};

type QueryFnType = typeof FetchOrderById;

type options = QueryConfigType<QueryFnType>;
export const useFetchOrderByIdQuery = (id: any, config?: options) => {
  console.log("useFetchOrderByIdQuery - id:", id);
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      else if (failureCount < 1) return true;
      else return false;
    },
    queryKey: [queryKey.orders.getOrderById, id],
    queryFn: () => FetchOrderById(id),
    staleTime: 1000 * 60 * 5,
    ...config,
  });
};

interface EditOrderShippingStatusProps {
  orderId: any;
  payload: any;
}
const editOrderStatus = async ({
  orderId,
  payload,
}: EditOrderShippingStatusProps) => {
  console.log("payload----4", payload);

  const response = await fetch(`/api/orders/${orderId}/update-status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

interface UseUpdateOrderShippingStatusMutationOptions {
  orderId: any; // Remove null from type
  config?: MutationConfig<QueryFnTypeUpdateStatus>;
}

type QueryFnTypeUpdateStatus = typeof editOrderStatus;

export const useUpdateOrderShippingStatusMutation = ({
  orderId,
  config,
}: UseUpdateOrderShippingStatusMutationOptions) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [queryKey.orders.updateOrderStatus, orderId],
    mutationFn: editOrderStatus,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error updating order  shipping status:", error);
      const errorMessage =
        error?.message ||
        error?.error ||
        "Error updating order shipping status";
      showToast(errorMessage, "error");

      // config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: [queryKey.orders.getOrderById, orderId],
      });
      showToast("Shipping status updated successfully", "success");
      // config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
