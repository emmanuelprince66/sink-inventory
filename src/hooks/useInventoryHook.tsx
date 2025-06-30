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
import { useEditServiceMutation } from "@/api/products/edit-service";
import { useReturnDamagedProductMutation } from "@/api/products/product-return";
import { useEffect, useState } from "react";
import { useToast } from "./toast/useToast";

import { queryKey } from "@/constants/query-key";
import { useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "./useDebounce";

const AddReturnProductSchema = z.object({
  quantity: z.string().min(1, " Quantity is required"),
  note: z.string().optional(),
});
const AddDamagedProductSchema = z.object({
  quantity: z.string().min(1, " Quantity is required"),
  note: z.string().optional(),
});
const AddServiceSchema = z.object({
  service_name: z.string().min(1, "Customer name is required"),
  description: z.string().min(1, "description number is required"),
  category: z.string().min(1, "Category name is required"),
  amount: z.string().min(1, "Amount is required"),
});
const AddDiscountSchema = z.object({
  product_threshold: z.string().min(1, "Product threshold is required"),
  price_discount: z.string().min(1, "Price discount is required"),
});

export type AddServiceFormValues = z.infer<typeof AddServiceSchema>;
export type AddDiscountFormValues = z.infer<typeof AddDiscountSchema>;
export type AddReturnedFormValues = z.infer<typeof AddReturnProductSchema>;
export type AddDamagedFormValues = z.infer<typeof AddDamagedProductSchema>;

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
  closeModal,
  type,
  page,
  product,
}: {
  searchInput?: string;
  type?: string;
  page?: number;
  selectedCategoryId?: string | null;
  closeModal?: any;
  productId?: string | null;
  product?: any;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  const {
    mutate: addReturnedOrDamagedProduct,
    isPending: addReturnedOrDamagedProductLoading,
    isSuccess: addReturnedOrDamagedProductSuccess,
  } = useReturnDamagedProductMutation({
    productId: productId || "", // Convert null to undefined
    onSuccess: (data) => {
      console.log("data", data);
      showToast(data.message, "success");
      queryClient.invalidateQueries({
        queryKey: [queryKey.inventory.getAllInventory],
      });
      if (closeModal) closeModal();
      // Optional: Invalidate queries or update cache
    },

    // You can add other callbacks here if needed
  });

  const {
    mutate: editProduct,
    isPending: editProductPending,
    isSuccess: editProductSuccess,
  } = useEditProductMutation({
    productId: productId,
  });
  const {
    mutate: editService,
    isPending: editServicePending,
    isSuccess: editServiceSuccess,
  } = useEditServiceMutation({
    productId: productId,
  });

  useEffect(() => {
    if (editServiceSuccess) {
      refetchInventory();
      queryClient.invalidateQueries({
        queryKey: [queryKey.inventory.getAllInventory],
      });
      if (closeModal) closeModal();
    }
  }, [editServiceSuccess]);

  useEffect(() => {
    if (editProductSuccess) {
      queryClient.invalidateQueries({
        queryKey: [queryKey.inventory.getAllInventory],
      });
      refetchInventory();
      if (closeModal) closeModal();
    }
  }, [editProductSuccess]);

  console.log("product", productId);
  const { mutate: deleteProduct, isPending: isDeleting } =
    useDeleteProductMutation({
      onSuccess: (data) => {
        console.log("data", data);
        showToast(data.message, "success");
        refetchInventory();
        if (closeModal) closeModal();
        // Optional: Invalidate queries or update cache
      },
      // You can add other callbacks here if needed
    });
  const { mutate: deleteService, isPending: isDeletingService } =
    useDeleteServiceMutation({
      onSuccess: (data) => {
        showToast(data.message, "success");

        refetchInventory();
        if (closeModal) closeModal();
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

  console.log("type", type);

  const debouncedSearchTerm = useDebounce(searchInput || "", 500); // 500ms debounce
  const {
    mutate: createService,
    isPending: isCreatingService,
    isSuccess: isCreatingServiceSuccess,
  } = useAddServiceMutation({
    businessId: business_id, // Convert null to undefined
  });

  useEffect(() => {
    if (isCreatingServiceSuccess) {
      refetchInventory();
      if (closeModal) closeModal();
    }
  }, [isCreatingServiceSuccess]);

  const searchTerm =
    debouncedSearchTerm?.length >= 3 || debouncedSearchTerm?.length === 0
      ? debouncedSearchTerm
      : null;

  const {
    data: InventoryData,
    isLoading: InventoryDataLoading,
    refetch: refetchInventory,
    isRefetching: isRefetchingInventory,
  } = useGetInventoryQuery({
    params: {
      page,
      limit: 15,
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

  const getCategoryIdForEditServiceFunc = () => {
    if (type === "SERVICE" && CategoriesData) {
      const productCat = CategoriesData?.data?.find(
        (category: any) => category.name === product.category
      ).id;

      return productCat;
    }

    return null;
  };

  const addReturnedProductForm = useForm<AddReturnedFormValues>({
    resolver: zodResolver(AddReturnProductSchema) as any, // Temporary workaround
    defaultValues: {
      quantity: "",
      note: "",
    },
    mode: "onChange",
  });
  const addDamagedProductForm = useForm<AddDamagedFormValues>({
    resolver: zodResolver(AddDamagedProductSchema) as any, // Temporary workaround
    defaultValues: {
      quantity: "",
      note: "",
    },
    mode: "onChange",
  });
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
  const addDiscountForm = useForm<AddDiscountFormValues>({
    resolver: zodResolver(AddDiscountSchema),
    defaultValues: {
      product_threshold: "",
      price_discount: "",
    },
    mode: "onChange",
  });

  const onSubmitAddReturnedProduct = (values: AddReturnedFormValues) => {
    const payload: {
      quantity: number;
      type: string;
      note?: string; // Optional field
    } = {
      quantity: Number(values.quantity),
      type: "RETURN",
    };

    // Only add note if it exists and isn't empty
    if (values.note && values.note.trim() !== "") {
      payload.note = values.note;
    }

    addReturnedOrDamagedProduct({
      payload,
      productId: productId, // Convert null to undefined
    });
  };

  const onSubmitAddDamagedProduct = (values: AddDamagedFormValues) => {
    const payload: {
      quantity: number;
      type: string;
      note?: string; // Optional field
    } = {
      quantity: Number(values.quantity),
      type: "DAMAGE",
    };

    // Only add note if it exists and isn't empty
    if (values.note && values.note.trim() !== "") {
      payload.note = values.note;
    }

    addReturnedOrDamagedProduct({
      payload,
      productId: productId, // Convert null to undefined
    });
  };

  const addDiscountSubmit = (values: AddDiscountFormValues) => {
    const formData = new FormData();

    formData.append("discount_threshold", String(values.product_threshold));
    formData.append("discount", String(values.price_discount));

    editProduct({
      payload: formData,
      productId: productId,
    });
    // const payload = {
    //   product_threshold: Number(values.product_threshold),
    //   price_discount: Number(values.price_discount),
    // };
    // console.log("payload", payload);
  };

  const onSubmit = (values: any) => {
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
  };
  const onSubmitEditSellingPrice = (values: EditSellingPriceFormValues) => {
    const formData = new FormData();

    console.log("type", type);
    if (type === "PRODUCT") {
      formData.append("selling_price", String(values.selling_price));

      editProduct({
        payload: formData,
        productId: productId,
      });
    } else {
      formData.append("amount", String(values.selling_price));
      // formData.append("category_id", getCategoryIdForEditServiceFunc());
      // formData.append("name", product.name);

      editService({
        payload: formData,
        productId: productId,
      });
    }

    // createService({
    //   payload,
    //   businessId: business_id,
    // });
    // closeAddServiceModal();
  };
  return {
    onSubmitAddReturnedProduct,
    onSubmitAddDamagedProduct,
    addReturnedProductForm,
    addDamagedProductForm,
    addReturnedOrDamagedProductLoading,
    InventoryData,
    CategoriesData,
    addDiscountSubmit,
    addDiscountForm,
    InventoryDataLoading: InventoryDataLoading || isRefetchingInventory,
    isCreatingService,
    form,
    onSubmitEditSellingPrice,
    loading: editProductPending || editServicePending,
    handleDeleteProduct,
    deleting: isDeleting || isDeletingService,
    editSellingPriceForm,
    onSubmit,
    CategoriesDataLoading,
  };
};
