import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

export const getNotificationFunc = async (id: string) => {
  // console.log("useQuery:", useQuery); //
  const response = await fetch(`/api/notification/${id}`);
  if (!response.ok) throw new Error("Error fetching notification");
  return response.json();
};

type QueryFnType = typeof getNotificationFunc;

type options = QueryConfigType<QueryFnType>;

export const useGetNotificationQuery = (id: any, config?: options) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      else if (failureCount < 1) return true;
      else return false;
    },
    queryKey: [queryKey.notification.getNotification, id],
    queryFn: () => getNotificationFunc(id),
    staleTime: 1000 * 60 * 5,
    ...config,
  });
};
