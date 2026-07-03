import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useGetCustomerByIdHook } from "@/hooks/useGetCustomerByIdHook";

const UpdateCustomerWallet = ({
  wallet,
  closeModal,
}: {
  wallet: string | number;
  closeModal: () => void;
}) => {
  const {
    form,
    onSubmit,
    isUpdatingWallet,
    handleSelectOption,
    selectedOption,
  } = useGetCustomerByIdHook({ closeModal });

  return (
    <div className="flex w-full flex-col items-start gap-3">
      <div className="border bg-white border-grey-5 rounded-xl w-full p-4 flex flex-col justify-between items-center gap-3">
        <div className="flex justify-between items-center w-full">
          <p className="text-grey-1 font-bold capitalize">
            {selectedOption?.toLocaleLowerCase()}
          </p>

          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline"}>Select an option</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white border border-grey-5">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-primary-green-300/10 hover:text-primary-green-300"
                    onSelect={() => handleSelectOption("DEPOSIT")}
                  >
                    Deposit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-primary-green-300/10 hover:text-primary-green-300"
                    onSelect={() => handleSelectOption("WITHDRAWAL")}
                  >
                    Withdrawal
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <span className="flex gap-2 items-center w-full">
          <p className="text-sm font-medium text-grey-3">Balance:</p>
          <p className="font-bold text-primary-green-300">{wallet}</p>
        </span>
      </div>

      <div className="w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 w-full"
          >
            {/* First Name and Last Name in same row */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Add Amount</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter an amount...." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem className="flex-1 w-full bg-white">
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white cursor-pointer">
                      <SelectItem value="MYCLIQ" className="cursor-pointer">
                        Mycliq
                      </SelectItem>
                      <SelectItem value="CASH" className="cursor-pointer">
                        Cash
                      </SelectItem>
                      <SelectItem value="BANK" className="cursor-pointer">
                        Bank Transfer
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Add a note</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter note description...."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-[48px] "
              disabled={isUpdatingWallet}
            >
              {isUpdatingWallet ? <Spinner /> : "Save"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UpdateCustomerWallet;
