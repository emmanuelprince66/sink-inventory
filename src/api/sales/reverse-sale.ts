import { canBeOverridden, isOverridePinInvalid } from "@/api/user/override-pin";
import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const reverseSale = async ({ id, pin }: { id: string; pin?: string }) => {
  const response = await fetch(`/api/sales/${id}/reverse-sale`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, ...(pin && { manager_override_pin: pin }) }),
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
    mutationFn: (input: string | { id: string; pin?: string }) => {
      const args = typeof input === "string" ? { id: input } : input;
      if (!args.id) {
        throw new Error("Product ID is required");
      }
      return reverseSale(args);
    },
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error reversing sale:", error);
      // Asking for a manager's PIN, or a wrong one: the dialog says so.
      if (!canBeOverridden(error) && !isOverridePinInvalid(error)) {
        const errorMessage = error?.message || "Error reversing sale";
        showToast(errorMessage, "error");
      }
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Sale reversed successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
