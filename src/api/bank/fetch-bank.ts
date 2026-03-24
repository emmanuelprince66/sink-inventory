import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { useEffect } from "react";
import { handleSubscriptionError } from "../sub/subscription-interceptor";

// ─── Typed API Error ──────────────────────────────────────────────────────────
export class ApiError extends Error {
  status: number;
  error: string;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.error = message;
    this.data = data;
  }
}

// ─── Fetch Function ───────────────────────────────────────────────────────────
export const fetchBank = async (id: string) => {
  const response = await fetch(`/api/bank/${id}/`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error || data?.message || "Error fetching bank data";
    throw new ApiError(message, response.status, data);
  }

  return data;
};

// ─── Query Hook ───────────────────────────────────────────────────────────────
type QueryFnType = typeof fetchBank;
type Options = QueryConfigType<QueryFnType>;

// Return type explicitly types error as ApiError so callers don't need casts
type UseFetchBankQueryResult = Omit<
  ReturnType<typeof useQuery<ExtractFnReturnType<QueryFnType>>>,
  "error"
> & {
  error: ApiError | null;
};

export const useFetchBankQuery = (
  id: any,
  config?: Options,
): UseFetchBankQueryResult => {
  const { showToast } = useToast();

  const query = useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([401, 402, 404].includes(error?.status)) return false;
      return failureCount < 1;
    },
    queryKey: [queryKey.bank.getAllBanks, id],
    queryFn: () => fetchBank(id),
    staleTime: 1000 * 60 * 5,
    ...config,
  });

  useEffect(() => {
    const error = query.error as ApiError | null;
    if (!error) return;

    const payload = error.status === 402 ? error.data : error;
    const isSubscriptionError = handleSubscriptionError(payload);

    if (!isSubscriptionError) {
      const errorMessage =
        error.message || error.error || "Error fetching bank data";
      showToast(errorMessage, "error");
    }
  }, [query.error]);

  return query as UseFetchBankQueryResult;
};
