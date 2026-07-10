import { PersonStandingIcon } from "lucide-react";
import moment from "moment";

import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { formatToNaira } from "@/utils/formatMoney";
import { SupplyHistory } from "../types";
const SupplyHistoryDetails = ({
  supplierDetails,
}: {
  supplierDetails: SupplyHistory;
}) => {
  console.log("supplierDetails", supplierDetails);

  // Format the date using moment.js
  const formattedDate = moment(supplierDetails.created_at).format(
    "MMMM DD, YYYY, h:mm A"
  );

  // Extract the order ID (last 6 characters)
  const shortOrderId = supplierDetails.id.substring(0, 6);

  // Extract transaction ID (first 6 characters)
  const transactionId = supplierDetails.id.substring(0, 6);
  return (
    <>
      <div className=" flex items-center justify-center">
        <div className="bg-white w-full max-w-full overflow-hidden max-h-[90vh] flex flex-col">
          <div className="overflow-y-auto flex-1">
            {/* Supply ID and date section */}
            <Card className="m-4 bg-secondary-6 border-0">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-grey-3">Supply ID</p>
                    <p className="font-bold text-grey-1">#{shortOrderId}</p>
                  </div>
                </div>
                <p className="text-sm text-grey-3 mt-2">{formattedDate}</p>
              </CardContent>
            </Card>

            {/* Items section */}
            <Card className="m-4 border-0">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-8 gap-2 text-sm text-grey-3">
                    <div className="col-span-4">Item(s)</div>
                    <div className="col-span-1 text-center">Qty</div>
                    <div className="col-span-1 text-right">Price</div>
                    <div className="col-span-2 text-right">Sub-Total</div>
                  </div>

                  <div>
                    <div className="grid grid-cols-8 gap-2 items-center py-2">
                      <div className="col-span-4 flex items-center gap-2">
                        <span className="text-sm text-grey-2">
                          {supplierDetails.name}
                        </span>
                      </div>
                      <div className="col-span-1 text-center text-grey-2">
                        {supplierDetails.quantity}
                      </div>
                      <div className="col-span-1 text-right text-grey-2">
                        {formatToNaira(supplierDetails.cost_price)}
                      </div>
                      <div className="col-span-2 text-right font-bold text-grey-1">
                        {(
                          supplierDetails.cost_price * supplierDetails.quantity
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-8 gap-2 items-center pt-2 border-t border-grey-5">
                    <div className="col-span-6 font-bold text-grey-1">
                      Total
                    </div>
                    <div className="col-span-2 text-right font-extrabold text-primary-green-300">
                      {formatToNaira(Number(supplierDetails.cost_price))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Store and Attendant section */}
            <Card className="m-4 border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 flex items-center justify-center bg-secondary-6 rounded-md">
                    <span className="text-primary-green-300 text-xs">
                      <PersonStandingIcon size={14} />
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-grey-3">Supplier</p>
                    <p className="text-sm font-bold text-grey-1">
                      {supplierDetails.supplier}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center bg-secondary-6 rounded-md">
                    <span className="text-primary-green-300 text-xs">👤</span>
                  </div>
                  <div>
                    <p className="text-sm text-grey-3">Attendant</p>
                    <p className="text-sm font-bold text-grey-1">
                      {supplierDetails.supplier}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status section */}
            <Card className="m-4 border-0">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-grey-3 mb-1">
                        Payment Status
                      </p>
                      <StatusBadge status={supplierDetails?.status} type="payment" />
                    </div>
                    {supplierDetails?.status !== "PAID" && (
                      <Button size="sm">Confirm Payment</Button>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-grey-3">Transaction ID</p>
                    <p className="text-sm font-bold text-grey-1">
                      #{transactionId}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default SupplyHistoryDetails;
