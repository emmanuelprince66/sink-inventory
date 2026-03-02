"use client";
import { CustomModal } from "@/components/app/CustomModal";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllCategories } from "@/hooks/useGetAllCategories";
import { Edit } from "lucide-react";
import { useState } from "react";
import Departments from "../departments/Departments";
import AddCategory from "./AddCategory";
import EditCategory from "./EditCategory";

const Categories = () => {
  const [activeTab, setActiveTab] = useState("categories");
  const [searchInput, setSearchInput] = useState("");
  const [editModal, setEditModal] = useState(false);
  const closeEditModal = () => setEditModal(false);
  const [categoryObj, setCategoryObj] = useState({});

  const [createModal, setCreateModal] = useState(false);
  const handleOpenCreateModal = () => setCreateModal(true);
  const handleCloseCreateModal = () => setCreateModal(false);

  const { CategoriesData, CategoriesDataLoading } =
    useGetAllCategories(categoryObj);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };
  const handleOpenEditModal = (category: any) => {
    setEditModal(true);
    setCategoryObj(category);
  };

  return (
    <div className="container mx-auto px-4 ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Store Management</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("categories")}
            className={`${
              activeTab === "categories"
                ? "border-green-600 text-green-700 bg-green-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-all rounded-t-md`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab("departments")}
            className={`${
              activeTab === "departments"
                ? "border-green-600 text-green-700 bg-green-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-all rounded-t-md`}
          >
            Departments
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "categories" ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              All Categories
            </h2>
            <Button onClick={handleOpenCreateModal}>Add Category</Button>
          </div>

          <div className="w-full md:w-1/2 mb-4">
            <SearchInput
              placeholder="Search categories..."
              value={searchInput}
              onValueChange={handleSearchChange}
            />
            {searchInput.length > 0 && searchInput.length < 3 && (
              <div className="mt-1 text-sm text-muted-foreground">
                Type at least 3 characters to search
              </div>
            )}
          </div>

          {CategoriesDataLoading ? (
            // Loading skeleton
            <div className="space-y-1">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="p-2 ">
                  <Skeleton className="h-14 w-full   bg-[#eef4ef]" />
                </div>
              ))}
            </div>
          ) : (
            // Categories table
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {CategoriesData?.data?.map((category: any) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {category.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleOpenEditModal(category)}
                          className="cursor-pointer text-gray-500 hover:text-indigo-600 transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Edit Category Modal */}
          <CustomModal
            isOpen={editModal}
            onClose={closeEditModal}
            trigger={false}
            title="Edit Category"
          >
            <EditCategory
              type="PRODUCT"
              closeModal={closeEditModal}
              categoryObj={categoryObj}
            />
          </CustomModal>

          {/* Create Category Modal */}
          <CustomModal
            isOpen={createModal}
            onClose={handleCloseCreateModal}
            trigger={false}
            title="Create Category"
          >
            <AddCategory closeModal={handleCloseCreateModal} type="PRODUCT" />
          </CustomModal>
        </>
      ) : (
        <Departments />
      )}
    </div>
  );
};

export default Categories;
