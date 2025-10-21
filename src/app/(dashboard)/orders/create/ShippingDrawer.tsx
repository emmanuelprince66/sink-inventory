import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Plus, Truck } from "lucide-react";
import { useState } from "react";
import CreateShippingMethod from "../../shipping/CreateShippingMethod";

interface ShippingData {
  id: string;
  location: string;
  amount: string;
  description: string;
  visible: boolean;
  created_at: string;
}

interface ShippingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShippingSelect: (shipping: {
    id: string;
    location: string;
    cost: number;
  }) => void;
  shippingData?: ShippingData[];
  isLoading?: boolean;
  onAddShipping?: () => void;
}

const ShippingDrawer = ({
  open,
  onOpenChange,
  onShippingSelect,
  shippingData = [],
  isLoading = false,
  onAddShipping,
}: ShippingDrawerProps) => {
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(
    null
  );
  const [openAddShippingModal, setOpenAddShippingModal] = useState(false);

  const handleShippingSelect = (shipping: ShippingData) => {
    setSelectedShippingId(shipping.id);
    onShippingSelect({
      id: shipping.id,
      location: shipping.location,
      cost: parseFloat(shipping.amount),
    });
    onOpenChange(false);
  };

  // Filter only visible shipping methods
  const visibleShippingMethods = shippingData.filter(
    (shipping) => shipping.visible
  );

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="bg-white border border-gray-200 flex flex-col w-full sm:max-w-md">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-xl font-semibold">
              Select Shipping Method
            </SheetTitle>
            <SheetDescription>
              Choose a shipping method for this order
            </SheetDescription>
          </SheetHeader>

          {/* Add Shipping Button */}
          <div className="w-full p-5">
            <Button
              onClick={() => setOpenAddShippingModal(true)}
              className="w-full h-12 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Shipping Method
            </Button>
          </div>

          {/* Shipping List */}
          <div className="flex-grow overflow-y-auto space-y-3 p-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-500">
                  Loading shipping methods...
                </div>
              </div>
            ) : visibleShippingMethods.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <Truck className="w-12 h-12 text-gray-300" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">
                    No shipping methods available
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Create a shipping method to get started
                  </p>
                </div>
              </div>
            ) : (
              visibleShippingMethods.map((shipping) => (
                <div
                  key={shipping.id}
                  onClick={() => handleShippingSelect(shipping)}
                  className={`
                  p-4 rounded-lg border border-gray-200 cursor-pointer transition-all
                  hover:border-green-300 hover:bg-green-50/50
            
                `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-base text-gray-900">
                          {shipping.location}
                        </h4>
                        <span className="text-base font-bold text-green-600">
                          ₦{parseFloat(shipping.amount).toLocaleString()}
                        </span>
                      </div>

                      {shipping.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {shipping.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Info */}
          {visibleShippingMethods.length > 0 && (
            <div className="border-t pt-4 mt-auto">
              <p className="text-xs text-gray-500 text-center">
                {visibleShippingMethods.length} shipping method
                {visibleShippingMethods.length !== 1 ? "s" : ""} available
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <CustomModal
        isOpen={openAddShippingModal}
        onClose={() => setOpenAddShippingModal(false)}
        trigger={false}
        title="Add Shipping"
      >
        <div className="w-full ">
          <CreateShippingMethod
            closeModal={() => setOpenAddShippingModal(false)}
          />
        </div>
      </CustomModal>
    </>
  );
};

export default ShippingDrawer;
