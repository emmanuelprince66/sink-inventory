"use client";
import { CustomModal } from "@/components/app/CustomModal";
import { SearchInput } from "@/components/app/SearchInput";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllCategories } from "@/hooks/useGetAllCategories";
import { Edit } from "lucide-react";
import { useState } from "react";
import EditCategory from "./EditCategory";

const Categories = () => {
  const [searchInput, setSearchInput] = useState("");
  const [editModal, setEditModal] = useState(false);
  const closeEditModal = () => setEditModal(false);
  const [categoryObj, setCategoryObj] = useState({});

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
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Categories</h1>

      <div className="w-full md:w-1/2 mb-4 mt-4">
        <SearchInput
          placeholder="Search ..."
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

      {/* attendants Modal */}
      <CustomModal
        isOpen={editModal} // FIXED: Removed the negation
        onClose={closeEditModal}
        trigger={false}
        title="Edit Category"
      >
        <EditCategory categoryObj={categoryObj} />
      </CustomModal>
    </div>
  );
};

export default Categories;
