import { useDeleteCategoryMutation } from "@/api/category/delete-category";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface DeleteCategoryProps {
  categoryId: string;
  categoryName: string;
  closeModal: () => void;
  onDeleteSuccess?: () => void;
}

const DeleteCategory = ({
  categoryId,
  categoryName,
  closeModal,
  onDeleteSuccess,
}: DeleteCategoryProps) => {
  const { mutate: deleteCategory, isPending: isDeleting } =
    useDeleteCategoryMutation({
      onSuccess: () => {
        closeModal();
        onDeleteSuccess?.();
      },
    });

  const handleDelete = () => {
    deleteCategory(categoryId);
  };

  return (
    <div className="space-y-6">
      {/* Warning Icon and Message */}
      <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-900 mb-1">
            Are you absolutely sure?
          </h3>
          <p className="text-sm text-red-800">
            This action cannot be undone. This will permanently delete the
            category <span className="font-bold">"{categoryName}"</span> and
            remove it from our servers.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={closeModal}
          disabled={isDeleting}
          className="font-semibold"
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold border border-red-600"
        >
          {isDeleting ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  opacity="0.25"
                />
                <path
                  d="M22 12a10 10 0 0 1-10 10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
              </svg>
              Deleting...
            </span>
          ) : (
            "Delete Category"
          )}
        </Button>
      </div>
    </div>
  );
};

export default DeleteCategory;
