import { CustomCard } from "@/components/app/CustomCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePremiumHook } from "@/hooks/usePremiumHook";
import { formatToNaira } from "@/utils/formatMoney";
import { CheckCircle, Infinity } from "lucide-react";
import Link from "next/link";
const Subscription = () => {
  const { AllSubscriptionsData, AllSubscriptionsLoading } = usePremiumHook({});
  console.log("AllSubscriptionsData", AllSubscriptionsData);

  return (
    <div className="w-full h-full flex flex-col justify-start gap-5 items-start">
      <div className="flex items-center justify-between w-full">
        <div className="flex justify-between flex-col items-start gap-2 w-full">
          <p className="text-xl sm:text-2xl font-extrabold text-grey-1">
            Your Subscription
          </p>

          <div className="flex items-center gap-2">
            <p className="text-sm text-grey-3">
              Manage your active plan or explore other options.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row w-full">
        {!AllSubscriptionsData || AllSubscriptionsLoading ? (
          <div className="flex gap-4 w-full">
            {Array.from({ length: 1 }).map((_, index) => (
              <CustomCard
                key={index}
                className="w-full h-[260px] rounded-2xl border-none bg-grey-6 p-0"
                contentClassName="p-4 sm:p-5 h-full flex flex-col justify-center gap-3"
              >
                <Skeleton className="h-4 w-full bg-grey-5" />
                <Skeleton className="h-6 w-[300px] bg-grey-5" />
                <Skeleton className="h-6 w-[100px] bg-grey-5" />
              </CustomCard>
            ))}
          </div>
        ) : (
          <CustomCard
            className="w-full h-[260px] rounded-2xl border-none bg-warning-2 p-0"
            contentClassName="p-4 sm:p-5 h-full flex flex-col gap-4 justify-between"
          >
            <div className="flex item-center justify-between w-full ">
              <div>
                <p className="text-lg font-extrabold text-grey-1">Current Plan</p>
              </div>

              <div className="flex items-center gap-2 p-2 text-center bg-primary-green-300 text-white rounded-[50px]">
                <CheckCircle className="w-3 h-3 text-white" color="white" />

                <p className="text-xs">Active</p>
              </div>
            </div>
            <div className="flex flex-col mt-3 items-start gap-4">
              <span className="flex items-end gap-1">
                <p className="text-[30px] font-extrabold text-grey-1">
                  {formatToNaira(AllSubscriptionsData?.amount)}
                </p>
                <p className="text-sm font-semibold text-grey-2 pb-1">
                  / {AllSubscriptionsData?.duration?.toLowerCase()}
                </p>
              </span>

              <span className="flex items-center gap-1">
                <p className="text-sm text-grey-2">Renewal Date : </p>
                <p className="text-sm font-semibold text-grey-1">
                  {AllSubscriptionsData?.end_date}
                </p>
              </span>

              <Link href={"/plan"}>
                <Button className="bg-white text-grey-1 hover:bg-grey-6">
                  <p className="text-xs">View Subscriptions</p>
                </Button>
              </Link>
            </div>
          </CustomCard>
        )}

        {!AllSubscriptionsData || AllSubscriptionsLoading ? (
          <div className="flex gap-4 w-full">
            {Array.from({ length: 1 }).map((_, index) => (
              <CustomCard
                key={index}
                className="w-full h-[260px] rounded-2xl border-none bg-grey-6 p-0"
                contentClassName="p-4 sm:p-5 h-full flex flex-col justify-center gap-3"
              >
                <Skeleton className="h-4 w-full bg-grey-5" />
                <Skeleton className="h-6 w-[300px] bg-grey-5" />
                <Skeleton className="h-6 w-[100px] bg-grey-5" />
              </CustomCard>
            ))}
          </div>
        ) : (
          <CustomCard
            className="w-full h-[260px] rounded-2xl border-none bg-grey-6 p-0"
            contentClassName="p-4 sm:p-5 h-full flex flex-col gap-4 justify-between"
          >
            <div className="flex item-center justify-between w-full ">
              <div>
                <p className="text-lg font-extrabold text-grey-1">Features</p>
              </div>
            </div>

            <div className="flex-col flex gap-2 items-start mt-4">
              <span className="flex items-center gap-1">
                <p className="text-sm text-grey-3">Users : </p>
                <p className="text-sm font-semibold text-grey-2">
                  {AllSubscriptionsData?.customer_count}
                </p>
              </span>
              <span className="flex items-center gap-1">
                <p className="text-sm text-grey-3">Businesses : </p>
                <p className="text-sm font-semibold text-grey-2">
                  {AllSubscriptionsData?.business_count || 0}
                </p>
              </span>
              <span className="flex items-center gap-1">
                <p className="text-sm text-grey-3">Attendants : </p>
                <p className="text-sm font-semibold text-grey-2">
                  {AllSubscriptionsData?.attendants || 0}
                </p>
              </span>
              <span className="flex items-center gap-1">
                <p className="text-sm text-grey-3">Inventory limit : </p>
                <p className="text-sm font-semibold text-grey-2 flex items-center">
                  {AllSubscriptionsData?.inventory_limit < 0 ? (
                    <Infinity className="w-4 h-4 text-grey-3" />
                  ) : (
                    AllSubscriptionsData?.inventory_limit
                  )}
                </p>
              </span>
              <span className="flex items-center gap-1">
                <p className="text-sm text-grey-3">Customer limit : </p>
                <p className="text-sm font-semibold text-grey-2 flex items-center">
                  {AllSubscriptionsData?.customer_limit < 0 ? (
                    <Infinity className="w-4 h-4 text-grey-3" />
                  ) : (
                    AllSubscriptionsData?.customer_limit
                  )}
                </p>
              </span>
            </div>
          </CustomCard>
        )}
        {!AllSubscriptionsData || AllSubscriptionsLoading ? (
          <div className="flex gap-4 w-full">
            {Array.from({ length: 1 }).map((_, index) => (
              <CustomCard
                key={index}
                className="w-full h-[260px] rounded-2xl border-none bg-grey-6 p-0"
                contentClassName="p-4 sm:p-5 h-full flex flex-col justify-center gap-3"
              >
                <Skeleton className="h-4 w-full bg-grey-5" />
                <Skeleton className="h-6 w-[300px] bg-grey-5" />
                <Skeleton className="h-6 w-[100px] bg-grey-5" />
              </CustomCard>
            ))}
          </div>
        ) : (
          <CustomCard
            className="w-full h-[260px] rounded-2xl border-none bg-secondary-6 p-0"
            contentClassName="p-4 sm:p-5 h-full flex flex-col gap-4 justify-between"
          >
            <div className="flex item-center justify-between w-full ">
              <div>
                <p className="text-lg font-extrabold text-grey-1">Usage Summary</p>
              </div>
            </div>

            <div className="w-full flex justify-between items-center mt-4">
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-grey-2">Inventory Used</p>

                <div className="bg-warning-2 p-2 flex justify-center items-center rounded-[50px] min-w-[120px]">
                  <span className="flex items-baseline gap-1">
                    <p className="font-bold text-grey-1">
                      {AllSubscriptionsData?.inventory_count}
                    </p>
                    <p className="flex items-center text-grey-2">
                      /{" "}
                      {AllSubscriptionsData?.inventory_limit < 0 ? (
                        <Infinity className="w-5 h-5 text-grey-3 mx-0.5" />
                      ) : (
                        AllSubscriptionsData?.inventory_limit
                      )}
                    </p>
                  </span>
                </div>
              </div>
              <div className="h-[100px] w-[2px] bg-grey-5"></div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-grey-2">Customer Added</p>

                <div className="bg-warning-2 p-2 flex justify-center items-center rounded-[50px] min-w-[120px]">
                  <span className="flex items-baseline gap-1">
                    <p className="font-bold text-grey-1">
                      {AllSubscriptionsData?.customer_count}
                    </p>
                    <p className="flex items-center text-grey-2">
                      /{" "}
                      {AllSubscriptionsData?.customer_limit < 0 ? (
                        <Infinity className="w-5 h-5 text-grey-3 mx-0.5" />
                      ) : (
                        AllSubscriptionsData?.customer_limit
                      )}
                    </p>
                  </span>
                </div>
              </div>
            </div>
          </CustomCard>
        )}
      </div>
    </div>
  );
};

export default Subscription;
