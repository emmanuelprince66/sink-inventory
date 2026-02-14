"use client";
import { CustomModal } from "@/components/app/CustomModal";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import AddDepartments from "./AddDepartments";

// Dummy department data
const DUMMY_DEPARTMENTS = [
  {
    id: 1,
    name: "Supermarket",
    description: "General groceries and household items",
    itemCount: 1250,
  },
  {
    id: 2,
    name: "Pharmacy",
    description: "Medications and health products",
    itemCount: 450,
  },
  {
    id: 3,
    name: "Bakery",
    description: "Fresh bread, pastries and baked goods",
    itemCount: 85,
  },
  {
    id: 4,
    name: "Fashion",
    description: "Clothing, shoes and accessories",
    itemCount: 650,
  },
];

const Departments = () => {
  const [searchInput, setSearchInput] = useState("");
  const [departments] = useState(DUMMY_DEPARTMENTS);
  const [createModal, setCreateModal] = useState(false);

  const handleOpenCreateModal = () => setCreateModal(true);
  const handleCloseCreateModal = () => setCreateModal(false);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const filteredDepartments = departments.filter((dept) =>
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
          onValueChange={handleSearchChange}
        />
        {searchInput.length > 0 && searchInput.length < 3 && (
          <div className="mt-1 text-sm text-muted-foreground">
            Type at least 3 characters to search
          </div>
        )}
      </div>

      {/* Departments table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDepartments.length > 0 ? (
              filteredDepartments.map((department) => (
                <tr key={department.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {department.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {department.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {department.itemCount} items
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-3">
                      <button className="cursor-pointer text-gray-500 hover:text-indigo-600 transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button className="cursor-pointer text-gray-500 hover:text-red-600 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No departments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Department Modal */}
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
