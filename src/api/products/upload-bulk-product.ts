import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface UploadProductsPayload {
  file: FormData;
}

const uploadProductsCsv = async ({
  businessId,
  file,
}: {
  businessId: string;
  file: FormData;
}) => {
  const response = await fetch(`/api/products/${businessId}/bulk-upload`, {
    method: "POST",
    body: file, // Send FormData directly
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof uploadProductsCsv;

interface UseUploadProductsMutationOptions extends MutationConfig<QueryFnType> {
  businessId: string | null;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useUploadProductsMutation = ({
  businessId,
  ...config
}: UseUploadProductsMutationOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.products.bulkUpload, businessId],
    mutationFn: uploadProductsCsv,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error uploading products:", error);
      const errorMessage =
        error?.message || error?.error || "Error uploading products";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Products uploaded successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
