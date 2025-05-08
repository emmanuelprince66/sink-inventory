import { useEditCategoryMutation } from "@/api/category/edit-category";
import { useGetCategoriesQuery } from "@/api/category/fetch-categories";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
const CategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

export type CategoryFormValues = z.infer<typeof CategorySchema>;

export const useGetAllCategories = ({ categoryObj }: { categoryObj?: any }) => {
  console.log("categoryObj", categoryObj);
  const business_id = useBusinessStore((state) => state.business_id);

  const { mutate: editCategory, isPending: isEditing } =
    useEditCategoryMutation();

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

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategorySchema),
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

  return {
    CategoriesData,
    CategoriesDataLoading,
    onSubmit,
    form,
    isEditing,
  };
};
