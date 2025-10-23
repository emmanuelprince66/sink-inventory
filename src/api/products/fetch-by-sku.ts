import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

export const fetchProductBySku = async (id: string) => {
  // console.log("useQuery:", useQuery); //
  const response = await fetch(`/api/p/${id}/sku`);
  if (!response.ok) throw new Error("Error fetching product data by SKU");
  return response.json();
};

type QueryFnType = typeof fetchProductBySku;

type options = QueryConfigType<QueryFnType>;

export const useFetchProductBySkuQuery = (id: any, config?: options) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      else if (failureCount < 1) return true;
      else return false;
    },
    queryKey: [queryKey.products.getAllSku, id],
    queryFn: () => fetchProductBySku(id),
    staleTime: 1000 * 60 * 5,
    ...config,
  });
};
