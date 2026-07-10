"use client";
import { CustomModal } from "@/components/app/CustomModal";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllCategories } from "@/hooks/useGetAllCategories";
import { Edit, Trash } from "lucide-react";
import { useState } from "react";
import AddCategory from "../AddCategory";
import DeleteCategory from "../DeleteCategory";
import EditExpensesCategory from "./EditExpensesCategory";

const Expenses = () => {
  const [searchInput, setSearchInput] = useState("");
  const [editModal, setEditModal] = useState(false);

  const [createModal, setCreateModal] = useState(false);
  const handleOpenCreateModal = () => setCreateModal(true);
  const handleCloseCreateModal = () => setCreateModal(false);

  const closeEditModal = () => setEditModal(false);
  const [categoryObj, setCategoryObj] = useState({});

  // Delete-category state
  const [deleteModal, setDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
  }>({ id: "", name: "" });

  const { ExpensesCategoriesData, ExpensesCategoriesDataLoading } =
    useGetAllCategories(categoryObj);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };
  const handleOpenEditModal = (category: any) => {
    setEditModal(true);
    setCategoryObj(category);
  };

  const handleDeleteExpenses = (category: any) => {
    setCategoryToDelete({ id: category.id, name: category.name });
    setDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal(false);
    setCategoryToDelete({ id: "", name: "" });
  };

  // Delete mutation invalidates the categories query, so the list refreshes
  // automatically. Kept as a hook in case we want to add a toast / focus jump.
  const handleDeleteSuccess = () => {};

  return (
    <div className="container mx-auto px-4 ">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Categories</h1>
        <Button onClick={handleOpenCreateModal} className="">
          Add Category
        </Button>
      </div>

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

      {ExpensesCategoriesDataLoading ? (
        // Loading skeleton
        <div className="space-y-1">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="p-2 ">
              <Skeleton className="h-14 w-full   bg-grey-5" />
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
              {ExpensesCategoriesData?.data?.map((category: any) => (
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
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleOpenEditModal(category)}
                        className="cursor-pointer text-gray-500 hover:text-indigo-600 transition-colors"
                        aria-label="Edit category"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpenses(category)}
                        className="cursor-pointer text-red-500 hover:text-red-600 transition-colors"
                        aria-label="Delete category"
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CustomModal
        isOpen={deleteModal}
        onClose={handleCloseDeleteModal}
        trigger={false}
        title="Delete Category"
      >
        <DeleteCategory
          categoryId={categoryToDelete.id}
          categoryName={categoryToDelete.name}
          closeModal={handleCloseDeleteModal}
          onDeleteSuccess={handleDeleteSuccess}
        />
      </CustomModal>

      {/* attendants Modal */}
      <CustomModal
        isOpen={editModal} // FIXED: Removed the negation
        onClose={closeEditModal}
        trigger={false}
        title="Edit Category"
      >
        <EditExpensesCategory
          closeModal={closeEditModal}
          type="EXPENSES"
          categoryObj={categoryObj}
        />
      </CustomModal>
      {/* attendants Modal */}
      <CustomModal
        isOpen={createModal} // FIXED: Removed the negation
        onClose={handleCloseCreateModal}
        trigger={false}
        title="Create Category"
      >
        <AddCategory closeModal={handleCloseCreateModal} type="EXPENSES" />
      </CustomModal>
    </div>
  );
};

export default Expenses;
