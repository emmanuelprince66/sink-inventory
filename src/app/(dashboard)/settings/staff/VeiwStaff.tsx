import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAttendantsHook } from "@/hooks/useAttendantsHook";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import AddStaff from "./AddStaff";
const VeiwStaff = () => {
  const { AttendantsData, AttendantsLoading } = useAttendantsHook();

  const [openAddStaffModal, setOpenAddStaffModal] = useState(false);
  const closeAddStaffModalFunc = () => setOpenAddStaffModal(false);
  const openAddStaffModalFunc = () => setOpenAddStaffModal(true);
  return (
    <>
      <div className="flex h-full w-full mt-4 flex-col gap-3 items-center justify-center p-4">
        <div className="w-full flex justify-end">
          <Button onClick={openAddStaffModalFunc}>Add Staff</Button>
        </div>
        {AttendantsLoading ? (
          <div className="w-full  space-y-2">
            {[1, 2].map((item) => (
              <Skeleton key={item} className="h-12 w-full bg-[#eef4ef]" />
            ))}
          </div>
        ) : (
          <div className="w-full  overflow-hidden rounded-lg ">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    staff Name
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white w-full">
                {AttendantsData?.data?.map((staff: any) => (
                  <tr key={staff?.id}>
                    <td className="whitespace-nowrap px-6 py-4 w-full">
                      <div className="text-sm font-medium text-gray-900">
                        {staff?.name}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 w-full">
                      <button
                        onClick={() => {}}
                        className="rounded p-1 cursor-pointer text-red-500 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CustomModal
        isOpen={openAddStaffModal} // FIXED: Removed the negation
        onClose={closeAddStaffModalFunc}
        trigger={false}
        title="Add Staff"
      >
        <AddStaff />
      </CustomModal>
    </>
  );
};

export default VeiwStaff;
