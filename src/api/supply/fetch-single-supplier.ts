import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

export const fetchSupplierById = async (id: string) => {
  // console.log("useQuery:", useQuery); //
  const response = await fetch(`/api/supplier/${id}/supplier-by-id`);
  if (!response.ok) throw new Error("Error fetching form data");
  return response.json();
};

type QueryFnType = typeof fetchSupplierById;

type options = QueryConfigType<QueryFnType>;

export const useFetchSupplierByIdQuery = (id: any, config?: options) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      else if (failureCount < 1) return true;
      else return false;
    },
    queryKey: [queryKey.supplier.getSingleSupplier, id],
    queryFn: () => fetchSupplierById(id),
    staleTime: 1000 * 60 * 5,
    ...config,
  });
};
