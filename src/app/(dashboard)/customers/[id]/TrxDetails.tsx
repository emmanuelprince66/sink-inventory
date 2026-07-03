import React from "react";

import { User, Wallet } from "lucide-react";
import moment from "moment";

import { CustomerWalletTrxData } from "../types";

const TrxDetails = ({
  walletTrxDetails,
}: {
  walletTrxDetails: CustomerWalletTrxData;
}) => {
  // Format the date using moment.js
  const formattedDate = moment(walletTrxDetails.created_at).format(
    "MMMM D, YYYY, h:mm A"
  );

  // Extract the transaction ID (first 6 characters)
  const shortTrxId = walletTrxDetails.id.substring(0, 6);

  return (
    <div className=" flex items-center justify-center ">
      <div className="bg-white w-full max-w-full rounded-lg  overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header with close button */}

        <div className="overflow-y-auto flex-1">
          {/* Transaction ID and date section */}
          <div className="m-4 p-4 bg-success-2 rounded-xl">
            <div className="mb-2">
              <p className="text-sm text-grey-3">Transaction ID</p>
              <p className="font-bold text-grey-1">#{shortTrxId}</p>
            </div>
            <p className="text-sm text-grey-3">{formattedDate}</p>
          </div>

          {/* Transaction details section */}
          <div className="m-4 p-4 bg-grey-6 rounded-xl">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-grey-3">Initial Balance</p>
                <p className="font-bold text-grey-1">
                  {walletTrxDetails.initial.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-grey-3">Amount Added</p>
                <p className="font-bold text-success-1">
                  {walletTrxDetails.amount.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-grey-3">Balance After</p>
                <p className="font-bold text-grey-1">
                  {walletTrxDetails.balance.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-grey-3">Note</p>
                <p className="font-medium text-grey-2">{walletTrxDetails.note || "-"}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-grey-3">Attendant</p>
                  <p className="font-bold text-grey-1">{walletTrxDetails.attendance}</p>
                </div>
                <div className="w-8 h-8 bg-primary-green-300/10 rounded-full flex items-center justify-center">
                  <User size={16} className="text-primary-green-300" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-grey-3">Payment Method</p>
                  <p className="font-bold text-grey-1 capitalize">
                    {walletTrxDetails.payment_method.toLowerCase()}
                  </p>
                </div>
                <div className="w-8 h-8 bg-primary-green-300/10 rounded-full flex items-center justify-center">
                  <Wallet size={16} className="text-primary-green-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrxDetails;
