import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const createBusiness = async (body: any) => {
  const response = await fetch(`/api/businesses/create-business`, {
    method: "POST",
    body: body,
  });

  if (!response.ok) {
    const errorData = await response.json();
    // Throw the entire error object to access details later
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof createBusiness;

export const useCreateBusinessMutation = (
  config?: MutationConfig<QueryFnType>
) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.business.createBusiness],
    mutationFn: createBusiness,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error creating business:", error);

      // Extract the most specific error message available
      const errorMessage =
        error?.details?.message ||
        error?.error ||
        error?.message ||
        "Error logging in";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Business Created Sucessfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
