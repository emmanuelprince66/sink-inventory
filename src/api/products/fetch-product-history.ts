import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { useLogoutMutation } from "../auth/logout-user";

export type ProductHistoryType = "WASTE" | "RETURN" | "DAMAGE";

export interface ProductHistoryItem {
  id: string;
  quantity: string;
  quantity_after: string;
  category: string;
  product: {
    name: string;
    unit: string;
  };
  value: string;
  type: ProductHistoryType;
  recorded_by: string;
  note: string;
  created_at: string;
}

export interface ProductHistoryResponse {
  links: {
    next: string | null;
    previous: string | null;
  };
  total: number;
  limit: number;
  pages: number;
  results: {
    value: number;
    count: number;
    data: ProductHistoryItem[];
  };
}

type FetchProductHistoryProps = {
  id: string;
  type: ProductHistoryType;
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  department?: string;
};

export const fetchProductHistory = async ({
  id,
  type,
  page,
  limit,
  start_date,
  end_date,
  department,
}: FetchProductHistoryProps) => {
  const url = new URL(
    `/api/products/${id}/product-history`,
    window.location.origin,
  );

  const params = new URLSearchParams();
  if (type) params.append("type", type);
  if (page) params.append("page", String(page));
  if (limit) params.append("limit", String(limit));
  if (start_date) params.append("start_date", start_date);
  if (end_date) params.append("end_date", end_date);
  if (department) params.append("department", department);

  url.search = params.toString();

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || "Error fetching product history data",
    );
    (error as any).type = response.type;
    (error as any).data = errorData;
    throw error;
  }

  return response.json();
};

type QueryFnType = typeof fetchProductHistory;

type UseFetchProductHistoryOptions = QueryConfigType<QueryFnType> & {
  params: FetchProductHistoryProps;
};

export const useFetchProductHistoryQuery = ({
  params,
  ...config
}: UseFetchProductHistoryOptions) => {
  const { mutate: logout, isPending } = useLogoutMutation({
    successMessage: "You are not authorized, please login again.",
    redirectPath: "/login?fromLogout=true",
  });

  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if (error.status === 401) {
        logout();
        console.log("isPending", isPending);
      }
      if ([404, 401].includes(error.type)) return false;
      return failureCount < 2;
    },
    queryKey: [queryKey.products.productHistory, params.id, params.type, params.page, params.limit, params.start_date, params.end_date, params.department],
    queryFn: () => fetchProductHistory(params),
    ...config,
  });
};
