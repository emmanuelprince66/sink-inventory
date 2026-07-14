"use client";
import { CustomModal } from "@/components/app/CustomModal";
import { CustomTable } from "@/components/app/CutomTable";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/toast/useToast";
import { useGetAllCategories } from "@/hooks/useGetAllCategories";
import { cn } from "@/lib/utils";
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Departments from "../departments/Departments";
import AddCategory from "./AddCategory";
import { getCategoriesColumns } from "./column";
import DeleteCategory from "./DeleteCategory";
import EditCategory from "./EditCategory";

const TABS = [
  { key: "categories", label: "Categories" },
  { key: "departments", label: "Departments" },
] as const;

const Categories = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]["key"]>("categories");
  const [searchInput, setSearchInput] = useState("");
  const [editModal, setEditModal] = useState(false);
  const { showToast } = useToast();

  const closeEditModal = () => setEditModal(false);
  const [categoryObj, setCategoryObj] = useState<any>({});

  const [createModal, setCreateModal] = useState(false);
  const handleOpenCreateModal = () => setCreateModal(true);
  const handleCloseCreateModal = () => setCreateModal(false);

  const [deleteModal, setDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { CategoriesData, CategoriesDataLoading, refetch } =
    useGetAllCategories({ categoryObj });

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleOpenEditModal = (category: any) => {
    setEditModal(true);
    setCategoryObj(category);
  };

  const handleOpenDeleteModal = (category: any) => {
    setCategoryToDelete({ id: category.id, name: category.name });
    setDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal(false);
    setCategoryToDelete(null);
  };

  const handleDeleteSuccess = () => {
    showToast("Category deleted successfully", "success");
    refetch(); // Refresh the categories list after deletion
  };

  const filteredCategories = (CategoriesData?.data ?? []).filter(
    (category: any) =>
      category.name.toLowerCase().includes(searchInput.toLowerCase()),
  );

  const columns = getCategoriesColumns({
    onEdit: handleOpenEditModal,
    onDelete: handleOpenDeleteModal,
  });

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-grey-5 text-sm font-bold text-grey-2 hover:bg-grey-6 hover:border-grey-4 cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <h1 className="text-xl sm:text-2xl font-extrabold text-grey-1">
          Store Management
        </h1>
      </div>

      <div className="w-full rounded-2xl border border-border-tint bg-white overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-border-tint px-4 sm:px-6">
          <div className="flex items-center gap-6">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "py-4 text-sm cursor-pointer font-bold border-b-2 transition-colors",
                  activeTab === tab.key
                    ? "border-primary-green-300 text-primary-green-300"
                    : "border-transparent text-grey-3 hover:text-grey-2",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "categories" ? (
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-base sm:text-lg font-extrabold text-grey-1">
                All Categories
              </h2>
              <Button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-1.5 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </Button>
            </div>

            <div className="w-full sm:w-80 mb-4">
              <SearchInput
                placeholder="Search categories..."
                value={searchInput}
                onValueChange={handleSearchChange}
              />
              {searchInput.length > 0 && searchInput.length < 3 && (
                <div className="mt-1 text-xs text-grey-4">
                  Type at least 3 characters to search
                </div>
              )}
            </div>

            <CustomTable
              columns={columns}
              data={filteredCategories}
              loading={CategoriesDataLoading}
              noDataText="No categories found"
              showSerialNumber={false}
              bordered={false}
            />
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <Departments />
          </div>
        )}
      </div>

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

      {/* Delete Category Modal */}
      <CustomModal
        isOpen={deleteModal}
        onClose={handleCloseDeleteModal}
        trigger={false}
        title="Delete Category"
      >
        {categoryToDelete && (
          <DeleteCategory
            categoryId={categoryToDelete.id}
            categoryName={categoryToDelete.name}
            closeModal={handleCloseDeleteModal}
            onDeleteSuccess={handleDeleteSuccess}
          />
        )}
      </CustomModal>
    </div>
  );
};

export default Categories;
