"use client";

import DataGapBadge from "@/components/app/DataGapBadge";
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
      />

      {hasCustomers && !customerLoading ? (
        <>
          <CustomerSummaryCards summary={summary} customers={rows} />

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

          {/* Gender, Tier, Points, Last Purchase, Visits, Risk, Score and
              Status render as em-dashes — the payload carries none of them,
              even though tier and status can be filtered on. */}
          <div className="flex items-center gap-2 flex-wrap">
            <DataGapBadge
              label="Missing columns"
              needs="GET /customer/{business_id}/ — the customer payload returns only name, phone, email, wallet, sales_count, total_sales and addresses. The Customers table design also needs these per customer: gender, loyalty tier, points, last_purchase_at, visits, risk level and retention score. Note tier and status are already accepted as filters, so the values exist server-side — they just aren't returned on each row."
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
