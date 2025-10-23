import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const createKycAcct = async ({
  body,
  businessId,
}: {
  body: any;
  businessId: any;
}) => {
  const response = await fetch(`/api/kyc/${businessId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof createKycAcct;

interface UseKycMutationProps extends MutationConfig<QueryFnType> {
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useCreateKycAcctMutation = (config?: UseKycMutationProps) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.kyc.createKycAcct],
    mutationFn: createKycAcct,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error creating account:", error);
      const errorMessage =
        error?.details?.message ||
        error?.error ||
        error?.message ||
        "Error creating account";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Account Created Successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
