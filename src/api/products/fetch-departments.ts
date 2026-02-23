import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

export const fetchDepartments = async (id: string) => {
  // console.log("useQuery:", useQuery); //
  const response = await fetch(`/api/products/${id}/departments`);
  if (!response.ok) throw new Error("Error fetching product department data ");
  return response.json();
};

type QueryFnType = typeof fetchDepartments;

type options = QueryConfigType<QueryFnType>;

export const useFetchDepartmentsQuery = (id: any, config?: options) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      else if (failureCount < 1) return true;
      else return false;
    },
    queryKey: [queryKey.products.getAllDepartments, id],
    queryFn: () => fetchDepartments(id),
    staleTime: 1000 * 60 * 5,
    ...config,
  });
};
