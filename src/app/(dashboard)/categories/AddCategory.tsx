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
import { useGetAllCategories } from "@/hooks/useGetAllCategories";

type CategoryType = "PRODUCT" | "SERVICE" | "EXPENSES";

const AddCategory = ({
  type,
  closeModal,
  allowTypeSelection = false,
}: {
  type?: CategoryType;
  closeModal: any;
  allowTypeSelection?: boolean;
}) => {
  const {
    AddCategoryForm: form,
    onAddCategorySubmit,
    createCategoryLoading,
  } = useGetAllCategories({ type, closeModal });
  return (
    <>
      <div className="w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onAddCategorySubmit)}
            className="space-y-5"
          >
            {/* First Name and Last Name in same row */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Category Name...." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {allowTypeSelection && (
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="PRODUCT">Product</SelectItem>
                        <SelectItem value="SERVICE">Service</SelectItem>
                        <SelectItem value="EXPENSES">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button
              type="submit"
              className="w-full h-[48px] "
              disabled={createCategoryLoading}
            >
              {createCategoryLoading ? <Spinner /> : "Save"}
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
};

export default AddCategory;
