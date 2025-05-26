"use client";
import { CustomModal } from "@/components/app/CustomModal";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalyticHook } from "@/hooks/useAnalyticHook";
import { useUserRole } from "@/lib/store/user-store";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import ShowAllAttendants from "../sales/ShowAllAttendants";
import CustomerAnalytics from "./CustomerAnalytics";
import ProductAnalytics from "./ProductAnalytics";
import SalesAnalytics from "./SalesAnalytics";
import SkeletonComp from "./SkeletonComp";

const Analytics = () => {
  const { user } = useUserRole();

  const AnalyticsOptionsTab =
    user?.role === "OWNER"
      ? (["Sales", "Products", "Customers"] as const)
      : (["Sales"] as const);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const [attendantId, setAttendantId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [ShowAttendants, setShowAttendants] = useState(false);
  const openAttendantsModal = () => setShowAttendants(true);
  const closeAttendantsModal = () => setShowAttendants(false);
  const [attendantsName, setAttendantsName] = useState("");

  const [activeTab, setActiveTab] = useState<
    "Sales" | "Products" | "Customers"
  >("Sales");

  const {
    SalesAnalyticLoading,
    AttendantsData,
    ProductAnalyticLoading,
    ProductAnalyticData,
    CustomerAnalyticData,
    CustomerAnalyticLoading,
    AttendantsLoading,
    SalesAnalyticData,
  } = useAnalyticHook({
    attendantId,
    dateRange,
    searchInput,
  });

  const handleClearAttendant = () => {
    setAttendantId("");
    setAttendantsName("");
  };

  const handleClickAttendants = (attendants: any) => {
    setAttendantId(attendants?.id);
    setAttendantsName(attendants?.name);
    closeAttendantsModal();
  };

  return (
    <div className="w-full h-full flex flex-col justify-start gap-5 items-start">
      <div className=" mx-auto w-full">
        {/* Date Range Picker */}
        <div className=" w-full flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Analytics Dashboard
          </h1>
          <div className="flex justify-end items-center gap-2">
            <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full ">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as typeof activeTab)}
            className="w-full mt-6 "
          >
            <TabsList className="w-[500px]">
              {AnalyticsOptionsTab.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className={`px-4 py-2  rounded-md h-14 min-w-[70px] text-sm hover:text-black font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-primary-green-300 text-white"
                      : "bg-primary-green-200 text-primary-black-100"
                  }`}
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="Sales" className="">
              {SalesAnalyticLoading ? (
                <SkeletonComp />
              ) : (
                <SalesAnalytics
                  openAttendantsModal={openAttendantsModal}
                  SalesAnalyticData={SalesAnalyticData}
                  attendantsName={attendantsName}
                  handleClearAttendant={handleClearAttendant}
                />
              )}
            </TabsContent>

            {user && user?.role === "OWNER" && (
              <TabsContent value="Products" className="p-6">
                {ProductAnalyticLoading ? (
                  <SkeletonComp />
                ) : (
                  <ProductAnalytics ProductAnalyticData={ProductAnalyticData} />
                )}
              </TabsContent>
            )}
            {user && user?.role === "OWNER" && (
              <TabsContent value="Customers" className="p-6">
                {CustomerAnalyticLoading ? (
                  <SkeletonComp />
                ) : (
                  <CustomerAnalytics
                    CustomerAnalyticData={CustomerAnalyticData}
                  />
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      <CustomModal
        isOpen={ShowAttendants} // FIXED: Removed the negation
        onClose={closeAttendantsModal}
        trigger={false}
        title="Store Attendants"
      >
        <ShowAllAttendants
          AttendantsData={AttendantsData}
          AttendantsLoading={AttendantsLoading}
          handleClickAttendants={handleClickAttendants}
        />
      </CustomModal>
    </div>
  );
};

export default Analytics;
