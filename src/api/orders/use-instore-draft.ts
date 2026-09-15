import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  FinalizeDraftPayload,
  FinalizeDraftResponse,
  InStoreDraft,
} from "@/app/(dashboard)/pos/instoreDraft";

/** Route handlers wrap the upstream body as { success, data }. */
interface Envelope<T> {
  success: boolean;
  data: T;
}

const readError = async (response: Response) => {
  const body = await response.json().catch(() => null);
  throw body ?? { error: "Request failed" };
};

// ---- Lookup -----------------------------------------------------------

const fetchDraft = async (businessId: string, code: string) => {
  const response = await fetch(
    `/api/orders/${businessId}/instore-lookup?code=${encodeURIComponent(code)}`,
    { method: "GET", headers: { "Content-Type": "application/json" } },
  );

  if (!response.ok) await readError(response);
  return (await response.json()) as Envelope<InStoreDraft>;
};

/**
 * Looks up a customer's order code.
 *
 * Deliberately never cached: a cashier refreshing a pending BNPL draft is
 * asking "has it been approved yet", and a five-minute stale window (the app
 * default) would answer with the same "not yet" every time. It also must not
 * refetch on its own — the cashier is reading this list against a physical
 * bag, and having it change under them is worse than it being a moment old.
 */
export const useInstoreDraftQuery = (
  businessId: string | null,
  code: string | null,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: [queryKey.orders.lookupInstoreDraft, businessId, code],
    queryFn: () => fetchDraft(businessId!, code!),
    enabled: !!businessId && !!code && options?.enabled !== false,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });

// ---- Finalize ---------------------------------------------------------

interface FinalizeVariables {
  businessId: string;
  payload: FinalizeDraftPayload;
}

const finalizeDraft = async ({ businessId, payload }: FinalizeVariables) => {
  const response = await fetch(
    `/api/orders/${businessId}/instore-finalize`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) await readError(response);
  return (await response.json()) as Envelope<FinalizeDraftResponse>;
};

/**
 * Completes a draft, or records collection of one already paid for.
 *
 * No toast on success: the caller shows a confirmation panel with the receipt,
 * and a toast on top of it is noise. Errors do toast, because the most likely
 * one — the last unit having sold while the customer walked over — needs to
 * reach the cashier immediately.
 */
export const useFinalizeInstoreDraftMutation = (config?: {
  onSuccess?: (data: Envelope<FinalizeDraftResponse>) => void;
  onError?: (message: string) => void;
}) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.orders.finalizeInstoreDraft],
    mutationFn: finalizeDraft,
    retry: false,
    onError: (error: any) => {
      const message =
        error?.details?.message ||
        error?.error ||
        error?.message ||
        "Could not complete this order";

      showToast(message, "error");
      config?.onError?.(message);
    },
    onSuccess: (data) => config?.onSuccess?.(data),
  });
};
