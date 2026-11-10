"use client";

import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StaffExpensePermissions from "./StaffExpensePermissions";
import { useUserRole } from "@/lib/store/user-store";
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
import { useAttendantsHook } from "@/hooks/useAttendantsHook";
import { useStaffPermissionMatrix } from "@/hooks/useStaffPermissionMatrix";
import StaffPermissionsMatrix from "./StaffPermissionsMatrix";

export const EditStaff = ({
  closeModal,
  attendantId,
}: {
  closeModal: () => void;
  attendantId: string;
}) => {
  const { isOwner } = useUserRole();
  const {
    editform,
    onSubmitEditForm,
    editAttendantLoading,
    AttendantLoading,
    selectedRole,
    attendantData,
  } = useAttendantsHook({
    closeModal,
    attendantId,
  });

  const matrix = useStaffPermissionMatrix({
    role: selectedRole,
    attendantId,
    savedRole: attendantData?.data?.role,
  });

  if (AttendantLoading) {
    return (
      <div className="w-full space-y-5 py-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 bg-gray-200" />
          <Skeleton className="h-4 w-72 bg-gray-100" />
        </div>
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <Skeleton className="h-4 w-36 bg-gray-200" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full bg-gray-200" />
            <Skeleton className="h-10 w-full bg-gray-200" />
          </div>
          <Skeleton className="h-10 w-full bg-gray-200" />
        </div>
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <Skeleton className="h-4 w-28 bg-gray-200" />
          <Skeleton className="h-10 w-full bg-gray-200" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-16 w-full bg-gray-100 rounded-lg" />
          <Skeleton className="h-16 w-full bg-gray-100 rounded-lg" />
          <Skeleton className="h-16 w-full bg-gray-100 rounded-lg" />
        </div>
        <Skeleton className="h-12 w-full bg-gray-200 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center overflow-y-auto py-6">
      <div className="w-full  bg-white  rounded-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Edit Staff Member
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Update staff account information and permissions
          </p>
        </div>

        <Form {...editform}>
          <form
            onSubmit={editform.handleSubmit((values) => {
              const { ok, setPermissions } = matrix.resolveForSave();
              if (ok) onSubmitEditForm(values, setPermissions);
            })}
            className="space-y-5"
          >
            {/* Personal Information Section */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editform.control}
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

                <FormField
                  control={editform.control}
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
              </div>

              <FormField
                control={editform.control}
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
            </div>

            {/* Role Selection Section */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                Role Assignment
              </h3>

              <FormField
                control={editform.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff Role</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        key={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a role for this staff member" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ATTENDANT">Attendant</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="ADMIN-ATTENDANT">
                            Admin Attendant
                          </SelectItem>
                          <SelectItem value="PHARMACIST">Pharmacist</SelectItem>
                          <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                          <SelectItem value="INVENTORY-MANAGER">
                            Inventory Manager
                          </SelectItem>
                          <SelectItem value="PRODUCTION-MANAGER">
                            Production Manager
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <StaffPermissionsMatrix {...matrix.editor} />

            <Button
              disabled={editAttendantLoading}
              type="submit"
              className="w-full h-[48px] mt-6"
            >
              {editAttendantLoading ? <Spinner /> : "Update Staff Member"}
            </Button>
          </form>
        </Form>

        {/* Expense payout rights, kept as their own section with their own
            save. They go to a different endpoint from the rest of this form,
            and folding them into the one button would mean a failed permission
            write silently discarding a successful profile edit.

            Owner-only. Gated here rather than only inside the section so it
            never mounts for anyone else: the permissions endpoint behind it is
            the owner's, and an admin-attendant editing staff would otherwise
            fire a request they are not entitled to make. */}
        {isOwner && (
          <div className="mt-8 border-t border-grey-5 pt-6">
            <StaffExpensePermissions attendantId={attendantId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EditStaff;
