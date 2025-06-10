import { useGetAllSubscriptionsQuery } from "@/api/premium/get-all-subscriptions";
import { useGetPremiumQuery } from "@/api/premium/get-subscriptions-details";
import { useSubscribeUserMutation } from "@/api/premium/subscribe-user";
import { useRouter } from "next/navigation";
import { useToast } from "./toast/useToast";
import { useDebounce } from "./useDebounce";

export const usePremiumHook = ({
  searchInput,
  page,
}: {
  searchInput?: string;
  page?: number;
}) => {
  const { data: AllSubscriptionsData, isLoading: AllSubscriptionsLoading } =
    useGetAllSubscriptionsQuery();
  const router = useRouter();
  const { showToast } = useToast();

  const { mutate: subUser, isPending: subUserLoading } =
    useSubscribeUserMutation();

  const debouncedSearchTerm = useDebounce(searchInput || "", 500); // 500ms debounce
  const searchTerm =
    debouncedSearchTerm?.length >= 3 || debouncedSearchTerm?.length === 0
      ? debouncedSearchTerm
      : null;
  const { data: UserPlanData, isLoading: UserPlanDataLoading } =
    useGetPremiumQuery({
      params: {
        page,
        limit: 15,
        search: searchTerm,
        //   searchTerm
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  const handleSubUser = (data: any, selectedPeriod: any) => {
    console.log("data", data);
    console.log("selectedPeriod", selectedPeriod);

    const payload = {
      plan: data?.id,
      duration: selectedPeriod.toUpperCase(),
    };

    subUser(payload, {
      onSuccess: (data) => {
        try {
          // Validate the payment URL
          if (!data?.data?.payment_url) {
            throw new Error("No payment URL received");
          }

          const paymentUrl = new URL(data.data.payment_url);

          // Close modal if exists

          // Show success message
          // showToast(data.message, "success");

          // Redirect after short delay for UX
          setTimeout(() => {
            if (paymentUrl.hostname === window.location.hostname) {
              router.push(data.data.payment_url);
            } else {
              window.location.href = data.data.payment_url;
            }
          }, 1000);
        } catch (error) {
          console.error("Redirect error:", error);
          showToast("Failed to process payment", "error");
        }
      },
    });
  };
  return {
    AllSubscriptionsData,
    AllSubscriptionsLoading,
    subUserLoading,
    UserPlanData,
    handleSubUser,
    UserPlanDataLoading,
  };
};
