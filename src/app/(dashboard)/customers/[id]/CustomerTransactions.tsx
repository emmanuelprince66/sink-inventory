import { Skeleton } from "@/components/ui/skeleton";

import { CustomerWalletTrxProps } from "../types";

import CustomerWalletTrxTable from "./CustomerWalletTrxTable";

export const CustomerTransactions = ({
  data,
  loading,
}: {
  data: CustomerWalletTrxProps;
  loading: boolean;
}) => {
  return (
    <div>
      <div>
        {loading || !data ? (
          <div className="space-y-4 p-4 sm:p-6">
            <Skeleton className="h-10 w-full bg-grey-5" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full bg-grey-5 mt-2" />
            ))}
          </div>
        ) : (
          <CustomerWalletTrxTable data={data} loading={loading} />
        )}
      </div>
    </div>
  );
};
