import { PackageSearch } from "lucide-react";

const NoRestockData = () => {
  return (
    <div className="flex flex-col items-center h-[60vh] justify-center w-full gap-4 text-center">
      <div className="w-16 h-16 rounded-full bg-grey-6 flex items-center justify-center">
        <PackageSearch className="h-8 w-8 text-grey-4" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-grey-1">
          No Restock History Data
        </h2>
        <p className="text-sm text-grey-3">
          Try different filters or adjust your search terms.
        </p>
      </div>
    </div>
  );
};

export default NoRestockData;
