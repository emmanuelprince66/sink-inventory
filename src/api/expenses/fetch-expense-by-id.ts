import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

export const FetchExpensesById = async (id: string) => {
  // console.log("useQuery:", useQuery); //
  const response = await fetch(`/api/expenses/${id}/single`);
  if (!response.ok) throw new Error("Error fetching form data");
  return response.json();
};

type QueryFnType = typeof FetchExpensesById;

type options = QueryConfigType<QueryFnType>;

export const useFetchExpensesByIdQuery = (id: any, config?: options) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      else if (failureCount < 1) return true;
      else return false;
    },
    queryKey: [queryKey.expenses.getExpenseById, id],
    queryFn: () => FetchExpensesById(id),
    staleTime: 1000 * 60 * 5,
    ...config,
  });
};
