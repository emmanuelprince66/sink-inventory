import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface UploadCustomersPayload {
  file: FormData;
}

const uploadCustomersCsv = async ({
  businessId,
  file,
}: {
  businessId: string;
  file: FormData;
}) => {
  const response = await fetch(`/api/customers/${businessId}/bulk-upload`, {
    method: "POST",
    body: file, // Send FormData directly
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof uploadCustomersCsv;

interface UseUploadCustomersMutationOptions
  extends MutationConfig<QueryFnType> {
  businessId: string | null;
}

export const useUploadCustomersMutation = ({
  businessId,
  ...config
}: UseUploadCustomersMutationOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.customers.uploadBulkCustomers, businessId],
    mutationFn: uploadCustomersCsv,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error uploading Customers:", error);
      const errorMessage =
        error?.message || error?.error || "Error uploading Customers";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Customers uploaded successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
