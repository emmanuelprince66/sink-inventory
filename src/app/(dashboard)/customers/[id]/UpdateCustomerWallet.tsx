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
      <div className="border bg-white    border-green-300 rounded w-full p-4 flex flex-col justify-between items-center">
        <div className="flex justify-between items-start w-full">
          <p className="text-primary-black-100 font-bold capitalize">
            {selectedOption?.toLocaleLowerCase()}
          </p>

          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline"}>Select an option</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-primary-green-200 border-none">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-white"
                    onSelect={() => handleSelectOption("DEPOSIT")}
                  >
                    Deposit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-white"
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
          <p>Balance : </p>
          <p className="text-bold text-primary-green-300">{wallet}</p>
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
                  <FormLabel>Payment Method</FormLabel> {/* Updated label */}
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full border border-green-300">
                        <SelectValue placeholder="Select a payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white cursor-pointer border border-green-100">
                      <SelectItem
                        value="MYCLIQ"
                        className="hover:bg-primary-green-300 hover:text-white   cursor-pointer "
                      >
                        Mycliq
                      </SelectItem>
                      <SelectItem
                        value="CASH"
                        className="hover:bg-primary-green-300 hover:text-white   cursor-pointer "
                      >
                        Cash
                      </SelectItem>
                      <SelectItem
                        value="BANK"
                        className="hover:bg-primary-green-300 hover:text-white   cursor-pointer "
                      >
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
