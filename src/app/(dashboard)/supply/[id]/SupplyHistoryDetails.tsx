import { CheckCircle, PersonStandingIcon } from "lucide-react";
import moment from "moment";

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
        <div className="bg-white w-full max-w-full r overflow-hidden max-h-[90vh] flex flex-col">
          <div className="overflow-y-auto flex-1">
            {/* Order ID and date section */}
            <Card className="m-4 bg-green-50 border-0">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Suuply ID</p>
                    <p className="font-medium">#{shortOrderId}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">{formattedDate}</p>
              </CardContent>
            </Card>

            {/* Items section */}
            <Card className="m-4 border-0">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-8 gap-2 text-sm text-gray-500">
                    <div className="col-span-4">Item(s)</div>
                    <div className="col-span-1 text-center">Qty</div>
                    <div className="col-span-1 text-right">Price</div>
                    <div className="col-span-2 text-right">Sub-Total</div>
                  </div>

                  <div>
                    <div className="grid grid-cols-8 gap-2 items-center py-2">
                      <div className="col-span-4 flex items-center gap-2">
                        {/* <div className="w-5 h-5 relative">
                          <Image
                            src={"/api/placeholder/32/32"}
                            alt={""}
                            width={22}
                            height={22}
                            className="rounded object-cover"
                          />
                        </div> */}
                        <span className="text-sm">{supplierDetails.name}</span>
                      </div>
                      <div className="col-span-1 text-center">
                        {supplierDetails.quantity}
                      </div>
                      <div className="col-span-1 text-right">
                        {formatToNaira(supplierDetails.cost_price)}
                      </div>
                      <div className="col-span-2 text-right font-medium">
                        {(
                          supplierDetails.cost_price * supplierDetails.quantity
                        ).toLocaleString()}
                      </div>
                    </div>
                    {/* {index < historyDetailsData.products.length - 1 && (
                      <Separator className="my-2" />
                    )} */}
                  </div>

                  <div className="grid grid-cols-8 gap-2 items-center pt-2 border-t">
                    <div className="col-span-6 font-medium">Total</div>
                    <div className="col-span-2 text-right font-medium">
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
                  <div className="w-6 h-6 flex items-center justify-center bg-green-100 rounded-md">
                    <span className="text-green-600 text-xs">
                      <PersonStandingIcon />
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Supplier</p>
                    <p className="text-sm font-medium">
                      {supplierDetails.supplier}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center bg-green-100 rounded-md">
                    <span className="text-green-600 text-xs">👤</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Attendant</p>
                    <p className="text-sm font-medium">
                      {supplierDetails.supplier}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method section */}
            <Card className="m-4 border-0">
              <CardContent className="p-4 ">
                <div className="flex justify-start flex-col items-center w-full">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex gap-2 items-center">
                      <span className="text-primary-green-300 bg-primary-100 rounded ">
                        {supplierDetails?.status?.toLocaleLowerCase()}
                      </span>
                      <CheckCircle className="text-green-500" size={12} />
                    </div>
                    <Button>Confirm Payment</Button>
                  </div>
                  <div className="w-full">
                    <p className="text-sm text-gray-500">Payment Method</p>
                    {/* <p className="font-medium">{historyDetailsData.method}</p> */}

                    <p className="text-sm text-gray-500 mt-3">Transaction ID</p>
                    <p className="text-sm">#{transactionId}</p>
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
