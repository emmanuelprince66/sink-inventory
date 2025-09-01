import { Skeleton } from "@/components/ui/skeleton";
import moment from "moment";

const PaymentDetails = ({
  BankBreakDownAnalyticsLoading,
  BankBreakDownAnalytics,
}: {
  BankBreakDownAnalyticsLoading: boolean;
  BankBreakDownAnalytics: any;
}) => {
  return (
    <div className="p-3 sm:p-6 bg-white rounded-lg shadow-md">
      {BankBreakDownAnalyticsLoading || !BankBreakDownAnalytics ? (
        <div className="w-full">
          <div className="space-y-3 sm:space-y-4 w-full">
            <Skeleton className="h-8 sm:h-10 w-full bg-[#eef4ef]" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-12 sm:h-16 w-full bg-[#eef4ef]"
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
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
                {BankBreakDownAnalytics?.data?.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment?.attendant}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₦{payment?.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {moment(payment?.created_at).format("MMM DD, YYYY")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {BankBreakDownAnalytics?.data?.map((payment: any) => (
              <div
                key={payment.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow"
              >
                <div className="flex flex-col space-y-2">
                  {/* Attendant */}
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Attendant
                      </span>
                      <span className="text-sm font-medium text-gray-900 mt-1">
                        {payment?.attendant}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Amount
                      </span>
                      <div className="text-lg font-semibold text-green-600 mt-1">
                        ₦{payment?.amount?.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-gray-200 my-2"></div>

                  {/* Date */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Date
                    </span>
                    <span className="text-sm text-gray-600">
                      {moment(payment?.created_at).format("MMM DD, YYYY")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {BankBreakDownAnalytics?.data?.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No payment records found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentDetails;
