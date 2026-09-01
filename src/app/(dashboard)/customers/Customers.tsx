"use client";
import { Download, Plus } from "lucide-react";

import { CustomModal } from "@/components/app/CustomModal";
import { StatCardSkeletonRow } from "@/components/app/StatCardSkeleton";
import { TableSkeleton } from "@/components/app/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerHook } from "@/hooks/useCustomerHook";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import { Spinner } from "@/components/app/Spinner";
import UserNotSubscribe from "@/components/app/UserNotSubscribe";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import AddCustomer from "./AddCustomer";
import AllCustomers from "./AllCustomers";

const tabSpinner = () => (
  <div className="w-full flex justify-center py-16">
    <Spinner className="text-primary-green-300" />
  </div>
);

// Growth tabs pull in chart.js, so they load on demand rather than in the
// initial Customers bundle.
const CustomerGrowthOverview = dynamic(
  () => import("./growth/CustomerGrowthOverview"),
  { ssr: false, loading: tabSpinner },
);
const CustomerGrowthAnalytics = dynamic(
  () => import("./growth/CustomerGrowthAnalytics"),
  { ssr: false, loading: tabSpinner },
);
const CustomerSegments = dynamic(() => import("./growth/CustomerSegments"), {
  ssr: false,
  loading: tabSpinner,
});
const LoyaltyPrograms = dynamic(() => import("./growth/LoyaltyPrograms"), {
  ssr: false,
  loading: tabSpinner,
});
const CustomerRewards = dynamic(() => import("./growth/CustomerRewards"), {
  ssr: false,
  loading: tabSpinner,
});
// AI Recommendations is hidden for now — the component and its screen are
// untouched, so restoring it is uncommenting here, in GROWTH_TABS, and in the
// panel switch below.
// const AIRecommendations = dynamic(() => import("./growth/AIRecommendations"), {
//   ssr: false,
//   loading: tabSpinner,
// });
const CustomerReferrals = dynamic(() => import("./growth/CustomerReferrals"), {
  ssr: false,
  loading: tabSpinner,
});

const GROWTH_TABS = [
  "Overview",
  "Customers",
  "Analytics",
  "Segments",
  "Loyalty Programs",
  "Rewards",
  // "AI Recommendations",
  "Referrals",
] as const;

type GrowthTab = (typeof GROWTH_TABS)[number];

// The tinted wallet/debt/customers KPI cards that lived here were removed —
// their figures now appear in the Wallet & Credit, Total Spend & Basket and
// Total Customers cards rendered by CustomerSummaryCards.

const Customers = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ?tab=Loyalty%20Programs — falls back to Overview for a missing or unknown
  // value, so a stale link can never render a blank screen.
  const tabParam = searchParams.get("tab") as GrowthTab | null;
  const activeTopTab: GrowthTab =
    tabParam && GROWTH_TABS.includes(tabParam) ? tabParam : "Overview";

  const setActiveTopTab = useCallback(
    (tab: GrowthTab) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      // replace, not push: flicking between tabs should not fill the history
      // stack, and Back should leave the Customers page entirely.
      router.replace(`/customers?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    undefined,
  );
  // Analytics tabs still key off a month; take it from the range start so the
  // single header control drives every tab.
  const month = useMemo(() => {
    const d = dateRange?.from ?? new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, [dateRange]);
  const [page, setPage] = useState(1);

  const [openAddCustomerModal, setOpenAddCustomerModal] = useState(false);
  const [showNotSubscribeModal, setShowNotSubscribeModal] = useState(false);
  const handleOpenNotSubscribeModal = () => setShowNotSubscribeModal(true);
  const handleCloseNotSubscribeModal = () => setShowNotSubscribeModal(false);

  const closeOpenCustomerModal = useCallback(() => {
    setOpenAddCustomerModal(false);
  }, []);

  const openCustomerModalFunc = useCallback(() => {
    setOpenAddCustomerModal(true);
  }, []);

  const {
    filterOptions,
    searchInput,
    CustomerData,
    CustomerLoading,
    handleRowClick,
    handleFilterChange,
    activeFilter,
    handleSearchChange,
    activeTier,
    setActiveTier,
    activeSegment,
    setActiveSegment,
  } = useCustomerHook({ handleOpenNotSubscribeModal, dateRange, page });

  // min-w-0: the tab panels below are flex items, which default to
  // min-width:auto and so refuse to shrink below their intrinsic content
  // width. The streak marquee track is width:max-content, and without this
  // that width propagates up and stretches the whole page sideways.
  return (
    <div className="w-full min-w-0 flex flex-col gap-6">
      {/* Header — title, month scope, and page actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-grey-1">
            Customers
          </h1>
          <p className="text-sm text-grey-3 mt-1">
            Customer Growth Platform — retention, loyalty &amp; lifetime value.
          </p>
        </div>

        {/* Mobile: the date picker takes its own full-width row and the two
            actions split the next one. From sm everything sits on one line,
            all at h-10 so the row reads as a single control strip. */}
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
          {/* One date control for the whole Customers screen. The list
              endpoint takes start_date/end_date; the analytics tabs take a
              YYYY-MM month, derived from the range start below. */}
          {/* DatePickerWithRange styles its own trigger and takes no height
              prop, so match the h-10 strip from here rather than changing the
              shared component for every other screen that uses it. */}
          <div className="w-full sm:w-56">
            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDateRange}
              className="w-full [&_button]:h-10 [&_button]:rounded-xl"
            />
          </div>

          <div className="flex gap-2">
            <Link href={"/customers/upload"} className="flex-1 sm:flex-none">
              <Button
                variant="outline"
                className="h-10 w-full gap-1.5 rounded-xl"
              >
                <Download className="w-4 h-4" />
                Import
              </Button>
            </Link>

            <Button
              className="h-10 flex-1 gap-1.5 rounded-xl sm:flex-none"
              onClick={openCustomerModalFunc}
            >
              <Plus className="w-4 h-4" />
              Add Customer
            </Button>
          </div>
        </div>
      </div>

      {/* Growth tabs */}
      <div className="border-b border-grey-5 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-6 min-w-max">
          {GROWTH_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTopTab(tab)}
              className={cn(
                "py-4 text-sm cursor-pointer font-bold border-b-2 transition-colors whitespace-nowrap",
                activeTopTab === tab
                  ? "border-primary-green-300 text-primary-green-300"
                  : "border-transparent text-grey-3 hover:text-grey-2",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTopTab === "Overview" && <CustomerGrowthOverview month={month} />}
      {activeTopTab === "Analytics" && <CustomerGrowthAnalytics month={month} />}
      {activeTopTab === "Segments" && <CustomerSegments />}
      {activeTopTab === "Loyalty Programs" && <LoyaltyPrograms />}
      {activeTopTab === "Rewards" && <CustomerRewards />}
      {/* {activeTopTab === "AI Recommendations" && <AIRecommendations />} */}
      {activeTopTab === "Referrals" && <CustomerReferrals />}

      {activeTopTab === "Customers" && (
        <>

      {CustomerLoading || !CustomerData ? (
        <>
          {/* Skeleton for cards */}
          <StatCardSkeletonRow
            count={3}
            gridClassName="w-full grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4"
          />

          {/* Skeleton for banner */}
          <Skeleton className="h-32 w-full rounded-2xl bg-grey-5" />

          {/* Skeleton for main card */}
          <div className="bg-white rounded-2xl border border-grey-5 overflow-hidden">
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex gap-2">
                {Array.from({ length: filterOptions.length }).map(
                  (_, index) => (
                    <Skeleton
                      key={index}
                      className="h-9 w-20 rounded-full bg-grey-5"
                    />
                  ),
                )}
              </div>
              <Skeleton className="h-10 w-full bg-grey-5" />
              <TableSkeleton
                rows={5}
                columns={[
                  { flex: true },
                  { width: "w-28", hiddenOnMobile: true },
                  { width: "w-24" },
                  { width: "w-24", hiddenOnMobile: true },
                  { width: "w-24", alignRight: true },
                  { width: "w-8" },
                ]}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* The tinted wallet/debt/customers KPI row that used to sit here was
              removed: the design puts these figures in the Wallet & Credit,
              Total Spend & Basket and Total Customers cards that
              CustomerSummaryCards renders inside AllCustomers, and showing both
              duplicated the same wallet, debt and count values twice on one
              screen. */}

          {/* The "Engage Your Customers" banner and the pill filter / date
              range / search toolbar were removed — neither appears in the
              Customers design. Search now lives in AllCustomers' own filter
              row, sitting between the summary cards and the table as its own
              block rather than inside the table's card. */}
          <AllCustomers
            customersData={CustomerData}
            handleRowClick={handleRowClick}
            customerLoading={CustomerLoading}
            setPage={setPage}
            page={page}
            search={searchInput}
            onSearchChange={handleSearchChange}
            statusOptions={filterOptions}
            activeStatus={activeFilter}
            onStatusChange={(value) =>
              handleFilterChange(value as (typeof filterOptions)[number])
            }
            activeTier={activeTier}
            onTierChange={setActiveTier}
            activeSegment={activeSegment}
            onSegmentChange={setActiveSegment}
          />
        </>
      )}
        </>
      )}

      {/* modal to add customer */}
      <CustomModal
        isOpen={openAddCustomerModal}
        onClose={closeOpenCustomerModal}
        trigger={false}
        title="Add Customer"
      >
        <div className="w-full ">
          {/* Nothing to add them to here, so an existing match opens their
              profile — which is where someone who reached for "Add Customer"
              and found one already on file was trying to get to. */}
          <AddCustomer
            handleOpenNotSubscribeModal={handleOpenNotSubscribeModal}
            closeOpenCustomerModal={closeOpenCustomerModal}
            onUseExisting={(customer: any) => {
              closeOpenCustomerModal();
              router.push(`/customers/${customer.id}`);
            }}
          />
        </div>
      </CustomModal>

      {/* modal for subscription notice */}
      <CustomModal
        isOpen={showNotSubscribeModal}
        onClose={handleCloseNotSubscribeModal}
        trigger={false}
        title="Subscription Details"
      >
        <div className="w-full ">
          <UserNotSubscribe />
        </div>
      </CustomModal>
    </div>
  );
};

export default Customers;
