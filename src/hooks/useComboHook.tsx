import { useCreateComboMutation } from "@/api/combo/create-combo";
import { useDeleteComboMutation } from "@/api/combo/delete-combo";
import { useEditComboMutation } from "@/api/combo/edit-combo";
import { useFetchComboByIdQuery } from "@/api/combo/fetch-combo-by-id";
import { queryKey } from "@/constants/query-key";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useToast } from "./toast/useToast";

export const useComboHook = ({
  comboId,
  closeModal,
}: {
  comboId?: string;
  closeModal?: () => void;
} = {}) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { showToast } = useToast();

  // Single combo (for edit page)
  const { data: singleComboData, isLoading: singleComboLoading } =
    useFetchComboByIdQuery(comboId || "", { enabled: !!comboId });

  const invalidateInventory = () => {
    // The combos list is fetched via the inventory endpoint (type=COMBO),
    // so invalidate the inventory query to refresh the combos table.
    queryClient.invalidateQueries({
      queryKey: [queryKey.inventory.getAllInventory],
    });
    if (comboId) {
      queryClient.invalidateQueries({
        queryKey: [queryKey.products.getComboById, comboId],
      });
    }
  };

  const { mutate: createCombo, isPending: creatingCombo } =
    useCreateComboMutation({
      onSuccess: () => {
        invalidateInventory();
        router.push("/inventory");
      },
    });

  const { mutate: editCombo, isPending: editingCombo } = useEditComboMutation({
    onSuccess: () => {
      invalidateInventory();
      router.push("/inventory");
    },
  });

  const { mutate: deleteCombo, isPending: deletingCombo } =
    useDeleteComboMutation({
      onSuccess: () => {
        invalidateInventory();
        if (closeModal) closeModal();
      },
    });

  const handleCreateCombo = (payload: FormData) => {
    if (!business_id) {
      showToast("Business not selected", "error");
      return;
    }
    createCombo({ businessId: business_id, payload });
  };

  const handleEditCombo = (id: string, payload: FormData) => {
    editCombo({ comboId: id, payload });
  };

  const handleDeleteCombo = (id: string) => {
    deleteCombo(id);
  };

  return {
    business_id,
    // Single combo
    singleComboData,
    singleComboLoading,
    // Actions
    handleCreateCombo,
    handleEditCombo,
    handleDeleteCombo,
    creatingCombo,
    editingCombo,
    deletingCombo,
  };
};
