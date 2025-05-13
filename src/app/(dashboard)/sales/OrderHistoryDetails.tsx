import { CheckCircle } from "lucide-react";
import moment from "moment";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SalesOrder } from "./types";

import { formatToNaira } from "@/utils/formatMoney";
import Image from "next/image";

const OrderHistoryDetails = ({
  orderDetails,
}: {
  orderDetails: SalesOrder;
}) => {
  console.log("orderDetails", orderDetails);

  // Format the date using moment.js
  const formattedDate = moment(orderDetails.created_at).format(
    "MMMM DD, YYYY, h:mm A"
  );

  // Extract the order ID (last 6 characters)
  const shortOrderId = orderDetails.id.substring(0, 6);

  // Extract transaction ID (first 6 characters)
  const transactionId = orderDetails.id.substring(0, 6);
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
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-medium">#{shortOrderId}</p>
                  </div>
                  <div>
                    <p className="font-medium bg-white p-2 rounded ">
                      {orderDetails.payment_status?.toLocaleLowerCase()}
                    </p>
                  </div>
                </div>
                <p className="text-sm  text-gray-500 mt-2">{formattedDate}</p>
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

                  {orderDetails.products.map((product, index) => (
                    <div key={index}>
                      <div className="grid grid-cols-8 gap-2 items-center py-2">
                        <div className="col-span-4 flex items-center gap-2">
                          <div className="w-5 h-5 relative">
                            <Image
                              src={product?.image || "/api/placeholder/32/32"}
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
                          {product?.price?.toLocaleString() || ""}
                        </div>
                        <div className="col-span-2 text-right font-medium">
                          {(
                            JSON.parse(product?.price) * product?.quantity
                          ).toLocaleString() ||
                            (
                              JSON.parse(product.price) * product.quantity
                            ).toLocaleString()}
                        </div>
                      </div>
                      {index < orderDetails.products.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
                  ))}

                  <div className="grid grid-cols-8 gap-2 items-center pt-2 border-t">
                    <div className="col-span-6 font-medium">Total</div>
                    <div className="col-span-2 text-right font-medium">
                      {formatToNaira(parseFloat(orderDetails.total_price))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Store and Attendant section */}
            <Card className="m-4 border-0">
              <CardContent className="p-4">
                {/* <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 flex items-center justify-center bg-green-100 rounded-md">
                    <span className="text-green-600 text-xs">
                      <PersonStandingIcon />
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Supplier</p>
                    <p className="text-sm font-medium">
                      {orderDetails.supplier}
                    </p>
                  </div>
                </div> */}

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center bg-green-100 rounded-md">
                    <span className="text-green-600 text-xs">👤</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Attendant</p>
                    <p className="text-sm font-medium">
                      {orderDetails.attendant}
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
                        {/* {orderDetails?.status?.toLocaleLowerCase()} */}{" "}
                        Store
                      </span>
                      <CheckCircle className="text-green-500" size={12} />
                    </div>
                  </div>
                  <div className="w-full">
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium">{orderDetails.method}</p>

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

export default OrderHistoryDetails;
