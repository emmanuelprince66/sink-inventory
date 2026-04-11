import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

const fetchComboById = async (id: string) => {
  const response = await fetch(`/api/combo/${id}/single`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || "Error fetching combo");
    (error as any).status = response.status;
    throw error;
  }
  return response.json();
};

type QueryFnType = typeof fetchComboById;
type Options = QueryConfigType<QueryFnType>;

export const useFetchComboByIdQuery = (id: string, config?: Options) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: [queryKey.products.getComboById, id],
    queryFn: () => fetchComboById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    ...config,
  });
};
