import { queryKey } from "@/constants/query-key";
import { MutationConfig, useMutation } from "@/lib/react-query";

const verifyUserOTP = async (body: any) => {
  const response = await fetch(`/api/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    // Throw the entire error object to access details later
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof verifyUserOTP;
interface VerifyOtpProps extends MutationConfig<QueryFnType> {
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}
export const useVerifyOtpMutation = (config?: VerifyOtpProps) => {
  return useMutation({
    mutationKey: [queryKey.auth.verifyOtp],
    mutationFn: verifyUserOTP,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error logging in:", error);

      // Extract the most specific error message available
      //   const errorMessage =
      //     error?.details?.message ||
      //     error?.error ||
      //     error?.message ||
      //     "Error logging in";

      //   showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      // showToast("Successfully signed up", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
