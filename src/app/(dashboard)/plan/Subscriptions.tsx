"use client";
import { CustomCard } from "@/components/app/CustomCard";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePremiumHook } from "@/hooks/usePremiumHook";
import { Check, X } from "lucide-react";
import { useState } from "react";

// Define the plan data type
interface PlanData {
  id: number;
  name: string;
  monthly: number;
  quarterly: number;
  biannually: number;
  annually: number;
  no_of_users: number;
  no_of_attendants: number;
  no_of_business: number;
  sales_count: number;
  invoice_count: number;
  inventory_count: number;
  customers_count: number;
  bulk_email: boolean;
  bulk_sms: boolean;
  in_store_checkout: boolean;
  store_front: boolean;
  track_income: boolean;
  bank_expenses_traking: boolean;
}

type BillingPeriod = "monthly" | "quarterly" | "biannually" | "annually";

const Subscriptions = () => {
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPeriod, setSelectedPeriod] =
    useState<BillingPeriod>("quarterly");
  const [loadingPlanId, setLoadingPlanId] = useState<number | null>(null);

  const { UserPlanData, UserPlanDataLoading, handleSubUser, subUserLoading } =
    usePremiumHook({
      searchInput,
      page,
    });

  console.log("UserPlanData", UserPlanData);
  console.log("selectedPeriod", selectedPeriod);

  const planData: PlanData[] = UserPlanData?.data?.results || [];

  // Function to map billing period to API format
  const mapPeriodToApiFormat = (period: BillingPeriod): string => {
    const periodMapping: { [key in BillingPeriod]: string } = {
      monthly: "MONTHLY",
      quarterly: "QUARTERLY",
      biannually: "BIANNUAL",
      annually: "ANNUAL",
    };
    return periodMapping[period];
  };

  // Modified handleSubUser function to track which plan is loading
  const handlePlanSelection = (plan: PlanData, period: BillingPeriod) => {
    setLoadingPlanId(plan.id);
    const apiPeriod = mapPeriodToApiFormat(period);
    handleSubUser(plan, apiPeriod);
  };

  // Function to format feature display
  const formatFeatureValue = (key: string, value: any) => {
    if (value === -1) return "Unlimited";
    if (value === 0 && key.includes("count")) return "0";
    if (typeof value === "boolean") return value;
    return value.toString();
  };

  // Function to get feature label
  const getFeatureLabel = (key: string) => {
    const labels: { [key: string]: string } = {
      no_of_users: "Users",
      no_of_attendants: "Attendants",
      no_of_business: "Businesses",
      sales_count: "Sales limit",
      invoice_count: "Invoice limit",
      inventory_count: "Inventory limit",
      customers_count: "Customer limit",
      bulk_email: "Bulk Email",
      bulk_sms: "Bulk SMS",
      in_store_checkout: "In-store Checkout",
      store_front: "Store Front",
      track_income: "Track Income",
      bank_expenses_traking: "Bank Expenses Tracking",
    };
    return labels[key] || key;
  };

  // Features to display
  const featureKeys = [
    "no_of_users",
    "no_of_attendants",
    "no_of_business",
    "sales_count",
    "invoice_count",
    "inventory_count",
    "customers_count",
    "bulk_email",
    "bulk_sms",
    "in_store_checkout",
    "store_front",
    "track_income",
    "bank_expenses_traking",
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <p className="text-3xl font-bold text-gray-900 ">Choose the</p>
        <p className="text-primary-green-300">Right Plan For Your Business</p>
        <p className="text-gray-600 text-xs">
          Flexible plans designed to grow with your business.
        </p>
      </div>

      {/* Billing Period Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-primary-green-200 p-1 rounded-lg inline-flex">
          {[
            { key: "monthly" as BillingPeriod, label: "One-off" },
            { key: "quarterly" as BillingPeriod, label: "Quarterly" },
            { key: "biannually" as BillingPeriod, label: "Biannual" },
            { key: "annually" as BillingPeriod, label: "Annual" },
          ].map((period) => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key)}
              className={`px-6 py-2 cursor-pointer rounded-md font-medium transition-all duration-200 ${
                selectedPeriod === period.key
                  ? "bg-primary-green-300 text-primary-green-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Cards */}

      {!UserPlanData || UserPlanDataLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <CustomCard
              key={index}
              className="w-full h-[550px] border-gray-200"
            >
              <div className="flex flex-col gap-6 items-start">
                <Skeleton className="h-4 w-full bg-[#eef4ef]" />
                <Skeleton className="h-4 w-full bg-[#eef4ef]" />
                <Skeleton className="h-4 w-full bg-[#eef4ef]" />
                <Skeleton className="h-4 w-full bg-[#eef4ef]" />
                <Skeleton className="h-4 w-full bg-[#eef4ef]" />
                <Skeleton className="h-4 w-full bg-[#eef4ef]" />
                <Skeleton className="h-4 w-full bg-[#eef4ef]" />
                <Skeleton className="h-4 w-full bg-[#eef4ef]" />
                <Skeleton className="h-4 w-full bg-[#eef4ef]" />
                <Skeleton className="h-4 w-full bg-[#eef4ef]" />
                <Skeleton className="h-4 w-full bg-[#eef4ef]" />
                <Skeleton className="h-4 w-full bg-[#eef4ef]" />
              </div>
            </CustomCard>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {planData.map((plan) => (
            <div
              key={plan.id}
              className="bg-primary-green-200 border border-primary-green-200 rounded-xl p-4 hover:shadow-lg transition-shadow duration-200"
            >
              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-sm font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="text-3xl font-bold text-primary-black-100">
                  ₦{plan[selectedPeriod].toLocaleString()}
                  <span className="text-sm font-normal text-gray-600">
                    {" "}
                    /{" "}
                    {selectedPeriod === "monthly"
                      ? "month"
                      : selectedPeriod === "biannually"
                      ? "6 months"
                      : selectedPeriod === "annually"
                      ? "year"
                      : selectedPeriod.replace("ly", "")}
                  </span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3">
                {featureKeys.map((key) => {
                  const value = plan[key as keyof PlanData];
                  const isBoolean = typeof value === "boolean";
                  const isIncluded = isBoolean ? value : value !== 0;
                  const displayValue = formatFeatureValue(key, value);

                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        {isIncluded ? (
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        )}
                        <span className="text-[11px] text-gray-700">
                          {getFeatureLabel(key)}
                        </span>
                      </div>
                      {!isBoolean && (
                        <span
                          className={`text-[10px] font-medium ${
                            isIncluded ? "text-gray-900" : "text-yellow-600"
                          }`}
                        >
                          {displayValue}
                        </span>
                      )}
                      {!isIncluded && isBoolean && (
                        <span className="text-[10px] text-yellow-600 bg-yellow-100 px-2 py-[2px] rounded">
                          Coming soon
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Choose Plan Button */}
              <div className="mt-8 w-full ">
                <Button
                  disabled={subUserLoading && loadingPlanId === plan.id}
                  onClick={() => handlePlanSelection(plan, selectedPeriod)}
                  className="w-full  hover:bg-primary-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  {subUserLoading && loadingPlanId === plan.id ? (
                    <Spinner />
                  ) : (
                    "Choose Plan"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
