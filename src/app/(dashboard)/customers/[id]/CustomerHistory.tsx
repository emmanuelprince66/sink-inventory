import React from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { CustomerHistoryProps } from "../types";

import CustomerHistoryTable from "./CustomerHistoryTable";

const CustomerHistory = ({
  data,
  loading,
}: {
  data: CustomerHistoryProps;
  loading: boolean;
}) => {
  return (
    <div>
      {loading || !data ? (
        <div className="space-y-4 p-4 sm:p-6">
          <Skeleton className="h-10 w-full bg-grey-6" />
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full bg-grey-6 mt-2" />
          ))}
        </div>
      ) : (
        <CustomerHistoryTable data={data} loading={loading} />
      )}
    </div>
  );
};

export default CustomerHistory;
