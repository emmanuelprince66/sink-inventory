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
import { CheckCircle2, XCircle } from "lucide-react";

const ROLE_PERMISSIONS = {
  ATTENDANT: {
    name: "Attendant",
    description:
      "Front-line staff member responsible for completing sales and managing customer transactions",
    permissions: [
      "Finalize transaction",
      "See orders and manage order transactions",
      "See transactions",
    ],
    restrictions: [],
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
    hasCustomPermissions: false,
  },
  "ADMIN-ATTENDANT": {
    name: "Admin Attendant",
    description:
      "Senior attendant with extended privileges for managing special sales and watchlisted items",
    permissions: [
      "Make pre-sale",
      "Sell watch listed items",
      "See transactions",
      "Finalize transaction",
    ],
    restrictions: [],
    color: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-600",
    hasCustomPermissions: false,
  },
  PHARMACIST: {
    name: "Pharmacist",
    description:
      "Licensed pharmacy professional with full system access and inventory management",
    permissions: [
      "Load inventory",
      "See all transactions and performance",
      "Full system access",
    ],
    restrictions: [],
    color: "bg-teal-50 border-teal-200",
    iconColor: "text-teal-600",
    hasCustomPermissions: true,
  },
  ACCOUNTANT: {
    name: "Accountant",
    description:
      "Financial oversight role with comprehensive transaction visibility across all branches",
    permissions: [
      "View transactions",
      "Access all transactions",
      "Inventory visibility",
      "Access all branches",
    ],
    restrictions: [
      "Cannot restock products",
      "Cannot transfer inventory",
      "Cannot process returns/damaged/production items",
    ],
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
    hasCustomPermissions: true,
  },
  "INVENTORY-MANAGER": {
    name: "Inventory Manager",
    description:
      "Comprehensive inventory control across multiple locations with full product lifecycle management",
    permissions: [
      "Manage inventory across multiple branches",
      "Restock products",
      "Move items to production",
      "Transfer to other locations",
      "Process product returns",
      "Record damaged products",
    ],
    restrictions: [
      "Cannot view transactions",
      "Cannot access orders",
      "Cannot access POS",
      "Cannot view transaction reports",
    ],
    color: "bg-lime-50 border-lime-200",
    iconColor: "text-lime-600",
    hasCustomPermissions: true,
  },
  "PRODUCTION-MANAGER": {
    name: "Production Manager",
    description:
      "Specialized role focused on production inventory and quality control",
    permissions: [
      "Access inventory",
      "Restock products only",
      "Record damaged products",
    ],
    restrictions: [
      "Cannot transfer products to other branches",
      "Cannot process returns",
    ],
    color: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-600",
    hasCustomPermissions: true,
  },
};

export const AddStaff = ({ closeModal }: { closeModal: () => void }) => {
  const { form, onSubmit, createStaffLoading } = useAttendantsHook({
    closeModal,
  });

  const selectedRole = form.watch("role");
  const canCreatePresale = form.watch("canCreatePresale");
  const canLoadPresalesAndFinalize = form.watch("canLoadPresalesAndFinalize");
  const canSellWatchlisted = form.watch("canSellWatchlisted");

  // Inventory Manager permissions
  const canManageMultipleBranches = form.watch("canManageMultipleBranches");
  const canRestock = form.watch("canRestock");
  const canMoveToProduction = form.watch("canMoveToProduction");
  const canTransfer = form.watch("canTransfer");
  const canReturnProduct = form.watch("canReturnProduct");
  const canRecordDamaged = form.watch("canRecordDamaged");

  // Accountant permissions
  const canViewTransactions = form.watch("canViewTransactions");
  const canAccessAllTransactions = form.watch("canAccessAllTransactions");
  const canViewInventory = form.watch("canViewInventory");
  const canAccessAllBranches = form.watch("canAccessAllBranches");

  // Production Manager permissions
  const canAccessInventory = form.watch("canAccessInventory");
  const canRestockProduction = form.watch("canRestockProduction");
  const canRecordDamagedProduction = form.watch("canRecordDamagedProduction");

  const roleConfig = selectedRole
    ? ROLE_PERMISSIONS[selectedRole as keyof typeof ROLE_PERMISSIONS]
    : null;

  return (
    <div className="flex h-full w-full items-center justify-center overflow-y-auto py-6">
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add Staff Member</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create a new staff account with appropriate role and permissions
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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

            {/* Pharmacist Custom Permissions */}
            {selectedRole === "PHARMACIST" && (
              <div className="rounded-lg border-2 border-teal-200 bg-teal-50 p-5 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Pharmacist Permissions
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Customize specific permissions for this pharmacist role
                  </p>
                </div>

                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="canLoadPresalesAndFinalize"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start gap-3 p-4 rounded-md bg-white border border-teal-100 hover:border-teal-300 transition-colors">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value || false}
                              onChange={field.onChange}
                              className="w-5 h-5 mt-0.5 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2 cursor-pointer"
                            />
                          </FormControl>
                          <div className="flex-1">
                            <FormLabel className="text-sm font-semibold text-gray-900 cursor-pointer block">
                              Load Presales and Finalize Transaction
                            </FormLabel>
                            <p className="text-xs text-gray-600 mt-1">
                              Enables loading of pre-created sales and
                              completing payment transactions for pharmacy items
                              (similar to attendant role but specific to
                              pharmacy operations)
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="canSellWatchlisted"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start gap-3 p-4 rounded-md bg-white border border-teal-100 hover:border-teal-300 transition-colors">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value || false}
                              onChange={field.onChange}
                              className="w-5 h-5 mt-0.5 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2 cursor-pointer"
                            />
                          </FormControl>
                          <div className="flex-1">
                            <FormLabel className="text-sm font-semibold text-gray-900 cursor-pointer block">
                              Sell Watchlisted Items
                            </FormLabel>
                            <p className="text-xs text-gray-600 mt-1">
                              Grants access to view and process sales for
                              inventory items marked as watchlisted or requiring
                              special authorization
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Inventory Manager Custom Permissions */}
            {selectedRole === "INVENTORY-MANAGER" && (
              <div className="rounded-lg border-2 border-lime-200 bg-lime-50 p-5 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Inventory Manager Permissions
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Select the specific inventory management capabilities for
                    this role
                  </p>
                </div>

                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="canManageMultipleBranches"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start gap-3 p-4 rounded-md bg-white border border-lime-100 hover:border-lime-300 transition-colors">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value || false}
                              onChange={field.onChange}
                              className="w-5 h-5 mt-0.5 text-lime-600 bg-gray-100 border-gray-300 rounded focus:ring-lime-500 focus:ring-2 cursor-pointer"
                            />
                          </FormControl>
                          <div className="flex-1">
                            <FormLabel className="text-sm font-semibold text-gray-900 cursor-pointer block">
                              Manage Inventory Across Multiple Branches
                            </FormLabel>
                            <p className="text-xs text-gray-600 mt-1">
                              Full visibility and control over inventory
                              operations at all business locations
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="canRestock"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start gap-3 p-4 rounded-md bg-white border border-lime-100 hover:border-lime-300 transition-colors">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value || false}
                              onChange={field.onChange}
                              className="w-5 h-5 mt-0.5 text-lime-600 bg-gray-100 border-gray-300 rounded focus:ring-lime-500 focus:ring-2 cursor-pointer"
                            />
                          </FormControl>
                          <div className="flex-1">
                            <FormLabel className="text-sm font-semibold text-gray-900 cursor-pointer block">
                              Restock Products
                            </FormLabel>
                            <p className="text-xs text-gray-600 mt-1">
                              Add new inventory quantities and manage stock
                              replenishment operations
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="canMoveToProduction"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start gap-3 p-4 rounded-md bg-white border border-lime-100 hover:border-lime-300 transition-colors">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value || false}
                              onChange={field.onChange}
                              className="w-5 h-5 mt-0.5 text-lime-600 bg-gray-100 border-gray-300 rounded focus:ring-lime-500 focus:ring-2 cursor-pointer"
                            />
                          </FormControl>
                          <div className="flex-1">
                            <FormLabel className="text-sm font-semibold text-gray-900 cursor-pointer block">
                              Move Items to Production
                            </FormLabel>
                            <p className="text-xs text-gray-600 mt-1">
                              Transfer inventory items from stock to production
                              areas for processing or manufacturing
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="canTransfer"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start gap-3 p-4 rounded-md bg-white border border-lime-100 hover:border-lime-300 transition-colors">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value || false}
                              onChange={field.onChange}
                              className="w-5 h-5 mt-0.5 text-lime-600 bg-gray-100 border-gray-300 rounded focus:ring-lime-500 focus:ring-2 cursor-pointer"
                            />
                          </FormControl>
                          <div className="flex-1">
                            <FormLabel className="text-sm font-semibold text-gray-900 cursor-pointer block">
                              Transfer to Other Locations
                            </FormLabel>
                            <p className="text-xs text-gray-600 mt-1">
                              Move inventory between different business branches
                              or warehouse locations
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="canReturnProduct"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start gap-3 p-4 rounded-md bg-white border border-lime-100 hover:border-lime-300 transition-colors">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value || false}
                              onChange={field.onChange}
                              className="w-5 h-5 mt-0.5 text-lime-600 bg-gray-100 border-gray-300 rounded focus:ring-lime-500 focus:ring-2 cursor-pointer"
                            />
                          </FormControl>
                          <div className="flex-1">
                            <FormLabel className="text-sm font-semibold text-gray-900 cursor-pointer block">
                              Process Product Returns
                            </FormLabel>
                            <p className="text-xs text-gray-600 mt-1">
                              Handle returned items and process them back into
                              inventory system
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="canRecordDamaged"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start gap-3 p-4 rounded-md bg-white border border-lime-100 hover:border-lime-300 transition-colors">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value || false}
                              onChange={field.onChange}
                              className="w-5 h-5 mt-0.5 text-lime-600 bg-gray-100 border-gray-300 rounded focus:ring-lime-500 focus:ring-2 cursor-pointer"
                            />
                          </FormControl>
                          <div className="flex-1">
                            <FormLabel className="text-sm font-semibold text-gray-900 cursor-pointer block">
                              Record Damaged Products
                            </FormLabel>
                            <p className="text-xs text-gray-600 mt-1">
                              Document and process damaged or unusable inventory
                              items for write-off
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Accountant Permissions - Checkbox based */}
            {selectedRole === "ACCOUNTANT" && (
              <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-5 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Accountant Permissions
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Select the specific financial and reporting capabilities for
                    this accountant
                  </p>
                </div>

                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="canViewTransactions"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start gap-3 p-4 rounded-md bg-white border border-blue-100 hover:border-blue-300 transition-colors">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value || false}
                              onChange={field.onChange}
                              className="w-5 h-5 mt-0.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                            />
                          </FormControl>
                          <div className="flex-1">
                            <FormLabel className="text-sm font-semibold text-gray-900 cursor-pointer block">
                              View Transactions
                            </FormLabel>
                            <p className="text-xs text-gray-600 mt-1">
                              Access to view all transaction records and payment
                              details
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="canAccessAllTransactions"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start gap-3 p-4 rounded-md bg-white border border-blue-100 hover:border-blue-300 transition-colors">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value || false}
                              onChange={field.onChange}
                              className="w-5 h-5 mt-0.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                            />
                          </FormControl>
                          <div className="flex-1">
                            <FormLabel className="text-sm font-semibold text-gray-900 cursor-pointer block">
                              Access All Transactions
                            </FormLabel>
                            <p className="text-xs text-gray-600 mt-1">
                              Complete access to all transaction history
                              including historical data and reports
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="canViewInventory"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start gap-3 p-4 rounded-md bg-white border border-blue-100 hover:border-blue-300 transition-colors">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value || false}
                              onChange={field.onChange}
                              className="w-5 h-5 mt-0.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                            />
                          </FormControl>
                          <div className="flex-1">
                            <FormLabel className="text-sm font-semibold text-gray-900 cursor-pointer block">
                              Inventory Visibility
                            </FormLabel>
                            <p className="text-xs text-gray-600 mt-1">
                              Read-only access to inventory levels, product
                              values, and stock reports
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="canAccessAllBranches"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start gap-3 p-4 rounded-md bg-white border border-blue-100 hover:border-blue-300 transition-colors">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value || false}
                              onChange={field.onChange}
                              className="w-5 h-5 mt-0.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                            />
                          </FormControl>
                          <div className="flex-1">
                            <FormLabel className="text-sm font-semibold text-gray-900 cursor-pointer block">
                              Access All Branches
                            </FormLabel>
                            <p className="text-xs text-gray-600 mt-1">
                              View financial data and reports across all
                              business branches and locations
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Production Manager Permissions - Checkbox based */}
            {selectedRole === "PRODUCTION-MANAGER" && (
              <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-5 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Production Manager Permissions
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Select the specific production and inventory capabilities
                    for this role
                  </p>
                </div>

                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="canAccessInventory"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start gap-3 p-4 rounded-md bg-white border border-amber-100 hover:border-amber-300 transition-colors">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value || false}
                              onChange={field.onChange}
                              className="w-5 h-5 mt-0.5 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 focus:ring-2 cursor-pointer"
                            />
                          </FormControl>
                          <div className="flex-1">
                            <FormLabel className="text-sm font-semibold text-gray-900 cursor-pointer block">
                              Access Inventory
                            </FormLabel>
                            <p className="text-xs text-gray-600 mt-1">
                              View production inventory levels, raw materials,
                              and finished goods
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="canRestockProduction"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start gap-3 p-4 rounded-md bg-white border border-amber-100 hover:border-amber-300 transition-colors">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value || false}
                              onChange={field.onChange}
                              className="w-5 h-5 mt-0.5 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 focus:ring-2 cursor-pointer"
                            />
                          </FormControl>
                          <div className="flex-1">
                            <FormLabel className="text-sm font-semibold text-gray-900 cursor-pointer block">
                              Restock Products Only
                            </FormLabel>
                            <p className="text-xs text-gray-600 mt-1">
                              Add new production inventory quantities and manage
                              stock replenishment for production items only
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="canRecordDamagedProduction"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start gap-3 p-4 rounded-md bg-white border border-amber-100 hover:border-amber-300 transition-colors">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value || false}
                              onChange={field.onChange}
                              className="w-5 h-5 mt-0.5 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 focus:ring-2 cursor-pointer"
                            />
                          </FormControl>
                          <div className="flex-1">
                            <FormLabel className="text-sm font-semibold text-gray-900 cursor-pointer block">
                              Record Damaged Products
                            </FormLabel>
                            <p className="text-xs text-gray-600 mt-1">
                              Document and track damaged or defective items
                              during production process
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Standard Role Permissions Display */}
            {roleConfig && !roleConfig.hasCustomPermissions && (
              <div className={`rounded-lg border-2 p-5 ${roleConfig.color}`}>
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {roleConfig.name} Role Overview
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {roleConfig.description}
                  </p>
                </div>

                {/* Permissions */}
                {roleConfig.permissions.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-800 text-sm mb-2 uppercase tracking-wide">
                      Permissions
                    </h4>
                    <div className="space-y-2">
                      {roleConfig.permissions.map((permission, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 bg-white/50 p-2 rounded"
                        >
                          <CheckCircle2
                            className={`w-5 h-5 mt-0.5 flex-shrink-0 ${roleConfig.iconColor}`}
                          />
                          <span className="text-sm text-gray-700 leading-relaxed">
                            {permission}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Restrictions */}
                {roleConfig.restrictions &&
                  roleConfig.restrictions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm mb-2 uppercase tracking-wide">
                        Restrictions
                      </h4>
                      <div className="space-y-2">
                        {roleConfig.restrictions.map((restriction, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 bg-white/50 p-2 rounded"
                          >
                            <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
                            <span className="text-sm text-gray-700 leading-relaxed">
                              {restriction}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Pharmacist Permissions Summary */}
            {selectedRole === "PHARMACIST" &&
              (canCreatePresale ||
                canLoadPresalesAndFinalize ||
                canSellWatchlisted) && (
                <div className="rounded-lg border-2 p-5 bg-teal-50 border-teal-200">
                  <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                    Selected Permissions Summary
                  </h3>
                  <div className="space-y-2">
                    {canCreatePresale && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-teal-600" />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can create presales
                        </span>
                      </div>
                    )}
                    {canLoadPresalesAndFinalize && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-teal-600" />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can load presales and finalize transactions
                        </span>
                      </div>
                    )}
                    {canSellWatchlisted && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-teal-600" />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can see and sell watchlisted items
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Inventory Manager Permissions Summary */}
            {selectedRole === "INVENTORY-MANAGER" &&
              (canManageMultipleBranches ||
                canRestock ||
                canMoveToProduction ||
                canTransfer ||
                canReturnProduct ||
                canRecordDamaged) && (
                <div className="rounded-lg border-2 p-5 bg-lime-50 border-lime-200">
                  <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                    Selected Permissions Summary
                  </h3>
                  <div className="space-y-2">
                    {canManageMultipleBranches && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-lime-600" />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can manage inventory across multiple branches
                        </span>
                      </div>
                    )}
                    {canRestock && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-lime-600" />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can restock products
                        </span>
                      </div>
                    )}
                    {canMoveToProduction && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-lime-600" />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can move items to production
                        </span>
                      </div>
                    )}
                    {canTransfer && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-lime-600" />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can transfer to other locations
                        </span>
                      </div>
                    )}
                    {canReturnProduct && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-lime-600" />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can process product returns
                        </span>
                      </div>
                    )}
                    {canRecordDamaged && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-lime-600" />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can record damaged products
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Accountant Permissions Summary */}
            {selectedRole === "ACCOUNTANT" &&
              (canViewTransactions ||
                canAccessAllTransactions ||
                canViewInventory ||
                canAccessAllBranches) && (
                <div className="rounded-lg border-2 p-5 bg-blue-50 border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                    Selected Permissions Summary
                  </h3>
                  <div className="space-y-2">
                    {canViewTransactions && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can view transactions
                        </span>
                      </div>
                    )}
                    {canAccessAllTransactions && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can access all transactions
                        </span>
                      </div>
                    )}
                    {canViewInventory && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Has inventory visibility
                        </span>
                      </div>
                    )}
                    {canAccessAllBranches && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can access all branches
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Production Manager Permissions Summary */}
            {selectedRole === "PRODUCTION-MANAGER" &&
              (canAccessInventory ||
                canRestockProduction ||
                canRecordDamagedProduction) && (
                <div className="rounded-lg border-2 p-5 bg-amber-50 border-amber-200">
                  <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                    Selected Permissions Summary
                  </h3>
                  <div className="space-y-2">
                    {canAccessInventory && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-600" />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can access inventory
                        </span>
                      </div>
                    )}
                    {canRestockProduction && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-600" />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can restock products
                        </span>
                      </div>
                    )}
                    {canRecordDamagedProduction && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-600" />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can record damaged products
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
