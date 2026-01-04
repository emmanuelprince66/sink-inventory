"use client";
import { CustomModal } from "@/components/app/CustomModal";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalyticHook } from "@/hooks/useAnalyticHook";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useUserRole } from "@/lib/store/user-store";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import ShowAllAttendants from "../sales/ShowAllAttendants";
import CustomerAnalytics from "./CustomerAnalytics";
import { DownloadReportButton } from "./DownloadReportsButton";
import ProductAnalytics from "./ProductAnalytics";
import SalesAnalytics from "./SalesAnalytics";
import SkeletonComp from "./SkeletonComp";

const Analytics = () => {
  const { user } = useUserRole();
  const business_id = useBusinessStore((state) => state.business_id);

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

  // const { mutate: downloadReport, isPending: isDownloading } =
  //   useDownloadAnalyticsReport();

  const handleClearAttendant = () => {
    setAttendantId("");
    setAttendantsName("");
  };

  const handleClickAttendants = (attendants: any) => {
    setAttendantId(attendants?.id);
    setAttendantsName(attendants?.name);
    closeAttendantsModal();
  };

  // const handleDownloadReport = () => {
  //   if (!business_id) {
  //     return;
  //   }

  //   downloadReport({
  //     id: business_id,
  //     start_date: dateRange?.from
  //       ? moment(dateRange.from).format("YYYY-MM-DD")
  //       : undefined,
  //     end_date: dateRange?.to
  //       ? moment(dateRange.to).format("YYYY-MM-DD")
  //       : undefined,
  //     format: "csv",
  //   });
  // };

  return (
    <div className="w-full h-full flex flex-col justify-start gap-3 sm:gap-5 items-start px-2 sm:px-2 lg:px-0">
      <div className="w-full">
        {/* Header Section */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <p className="text-xl sm:text-2xl lg:text-3xl text-primary-black-100 font-medium">
            Analytics
          </p>
          <div className="grid grid-cols-1 sm:flex justify-end gap-2 sm:gap-3 w-full">
            <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />

            <DownloadReportButton
              business_id={business_id}
              dateRange={dateRange}
            />
            {/* <Button
              variant={"outline"}
              className="text-green-600 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base w-full sm:w-auto hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDownloadReport}
              disabled={isDownloading || !business_id}
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? "Downloading..." : "Download Report"}
            </Button> */}
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as typeof activeTab)}
            className="w-full mt-4 sm:mt-6"
          >
            {/* Responsive Tabs List */}
            <div className="mb-4 overflow-x-auto">
              <TabsList className="w-full min-w-[300px] sm:w-auto inline-flex">
                {AnalyticsOptionsTab.map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md h-10 sm:h-14 min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm hover:text-black font-medium transition-colors ${
                      activeTab === tab
                        ? "bg-primary-green-300 text-white"
                        : "bg-primary-green-200 text-primary-black-100"
                    }`}
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="w-full">
              <TabsContent value="Sales" className="mt-0">
                {SalesAnalyticLoading ? (
                  <SkeletonComp />
                ) : (
                  <div className="w-full overflow-hidden">
                    <SalesAnalytics
                      openAttendantsModal={openAttendantsModal}
                      SalesAnalyticData={SalesAnalyticData}
                      attendantsName={attendantsName}
                      handleClearAttendant={handleClearAttendant}
                      dateRange={dateRange}
                    />
                  </div>
                )}
              </TabsContent>

              {user && user?.role === "OWNER" && (
                <TabsContent value="Products" className="mt-0 p-3 sm:p-6">
                  {ProductAnalyticLoading ? (
                    <SkeletonComp />
                  ) : (
                    <div className="w-full overflow-hidden">
                      <ProductAnalytics
                        ProductAnalyticData={ProductAnalyticData}
                      />
                    </div>
                  )}
                </TabsContent>
              )}

              {user && user?.role === "OWNER" && (
                <TabsContent value="Customers" className="mt-0 p-3 sm:p-6">
                  {CustomerAnalyticLoading ? (
                    <SkeletonComp />
                  ) : (
                    <div className="w-full overflow-hidden">
                      <CustomerAnalytics
                        CustomerAnalyticData={CustomerAnalyticData}
                      />
                    </div>
                  )}
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>
      </div>

      {/* Modal */}
      <CustomModal
        isOpen={ShowAttendants}
        onClose={closeAttendantsModal}
        trigger={false}
        title="Store Attendants"
      >
        <div className="w-full max-h-[70vh] overflow-y-auto">
          <ShowAllAttendants
            AttendantsData={AttendantsData}
            AttendantsLoading={AttendantsLoading}
            handleClickAttendants={handleClickAttendants}
          />
        </div>
      </CustomModal>
    </div>
  );
};

export default Analytics;
