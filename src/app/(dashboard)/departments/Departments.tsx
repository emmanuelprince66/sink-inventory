"use client";
import { CustomModal } from "@/components/app/CustomModal";
import { CustomTable } from "@/components/app/CutomTable";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import { useDepartment } from "@/hooks/useDepartment";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddDepartments from "./AddDepartments";
import { getDepartmentColumns } from "./column";

const Departments = () => {
  const [searchInput, setSearchInput] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const handleOpenCreateModal = () => setCreateModal(true);
  const handleCloseCreateModal = () => setCreateModal(false);

  const { DepartmentData, DepartmentDataLoading } = useDepartment({});

  const filteredDepartments = (DepartmentData?.data ?? []).filter((dept: any) =>
    dept.name.toLowerCase().includes(searchInput.toLowerCase()),
  );

  const columns = getDepartmentColumns();

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-base sm:text-lg font-extrabold text-grey-1">
          All Departments
        </h2>
        <Button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </Button>
      </div>

      <div className="w-full sm:w-80 mb-4">
        <SearchInput
          placeholder="Search departments..."
          value={searchInput}
          onValueChange={setSearchInput}
        />
        {searchInput.length > 0 && searchInput.length < 3 && (
          <div className="mt-1 text-xs text-grey-4">
            Type at least 3 characters to search
          </div>
        )}
      </div>

      <CustomTable
        columns={columns}
        data={filteredDepartments}
        loading={DepartmentDataLoading}
        noDataText="No departments found"
        showSerialNumber={false}
        bordered={false}
      />

      <CustomModal
        isOpen={createModal}
        onClose={handleCloseCreateModal}
        trigger={false}
        title="Add Department"
      >
        <AddDepartments closeModal={handleCloseCreateModal} />
      </CustomModal>
    </>
  );
};

export default Departments;
