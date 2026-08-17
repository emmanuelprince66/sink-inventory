"use client";

import CustomerFilterBar from "./CustomerFilterBar";
import CustomerSummaryCards from "./CustomerSummaryCards";
import CustomerTable from "./CustomerTable";
import NoCustomer from "./NoCustomer";
import { ApiResponse, CustomerResponse } from "./types";

const AllCustomers = ({
  customersData,
  customerLoading,
  handleRowClick,
  setPage,
  page,
  search,
  onSearchChange,
  statusOptions,
  activeStatus,
  onStatusChange,
  activeTier,
  onTierChange,
  activeSegment,
  onSegmentChange,
}: {
  customersData: ApiResponse<CustomerResponse>;
  handleRowClick?: (row: any) => void; // Define the type of row if possible
  customerLoading?: boolean;
  setPage: (page: number) => void;
  page: number;
  search: string;
  onSearchChange: (value: string) => void;
  statusOptions: readonly string[];
  activeStatus: string;
  onStatusChange: (value: string) => void;
  activeTier: string;
  onTierChange: (value: string) => void;
  activeSegment: string;
  onSegmentChange: (value: string) => void;
}) => {
  const hasCustomers = (customersData?.data?.results?.data?.length ?? 0) > 0;

  const summary = customersData?.data?.results;
  const rows = summary?.data ?? [];

  return (
    <div className="w-full space-y-4">
      {/* Filters stay mounted even with no results — otherwise a search that
          matches nothing would remove the box used to clear it. */}
      <CustomerFilterBar
        search={search}
        onSearchChange={onSearchChange}
        statusOptions={statusOptions}
        activeStatus={activeStatus}
        onStatusChange={onStatusChange}
        activeTier={activeTier}
        onTierChange={onTierChange}
        activeSegment={activeSegment}
        onSegmentChange={onSegmentChange}
      />

      {hasCustomers && !customerLoading ? (
        <>
          <CustomerSummaryCards summary={summary} />

          {/* Count, legend and the table share one card, as in the design. */}
          <div className="w-full rounded-2xl border border-grey-5 bg-white overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-2 flex-wrap">
              <p className="text-xs text-grey-3">
                {rows.length} of {customersData?.data?.total ?? rows.length}{" "}
                customers
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-primary-green-300 bg-primary-green-500">
                  Active
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-warning-1 bg-warning-2">
                  At Risk
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-grey-3 bg-grey-6">
                  Inactive
                </span>
              </div>
            </div>

            <CustomerTable
              response={customersData}
              loading={false}
              setPage={setPage}
              page={page}
              handleRowClick={handleRowClick}
            />
          </div>

        </>
      ) : (
        <div className="w-full h-full flex flex-col justify-center items-center">
          <NoCustomer />
        </div>
      )}
    </div>
  );
};

export default AllCustomers;
