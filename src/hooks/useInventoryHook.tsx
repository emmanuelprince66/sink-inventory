import { useGetCategoriesQuery } from "@/api/category/fetch-categories";
import { useAddServiceMutation } from "@/api/inventory/add-service";
import { useGetInventoryQuery } from "@/api/inventory/fetch-inventory";
import { useDeleteProductMutation } from "@/api/products/delete-product";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useDeleteServiceMutation } from "@/api/products/delete-service";
import { useEditProductMutation } from "@/api/products/edit-product";
import { useState } from "react";
import { useToast } from "./toast/useToast";
import { useDebounce } from "./useDebounce";

const AddServiceSchema = z.object({
  service_name: z.string().min(1, "Customer name is required"),
  description: z.string().min(1, "description number is required"),
  category: z.string().min(1, "Category name is required"),
  amount: z.string().min(1, "Amount is required"),
});

export type AddServiceFormValues = z.infer<typeof AddServiceSchema>;

const EditSellingPriceSchema = z.object({
  selling_price: z
    .union([
      z
        .number({
          required_error: "Price is required",
          invalid_type_error: "Price must be a number",
        })
        .min(0.01, "Price must be at least $0.01"),
      z
        .string()
        .min(1, "Price is required")
        .refine((val) => !isNaN(Number(val)), "Price must be a number"),
    ])
    .transform((val) => Number(val)),
});

type EditSellingPriceFormValues = {
  selling_price: number;
};

type EditSellingPriceInput = {
  selling_price: string | number;
};

// export type EditSellingPriceFormValues = z.infer<typeof EditSellingPriceSchema>;

export const useInventoryHook = ({
  searchInput,
  productId,
  selectedCategoryId,
  closeAddServiceModal,
}: {
  searchInput?: string;
  selectedCategoryId?: string | null;
  closeAddServiceModal?: any;
  productId?: string | null;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const { showToast } = useToast();

  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  const { mutate: editProduct, isPending: editProductPending } =
    useEditProductMutation({
      productId: productId,
    });

  console.log("product", productId);
  const { mutate: deleteProduct, isPending: isDeleting } =
    useDeleteProductMutation({
      onSuccess: (data) => {
        console.log("data", data);
        showToast(data.message, "success");
        // Optional: Invalidate queries or update cache
      },
      // You can add other callbacks here if needed
    });
  const { mutate: deleteService, isPending: isDeletingService } =
    useDeleteServiceMutation({
      onSuccess: (data) => {
        showToast(data.message, "success");
        // Optional: Invalidate queries or update cache
      },
      // You can add other callbacks here if needed
    });

  const handleDeleteProduct = (id: string, type: string) => {
    if (type === "PRODUCT") {
      deleteProduct(id);
    }
    deleteService(id);
  };

  const debouncedSearchTerm = useDebounce(searchInput || "", 500); // 500ms debounce
  const { mutate: createService, isPending: isCreatingService } =
    useAddServiceMutation({
      businessId: business_id, // Convert null to undefined
    });

  const searchTerm =
    debouncedSearchTerm?.length >= 3 || debouncedSearchTerm?.length === 0
      ? debouncedSearchTerm
      : null;

  const { data: InventoryData, isLoading: InventoryDataLoading } =
    useGetInventoryQuery({
      params: {
        id: business_id,
        search: searchTerm,
        category_id: selectedCategoryId,
      },
      enabled: !!business_id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  const { data: CategoriesData, isLoading: CategoriesDataLoading } =
    useGetCategoriesQuery({
      params: {
        id: business_id,
        type: "PRODUCT",
      },
      enabled: !!business_id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  console.log("InventoryData", InventoryData);
  console.log("CategoriesData", CategoriesData);

  const editSellingPriceForm = useForm<EditSellingPriceFormValues>({
    resolver: zodResolver(EditSellingPriceSchema) as any, // Temporary workaround
    defaultValues: {
      selling_price: undefined,
    },
    mode: "onChange",
  });

  const form = useForm<AddServiceFormValues>({
    resolver: zodResolver(AddServiceSchema),
    defaultValues: {
      service_name: "",
      description: "",
      category: "",
      amount: "",
    },
    mode: "onChange",
  });

  const onSubmit = (values: AddServiceFormValues) => {
    const payload = {
      name: values.service_name,
      description: values.description,
      category_id: values.category,
      amount: Number(values.amount),
    };
    console.log("payload", payload);

    createService({
      payload,
      businessId: business_id,
    });
    closeAddServiceModal();
  };
  const onSubmitEditSellingPrice = (values: EditSellingPriceFormValues) => {
    const payload = {
      selling_price: Number(values.selling_price),
    };
    console.log("payload--3", payload);

    editProduct({
      payload,
      productId: productId,
    });

    // createService({
    //   payload,
    //   businessId: business_id,
    // });
    // closeAddServiceModal();
  };
  return {
    InventoryData,
    CategoriesData,
    InventoryDataLoading,
    isCreatingService,
    form,
    onSubmitEditSellingPrice,
    editProductPending,
    handleDeleteProduct,
    deleting: isDeleting || isDeletingService,
    editSellingPriceForm,
    onSubmit,
    CategoriesDataLoading,
  };
};
