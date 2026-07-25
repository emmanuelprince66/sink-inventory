import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

type fetchSalesExpensesProps = {
  id: string;
  search?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
};

export const fetchExpenses = async ({
  id,
  search = "",
  start_date = "",
  end_date = "",
  category = "",
  page = 1,
  limit = 30,
}: fetchSalesExpensesProps) => {
  const url = new URL(`/api/expenses/${id}`, window.location.origin);

  if (search) url.searchParams.append("search", search);
  if (start_date) url.searchParams.append("start_date", start_date);
  if (end_date) url.searchParams.append("end_date", end_date);
  if (category) url.searchParams.append("category", category);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("limit", limit.toString());

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || "Error fetching  expenses data"
    );
    (error as any).type = response.type;
    (error as any).data = errorData;
    throw error;
  }

  return response.json();
};

type QueryFnType = typeof fetchExpenses;

type useFetchExpensesHistoryOptions = QueryConfigType<QueryFnType> & {
  params: fetchSalesExpensesProps;
};

export const useFetchExpensesQuery = ({
  params,
  ...config
}: useFetchExpensesHistoryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.type)) return false;
      return failureCount < 2;
    },
    queryKey: [
      queryKey.expenses.getAllExpenses,
      params.id,
      params.search,
      params.start_date,
      params.end_date,
      params.category,
      params.limit,
      params.page,
    ],
    queryFn: () => fetchExpenses(params),
    // staleTime: 1000 * 60 * 5, // 5 minutes
    ...config,
  });
};
