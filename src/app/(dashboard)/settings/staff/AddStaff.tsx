"use client";

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
import { useAttendantsHook } from "@/hooks/useAttendantsHook";
import { useStaffPermissionMatrix } from "@/hooks/useStaffPermissionMatrix";
import StaffPermissionsMatrix from "./StaffPermissionsMatrix";

export const AddStaff = ({ closeModal }: { closeModal: () => void }) => {
  const {
    form,
    onSubmit,
    createStaffLoading,
    selectedRole,
  } = useAttendantsHook({
    closeModal,
  });

  const matrix = useStaffPermissionMatrix({
    role: selectedRole,
  });

  return (
    <div className="flex h-full w-full items-center justify-center overflow-y-auto py-6">
      <div className="w-full max-w-full bg-white  rounded-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add Staff Member</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create a new staff account with appropriate role and permissions
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => {
              const { ok, setPermissions } = matrix.resolveForSave();
              if (ok) onSubmit(values, setPermissions);
            })} className="space-y-5">
            {/* Personal Information Section */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

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
            </div>

            {/* Role Selection Section */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                Role Assignment
              </h3>

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff Role</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
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
              disabled={createStaffLoading}
              type="submit"
              className="w-full h-[48px] mt-6"
            >
              {createStaffLoading ? <Spinner /> : "Add Staff Member"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddStaff;
