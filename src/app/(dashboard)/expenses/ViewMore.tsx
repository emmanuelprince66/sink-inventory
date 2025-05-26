import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import Link from "next/link";

const ViewMore = ({ expenses }: { expenses: any }) => {
  return (
    <>
      <div className="bg-[#FEFFFE] p-6 rounded-lg shadow-sm border w-full border-gray-200 max-w-4xl mx-auto">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-8 w-full">
          {/* Left Column - Item Info */}
          <div className="space-y-4 w-full">
            <div className="grid grid-cols-1 gap-4 w-full  p-1 ">
              <DetailItem
                label="Expense ID"
                value={expenses?.id?.split("-")[0] || "N/A"}
              />
              <DetailItem label="Name" value={expenses?.name || "N/A"} />
              <DetailItem
                label="Category"
                value={expenses?.category?.name || "N/A"}
              />
              <DetailItem label="Date" value={expenses?.date || "N/A"} />
              <DetailItem label="Note" value={expenses?.note || "N/A"} />
              <DetailItem label="Added By" value={expenses?.added_by} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Link href={`/expenses/${expenses?.id}`}>
            <Button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
              <Edit2 size={16} />
              Edit Expense
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};
const DetailItem = ({
  label,
  value,
  spanFull = false,
}: {
  label: string;
  value: string | number;
  spanFull?: boolean;
}) => (
  <div className={" flex w-full items-center gap-5"}>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium mt-1">{value}</p>
  </div>
);

export default ViewMore;
