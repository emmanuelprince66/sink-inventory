import { CustomModal } from "@/components/app/CustomModal";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAttendantsHook } from "@/hooks/useAttendantsHook";
import { useUserRole } from "@/lib/store/user-store";
import { Building2, Edit2Icon, Trash2 } from "lucide-react";
import { useState } from "react";
import AddStaff from "./AddStaff";
import EditStaff from "./EditStaff";
import { ManageAttendantBusinessesModal } from "./ManageAttendantsBusinessModal";

const ViewStaff = () => {
  const [editStaffModal, setEditStaffModal] = useState(false);
  const closeEditStaffModal = () => setEditStaffModal(false);
  const openEditStaffModal = () => setEditStaffModal(true);

  const [deleteAttendantModal, setDeleteAttendantModal] = useState(false);
  const closeDeleteAttendantModal = () => setDeleteAttendantModal(false);
  const openDeleteAttendantModal = () => setDeleteAttendantModal(true);

  const [manageBusinessesModal, setManageBusinessesModal] = useState(false);
  const closeManageBusinessesModal = () => setManageBusinessesModal(false);
  const openManageBusinessesModal = () => setManageBusinessesModal(true);

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
    setStaffData(staff);
    openDeleteAttendantModal();
  };

  const handleEditStaff = (staff: any) => {
    setStaffData(staff);
    openEditStaffModal();
  };

  const handleManageBusinesses = (staff: any) => {
    setStaffData(staff);
    openManageBusinessesModal();
  };

  const deleteStaff = () => {
    handleDeleteAttendant(staffData);
  };

  const [openAddStaffModal, setOpenAddStaffModal] = useState(false);
  const closeAddStaffModalFunc = () => setOpenAddStaffModal(false);
  const openAddStaffModalFunc = () => setOpenAddStaffModal(true);

  const { user } = useUserRole();

  return (
    <>
      <div className="flex h-full w-full mt-4 flex-col gap-3 items-center justify-center">
        <div className="w-full flex justify-end">
          {user &&
            (user?.role === "OWNER" || user?.role === "ADMIN-ATTENDANT") && (
              <Button onClick={openAddStaffModalFunc}>Add HR</Button>
            )}
        </div>

        {AttendantsLoading ? (
          <div className="w-full space-y-2">
            {[1, 2].map((item) => (
              <Skeleton key={item} className="h-12 w-full bg-[#eef4ef]" />
            ))}
          </div>
        ) : (
          <div className="w-full overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Staff Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Businesses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white w-full">
                {AttendantsData?.data?.map((staff: any) => (
                  <tr key={staff?.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {staff?.name}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="text-xs font-medium bg-gray-100 text-gray-700 rounded-full px-2 py-1">
                        {staff?.role}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {staff?.businesses?.length > 0
                          ? staff.businesses.map((b: any) => b.name).join(", ")
                          : "—"}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex gap-2 items-center">
                        {/* Manage businesses */}
                        <button
                          onClick={() => handleManageBusinesses(staff)}
                          title="Manage Businesses"
                          className="rounded p-1 cursor-pointer text-blue-500 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Building2 className="h-5 w-5" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleEditStaff(staff)}
                          title="Edit Staff"
                          className="rounded p-1 cursor-pointer text-green-500 hover:bg-green-50 hover:text-green-700"
                        >
                          <Edit2Icon className="h-5 w-5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteStaffModal(staff)}
                          title="Delete Staff"
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

      {/* Add Staff Modal */}
      <CustomModal
        isOpen={openAddStaffModal}
        onClose={closeAddStaffModalFunc}
        trigger={false}
        title="Add HR"
      >
        <AddStaff closeModal={closeAddStaffModalFunc} />
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <CustomModal
        isOpen={deleteAttendantModal}
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

      {/* Edit Staff Modal */}
      <CustomModal
        isOpen={editStaffModal}
        onClose={closeEditStaffModal}
        trigger={false}
        title=""
      >
        {staffData && (
          <EditStaff
            attendantId={staffData.id}
            closeModal={closeEditStaffModal}
          />
        )}
      </CustomModal>

      {/* Manage Businesses Modal */}
      {staffData && (
        <ManageAttendantBusinessesModal
          isOpen={manageBusinessesModal}
          onClose={closeManageBusinessesModal}
          attendant={{
            id: staffData.id,
            name: staffData.name,
            role: staffData.role,
            businesses: staffData.businesses || [],
          }}
        />
      )}
    </>
  );
};

export default ViewStaff;
