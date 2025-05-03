import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

type CategoryProps = {
  id: string;
  type?: string;
};

export const fetchCategories = async ({ id, type = "" }: CategoryProps) => {
  // Safely construct URL with search params
  const url = new URL(`/api/categories/${id}`, window.location.origin);
  if (type) url.searchParams.append("type", type);

  const response = await fetch(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = new Error("Error categories  data");
    // Attach status code for retry logic
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
};

type QueryFnType = typeof fetchCategories;

type useGetCategoriesOption = QueryConfigType<QueryFnType> & {
  params: CategoryProps;
};

export const useGetCategoriesQuery = ({
  params,
  ...config
}: useGetCategoriesOption) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      return failureCount < 2;
    },
    // Include all parameters in the query key
    queryKey: [queryKey.categories.getAllCategories, params.id, params.type],
    queryFn: () => fetchCategories(params),
    ...config,
  });
};
