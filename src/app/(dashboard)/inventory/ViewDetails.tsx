import { Button } from "@/components/ui/button";
import { useInventoryHook } from "@/hooks/useInventoryHook";
import { ArrowUpRight, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";

const ViewDetails = ({
  data,
  closeModal,
}: {
  data: any;
  closeModal?: () => void;
}) => {
  const { handleDeleteProduct, deleting } = useInventoryHook({ closeModal });

  return (
    <div className="bg-[#FEFFFE] p-6 rounded-lg shadow-sm border border-gray-200 max-w-4xl mx-auto">
      <div className="flex flex-col gap-6">
        {/* Image Header */}
        <div className="flex justify-start">
          {data?.image && (
            <img
              src={data.image}
              alt={data.name}
              className="w-20 h-20 object-cover rounded-lg border border-gray-200 p-2 "
            />
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Item Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <DetailItem
                label="SKU"
                value={data?.id?.split("-")[0] || "N/A"}
              />
              <DetailItem label="Category" value={data?.category || "N/A"} />
              <DetailItem label="Stock" value="0" />
              <DetailItem label="Total Sold" value="0" />
              <DetailItem label="Low Stock Alert" value="0" />
              <DetailItem label="Expiry Date" value="N/A" />
            </div>
          </div>

          {/* Right Column - Pricing */}
          <div className="space-y-4 w-full">
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Purchase Price" value="N/A" />
              <DetailItem label="Discount" value="N/A" />
              <DetailItem
                label="Selling Price"
                value={`N${(data?.selling_price || data?.amount / 100).toFixed(
                  2
                )}`}
              />
              <DetailItem label="Total Stock Value" value="N/A" />
              <DetailItem label="Supplied by" value="N/A" spanFull />
            </div>

            {/* Restock History Button */}
          </div>

          <div className="flex gap-2  items-center w-full">
            <Link href={`/inventory/${data?.id}/restock`}>
              <button className="w-[10rem] cursor-pointer flex items-center justify-between mt-6 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                <span className="font-medium">Restock History</span>
                <ArrowUpRight size={18} className="text-gray-500" />
              </button>
            </Link>
            <Link href={`/inventory/${data?.id}/transfer-history`}>
              <button className="w-[10rem] cursor-pointer flex items-center justify-between mt-6 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                <span className="font-medium">Transfer History</span>
                <ArrowUpRight size={18} className="text-gray-500" />
              </button>
            </Link>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Link href={`/product/${data?.id}/edit-product`}>
            <Button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
              <Edit2 size={16} />
              Edit Details
            </Button>
          </Link>

          <Button
            disabled={deleting}
            onClick={() => handleDeleteProduct(data?.id, data?.type)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
          >
            <Trash2 size={16} />
            {deleting ? "Deleting..." : "Delete"}
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
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium mt-1">{value}</p>
  </div>
);

export default ViewDetails;
