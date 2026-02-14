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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDepartment } from "@/hooks/useDepartsment";

const DEPARTMENT_TYPES = [
  { value: "supermarket", label: "Supermarket" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "bakery", label: "Bakery" },
  { value: "fashion", label: "Fashion" },
  { value: "electronics", label: "Electronics" },
  { value: "home_garden", label: "Home & Garden" },
  { value: "sports", label: "Sports & Outdoors" },
  { value: "beauty", label: "Beauty & Personal Care" },
];

const AddDepartment = ({ closeModal }: { closeModal: any }) => {
  const {
    AddDepartmentForm: form,
    onAddDepartmentSubmit,
    createDepartmentLoading,
  } = useDepartment({ closeModal });

  return (
    <>
      <div className="w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onAddDepartmentSubmit)}
            className="space-y-5"
          >
            {/* Department Type Select */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Department Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select department type..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="w-full">
                      {DEPARTMENT_TYPES.map((type) => (
                        <SelectItem
                          className="w-full"
                          key={type.value}
                          value={type.value}
                        >
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Department Name */}
            {/* <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Department Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter department name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            {/* Description */}
            {/* <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter department description..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <Button
              type="submit"
              className="w-full h-[48px] "
              disabled={createDepartmentLoading}
            >
              {createDepartmentLoading ? <Spinner /> : "Save Department"}
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
};

export default AddDepartment;
