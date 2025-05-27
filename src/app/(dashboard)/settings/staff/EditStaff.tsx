"use client";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useAttendantsHook } from "@/hooks/useAttendantsHook";
const EditStaff = ({
  staff,
  closeModal,
}: {
  staff: any;
  closeModal: () => void;
}) => {
  const {
    AttendantLoading,
    attendantData,
    editAttendant,
    editAttendantLoading,
    editform: form,
    onSubmitEditForm,
  } = useAttendantsHook({
    closeModal,
    attendantId: staff?.id,
  });

  return (
    <>
      {AttendantLoading || !attendantData ? (
        <div className="w-full mx-auto my-4 pb-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="flex flex-col gap-6 items-start">
              <Skeleton className="h-4 w-full bg-[#eef4ef]" />
              <Skeleton className="h-6 w-full bg-[#eef4ef]" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="w-full max-w-xl bg-white p-4 rounded shadow-md">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmitEditForm)}
                className="space-y-4"
              >
                {/* First Name */}
                <FormField
                  control={form.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter first name"
                          {...field}
                          maxLength={50}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Last Name */}
                <FormField
                  control={form.control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter last name"
                          {...field}
                          maxLength={50}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Number */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Is Admin Checkbox */}
                <FormField
                  control={form.control}
                  name="is_admin"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                      <FormControl>
                        <Checkbox
                          className="border border-primary-green-300 "
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Grant admin privileges</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  disabled={editAttendantLoading}
                  type="submit"
                  className="w-full h-[48px] mt-6"
                >
                  {editAttendantLoading ? <Spinner /> : "Edit "}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      )}
    </>
  );
};

export default EditStaff;
