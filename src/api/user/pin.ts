import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import {
  ExtractFnReturnType,
  MutationCallbacks,
  QueryConfigType,
  useMutation,
  useQuery,
  useQueryClient,
} from "@/lib/react-query";

/**
 * The personal transaction PIN used to authorise expense payouts and
 * approvals.
 *
 * Distinct from the business wallet PIN under settings/pin, which secures the
 * wallet transfer flow and is scoped to a business. This one belongs to the
 * user and travels with them across the businesses they work in.
 */

const request = async (path: string, body?: unknown) => {
  const response = await fetch(path, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw payload;
  return payload;
};

// ─── Status ───────────────────────────────────────────────────────────────────

export const fetchPinStatus = () => request("/api/user/pin/status");

type StatusFnType = typeof fetchPinStatus;

export const useUserPinStatusQuery = (
  config?: QueryConfigType<StatusFnType>,
) =>
  useQuery<ExtractFnReturnType<StatusFnType>>({
    queryKey: [queryKey.userPin.status],
    queryFn: fetchPinStatus,
    // Long enough to dedupe the several screens that ask on the way to a
    // payout, short enough that a PIN set in another tab is not still being
    // reported as missing minutes later — being wrong here means offering
    // "create" to someone who already has one, which the API then rejects.
    staleTime: 1000 * 30,
    ...config,
  });

/** `has_pin` off the status response, defaulting to unknown-as-false. */
export const hasPinFrom = (data: any): boolean =>
  Boolean(data?.data?.has_pin ?? data?.has_pin);

/**
 * Whether this user needs a transaction PIN at all.
 *
 * Only someone who can move money does. A cashier who will never initiate or
 * approve a payout should not be nagged to set one, so the prompt is gated on
 * this rather than on `has_pin` alone.
 *
 * Absent means yes. The field is newer than the endpoint, so a response
 * without it is one from before the distinction existed — and prompting
 * someone who did not need to is a smaller failure than silently hiding the
 * prompt from someone who cannot pay out without it.
 */
export const pinRequiredFrom = (data: any): boolean => {
  const value = data?.data?.pin_required ?? data?.pin_required;
  return value === undefined || value === null ? true : Boolean(value);
};

// ─── Set ──────────────────────────────────────────────────────────────────────

const setPin = ({ pin }: { pin: string }) =>
  request("/api/user/pin/set", { pin });

export const useSetUserPinMutation = (
  config?: MutationCallbacks<typeof setPin>,
) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    // Spread first: our own onSuccess below must run even when a caller
    // passes one, or the cache invalidation is silently replaced.
    ...config,
    mutationKey: [queryKey.userPin.set],
    mutationFn: setPin,
    retry: false,
    onError: (error: any, variables, context) => {
      showToast(
        error?.details?.message || error?.error || "Could not set your PIN",
        "error",
      );
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      showToast("Transaction PIN set", "success");
      // Every screen gated on has_pin needs to stop asking immediately.
      queryClient.invalidateQueries({ queryKey: [queryKey.userPin.status] });
      config?.onSuccess?.(data, variables, context);
    },
  });
};

// ─── Change ───────────────────────────────────────────────────────────────────

const changePin = (body: { old_pin: string; new_pin: string }) =>
  request("/api/user/pin/change", body);

export const useChangeUserPinMutation = (
  config?: MutationCallbacks<typeof changePin>,
) => {
  const { showToast } = useToast();

  return useMutation({
    // Spread first: our own onSuccess below must run even when a caller
    // passes one, or the cache invalidation is silently replaced.
    ...config,
    mutationKey: [queryKey.userPin.change],
    mutationFn: changePin,
    retry: false,
    onError: (error: any, variables, context) => {
      showToast(
        error?.details?.message || error?.error || "Could not change your PIN",
        "error",
      );
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      showToast("Transaction PIN changed", "success");
      config?.onSuccess?.(data, variables, context);
    },
  });
};
