import { useCreateDepartmentMutation } from "@/api/products/add-departments";
import { useFetchDepartmentsQuery } from "@/api/products/fetch-departments";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "./toast/useToast";

const AddDepartmentSchema = z.object({
  name: z.string().min(1, "Department name is required").max(100),
});

export type AddDepartmentFormValues = z.infer<typeof AddDepartmentSchema>;

export const useDepartment = ({ closeModal }: { closeModal?: () => void }) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const { showToast } = useToast();

  const {
    data: DepartmentData,
    isLoading: DepartmentDataLoading,
    refetch: refetchDepartments,
  } = useFetchDepartmentsQuery(business_id, {
    enabled: !!business_id,
    staleTime: 1000 * 60 * 5,
  });

  const { mutate: createDepartment, isPending: createDepartmentLoading } =
    useCreateDepartmentMutation({
      businessId: business_id,
      onSuccess: (data: any) => {
        showToast(data.message, "success");
        refetchDepartments();
        if (closeModal) closeModal();
      },
      onError: (error: any) => {
        showToast(error.message, "error");
      },
    });

  const AddDepartmentForm = useForm<AddDepartmentFormValues>({
    resolver: zodResolver(AddDepartmentSchema),
    defaultValues: { name: "" },
    mode: "onChange",
  });

  const onAddDepartmentSubmit = (values: AddDepartmentFormValues) => {
    createDepartment({
      businessId: business_id,
      payload: { name: values.name },
    });
  };

  return {
    DepartmentData,
    DepartmentDataLoading,
    AddDepartmentForm,
    onAddDepartmentSubmit,
    createDepartmentLoading,
    refetchDepartments,
  };
};
