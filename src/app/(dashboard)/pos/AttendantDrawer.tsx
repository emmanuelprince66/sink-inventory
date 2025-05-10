"use client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton"; // Make sure to import Skeleton
import { useCheckoutHook } from "@/hooks/useCheckoutHook";

const AttendantDrawer = ({ open, onOpenChange, onAttendantSelect }: any) => {
  const { AttendantsData, AttendantsLoading } = useCheckoutHook({});

  console.log("AttendantsData", AttendantsData);

  const handleSelectAttendant = (Attendant: any) => {
    onAttendantSelect(Attendant);
    onOpenChange(false); // Close the drawer after selection
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="bg-white border border-gray-200">
          <SheetHeader>
            <SheetTitle>Select Attendant</SheetTitle>
            <SheetDescription>Choose an existing Attendant</SheetDescription>
          </SheetHeader>

          <div className="mt-2 space-y-4">
            {AttendantsLoading ? (
              // Show skeleton loading states
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-3 space-y-2">
                  <Skeleton className="bg-[#eef4ef] h-6 w-3/4" />
                  <Skeleton className="bg-[#eef4ef] h-4 w-1/2" />
                </div>
              ))
            ) : AttendantsData?.data?.length > 0 ? (
              // Show actual Attendant data when loaded
              AttendantsData.data?.map((Attendant: any) => (
                <div
                  key={Attendant.id}
                  className="m-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 border-gray-200 hover:border-[#52b661] transition-colors"
                  onClick={() => handleSelectAttendant(Attendant)}
                >
                  <h3 className="font-medium">{Attendant.name}</h3>
                </div>
              ))
            ) : (
              <div>No Attendants found</div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AttendantDrawer;
