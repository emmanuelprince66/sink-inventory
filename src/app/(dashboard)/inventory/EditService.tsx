import { Spinner } from "@/components/app/Spinner";
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
    isCreatingService,
  } = useInventoryHook({ closeModal, service, serviceId });

  console.log("forms", form.getValues());
  return (
    <div>
      <div className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* First Name and Last Name in same row */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => {
                const fileInputRef = useRef<HTMLInputElement>(null);
                const [previewUrl, setPreviewUrl] = useState<string | null>(
                  null
                );

                // Handle file change separately from rendering preview
                const handleFileChange = (
                  e: React.ChangeEvent<HTMLInputElement>
                ) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    field.onChange(file);
                    if (previewUrl) {
                      URL.revokeObjectURL(previewUrl);
                    }
                    setPreviewUrl(URL.createObjectURL(file));
                  }
                };

                return (
                  <FormItem className="flex flex-col items-center gap-2">
                    <FormLabel>Product Image</FormLabel>
                    <div
                      className="relative w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {previewUrl ||
                      (typeof field.value === "string" && field.value) ? (
                        <>
                          <img
                            src={
                              previewUrl ||
                              (typeof field.value === "string"
                                ? field.value
                                : "")
                            }
                            alt="Product preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
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
                            className="mx-auto h-12 w-12 text-gray-400"
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
                          <span className="text-xs text-gray-500">
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

            <FormField
              control={form.control}
              name="category" // You might want to rename this to "category" or similar
              render={({ field }) => (
                <FormItem className="flex-1 w-full bg-white">
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full border border-green-300">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white cursor-pointer border border-green-100">
                      {!CategoriesDataLoading
                        ? CategoriesData?.data?.map((category: any) => (
                            <SelectItem
                              key={category.id}
                              value={category.id}
                              className="hover:bg-primary-green-300 hover:text-white cursor-pointer"
                            >
                              {category.name}
                            </SelectItem>
                          ))
                        : "Loading..."}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Amount...." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-[48px] "
              disabled={isCreatingService}
            >
              {isCreatingService ? <Spinner /> : "Save"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditService;
