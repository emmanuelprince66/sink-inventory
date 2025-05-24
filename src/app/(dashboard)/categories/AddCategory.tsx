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
import { useGetAllCategories } from "@/hooks/useGetAllCategories";
const AddCategory = ({
  type,
  closeModal,
}: {
  type: string;
  closeModal: any;
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
                    <Input placeholder="Customer Name...." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
