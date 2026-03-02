"use client";
import { CustomModal } from "@/components/app/CustomModal";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDepartment } from "@/hooks/useDepartment";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import AddDepartments from "./AddDepartments";

const Departments = () => {
  const [searchInput, setSearchInput] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const handleOpenCreateModal = () => setCreateModal(true);
  const handleCloseCreateModal = () => setCreateModal(false);

  const { DepartmentData, DepartmentDataLoading } = useDepartment({});

  const filteredDepartments = (DepartmentData?.data ?? []).filter((dept: any) =>
    dept.name.toLowerCase().includes(searchInput.toLowerCase()),
  );

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">All Departments</h2>
        <Button onClick={handleOpenCreateModal}>Add Department</Button>
      </div>

      <div className="w-full md:w-1/2 mb-4">
        <SearchInput
          placeholder="Search departments..."
          value={searchInput}
          onValueChange={setSearchInput}
        />
        {searchInput.length > 0 && searchInput.length < 3 && (
          <div className="mt-1 text-sm text-muted-foreground">
            Type at least 3 characters to search
          </div>
        )}
      </div>

      {DepartmentDataLoading ? (
        <div className="space-y-1">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="p-2">
              <Skeleton className="h-14 w-full bg-[#eef4ef]" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-full">
                  Name
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((department: any) => (
                  <tr key={department.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {department.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex gap-2 items-center justify-end">
                        <button className="rounded p-1 cursor-pointer text-green-500 hover:bg-green-50 hover:text-green-700">
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button className="rounded p-1 cursor-pointer text-red-500 hover:bg-red-50 hover:text-red-700">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No departments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

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
