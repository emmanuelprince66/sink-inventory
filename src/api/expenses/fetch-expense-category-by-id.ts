import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

export type FetchExpenseCategoryByIdParams = {
  id: string;
  categoryId: string;
  search?: string;
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  user?: string;
  status?: string;
};

export const fetchExpenseCategoryById = async ({
  id,
  categoryId,
  ...query
}: FetchExpenseCategoryByIdParams) => {
  const url = new URL(
    `/api/expenses/${id}/categories/${categoryId}`,
    window.location.origin,
  );
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString(), { method: "GET" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error fetching category details");
  }

  return response.json();
};

type QueryFnType = typeof fetchExpenseCategoryById;

type UseFetchExpenseCategoryByIdOptions = QueryConfigType<QueryFnType> & {
  params: FetchExpenseCategoryByIdParams;
};

export const useFetchExpenseCategoryByIdQuery = ({
  params,
  ...config
}: UseFetchExpenseCategoryByIdOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: [queryKey.expenses.getExpenseCategoryById, params],
    queryFn: () => fetchExpenseCategoryById(params),
    ...config,
  });
};
