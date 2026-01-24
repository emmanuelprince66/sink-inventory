import { Button } from "@/components/ui/button";
import { useInventoryHook } from "@/hooks/useInventoryHook";
import { formatToNaira } from "@/utils/formatMoney";
import { ArrowUpRight, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";

const ViewDetails = ({
  data,
  closeModal,
}: {
  data: any;
  closeModal: () => void;
}) => {
  const { handleDeleteProduct, deleting } = useInventoryHook({ closeModal });

  // Check if product has variations
  const hasVariations = data?.variations && data.variations.length > 0;

  // Calculate price range for variations
  let sellingPriceDisplay = "N/A";
  if (hasVariations) {
    const prices = data.variations.map((v: any) => v.selling_price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      sellingPriceDisplay = formatToNaira(minPrice);
    } else {
      sellingPriceDisplay = `${formatToNaira(minPrice)} - ${formatToNaira(
        maxPrice
      )}`;
    }
  } else {
    // For products without variations
    const price = data?.selling_price || 0;
    sellingPriceDisplay = price > 0 ? formatToNaira(price) : "N/A";
  }

  return (
    <div className="bg-[#FEFFFE] p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 max-w-4xl mx-auto">
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Image Header */}
        <div className="flex justify-start">
          {data?.image && (
            <img
              src={data.image}
              alt={data.name}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-200 p-1 sm:p-2"
            />
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          {/* Left Column - Item Info */}
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <DetailItem
                label="SKU"
                value={data?.sku || data?.id?.split("-")[0] || "N/A"}
              />
              <DetailItem label="Category" value={data?.category || "N/A"} />
              <DetailItem label="Stock" value={data?.quantity || "0"} />
              <DetailItem label="Total Sold" value={data?.sold || "0"} />
              <DetailItem
                label="Low Stock Alert"
                value={data?.low_stock_threshold || "0"}
              />
              <DetailItem
                label="Expiry Date"
                value={data?.expiry_date || "N/A"}
              />
              <DetailItem label="Unit" value={data?.unit || "N/A"} />
              <DetailItem label="Product Type" value={data?.type || "N/A"} />
              {hasVariations && (
                <DetailItem
                  label="Variants"
                  value={`${data.variations.length} variants`}
                  spanFull
                />
              )}
            </div>
          </div>

          {/* Right Column - Pricing */}
          <div className="space-y-3 sm:space-y-4 w-full">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <DetailItem
                label="Purchase Price"
                value={
                  data?.cost_price ? formatToNaira(data.cost_price) : "N/A"
                }
              />
              <DetailItem
                label="Discount"
                value={data?.discount ? `${data.discount}%` : "N/A"}
              />
              <DetailItem label="Selling Price" value={sellingPriceDisplay} />
              <DetailItem
                label="Discount Threshold"
                value={
                  data?.discount_threshold
                    ? `${data.discount_threshold} units`
                    : "N/A"
                }
              />
              <DetailItem label="Total Stock Value" value="N/A" spanFull />
            </div>
          </div>

          {/* History Buttons - Stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full col-span-1 md:col-span-2">
            <Link
              href={`/inventory/${data?.id}/restock`}
              className="w-full sm:w-auto"
            >
              <button className="w-full sm:w-[10rem] cursor-pointer flex items-center justify-between p-2 sm:p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                <span className="font-medium text-xs">Restock History</span>
                <ArrowUpRight size={16} className="text-gray-500" />
              </button>
            </Link>
            <Link
              href={`/inventory/${data?.id}/transfer-history`}
              className="w-full sm:w-auto"
            >
              <button className="w-full sm:w-[10rem] cursor-pointer flex items-center justify-between p-2 sm:p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                <span className="font-medium text-xs">Transfer History</span>
                <ArrowUpRight size={16} className="text-gray-500" />
              </button>
            </Link>
            <Link
              href={`/inventory/${data?.id}/product-sold-history`}
              className="w-full sm:w-auto"
            >
              <button className="w-full sm:w-[10rem] cursor-pointer flex items-center justify-between p-2 sm:p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                <span className="font-medium text-xs">
                  Product Sold History
                </span>
                <ArrowUpRight size={16} className="text-gray-500" />
              </button>
            </Link>
          </div>
        </div>

        {/* Action Buttons - Stack on mobile */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-3 sm:pt-4 border-t">
          <Link
            href={`/new-add-product/${data?.id}/edit-product`}
            className="w-full sm:w-auto"
          >
            <Button className="w-full sm:w-auto flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
              <Edit2 size={14} className="sm:size-4" />
              <span className="text-sm sm:text-base">Edit Details</span>
            </Button>
          </Link>

          <Button
            disabled={deleting}
            onClick={() => handleDeleteProduct(data?.id, data?.type)}
            className="w-full sm:w-auto flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
          >
            <Trash2 size={14} className="sm:size-4" />
            <span className="text-sm sm:text-base">
              {deleting ? "Deleting..." : "Delete"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

// Reusable detail item component
const DetailItem = ({
  label,
  value,
  spanFull = false,
}: {
  label: string;
  value: string | number;
  spanFull?: boolean;
}) => (
  <div className={spanFull ? "col-span-2" : ""}>
    <p className="text-xs sm:text-sm text-gray-500">{label}</p>
    <p className="font-medium text-sm sm:text-base mt-0.5 sm:mt-1">{value}</p>
  </div>
);

export default ViewDetails;
