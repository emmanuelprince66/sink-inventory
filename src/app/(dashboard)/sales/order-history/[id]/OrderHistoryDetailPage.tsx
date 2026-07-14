"use client";

import { useSelectedOrderStore } from "@/lib/store/useSelectedOrderStore";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { useRouter } from "next/navigation";
import OrderHistoryDetails from "../../OrderHistoryDetails";

const OrderHistoryDetailPage = ({ id }: { id: string }) => {
  const router = useRouter();
  const selectedOrder = useSelectedOrderStore((state) => state.selectedOrder);
  const selectedOrderBusiness = useSelectedOrderStore(
    (state) => state.selectedOrderBusiness,
  );

  const goBackToSales = () => router.push("/sales");

  // No fetch-by-id endpoint for order history — the order only exists here
  // if it was set when the row was clicked (see useSalesHook.handleOrderHistoryRowClick).
  // A cold/direct link to this URL won't have it.
  const hasOrder = selectedOrder && selectedOrder.id === id;

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 mr-4 px-3 py-2 rounded-lg border border-grey-5 text-sm font-bold text-grey-2 hover:bg-grey-6 hover:border-grey-4 cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <h1 className="text-xl ml-3 sm:text-2xl font-extrabold text-grey-1">
          Order Details
        </h1>
      </div>

      {hasOrder ? (
        <div className="bg-white rounded-2xl border border-grey-5 p-4 sm:p-6">
          <OrderHistoryDetails
            orderDetails={selectedOrder}
            business={selectedOrderBusiness}
            closeModal={goBackToSales}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-grey-5 p-10 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-grey-6 flex items-center justify-center">
            <FileQuestion className="h-5 w-5 text-grey-4" />
          </div>
          <p className="text-sm font-bold text-grey-1">
            No order details to show
          </p>
          <p className="text-xs text-grey-3 max-w-xs">
            This page only shows an order after you open it from the Order
            History table — open it from there instead of linking here
            directly.
          </p>
          <button
            onClick={goBackToSales}
            className="mt-2 px-4 py-2 rounded-lg bg-primary-green-300 text-white text-sm font-bold hover:bg-primary-green-300/90 cursor-pointer transition-colors"
          >
            Go to Sales
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryDetailPage;
