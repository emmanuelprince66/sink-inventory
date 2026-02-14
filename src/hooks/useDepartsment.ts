import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const DepartmentSchema = z.object({
  type: z.string().min(1, "Department type is required"),
  name: z.string().min(1, "Department name is required"),
  description: z.string().min(1, "Description is required"),
});

const AddDepartmentSchema = z.object({
  type: z.string().min(1, "Department type is required"),
  name: z.string().min(1, "Department name is required"),
  description: z.string().min(1, "Description is required"),
});

export type DepartmentFormValues = z.infer<typeof DepartmentSchema>;
export type AddDepartmentFormValues = z.infer<typeof AddDepartmentSchema>;

export const useDepartment = ({
  departmentObj,
  closeModal,
}: {
  departmentObj?: any;
  closeModal?: any;
} = {}) => {
  // For now, we'll use local state since we're not calling any API
  const [createDepartmentLoading, setCreateDepartmentLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(DepartmentSchema),
    defaultValues: {
      type: departmentObj?.type || "",
      name: departmentObj?.name || "",
      description: departmentObj?.description || "",
    },
    mode: "onChange",
  });

  const AddDepartmentForm = useForm<AddDepartmentFormValues>({
    resolver: zodResolver(AddDepartmentSchema),
    defaultValues: {
      type: "",
      name: "",
      description: "",
    },
    mode: "onChange",
  });

  const onSubmit = (values: DepartmentFormValues) => {
    console.log("Edit Department:", values);
    setIsEditing(true);

    // Simulate API call
    setTimeout(() => {
      setIsEditing(false);
      if (closeModal) closeModal();
      // Here you would call your edit mutation
      // editDepartment({ deptId: departmentObj.id, payload: values });
    }, 1000);
  };

  const onAddDepartmentSubmit = (values: AddDepartmentFormValues) => {
    console.log("Add Department:", values);
    setCreateDepartmentLoading(true);

    // Simulate API call
    setTimeout(() => {
      setCreateDepartmentLoading(false);
      if (closeModal) closeModal();
      // Here you would call your create mutation
      // createDepartment({ businessId: business_id, payload: values });
    }, 1000);
  };

  return {
    form,
    onSubmit,
    AddDepartmentForm,
    onAddDepartmentSubmit,
    createDepartmentLoading,
    isEditing,
  };
};
