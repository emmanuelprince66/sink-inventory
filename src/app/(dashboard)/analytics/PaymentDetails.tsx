const PaymentDetails = () => {
  // Dummy data
  const payments = [
    {
      id: 1,
      timeDate: "2023-05-15 10:30 AM",
      amount: 125.5,
      attendant: "John Smith",
    },
    {
      id: 2,
      timeDate: "2023-05-15 11:45 AM",
      amount: 89.99,
      attendant: "Sarah Johnson",
    },
    {
      id: 3,
      timeDate: "2023-05-15 02:15 PM",
      amount: 220.0,
      attendant: "Michael Brown",
    },
    {
      id: 4,
      timeDate: "2023-05-16 09:20 AM",
      amount: 45.75,
      attendant: "Emily Davis",
    },
    {
      id: 5,
      timeDate: "2023-05-16 01:40 PM",
      amount: 175.25,
      attendant: "David Wilson",
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="overflow-x-auto">
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
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {payment.attendant}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${payment.amount.toFixed(2)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {payment.timeDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentDetails;
