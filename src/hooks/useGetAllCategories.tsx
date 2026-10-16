import { useCreateCategoryMutation } from "@/api/category/add-category";
import { useEditCategoryMutation } from "@/api/category/edit-category";
import { useGetCategoriesQuery } from "@/api/category/fetch-categories";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "./toast/useToast";

export type CategoryType = "PRODUCT" | "SERVICE" | "EXPENSES";

const CategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  type: z.enum(["PRODUCT", "SERVICE", "EXPENSES"]),
});

const AddCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  type: z.enum(["PRODUCT", "SERVICE", "EXPENSES"]),
});

export type CategoryFormValues = z.infer<typeof CategorySchema>;
export type AddCategoryFormValues = z.infer<typeof AddCategorySchema>;

export const useGetAllCategories = ({
  categoryObj,
  type,
  closeModal,
}: {
  categoryObj?: any;
  type?: CategoryType;
  closeModal?: any;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);

  const {
    mutate: editCategory,
    isPending: isEditing,
    isSuccess: isEditingSuccess,
  } = useEditCategoryMutation();

  useEffect(() => {
    if (isEditingSuccess) {
      void refetchAllCategories();
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

  const {
    data: ServiceCategoriesData,
    isLoading: ServiceCategoriesDataLoading,
    refetch: ServiceCategoriesRefetch,
  } = useGetCategoriesQuery({
    params: {
      id: business_id,
      type: "SERVICE",
    },
    enabled: !!business_id,
    staleTime: 1000 * 60 * 5,
  });

  const { mutate: createCategory, isPending: createCategoryLoading } =
    useCreateCategoryMutation({
      businessId: business_id,
      onSuccess: (_data, variables) => {
        const categoryType = variables?.payload?.type ?? type;
        if (categoryType === "EXPENSES") {
          ExpensesRefetch();
        } else if (categoryType === "SERVICE") {
          ServiceCategoriesRefetch();
        } else {
          refetch();
        }

        if (closeModal) closeModal();
      },
    });

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: categoryObj?.name || "",
      type: categoryObj?.type ?? type ?? "PRODUCT",
    },
    mode: "onChange",
  });

  const AddCategoryForm = useForm<AddCategoryFormValues>({
    resolver: zodResolver(AddCategorySchema),
    defaultValues: {
      name: categoryObj?.name || "",
      type: type === "SERVICE" || type === "EXPENSES" ? type : "PRODUCT",
    },
    mode: "onChange",
  });

  const onSubmit = (values: CategoryFormValues) => {
    editCategory({
      catId: categoryObj.id,
      payload: {
        name: values.name,
        type: values.type,
      },
    });
  };

  const onAddCategorySubmit = (values: AddCategoryFormValues) => {
    createCategory({
      businessId: business_id,
      payload: {
        name: values.name,
        type: type ?? values.type,
      },
    });
  };

  const AllCategoriesData = {
    ...(CategoriesData ?? {}),
    data: [
      ...(CategoriesData?.data ?? []),
      ...(ServiceCategoriesData?.data ?? []),
      ...(ExpensesCategoriesData?.data ?? []),
    ],
  };

  const refetchAllCategories = async () => {
    await Promise.all([
      refetch(),
      ServiceCategoriesRefetch(),
      ExpensesRefetch(),
    ]);
  };

  return {
    CategoriesData,
    CategoriesDataLoading,
    AllCategoriesData,
    AllCategoriesDataLoading:
      CategoriesDataLoading ||
      ServiceCategoriesDataLoading ||
      ExpensesCategoriesDataLoading,
    refetchAllCategories,
    onSubmit,
    ExpensesCategoriesDataLoading,
    form,
    onAddCategorySubmit,
    AddCategoryForm,
    createCategoryLoading,
    ExpensesCategoriesData,
    isEditing,
    refetch, // ✅ Expose refetch for manual refresh
    ExpensesRefetch, // ✅ Expose expenses refetch
  };
};
