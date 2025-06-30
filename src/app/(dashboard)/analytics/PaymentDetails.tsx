import { Skeleton } from "@/components/ui/skeleton";
import moment from "moment";

const PaymentDetails = ({
  BankBreakDownAnalyticsLoading,
  BankBreakDownAnalytics,
}: {
  BankBreakDownAnalyticsLoading: boolean;
  BankBreakDownAnalytics: any;
}) => {
  // Dummy data

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="overflow-x-auto">
        {BankBreakDownAnalyticsLoading || !BankBreakDownAnalytics ? (
          <div className="w-full">
            <div className="space-y-4 w-full">
              <Skeleton className="h-10 w-full bg-[#eef4ef]" />
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-16 w-full bg-[#eef4ef] mt-2"
                />
              ))}
            </div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Attendant
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>

                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Time/Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 w-full">
              <>
                {BankBreakDownAnalytics?.data?.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment?.attendant}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      N{payment?.amount}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {moment(payment?.created_at).format("YYYY-MM-DD")}
                    </td>
                  </tr>
                ))}
              </>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PaymentDetails;
