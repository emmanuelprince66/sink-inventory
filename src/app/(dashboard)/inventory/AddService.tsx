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

const AddService = ({ closeModal }: { closeModal: any }) => {
  const {
    form,
    onSubmit,
    CategoriesData,
    CategoriesDataLoading,
    isCreatingService,
  } = useInventoryHook({ closeModal });

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* First Name and Last Name in same row */}
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
  );
};

export default AddService;
