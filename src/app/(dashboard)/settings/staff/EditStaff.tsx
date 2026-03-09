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

export const EditStaff = ({
  closeModal,
  attendantId,
}: {
  closeModal: () => void;
  attendantId: string;
}) => {
  const { editform, onSubmitEditForm, editAttendantLoading, AttendantLoading } =
    useAttendantsHook({
      closeModal,
      attendantId,
    });

  const selectedRole = editform.watch("role");
  const canCreatePresale = editform.watch("canCreatePresale");
  const canLoadPresalesAndFinalize = editform.watch(
    "canLoadPresalesAndFinalize",
  );
  const canSellWatchlisted = editform.watch("canSellWatchlisted");

  if (AttendantLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="w-full max-w-xl bg-white p-4 rounded shadow-md">
        <Form {...editform}>
          <form
            onSubmit={editform.handleSubmit(onSubmitEditForm)}
            className="space-y-4"
          >
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

            <FormField
              control={editform.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ATTENDANT">Attendant</SelectItem>
                        <SelectItem value="ADMIN-ATTENDANT">
                          Admin Attendant
                        </SelectItem>
                        <SelectItem value="PHARMACIST">Pharmacist</SelectItem>
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

            {/* Pharmacist Permissions - Checkbox based */}
            {selectedRole === "PHARMACIST" && (
              <div className="rounded-lg border-2 border-teal-200 bg-teal-50 p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Pharmacist Permissions
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select the permissions for this pharmacist
                </p>

                {/* Create Presale */}
                <FormField
                  control={editform.control}
                  name="canCreatePresale"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-3  p-3 rounded-md bg-white border border-teal-100 hover:border-teal-300 transition-colors">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value || false}
                            onChange={field.onChange}
                            className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2 cursor-pointer"
                          />
                        </FormControl>
                        <div className="flex-1">
                          <FormLabel className="text-sm font-medium text-gray-900 cursor-pointer">
                            Create Presale
                          </FormLabel>
                          <p className="text-xs text-gray-600 mt-0.5">
                            Allow this user to create presales for pharmacy
                            items
                          </p>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Load Presales and Finalize Transaction */}
                <FormField
                  control={editform.control}
                  name="canLoadPresalesAndFinalize"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-3 p-3 rounded-md bg-white border border-teal-100 hover:border-teal-300 transition-colors">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value || false}
                            onChange={field.onChange}
                            className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2 cursor-pointer"
                          />
                        </FormControl>
                        <div className="flex-1">
                          <FormLabel className="text-sm font-medium text-gray-900 cursor-pointer">
                            Load Presales and Finalize Transaction
                          </FormLabel>
                          <p className="text-xs text-gray-600 mt-0.5">
                            Load presales and complete transaction payments
                            (like attendant but for pharmacy)
                          </p>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sell Watchlisted Item */}
                <FormField
                  control={editform.control}
                  name="canSellWatchlisted"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-3  p-3 rounded-md bg-white border border-teal-100 hover:border-teal-300 transition-colors">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value || false}
                            onChange={field.onChange}
                            className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2 cursor-pointer"
                          />
                        </FormControl>
                        <div className="flex-1">
                          <FormLabel className="text-sm font-medium text-gray-900 cursor-pointer">
                            Sell Watchlisted Item
                          </FormLabel>
                          <p className="text-xs text-gray-600 mt-0.5">
                            Allow this user to view and sell watchlisted
                            inventory items
                          </p>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Role Permissions Display */}
            {selectedRole &&
              selectedRole !== "PHARMACIST" &&
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
                      <div key={index} className="flex items-start space-x-3">
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

            {/* Show selected permissions summary for Pharmacist */}
            {selectedRole === "PHARMACIST" &&
              (canCreatePresale ||
                canLoadPresalesAndFinalize ||
                canSellWatchlisted) && (
                <div className="rounded-lg border-2 p-4 bg-teal-50 border-teal-200">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Selected Permissions Summary
                  </h3>
                  <div className="space-y-2">
                    {canCreatePresale && (
                      <div className="flex items-start space-x-3">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-teal-600" />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can create presales
                        </span>
                      </div>
                    )}
                    {canLoadPresalesAndFinalize && (
                      <div className="flex items-start space-x-3">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-teal-600" />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can load presales and finalize transactions
                        </span>
                      </div>
                    )}
                    {canSellWatchlisted && (
                      <div className="flex items-start space-x-3">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-teal-600" />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can see and sell watchlisted items
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            <Button
              disabled={editAttendantLoading}
              type="submit"
              className="w-full h-[48px] mt-6"
            >
              {editAttendantLoading ? <Spinner /> : "Update Staff Member"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditStaff;
