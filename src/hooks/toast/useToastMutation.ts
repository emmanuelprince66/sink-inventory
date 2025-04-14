import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { useToast } from "./useToast";

export function useToastMutation<
  TData = unknown,
  TError extends { message?: string } = Error,
  TVariables = void
>(
  options: UseMutationOptions<TData, TError, TVariables> & {
    successMessage?: string;
    errorMessage?: string;
  }
) {
  const { showToast } = useToast();

  return useMutation<TData, TError, TVariables>({
    ...options,
    onSuccess: (...args) => {
      if (options.successMessage) {
        showToast(options.successMessage, "success");
      }
      options.onSuccess?.(...args);
    },
    onError: (error, ...args) => {
      const errorMessage =
        options.errorMessage || error.message || "Something went wrong";

      showToast(errorMessage, "error");
      options.onError?.(error, ...args);
    },
  });
}
