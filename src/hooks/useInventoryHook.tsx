import { useGetCategoriesQuery } from "@/api/category/fetch-categories";
import { useAddServiceMutation } from "@/api/inventory/add-service";
import { useGetInventoryQuery } from "@/api/inventory/fetch-inventory";
import { useDeleteProductMutation } from "@/api/products/delete-product";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useMoveProductToProductionMutation } from "@/api/inventory/move-to-production";
import { useDeleteServiceMutation } from "@/api/products/delete-service";
import { useEditProductMutation } from "@/api/products/edit-product";
import { useEditServiceMutation } from "@/api/products/edit-service";
import { useFetchDepartmentsQuery } from "@/api/products/fetch-departments";
import { useReturnDamagedProductMutation } from "@/api/products/product-return";
import { handleSubscriptionError } from "@/api/sub/subscription-interceptor";
import { queryKey } from "@/constants/query-key";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useToast } from "./toast/useToast";
import { useDebounce } from "./useDebounce";

const AddReturnProductSchema = z.object({
  quantity: z.string().min(1, " Quantity is required"),
  note: z.string().optional(),
});

const AddDamagedProductSchema = z.object({
  quantity: z.string().min(1, " Quantity is required"),
  note: z.string().optional(),
});
const AddWasteProductSchema = z.object({
  quantity: z.string().min(1, " Quantity is required"),
  note: z.string().optional(),
});
const AddMoveToProductionSchema = z.object({
  quantity: z.string().min(1, " Quantity is required"),
  note: z.string().optional(),
});

const AddServiceSchema = z.object({
  image: z.union([
    z
      .instanceof(File, { message: "Service image is required" })
      .refine(
        (file) => file.size <= 5 * 1024 * 1024,
        "File size must be less than 5MB",
      )
      .refine(
        (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
        "Only .jpg, .png, and .webp formats are supported",
      )
      .optional(),
    z.string().optional(),
  ]),
  service_name: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category name is required"),
  amount: z.string().min(1, "Amount is required"),
  vat: z.boolean(),
});

const AddDiscountSchema = z.object({
  product_threshold: z.string().min(1, "Product threshold is required"),
  price_discount: z.string().min(1, "Price discount is required"),
});

export type AddServiceFormValues = z.infer<typeof AddServiceSchema>;
export type AddDiscountFormValues = z.infer<typeof AddDiscountSchema>;
export type AddReturnedFormValues = z.infer<typeof AddReturnProductSchema>;
export type AddWasteFormValues = z.infer<typeof AddWasteProductSchema>;
export type AddDamagedFormValues = z.infer<typeof AddDamagedProductSchema>;
export type AddMoveToProductionFormValues = z.infer<
  typeof AddMoveToProductionSchema
>;

export type ProductFilters = {
  allowTax: boolean;
  sellOnline: boolean;
  inHouse: boolean;
  rawMaterial: boolean;
  watchlist: boolean;
};

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

export const useInventoryHook = ({
  searchInput,
  productId,
  selectedCategoryId,
  closeModal,
  type,
  selectedType,
  service,
  selectedDepartmentId,
  serviceId,
  page,
  product,
  productFilters,
}: {
  searchInput?: string;
  type?: string;
  service?: any;
  serviceId?: string | null;
  selectedType?: string | null;
  selectedDepartmentId?: string | null;
  page?: number;
  selectedCategoryId?: string | null;
  closeModal?: any;
  productId?: string | null;
  product?: any;
  productFilters?: ProductFilters;
}) => {
  console.log("productId", productId);
  const business_id = useBusinessStore((state) => state.business_id);

  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isFormReady, setIsFormReady] = useState(false);

  const {
    mutate: addReturnedOrDamagedProduct,
    isPending: addReturnedOrDamagedProductLoading,
    isSuccess: addReturnedOrDamagedProductSuccess,
  } = useReturnDamagedProductMutation({
    productId: productId || "",
    onSuccess: (data) => {
      showToast(data.message, "success");
      refetchInventory();
      queryClient.invalidateQueries({
        queryKey: [queryKey.inventory.getAllInventory],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKey.products.productHistory],
      });
      if (closeModal) closeModal();
    },
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

  const {
    mutate: deleteProduct,
    isPending: isDeleting,
    isSuccess: isDeletingProductSuccess,
  } = useDeleteProductMutation({
    onSuccess: (data) => {
      showToast(data.message, "success");
      refetchInventory();
      if (closeModal) closeModal();
    },
  });

  const {
    mutate: deleteService,
    isPending: isDeletingService,
    isSuccess: isDeletingServiceSuccess,
  } = useDeleteServiceMutation({
    onSuccess: (data) => {
      showToast(data.message, "success");
      refetchInventory();
      if (closeModal) closeModal();
    },
  });

  const {
    mutate: moveToProduction,
    isPending: isMovingToProduction,
    isSuccess: isMovingToProductionSuccess,
  } = useMoveProductToProductionMutation({
    productId: productId || "",
    onSuccess: (data) => {
      showToast(data.message, "success");
      refetchInventory();
      queryClient.invalidateQueries({
        queryKey: [queryKey.products.fetchProductionHistiory],
      });
      if (closeModal) closeModal();
    },
  });

  useEffect(() => {
    if (isDeletingServiceSuccess || isDeletingProductSuccess) {
      refetchInventory();
      queryClient.invalidateQueries({
        queryKey: [queryKey.inventory.getAllInventory],
      });
      if (closeModal) closeModal();
    }
  }, [isDeletingServiceSuccess, isDeletingProductSuccess]);

  const handleDeleteProduct = (id: string, type: string) => {
    if (type === "PRODUCT") {
      deleteProduct(id);
    } else {
      deleteService(id);
    }
  };

  const debouncedSearchTerm = useDebounce(searchInput || "", 500);

  const {
    mutate: createService,
    isPending: isCreatingService,
    isSuccess: isCreatingServiceSuccess,
  } = useAddServiceMutation({
    businessId: business_id || "",
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
      limit: 20,
      id: business_id,
      search: searchTerm,
      category_id: selectedCategoryId,
      department_id: selectedDepartmentId,
      ...(selectedType && { type: selectedType }),
      ...(productFilters?.allowTax && { allow_tax: true }),
      ...(productFilters?.sellOnline && { sell_online: true }),
      ...(productFilters?.inHouse && { in_house: true }),
      ...(productFilters?.rawMaterial && { raw_material: true }),
      ...(productFilters?.watchlist && { watchlist: true }),
    },
    enabled: !!business_id,
    staleTime: 1000 * 60 * 5,
  });

  console.log("InventoryData", InventoryData);

  const {
    data: DepartmentData,
    isLoading: DepartmentDataLoading,
    refetch: refetchDepartments,
    isRefetching: isRefetchingDepartments,
  } = useFetchDepartmentsQuery(business_id, {
    enabled: !!business_id,
    staleTime: 1000 * 60 * 5,
  });

  const { data: CategoriesData, isLoading: CategoriesDataLoading } =
    useGetCategoriesQuery({
      params: {
        id: business_id,
        type: "PRODUCT",
      },
      enabled: !!business_id,
      staleTime: 1000 * 60 * 5,
    });

  const getCategoryByName = (name: string) => {
    const category = CategoriesData?.data.find(
      (category: any) => category.name === name,
    );
    return category?.id;
  };

  const addReturnedProductForm = useForm<AddReturnedFormValues>({
    resolver: zodResolver(AddReturnProductSchema) as any,
    defaultValues: { quantity: "", note: "" },
    mode: "onChange",
  });
  const addWasteProductForm = useForm<AddWasteFormValues>({
    resolver: zodResolver(AddWasteProductSchema) as any,
    defaultValues: { quantity: "", note: "" },
    mode: "onChange",
  });

  const addDamagedProductForm = useForm<AddDamagedFormValues>({
    resolver: zodResolver(AddDamagedProductSchema) as any,
    defaultValues: { quantity: "", note: "" },
    mode: "onChange",
  });
  const addMoveToProductionForm = useForm<AddMoveToProductionFormValues>({
    resolver: zodResolver(AddMoveToProductionSchema) as any,
    defaultValues: { quantity: "", note: "" },
    mode: "onChange",
  });

  const editSellingPriceForm = useForm<EditSellingPriceFormValues>({
    resolver: zodResolver(EditSellingPriceSchema) as any,
    defaultValues: { selling_price: undefined },
    mode: "onChange",
  });

  const form = useForm<AddServiceFormValues>({
    resolver: zodResolver(AddServiceSchema),
    defaultValues: {
      service_name: "",
      description: "",
      category: "",
      amount: "",
      vat: false,
    },
    mode: "onChange",
  });

  const addDiscountForm = useForm<AddDiscountFormValues>({
    resolver: zodResolver(AddDiscountSchema),
    defaultValues: { product_threshold: "", price_discount: "" },
    mode: "onChange",
  });

  useEffect(() => {
    if (product) {
      addDiscountForm.reset({
        product_threshold: JSON.stringify(product.discount_threshold) || "",
        price_discount: JSON.stringify(product.discount) || "",
      });
    }
  }, [product]);

  const onSubmitAddReturnedProduct = (values: AddReturnedFormValues) => {
    const payload: { quantity: number; type: string; note?: string } = {
      quantity: Number(values.quantity),
      type: "RETURN",
    };
    if (values.note && values.note.trim() !== "") payload.note = values.note;
    addReturnedOrDamagedProduct({ payload, productId });
  };
  const onSubmitAddWasteProduct = (values: AddWasteFormValues) => {
    const payload: { quantity: number; type: string; note?: string } = {
      quantity: Number(values.quantity),
      type: "WASTE",
    };
    if (values.note && values.note.trim() !== "") payload.note = values.note;
    addReturnedOrDamagedProduct({ payload, productId });
  };

  const onSubmitAddDamagedProduct = (values: AddDamagedFormValues) => {
    const payload: { quantity: number; type: string; note?: string } = {
      quantity: Number(values.quantity),
      type: "DAMAGE",
    };
    if (values.note && values.note.trim() !== "") payload.note = values.note;
    addReturnedOrDamagedProduct({ payload, productId });
  };

  const onSubmitAddMoveToProduction = (
    values: AddMoveToProductionFormValues,
  ) => {
    const payload: { quantity: number; note?: string } = {
      quantity: Number(values.quantity),
    };
    if (values.note && values.note.trim() !== "") payload.note = values.note;
    moveToProduction({ payload, productId });
  };

  const addDiscountSubmit = (values: AddDiscountFormValues) => {
    const formData = new FormData();
    formData.append("discount_threshold", String(values.product_threshold));
    formData.append("discount", String(values.price_discount));
    editProduct({ payload: formData, productId });
  };

  const onSubmit = (values: any) => {
    const formData = new FormData();

    // FIX: Only append image if it's an actual new File — never send a string URL
    if (values.image instanceof File) {
      formData.append("image", values.image);
    }

    const appendIfNotEmpty = (fieldName: string, value: string | undefined) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(fieldName, value);
      }
    };

    appendIfNotEmpty("name", values.service_name);
    appendIfNotEmpty("description", values.description);
    appendIfNotEmpty("category_id", values.category);
    appendIfNotEmpty("amount", values.amount);

    // VAT is now a boolean — send "true" or "false" as string for FormData
    if (values.vat !== undefined) {
      formData.append("vat", values.vat ? "true" : "false");
    }

    if (serviceId) {
      editService(
        { payload: formData, productId: serviceId },
        {
          onSuccess: () => {
            showToast("Service updated successfully", "success");
            queryClient.invalidateQueries({
              queryKey: [queryKey.inventory.getAllInventory],
            });
            if (closeModal) closeModal();
          },
          onError: (error: any) => {
            const isSubscriptionError = handleSubscriptionError(error);
            if (!isSubscriptionError) {
              const errorMessage =
                error?.message || error?.error || "Error updating service";
              showToast(errorMessage, "error");
            }
          },
        },
      );
    } else {
      createService(
        { payload: formData, businessId: business_id },
        {
          onSuccess: () => {
            showToast("Service created successfully", "success");
            queryClient.invalidateQueries({
              queryKey: [queryKey.inventory.getAllInventory],
            });
            if (closeModal) closeModal();
          },
          onError: (error: any) => {
            const isSubscriptionError = handleSubscriptionError(error);
            if (!isSubscriptionError) {
              const errorMessage =
                error?.message || error?.error || "Error creating service";
              showToast(errorMessage, "error");
            }
          },
        },
      );
    }
  };

  useEffect(() => {
    if (!serviceId) {
      setIsFormReady(true);
      return;
    }
    if (serviceId && service && CategoriesData) {
      const categoryId = getCategoryByName(service.category) || "";
      form.reset({
        image: service.image || "",
        service_name: service.name,
        description: service.description || "",
        category: categoryId,
        amount: service.amount.toString(),
        vat:
          service.vat === true ||
          service.vat === "true" ||
          Number(service.vat) > 0,
      });
      setTimeout(() => setIsFormReady(true), 0);
    }
  }, [serviceId, service, CategoriesData]);

  const onSubmitEditSellingPrice = (values: EditSellingPriceFormValues) => {
    const formData = new FormData();
    if (type === "PRODUCT") {
      formData.append("selling_price", String(values.selling_price));
      editProduct({ payload: formData, productId });
    } else {
      formData.append("amount", String(values.selling_price));
      editService({ payload: formData, productId });
    }
  };

  return {
    onSubmitAddReturnedProduct,
    onSubmitAddDamagedProduct,
    onSubmitAddWasteProduct,
    addWasteProductForm,
    onSubmitAddMoveToProduction,
    addMoveToProductionForm,
    addReturnedProductForm,
    moveToProduction,
    isMovingToProduction,
    addDamagedProductForm,
    addReturnedOrDamagedProductLoading,
    InventoryData,
    CategoriesData,
    DepartmentData,
    DepartmentDataLoading,
    business_id,
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
    isFormReady,
  };
};
