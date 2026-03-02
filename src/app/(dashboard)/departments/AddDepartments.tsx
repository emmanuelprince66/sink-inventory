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
import { useDepartment } from "@/hooks/useDepartment";

const AddDepartments = ({ closeModal }: { closeModal: () => void }) => {
  const {
    AddDepartmentForm: form,
    onAddDepartmentSubmit,
    createDepartmentLoading,
  } = useDepartment({ closeModal });

  return (
    <div className="w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onAddDepartmentSubmit)}
          className="space-y-5"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter department name..."
                    {...field}
                    maxLength={100}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-[48px]"
            disabled={createDepartmentLoading}
          >
            {createDepartmentLoading ? <Spinner /> : "Save Department"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddDepartments;
