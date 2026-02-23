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
import { Skeleton } from "@/components/ui/skeleton";
import { useAttendantsHook } from "@/hooks/useAttendantsHook";
import { CheckCircle2 } from "lucide-react";

const ROLE_PERMISSIONS = {
  ATTENDANT: {
    name: "Attendant",
    permissions: [
      "Finalize transaction",
      "See orders and manage order transactions",
      "See transactions",
    ],
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
  },
  "ADMIN-ATTENDANT": {
    name: "Admin Attendant",
    permissions: [
      "Make pre-sale",
      "Sell watch listed items",
      "See transactions",
      "Finalize transaction",
    ],
    color: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-600",
  },
  PHARMACIST: {
    name: "Pharmacist",
    permissions: [
      "Load inventory",
      "See all transactions and performance",
      "Full system access",
    ],
    color: "bg-teal-50 border-teal-200",
    iconColor: "text-teal-600",
  },
  "INVENTORY-MANAGER": {
    name: "Inventory Manager",
    permissions: [
      "Add product",
      "Restock product",
      "Edit selling price",
      "Adjust stock",
      "View sold history",
    ],
    color: "bg-lime-50 border-lime-200",
    iconColor: "text-lime-600",
  },
};

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
    editAttendantLoading,
    editform: form,
    onSubmitEditForm,
  } = useAttendantsHook({
    closeModal,
    attendantId: staff?.id,
  });

  const selectedRole = form.watch("role");

  return (
    <>
      {AttendantLoading || !attendantData ? (
        <div className="w-full mx-auto my-4 pb-6 space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-1/3 bg-[#eef4ef]" />
              <Skeleton className="h-10 w-full bg-[#eef4ef]" />
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

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ATTENDANT">Attendant</SelectItem>
                            <SelectItem value="ADMIN-ATTENDANT">
                              Admin Attendant
                            </SelectItem>
                            <SelectItem value="PHARMACIST">
                              Pharmacist
                            </SelectItem>
                            <SelectItem value="INVENTORY-MANAGER">
                              Inventory Manager
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedRole &&
                  ROLE_PERMISSIONS[
                    selectedRole as keyof typeof ROLE_PERMISSIONS
                  ] && (
                    <div
                      className={`rounded-lg border-2 p-4 ${ROLE_PERMISSIONS[selectedRole as keyof typeof ROLE_PERMISSIONS].color}`}
                    >
                      <h3 className="font-semibold text-gray-900 mb-3">
                        {
                          ROLE_PERMISSIONS[
                            selectedRole as keyof typeof ROLE_PERMISSIONS
                          ].name
                        }{" "}
                        Permissions
                      </h3>
                      <div className="space-y-2">
                        {ROLE_PERMISSIONS[
                          selectedRole as keyof typeof ROLE_PERMISSIONS
                        ].permissions.map((permission, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3"
                          >
                            <CheckCircle2
                              className={`w-5 h-5 mt-0.5 flex-shrink-0 ${ROLE_PERMISSIONS[selectedRole as keyof typeof ROLE_PERMISSIONS].iconColor}`}
                            />
                            <span className="text-sm text-gray-700 leading-relaxed">
                              {permission}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <Button
                  disabled={editAttendantLoading}
                  type="submit"
                  className="w-full h-[48px] mt-6"
                >
                  {editAttendantLoading ? <Spinner /> : "Save Changes"}
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
