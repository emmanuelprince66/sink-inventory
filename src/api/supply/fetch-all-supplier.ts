import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

export const fetchSupplierData = async (id: string) => {
  console.log("eeee", id);
  const response = await fetch(`/api/supplier/${id}/`);
  if (!response.ok) throw new Error("Error fetching form data");
  return response.json();
};

type QueryFnType = typeof fetchSupplierData;

type options = QueryConfigType<QueryFnType>;

export const useFetchSupplierDataQuery = (id: any, config?: options) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      else if (failureCount < 1) return true;
      else return false;
    },
    queryKey: [queryKey.supplier.getAllSuppliers, id],
    queryFn: () => fetchSupplierData(id),
    ...config,
  });
};
