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

const EditCategory = ({ categoryObj }: { categoryObj: any }) => {
  const { form, onSubmit, isEditing } = useGetAllCategories({ categoryObj });

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
            disabled={isEditing}
          >
            {isEditing ? <Spinner /> : "Save"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EditCategory;
