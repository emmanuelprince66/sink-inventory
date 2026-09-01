import React from "react";

import { CheckCircle } from "lucide-react";
import moment from "moment";

import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatToNaira } from "@/utils/formatMoney";

import { CustomerHistoryData } from "../types";

const HistoryMoreDetails = ({
  historyDetailsData,
}: {
  historyDetailsData: CustomerHistoryData;
}) => {
  // Format the date using moment.js
  const formattedDate = moment(historyDetailsData.created_at).format(
    "MMMM DD, YYYY, h:mm A"
  );

  // Extract the order ID (last 6 characters)
  const shortOrderId = historyDetailsData.id.substring(0, 6);

  // Extract transaction ID (first 6 characters)
  const transactionId = historyDetailsData.id.substring(0, 6);

  return (
    <div className=" flex items-center justify-center">
      <div className="bg-white w-full max-w-full rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="overflow-y-auto flex-1">
          {/* Order ID and date section */}
          <Card className="m-4 bg-success-2 border-0">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-grey-3">Order ID</p>
                  <p className="font-bold text-grey-1">#{shortOrderId}</p>
                </div>
                <div className="text-right">
                  <span className="bg-info-2 text-info-1 px-3 py-1 rounded-full text-xs font-medium">
                    {historyDetailsData.payment_status}
                  </span>
                </div>
              </div>
              <p className="text-sm text-grey-3 mt-2">{formattedDate}</p>
            </CardContent>
          </Card>

          {/* Items section */}
          <Card className="m-4 border border-grey-5">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="grid grid-cols-8 gap-2 text-sm font-bold text-grey-3">
                  <div className="col-span-4">Item(s)</div>
                  <div className="col-span-1 text-center">Qty</div>
                  <div className="col-span-1 text-right">Price</div>
                  <div className="col-span-2 text-right">Sub-Total</div>
                </div>

                {historyDetailsData.products.map((product, index) => (
                  <div key={index}>
                    <div className="grid grid-cols-8 gap-2 items-center py-2">
                      <div className="col-span-4 flex items-center gap-2">
                        <div className="w-5 h-5 relative">
                          <Image
                            src={product.image || "/api/placeholder/32/32"}
                            alt={product.name}
                            width={22}
                            height={22}
                            className="rounded object-cover"
                          />
                        </div>
                        <span className="text-sm">{product.name}</span>
                      </div>
                      <div className="col-span-1 text-center">
                        {product.quantity}
                      </div>
                      <div className="col-span-1 text-right">
                        {formatToNaira(product.price)}
                      </div>
                      <div className="col-span-2 text-right font-medium">
                        {formatToNaira(product.price * product.quantity)}
                      </div>
                    </div>
                    {index < historyDetailsData.products.length - 1 && (
                      <Separator className="my-2" />
                    )}
                  </div>
                ))}

                <div className="grid grid-cols-8 gap-2 items-center pt-2 border-t border-grey-6">
                  <div className="col-span-6 font-bold text-grey-1">Total</div>
                  <div className="col-span-2 text-right font-bold text-grey-1">
                    {formatToNaira(
                      parseFloat(historyDetailsData.total_price)
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Store and Attendant section */}
          <Card className="m-4 border border-grey-5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 flex items-center justify-center bg-primary-green-300/10 rounded-md">
                  <span className="text-xs">🏪</span>
                </div>
                <div>
                  <p className="text-sm text-grey-3">Store</p>
                  <p className="text-sm font-bold text-grey-1">
                    {historyDetailsData.attendance}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center bg-primary-green-300/10 rounded-md">
                  <span className="text-xs">👤</span>
                </div>
                <div>
                  <p className="text-sm text-grey-3">Attendant</p>
                  <p className="text-sm font-bold text-grey-1">
                    {historyDetailsData.attendance}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method section */}
          <Card className="m-4 border border-grey-5">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-grey-3">Payment Method</p>
                  <p className="font-bold text-grey-1">{historyDetailsData.method}</p>

                  <p className="text-sm text-grey-3 mt-3">Transaction ID</p>
                  <p className="text-sm text-grey-2">#{transactionId}</p>
                </div>
                <div>
                  <CheckCircle className="text-success-1" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HistoryMoreDetails;
