import { CustomModal } from "@/components/app/CustomModal";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAttendantsHook } from "@/hooks/useAttendantsHook";
import { useUserRole } from "@/lib/store/user-store";
import { Edit2Icon, Trash2 } from "lucide-react";
import { useState } from "react";
import AddStaff from "./AddStaff";
import EditStaff from "./EditStaff";
const VeiwStaff = () => {
  const [editStaffModal, setEditStaffModal] = useState(false);
  const closeEditStaffModal = () => setEditStaffModal(false);
  const openEditStaffModal = () => setEditStaffModal(true);
  const [deleteAttendantModal, setDeleteAttendantModal] = useState(false);
  const closeDeleteAttendantModal = () => setDeleteAttendantModal(false);
  const openDeleteAttendantModal = () => setDeleteAttendantModal(true);
  const {
    AttendantsData,
    AttendantsLoading,
    deleteAttendantLoading,
    handleDeleteAttendant,
  } = useAttendantsHook({
    closeModal: closeDeleteAttendantModal,
  });

  const [staffData, setStaffData] = useState<any>(null);

  const handleDeleteStaffModal = (staff: any) => {
    console.log("staffData----1", staff);
    setStaffData(staff);
    openDeleteAttendantModal();
  };

  const handleEditStaff = (staff: any) => {
    console.log("staffData----2", staff);
    setStaffData(staff);
    openEditStaffModal();
  };

  const deleteStaff = () => {
    console.log("staffData----4", staffData);
    handleDeleteAttendant(staffData);
  };

  console.log("staffData", staffData);

  const [openAddStaffModal, setOpenAddStaffModal] = useState(false);
  const closeAddStaffModalFunc = () => setOpenAddStaffModal(false);
  const openAddStaffModalFunc = () => setOpenAddStaffModal(true);
  const { user } = useUserRole();

  return (
    <>
      <div className="flex h-full w-full mt-4 flex-col gap-3 items-center justify-center p-4">
        <div className="w-full flex justify-end">
          {user && user?.role === "OWNER" && (
            <Button onClick={openAddStaffModalFunc}>Add Staff</Button>
          )}
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
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => {
                            handleEditStaff(staff);
                          }}
                          className="rounded p-1 cursor-pointer text-green-500 hover:bg-green-50 hover:text-green-700"
                        >
                          <Edit2Icon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteStaffModal(staff);
                          }}
                          className="rounded p-1 cursor-pointer text-red-500 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
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
        <AddStaff closeModal={closeAddStaffModalFunc} />
      </CustomModal>
      <CustomModal
        isOpen={deleteAttendantModal} // FIXED: Removed the negation
        onClose={closeDeleteAttendantModal}
        trigger={false}
        title=""
      >
        <div className="w-full flex-col items-center justify-center gap-3">
          <p className="text-center text-gray-700">
            Are you sure you want to delete this staff?
          </p>
          <div className="flex gap-4 mx-auto justify-center w-full mt-3">
            <Button
              disabled={deleteAttendantLoading}
              onClick={deleteStaff}
              className="w-[100px]"
            >
              {deleteAttendantLoading ? (
                <div className="flex items-center justify-center">
                  <Spinner />
                </div>
              ) : (
                "Confirm"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={closeDeleteAttendantModal}
              className="w-[100px]"
            >
              Cancel
            </Button>
          </div>
        </div>
      </CustomModal>
      <CustomModal
        isOpen={editStaffModal} // FIXED: Removed the negation
        onClose={closeEditStaffModal}
        trigger={false}
        title=""
      >
        <EditStaff staff={staffData} closeModal={closeEditStaffModal} />
      </CustomModal>
    </>
  );
};

export default VeiwStaff;
