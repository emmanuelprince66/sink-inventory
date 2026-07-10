import { CustomModal } from "@/components/app/CustomModal";
import { CustomTable } from "@/components/app/CutomTable";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { useAttendantsHook } from "@/hooks/useAttendantsHook";
import { useUserRole } from "@/lib/store/user-store";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddStaff from "./AddStaff";
import { getStaffColumns } from "./column";
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

  const columns = getStaffColumns({
    onManageBusinesses: handleManageBusinesses,
    onEdit: handleEditStaff,
    onDelete: handleDeleteStaffModal,
  });

  return (
    <>
      <div className="flex h-full w-full flex-col gap-3 items-start">
        <div className="w-full flex justify-end">
          {user &&
            (user?.role === "OWNER" || user?.role === "ADMIN-ATTENDANT") && (
              <Button
                onClick={openAddStaffModalFunc}
                className="flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add HR
              </Button>
            )}
        </div>

        <div className="w-full">
          <CustomTable
            columns={columns}
            data={AttendantsData?.data ?? []}
            loading={AttendantsLoading}
            noDataText="No staff found"
            showSerialNumber={false}
            bordered={false}
          />
        </div>
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
          <p className="text-center text-sm font-medium text-grey-2">
            Are you sure you want to delete this staff?
          </p>
          <div className="flex gap-4 mx-auto justify-center w-full mt-3">
            <Button
              variant="destructive"
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
