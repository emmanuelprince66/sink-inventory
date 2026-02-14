"use client";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Edit,
  Edit2Icon,
  Percent,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Dummy data
const DUMMY_TAX_DATA = [
  {
    id: "1",
    name: "VAT",
    percentage: 7.5,
    description: "Value Added Tax on taxable items",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Service Tax",
    percentage: 5.0,
    description: "Tax applied to services",
    createdAt: "2024-02-10",
  },
  {
    id: "3",
    name: "Import Duty",
    percentage: 10.0,
    description: "Tax on imported goods",
    createdAt: "2024-03-05",
  },
];

const DUMMY_PROFIT_MARGIN = {
  id: "1",
  percentage: 30,
  description: "Default profit margin for calculating selling price",
  updatedAt: "2024-03-01",
};

const taxSchema = z.object({
  name: z.string().min(1, "Tax name is required"),
  percentage: z.string().min(1, "Percentage is required"),
  description: z.string().optional(),
});

const profitMarginSchema = z.object({
  percentage: z.string().min(1, "Profit margin is required"),
  description: z.string().optional(),
});

type TaxFormValues = z.infer<typeof taxSchema>;
type ProfitMarginFormValues = z.infer<typeof profitMarginSchema>;

const Tax = () => {
  const [isAddTaxModalOpen, setIsAddTaxModalOpen] = useState(false);
  const [isEditTaxModalOpen, setIsEditTaxModalOpen] = useState(false);
  const [isEditProfitMarginModalOpen, setIsEditProfitMarginModalOpen] =
    useState(false);
  const [isDeleteTaxModalOpen, setIsDeleteTaxModalOpen] = useState(false);
  const [selectedTax, setSelectedTax] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const taxForm = useForm<TaxFormValues>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      name: "",
      percentage: "",
      description: "",
    },
  });

  const profitMarginForm = useForm<ProfitMarginFormValues>({
    resolver: zodResolver(profitMarginSchema),
    defaultValues: {
      percentage: DUMMY_PROFIT_MARGIN.percentage.toString(),
      description: DUMMY_PROFIT_MARGIN.description,
    },
  });

  const handleAddTax = (values: TaxFormValues) => {
    console.log("Add Tax:", values);
    setIsAddTaxModalOpen(false);
    taxForm.reset();
    // Add API call here
  };

  const handleEditTax = (values: TaxFormValues) => {
    console.log("Edit Tax:", values);
    setIsEditTaxModalOpen(false);
    setSelectedTax(null);
    taxForm.reset();
    // Add API call here
  };

  const handleUpdateProfitMargin = (values: ProfitMarginFormValues) => {
    console.log("Update Profit Margin:", values);
    setIsEditProfitMarginModalOpen(false);
    // Add API call here
  };

  const handleEditClick = (tax: any) => {
    setSelectedTax(tax);
    taxForm.reset({
      name: tax.name,
      percentage: tax.percentage.toString(),
      description: tax.description,
    });
    setIsEditTaxModalOpen(true);
  };

  const handleDeleteClick = (tax: any) => {
    setSelectedTax(tax);
    setIsDeleteTaxModalOpen(true);
  };

  const handleDeleteTax = () => {
    console.log("Delete Tax:", selectedTax?.id);
    setDeleteLoading(true);
    // Simulate API call
    setTimeout(() => {
      setDeleteLoading(false);
      setIsDeleteTaxModalOpen(false);
      setSelectedTax(null);
    }, 1000);
    // Add API call here
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Tax Configuration
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage VAT and profit margin settings
          </p>
        </div>
      </div>

      {/* Profit Margin Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Profit Margin</h2>
          <Button
            onClick={() => setIsEditProfitMarginModalOpen(true)}
            variant="outline"
            size="sm"
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>

        <CustomCard className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Default Profit Margin</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {DUMMY_PROFIT_MARGIN.percentage}%
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {DUMMY_PROFIT_MARGIN.description}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Last updated:{" "}
                  {new Date(DUMMY_PROFIT_MARGIN.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CustomCard>
      </div>

      {/* Tax Rates Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Tax Rates</h2>
          <Button
            onClick={() => setIsAddTaxModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Tax
          </Button>
        </div>

        {isLoading ? (
          <div className="w-full space-y-2">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-12 w-full bg-[#eef4ef]" />
            ))}
          </div>
        ) : DUMMY_TAX_DATA.length > 0 ? (
          <div className="w-full overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Tax Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date Added
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white w-full">
                {DUMMY_TAX_DATA.map((tax) => (
                  <tr key={tax.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Percent className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {tax.name}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="text-sm font-semibold text-blue-600">
                        {tax.percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {tax.description}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {new Date(tax.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => handleEditClick(tax)}
                          className="rounded p-1 cursor-pointer text-green-500 hover:bg-green-50 hover:text-green-700"
                        >
                          <Edit2Icon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(tax)}
                          className="rounded p-1 cursor-pointer text-red-500 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <CustomCard className="border-gray-200">
            <div className="text-center py-12">
              <Percent className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No tax rates added</p>
              <p className="text-sm text-gray-500 mt-2">
                Click "Add Tax" to create your first tax rate
              </p>
            </div>
          </CustomCard>
        )}
      </div>

      {/* Add Tax Modal */}
      <CustomModal
        isOpen={isAddTaxModalOpen}
        onClose={() => {
          setIsAddTaxModalOpen(false);
          taxForm.reset();
        }}
        trigger={false}
        title="Add New Tax"
        description="Add a new tax rate for your taxable items"
      >
        <Form {...taxForm}>
          <form
            onSubmit={taxForm.handleSubmit(handleAddTax)}
            className="space-y-4"
          >
            <FormField
              control={taxForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., VAT, Sales Tax" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={taxForm.control}
              name="percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Percentage (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 7.5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={taxForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief description of this tax"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddTaxModalOpen(false);
                  taxForm.reset();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Add Tax
              </Button>
            </div>
          </form>
        </Form>
      </CustomModal>

      {/* Edit Tax Modal */}
      <CustomModal
        isOpen={isEditTaxModalOpen}
        onClose={() => {
          setIsEditTaxModalOpen(false);
          setSelectedTax(null);
          taxForm.reset();
        }}
        trigger={false}
        title="Edit Tax"
        description="Update tax rate information"
      >
        <Form {...taxForm}>
          <form
            onSubmit={taxForm.handleSubmit(handleEditTax)}
            className="space-y-4"
          >
            <FormField
              control={taxForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., VAT, Sales Tax" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={taxForm.control}
              name="percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Percentage (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 7.5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={taxForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief description of this tax"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditTaxModalOpen(false);
                  setSelectedTax(null);
                  taxForm.reset();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Update Tax
              </Button>
            </div>
          </form>
        </Form>
      </CustomModal>

      {/* Delete Tax Modal */}
      <CustomModal
        isOpen={isDeleteTaxModalOpen}
        onClose={() => {
          setIsDeleteTaxModalOpen(false);
          setSelectedTax(null);
        }}
        trigger={false}
        title=""
      >
        <div className="w-full flex-col items-center justify-center gap-3">
          <p className="text-center text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{selectedTax?.name}</span>?
          </p>
          <div className="flex gap-4 mx-auto justify-center w-full mt-6">
            <Button
              disabled={deleteLoading}
              onClick={handleDeleteTax}
              className="w-[100px] bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? "Deleting..." : "Confirm"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteTaxModalOpen(false);
                setSelectedTax(null);
              }}
              className="w-[100px]"
            >
              Cancel
            </Button>
          </div>
        </div>
      </CustomModal>

      {/* Edit Profit Margin Modal */}
      <CustomModal
        isOpen={isEditProfitMarginModalOpen}
        onClose={() => setIsEditProfitMarginModalOpen(false)}
        trigger={false}
        title="Edit Profit Margin"
        description="Update the default profit margin for calculating selling price"
      >
        <Form {...profitMarginForm}>
          <form
            onSubmit={profitMarginForm.handleSubmit(handleUpdateProfitMargin)}
            className="space-y-4"
          >
            <FormField
              control={profitMarginForm.control}
              name="percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profit Margin (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 30"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profitMarginForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditProfitMarginModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Update Margin
              </Button>
            </div>
          </form>
        </Form>
      </CustomModal>
    </div>
  );
};

export default Tax;
