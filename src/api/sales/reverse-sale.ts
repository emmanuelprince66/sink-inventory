import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const reverseSale = async (id: string) => {
  const response = await fetch(`/api/sales/${id}/reverse-sale`, {
    method: "POST",
    // headers: {
    //   "Content-Type": "application/json",
    // },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof reverseSale;

interface UseReverseSaleOptions extends MutationConfig<QueryFnType> {
  // Additional options can be added here if needed
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useReverseSaleMutation = (config?: UseReverseSaleOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.sales.reverseSale],
    mutationFn: (id: string) => {
      if (!id) {
        throw new Error("Product ID is required");
      }
      return reverseSale(id);
    },
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error reversing sale:", error);
      const errorMessage = error?.message || "Error reversing sale";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Sale reversed successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
