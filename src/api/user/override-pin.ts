import { useToast } from "@/hooks/toast/useToast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * The manager override PIN: typed at the till to approve one action a cashier
 * isn't allowed to do (a manual discount, reversing a sale). Separate from the
 * personal transaction PIN, because it's entered in front of staff and needs
 * changing on its own.
 */

const STATUS_KEY = ["override-pin-status"];

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

const unwrap = (body: any) => body?.data?.data ?? body?.data ?? body;

export const useOverridePinStatusQuery = (enabled = true) =>
  useQuery({
    queryKey: STATUS_KEY,
    queryFn: () => request("/api/user/override-pin/status"),
    enabled,
    staleTime: 60_000,
    select: (body) => ({
      hasPin: Boolean(unwrap(body)?.has_override_pin),
      eligible: Boolean(unwrap(body)?.eligible),
    }),
  });

const errorText = (error: any, fallback: string) =>
  error?.details?.message || error?.error || fallback;

export const useSetOverridePinMutation = (onDone?: () => void) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pin }: { pin: string }) =>
      request("/api/user/override-pin/set", { pin }),
    onError: (error) =>
      showToast(errorText(error, "Could not set your override PIN"), "error"),
    onSuccess: () => {
      showToast("Override PIN set", "success");
      queryClient.invalidateQueries({ queryKey: STATUS_KEY });
      onDone?.();
    },
  });
};

export const useChangeOverridePinMutation = (onDone?: () => void) => {
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (body: { old_pin: string; new_pin: string }) =>
      request("/api/user/override-pin/change", body),
    onError: (error) =>
      showToast(errorText(error, "Could not change your override PIN"), "error"),
    onSuccess: () => {
      showToast("Override PIN changed", "success");
      onDone?.();
    },
  });
};

/** Actions a manager's PIN can approve for someone else, per the backend. */
const OVERRIDABLE = new Set(["sales:discount", "sales:reverse"]);

/** The permission a 403 says is missing, or null if it isn't a permission 403. */
export const deniedPermission = (
  error: any,
): { module: string; action: string } | null => {
  const body = error?.details ?? error;
  if (body?.code !== "PERMISSION_DENIED" && error?.code !== "PERMISSION_DENIED") {
    return null;
  }
  const module = body?.module ?? error?.module;
  const action = body?.action ?? error?.action;
  return module && action ? { module, action } : null;
};

export const canBeOverridden = (error: any) => {
  const denied = deniedPermission(error);
  return Boolean(denied && OVERRIDABLE.has(`${denied.module}:${denied.action}`));
};

/** The manager's PIN was wrong, belongs to someone who can't approve, or too many tries. */
export const isOverridePinInvalid = (error: any) =>
  (error?.details ?? error)?.code === "OVERRIDE_PIN_INVALID" ||
  error?.code === "OVERRIDE_PIN_INVALID";
