// hooks/usePresaleHook.ts
import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation, useQuery } from "@/lib/react-query";

// Fetch Presale Hook
interface FetchPresaleParams {
  businessId: string;
  code: string;
}

const fetchPresale = async ({ businessId, code }: FetchPresaleParams) => {
  const response = await fetch(
    `/api/sales/${businessId}/fetch-presale?code=${encodeURIComponent(code)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

export const useFetchPresaleQuery = (
  businessId: string | null,
  code: string | null,
  options?: any,
) => {
  return useQuery({
    queryKey: [queryKey.sales?.fetchPresaleDetails, businessId, code],
    queryFn: () => fetchPresale({ businessId: businessId!, code: code! }),
    enabled: !!businessId && !!code && options?.enabled !== false,
    ...options,
  });
};

// Create Presale Hook
interface CreatePresalePayload {
  products: Array<{
    id: string;
    quantity: number | string;
  }>;
}

interface CreatePresaleVariables {
  businessId: string;
  payload: CreatePresalePayload;
}

const createPresale = async (variables: CreatePresaleVariables) => {
  const { businessId, payload } = variables;

  const response = await fetch(`/api/sales/${businessId}/create-presale`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof createPresale;

interface UseCreatePresaleMutationOptions extends MutationConfig<QueryFnType> {
  businessId: string | null;
}

export const useCreatePresaleMutation = ({
  businessId,
  ...config
}: UseCreatePresaleMutationOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.sales?.createPresale, businessId],
    mutationFn: createPresale,
    retry: false,
    onError: (
      error: any,
      variables: CreatePresaleVariables,
      context: unknown,
    ) => {
      const errorMessage =
        error?.message || error?.error || "Error creating presale";

      showToast(errorMessage, "error");
      //   config?.onError?.(error, variables, context, undefined);
    },
    onSuccess: (
      data: any,
      variables: CreatePresaleVariables,
      context: unknown,
    ) => {
      showToast("Presale created successfully", "success");
      //   config?.onSuccess?.(data, variables, context,undefined);
    },
    ...config,
  });
};
