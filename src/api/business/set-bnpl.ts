import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const setBnpl = async ({
  businessId,
  enabled,
}: {
  businessId: string;
  enabled: boolean;
}) => {
  const response = await fetch(`/api/businesses/${businessId}/bnpl`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enable_bnpl: enabled }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) throw payload ?? { error: "Request failed" };
  return payload;
};

/**
 * The eligibility failures arrive keyed on the field rather than as a message.
 *
 * A merchant who is not Tier 3 gets `{ enable_bnpl: "Your wallet must be
 * upgraded..." }`, which the generic error readers miss entirely — they look
 * at `message` and `error` and would show "Request failed" over the top of the
 * one sentence that says what to do about it.
 */
const bnplErrorFrom = (error: any): string => {
  const details = error?.details ?? error;
  const field = details?.enable_bnpl;

  if (typeof field === "string") return field;
  if (Array.isArray(field) && field.length) return String(field[0]);

  return (
    details?.message ??
    error?.error ??
    error?.message ??
    "Could not update your BNPL setting"
  );
};

export const useSetBnplMutation = (config?: {
  onSuccess?: (data: any) => void;
  onError?: (message: string) => void;
}) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["set-business-bnpl"],
    mutationFn: setBnpl,
    retry: false,
    onError: (error: any) => {
      const message = bnplErrorFrom(error);
      showToast(message, "error");
      config?.onError?.(message);
    },
    onSuccess: (data, variables) => {
      showToast(
        variables.enabled
          ? "Buy Now Pay Later is now active."
          : "Buy Now Pay Later has been turned off.",
        "success",
      );
      // The card reads enable_bnpl off the business record, so it has to be
      // refetched or the toggle springs back on the next render.
      queryClient.invalidateQueries({
        queryKey: [queryKey.business.getBusinessById],
      });
      config?.onSuccess?.(data);
    },
  });
};
