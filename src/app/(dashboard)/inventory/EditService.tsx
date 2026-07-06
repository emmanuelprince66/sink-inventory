import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInventoryHook } from "@/hooks/useInventoryHook";
import { useRef, useState } from "react";

const EditService = ({
  serviceId,
  service,
  type,
  closeModal,
}: {
  serviceId: string;
  service: any;
  type: any;
  closeModal: any;
}) => {
  const {
    form,
    onSubmit,
    CategoriesData,
    CategoriesDataLoading,
    loading,
    isFormReady,
  } = useInventoryHook({ closeModal, service, serviceId });

  // Mirror the pattern from useAddNewProductHook/NewAddProduct:
  // block render until categories are loaded AND form.reset has completed
  // This eliminates the flash of empty values before useEffect fires
  if (CategoriesDataLoading || !CategoriesData || !isFormReady) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Image Upload */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => {
                const fileInputRef = useRef<HTMLInputElement>(null);
                const [previewUrl, setPreviewUrl] = useState<string | null>(
                  null,
                );

                const handleFileChange = (
                  e: React.ChangeEvent<HTMLInputElement>,
                ) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    field.onChange(file);
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(URL.createObjectURL(file));
                  }
                };

                const displaySrc =
                  previewUrl ||
                  (typeof field.value === "string" ? field.value : null);

                return (
                  <FormItem className="flex flex-col items-center gap-2">
                    <FormLabel>Service Image</FormLabel>
                    <div
                      className="relative w-32 h-32 rounded-full border-2 border-dashed border-grey-5 hover:border-primary-green-300 flex items-center justify-center overflow-hidden cursor-pointer transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {displaySrc ? (
                        <>
                          <img
                            src={displaySrc}
                            alt="Service preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-error-1 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              field.onChange(undefined);
                              if (previewUrl) {
                                URL.revokeObjectURL(previewUrl);
                                setPreviewUrl(null);
                              }
                            }}
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <svg
                            className="mx-auto h-12 w-12 text-grey-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-xs font-medium text-grey-4">
                            Click to upload
                          </span>
                        </div>
                      )}
                    </div>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {field.value ? "Change Image" : "Select Image"}
                    </Button>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Service Name */}
            <FormField
              control={form.control}
              name="service_name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Service Name...." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Description...." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category — rendered only after CategoriesData is loaded, value is controlled */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="flex-1 w-full bg-white">
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white cursor-pointer">
                      {CategoriesData?.data?.map((category: any) => (
                        <SelectItem
                          key={category.id}
                          value={category.id}
                          className="hover:bg-primary-green-300 hover:text-white cursor-pointer"
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter Amount...."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* VAT Checkbox */}
            <FormField
              control={form.control}
              name="vat"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 rounded-xl border border-grey-5 p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="leading-none">
                    <FormLabel className="text-sm font-medium cursor-pointer">
                      Apply VAT to this service
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-[48px]"
              disabled={loading}
            >
              {loading ? <Spinner /> : "Update Service"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditService;
