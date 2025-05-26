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
          <div className="space-y-4">
            <Skeleton className="h-10 w-full bg-[#eef4ef]" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full bg-[#eef4ef] mt-2" />
            ))}
          </div>
        ) : (
          <CustomerWalletTrxTable data={data} loading={loading} />
        )}
      </div>
    </div>
  );
};
