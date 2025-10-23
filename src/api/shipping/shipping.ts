import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import {
  ExtractFnReturnType,
  MutationConfig,
  QueryConfigType,
  useMutation,
  useQuery,
} from "@/lib/react-query";

interface CreateShippingPayload {
  [key: string]: any;
}

interface UpdateShippingPayload {
  [key: string]: any;
}

const createShippingMethod = async ({
  businessId,
  payload,
}: {
  businessId: any;
  payload: CreateShippingPayload;
}) => {
  const response = await fetch(`/api/shipping/${businessId}/create-method`, {
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

export const fetchAllShipping = async (id: string) => {
  console.log(`/api/shipping/${id}/shippings`);
  const response = await fetch(`/api/shipping/${id}/`);
  if (!response.ok) throw new Error("Error fetching form data");
  return response.json();
};

type options = QueryConfigType<QueryFnType>;

type QueryFnType = typeof createShippingMethod;

interface UseCreateShippingMethodOptions extends MutationConfig<QueryFnType> {
  businessId: string | null;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useCreateShippingMethodMutation = ({
  businessId,
  ...config
}: UseCreateShippingMethodOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.shipping.createShippingMethod, businessId],
    mutationFn: (payload: CreateShippingPayload) =>
      createShippingMethod({ businessId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error creating Shipping Method:", error);

      const errorMessage =
        error?.message ||
        error?.error ||
        error?.message ||
        "Error creating Shipping Method";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Shipping Method created successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};

export const useFetchAllShippingQuery = (params: any, config?: options) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      else if (failureCount < 1) return true;
      else return false;
    },
    queryKey: [queryKey.shipping.getAllShippings, params.business_id],
    queryFn: () => fetchAllShipping(params.business_id),
    staleTime: 1000 * 60 * 5,
    ...config,
  });
};

export const FetchShippingById = async (id: string) => {
  const response = await fetch(`/api/shipping/${id}/single`);
  if (!response.ok) throw new Error("Error fetching form data");
  return response.json();
};

export const useFetchShippingByIdQuery = (id: any, config?: options) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      else if (failureCount < 1) return true;
      else return false;
    },
    queryKey: [queryKey.shipping.getShippingById, id],
    queryFn: () => FetchShippingById(id),
    staleTime: 1000 * 60 * 5,
    ...config,
  });
};

const editShippingMethod = async ({
  shippingId,
  payload,
}: {
  shippingId: any;
  payload: UpdateShippingPayload;
}) => {
  const response = await fetch(`/api/shipping/${shippingId}/edit`, {
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

type QueryFnTypeForEditShippingMethod = typeof editShippingMethod;

interface editShippingMethodOptions
  extends MutationConfig<QueryFnTypeForEditShippingMethod> {
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
  // Add any additional options here if needed
}

export const useEditShippingMethodMutation = (
  config?: editShippingMethodOptions
) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.shipping.editShipping],
    mutationFn: ({
      shippingId,
      payload,
    }: {
      shippingId: string;
      payload: UpdateShippingPayload;
    }) => {
      if (!shippingId) {
        throw new Error("Shipping Method ID is required");
      }
      return editShippingMethod({ shippingId, payload });
    },
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error editing Shipping Method:", error);
      const errorMessage = error?.message || "Error editing Shipping Method";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Shipping Method updated successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};

const deleteShipping = async (id: string) => {
  const response = await fetch(`/api/shipping/${id}/delete`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnTypeForDelete = typeof deleteShipping;

interface useDeleteShippingOptions
  extends MutationConfig<QueryFnTypeForDelete> {
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
  // Additional options can be added here if needed
}

export const useDeleteShippingMutation = (
  config?: useDeleteShippingOptions
) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.shipping.deleteShipping],
    mutationFn: (id: string) => {
      if (!id) {
        throw new Error("Shipping ID is required");
      }
      return deleteShipping(id);
    },
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error deleting Shipping:", error);
      const errorMessage = error?.message || "Error deleting Shipping";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Shipping deleted successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
