import { useCreateCategoryMutation } from "@/api/category/add-category";
import { useEditCategoryMutation } from "@/api/category/edit-category";
import { useGetCategoriesQuery } from "@/api/category/fetch-categories";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "./toast/useToast";
const CategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});
const AddCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

export type CategoryFormValues = z.infer<typeof CategorySchema>;
export type AddCategoryFormValues = z.infer<typeof AddCategorySchema>;

export const useGetAllCategories = ({
  categoryObj,
  type,
  closeModal,
}: {
  categoryObj?: any;
  type?: string;
  closeModal?: any;
}) => {
  console.log("categoryObj", categoryObj);
  const business_id = useBusinessStore((state) => state.business_id);

  const {
    mutate: editCategory,
    isPending: isEditing,
    isSuccess: isEditingSuccess,
  } = useEditCategoryMutation();

  useEffect(() => {
    if (isEditingSuccess) {
      if (type === "EXPENSES") {
        ExpensesRefetch();
      } else {
        refetch();
      }
      if (closeModal) closeModal();
    }
  }, [isEditingSuccess]);

  const { showToast } = useToast();
  const {
    data: CategoriesData,
    isLoading: CategoriesDataLoading,
    refetch,
  } = useGetCategoriesQuery({
    params: {
      id: business_id,
      type: "PRODUCT",
    },
    enabled: !!business_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  const {
    data: ExpensesCategoriesData,
    isLoading: ExpensesCategoriesDataLoading,
    refetch: ExpensesRefetch,
  } = useGetCategoriesQuery({
    params: {
      id: business_id,
      type: "EXPENSES",
    },
    enabled: !!business_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { mutate: createCategory, isPending: createCategoryLoading } =
    useCreateCategoryMutation({
      businessId: business_id, // Convert null to undefined
      onSuccess: (data) => {
        console.log("data---4", data);
        showToast(data.message, "success");

        if (type === "EXPENSES") {
          ExpensesRefetch();
        } else {
          refetch();
        }

        if (closeModal) closeModal();

        // if (closeAddBankModal) closeAddBankModal();

        // Optional: Invalidate queries or update cache
      },
    });

  console.log("ExpensesCategoriesData", ExpensesCategoriesData);
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: categoryObj?.name || "",
    },
    mode: "onChange",
  });
  const AddCategoryForm = useForm<AddCategoryFormValues>({
    resolver: zodResolver(AddCategorySchema),
    defaultValues: {
      name: categoryObj?.name || "",
    },
    mode: "onChange",
  });

  const onSubmit = (values: CategoryFormValues) => {
    editCategory({
      catId: categoryObj.id,
      payload: {
        name: values.name,
      },
    });

    refetch();
  };
  const onAddCategorySubmit = (values: AddCategoryFormValues) => {
    createCategory({
      businessId: business_id,
      payload: {
        name: values.name,
        type: type,
      },
    });
  };

  return {
    CategoriesData,
    CategoriesDataLoading,
    onSubmit,
    ExpensesCategoriesDataLoading,
    form,
    onAddCategorySubmit,
    AddCategoryForm,
    createCategoryLoading,
    ExpensesCategoriesData,
    isEditing,
  };
};
