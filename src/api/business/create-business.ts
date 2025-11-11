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

type QueryFnType = typeof createBusiness;
type QueryFnTypeTwo = typeof updateBusiness;

interface CreateBusinessProps extends MutationConfig<QueryFnType> {
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

interface UpdateBusinessProps extends MutationConfig<QueryFnTypeTwo> {
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

      const errorMessage =
        error?.details?.message ||
        error?.error ||
        error?.message ||
        "Error creating business";

      showToast(errorMessage, "error");
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
