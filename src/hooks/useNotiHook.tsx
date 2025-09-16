import { useGetNotificationQuery } from "@/api/noti/get-notification";
import { useBusinessStore } from "@/lib/store/useBusinessStore";

export const useNotiHook = () => {
  const business_id = useBusinessStore((state) => state.business_id);

  const { data: NotificationData, isLoading: NotificationDataLoading } =
    useGetNotificationQuery(business_id, { enabled: !!business_id });

  console.log("NotificationData", NotificationData);
  return { NotificationData, NotificationDataLoading };
};
