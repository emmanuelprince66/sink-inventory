"use client";
import { CustomCard } from "@/components/app/CustomCard";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePremiumHook } from "@/hooks/usePremiumHook";
import { formatToNaira } from "@/utils/formatMoney";
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

// Cycled by card position so each plan reads as visually distinct, matching
// the multi-color reference while staying within our own token palette.
const cardColorSchemes = [
  {
    border: "border-primary-green-300/40",
    bg: "bg-white",
    button: "bg-primary-green-300 hover:bg-primary-green-300/90 text-white",
  },
  {
    border: "border-warning-1/40",
    bg: "bg-warning-2/40",
    button: "bg-warning-1 hover:bg-warning-1/90 text-white",
  },
  {
    border: "border-success-1/40",
    bg: "bg-success-2/40",
    button: "bg-success-1 hover:bg-success-1/90 text-white",
  },
  {
    border: "border-primary-green-100/30",
    bg: "bg-white",
    button: "bg-primary-green-100 hover:bg-primary-green-100/90 text-white",
  },
];

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
    <div className="w-full">
      <div className="text-center mb-6 sm:mb-8">
        <p className="text-2xl sm:text-3xl font-extrabold text-grey-1">
          Choose the{" "}
          <span className="text-primary-green-300">Right Plan</span> For Your
          Business
        </p>
        <p className="text-grey-3 text-sm mt-1">
          Flexible plans designed to grow with your business.
        </p>
      </div>

      {/* Billing Period Tabs — segmented pill control, matches Customers/Campaigns switch */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <div className="bg-grey-6 p-1 rounded-full inline-flex">
          {[
            { key: "monthly" as BillingPeriod, label: "One-off" },
            { key: "quarterly" as BillingPeriod, label: "Quarterly" },
            { key: "biannually" as BillingPeriod, label: "Biannual" },
            { key: "annually" as BillingPeriod, label: "Annual" },
          ].map((period) => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key)}
              className={`px-4 sm:px-6 py-2 cursor-pointer rounded-full text-sm font-bold transition-all duration-200 ${
                selectedPeriod === period.key
                  ? "bg-primary-green-300 text-white shadow-sm"
                  : "text-grey-3 hover:text-grey-2"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Cards */}
      {!UserPlanData || UserPlanDataLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <CustomCard
              key={index}
              className="w-full h-[550px] rounded-2xl border-border-tint p-0"
              contentClassName="p-4 sm:p-5 h-full"
            >
              <div className="flex flex-col gap-4 items-start">
                <Skeleton className="h-4 w-full bg-grey-5" />
                <Skeleton className="h-8 w-2/3 bg-grey-5" />
                {Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full bg-grey-5" />
                ))}
              </div>
            </CustomCard>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {planData.map((plan, index) => {
            const scheme = cardColorSchemes[index % cardColorSchemes.length];
            return (
            <div
              key={plan.id}
              className={`h-[550px] flex flex-col ${scheme.bg} border ${scheme.border} rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow duration-200`}
            >
              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-sm font-bold text-grey-2 mb-2">
                  {plan.name}
                </h3>
                <div className="text-3xl font-extrabold text-grey-1">
                  {formatToNaira(plan[selectedPeriod])}
                  <span className="text-sm font-normal text-grey-3">
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
              <div className="space-y-3 flex-1 overflow-y-auto">
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
                          <Check className="h-4 w-4 text-success-1 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-warning-1 flex-shrink-0" />
                        )}
                        <span className="text-[11px] text-grey-2">
                          {getFeatureLabel(key)}
                        </span>
                      </div>
                      {!isBoolean && (
                        <span
                          className={`text-[10px] font-bold ${
                            isIncluded ? "text-grey-1" : "text-warning-1"
                          }`}
                        >
                          {displayValue}
                        </span>
                      )}
                      {!isIncluded && isBoolean && (
                        <span className="text-[10px] font-extrabold uppercase text-warning-1 bg-warning-2 px-2 py-0.5 rounded-full">
                          Coming soon
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Choose Plan Button */}
              <div className="mt-4 w-full">
                <Button
                  disabled={subUserLoading && loadingPlanId === plan.id}
                  onClick={() => handlePlanSelection(plan, selectedPeriod)}
                  className={`w-full ${scheme.button}`}
                >
                  {subUserLoading && loadingPlanId === plan.id ? (
                    <Spinner />
                  ) : (
                    "Choose Plan"
                  )}
                </Button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
