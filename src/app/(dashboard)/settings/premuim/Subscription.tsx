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
        <div className="flex justify-between mt-3 flex-col items-start gap-2 w-full">
          <p className="text-2xl md:text-3xl text-primary-black-100 font-[500]">
            Your Subscription
          </p>

          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-600">
              Manage your active plan or explore other options.
            </p>
          </div>
        </div>
      </div>

      <div className="flex  flex-col gap-3 md:flex-row w-full">
        {!AllSubscriptionsData || AllSubscriptionsLoading ? (
          <div className="flex gap-4 w-full mt-5">
            {Array.from({ length: 1 }).map((_, index) => (
              <CustomCard key={index} className="w-full border-gray-200">
                <div className="flex flex-col gap-6 items-start">
                  <Skeleton className="h-4 w-full bg-[#eef4ef]" />
                  <Skeleton className="h-6 w-[300px] bg-[#eef4ef]" />
                  <Skeleton className="h-6 w-[100px] bg-[#eef4ef]" />
                </div>
              </CustomCard>
            ))}
          </div>
        ) : (
          <CustomCard className="w-full h-[200px] mt-5 flex flex-col gap-4 justify-between p-1 bg-[#F6EDD9] border border-gray-200 rounded-lg shadow-sm">
            <div className="flex item-center justify-between w-full ">
              <div>
                <p className="text-lg font-semibold">Current Plan</p>
              </div>

              <div className="flex items-center gap-2 p-2  text-center bg-primary-green-300 text-white  rounded-[50px]">
                <CheckCircle className="w-3 h-3 text-white" color="white" />

                <p className="text-xs">Active</p>
              </div>
            </div>
            <div className="flex flex-col mt-3 items-start gap-4">
              <span className="flex items-end gap-1">
                <p className="text-[30px] font-bold">
                  {formatToNaira(AllSubscriptionsData?.amount)}
                </p>
                <p className="text-sm font-semibold pb-1">
                  / {AllSubscriptionsData?.duration?.toLowerCase()}
                </p>
              </span>

              <span className="flex items-center gap-1">
                <p className="text-sm">Renewal Date : </p>
                <p className="text-sm font-semibold">
                  {AllSubscriptionsData?.end_date}
                </p>
              </span>

              <Link href={"/plan"}>
                <Button className="bg-white text-black  hover:bg-gray-200">
                  <p className="text-xs">View Subscriptions</p>
                </Button>
              </Link>
            </div>
          </CustomCard>
        )}

        {!AllSubscriptionsData || AllSubscriptionsLoading ? (
          <div className="flex gap-4 w-full mt-5">
            {Array.from({ length: 1 }).map((_, index) => (
              <CustomCard key={index} className="w-full border-gray-200">
                <div className="flex flex-col gap-6 items-start">
                  <Skeleton className="h-4 w-full bg-[#eef4ef]" />
                  <Skeleton className="h-6 w-[300px] bg-[#eef4ef]" />
                  <Skeleton className="h-6 w-[100px] bg-[#eef4ef]" />
                </div>
              </CustomCard>
            ))}
          </div>
        ) : (
          <CustomCard className="w-full h-[200px] mt-5 flex flex-col gap-4 justify-between p-1 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex item-center justify-between w-full ">
              <div>
                <p className="text-lg font-semibold">Features</p>
              </div>
            </div>

            <div className="flex-col flex gap-2 items-start mt-4">
              <span className="flex items-center gap-1">
                <p className="text-sm text-gray-600">Users : </p>
                <p className="text-sm font-semibold text-gray-600">
                  {AllSubscriptionsData?.customer_count}
                </p>
              </span>
              <span className="flex items-center gap-1">
                <p className="text-sm text-gray-600">Businesses : </p>
                <p className="text-sm font-semibold text-gray-600">
                  {AllSubscriptionsData?.business_count || 0}
                </p>
              </span>
              <span className="flex items-center gap-1">
                <p className="text-sm text-gray-600">Attendants : </p>
                <p className="text-sm font-semibold text-gray-600">
                  {AllSubscriptionsData?.attendants || 0}
                </p>
              </span>
              <span className="flex items-center gap-1">
                <p className="text-sm text-gray-600">Inventory limit : </p>
                <p className="text-sm font-semibold">
                  {AllSubscriptionsData?.inventory_limit < 0 ? (
                    <Infinity className="w-5 h-5 text-gray-600" />
                  ) : (
                    ""
                  )}
                </p>
              </span>
              <span className="flex items-center gap-1">
                <p className="text-sm text-gray-600">Customer limit : </p>
                <p className="text-sm font-semibold">
                  {AllSubscriptionsData?.customer_limit < 0 ? (
                    <Infinity className="w-5 h-5 text-gray-600" />
                  ) : (
                    ""
                  )}
                </p>
              </span>
            </div>
          </CustomCard>
        )}
        {!AllSubscriptionsData || AllSubscriptionsLoading ? (
          <div className="flex gap-4 w-full mt-5">
            {Array.from({ length: 1 }).map((_, index) => (
              <CustomCard key={index} className="w-full border-gray-200">
                <div className="flex flex-col gap-6 items-start">
                  <Skeleton className="h-4 w-full bg-[#eef4ef]" />
                  <Skeleton className="h-6 w-[300px] bg-[#eef4ef]" />
                  <Skeleton className="h-6 w-[100px] bg-[#eef4ef]" />
                </div>
              </CustomCard>
            ))}
          </div>
        ) : (
          <CustomCard className="w-full h-[200px] mt-5 flex flex-col gap-4 justify-between p-1 bg-[#eef4ef] border border-gray-200 rounded-lg shadow-sm">
            <div className="flex item-center justify-between w-full ">
              <div>
                <p className="text-lg font-semibold">Usage Summary</p>
              </div>
            </div>

            <div className="w-full flex justify-between items-center mt-4">
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-primary-black-100">Inventory Used</p>

                <div className="bg-[#F6EDD9] p-2 flex justify-center items-center rounded-[50px] min-w-[120px]">
                  <span className="flex items-baseline gap-1">
                    <p className="font-bold text-primary-black-100">
                      {AllSubscriptionsData?.inventory_count}
                    </p>
                    <p className="flex items-center">
                      /{" "}
                      {AllSubscriptionsData?.inventory_limit < 0 ? (
                        <Infinity className="w-5 h-5 text-gray-600 mx-0.5" />
                      ) : (
                        AllSubscriptionsData?.inventory_limit
                      )}
                    </p>
                  </span>
                </div>
              </div>
              <div className="h-[100px] w-[2px] bg-gray-300"></div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-primary-black-100">Customer Added</p>

                <div className="bg-[#F6EDD9] p-2 flex justify-center items-center rounded-[50px] min-w-[120px]">
                  <span className="flex items-baseline gap-1">
                    <p className="font-bold text-primary-black-100">
                      {AllSubscriptionsData?.customer_count}
                    </p>
                    <p className="flex items-center">
                      /{" "}
                      {AllSubscriptionsData?.customer_limit < 0 ? (
                        <Infinity className="w-5 h-5 text-gray-600 mx-0.5" />
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
