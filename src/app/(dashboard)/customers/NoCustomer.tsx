import { UserSearch } from "lucide-react";

const NoCustomer = () => {
  return (
    <div className="w-full flex flex-col items-center text-center justify-center py-16 gap-4">
      <div className="w-16 h-16 rounded-full bg-grey-6 flex items-center justify-center">
        <UserSearch className="h-8 w-8 text-grey-4" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-grey-1">No Customer Found</h2>
        <p className="text-sm text-grey-3">Please add a customer.</p>
      </div>
    </div>
  );
};

export default NoCustomer;
