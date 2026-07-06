import { PackageSearch } from "lucide-react";

const NoInventory = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] w-full gap-1 text-center">
      <div className="w-16 h-16 rounded-full bg-grey-6 flex items-center justify-center mb-4">
        <PackageSearch className="h-8 w-8 text-grey-4" />
      </div>
      <h2 className="text-base font-extrabold text-grey-1">
        No inventory matched your search.
      </h2>
      <p className="text-sm font-medium text-grey-4 max-w-xs">
        Try different filters or adjust your search terms.
      </p>
    </div>
  );
};

export default NoInventory;
