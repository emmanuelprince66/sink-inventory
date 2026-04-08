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

export const AddStaff = ({ closeModal }: { closeModal: () => void }) => {
  const {
    form,
    onSubmit,
    createStaffLoading,
    selectedRole,
    permissions,
    roleConfig,
    getSelectedPermissionsCount,
  } = useAttendantsHook({
    closeModal,
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
                    name="set_permissions.process_sales"
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
                              Process Sales
                            </FormLabel>
                            <p className="text-xs text-gray-600 mt-1">
                              Load presales and complete sales transactions
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="set_permissions.make_presale"
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
                              Make Presale
                            </FormLabel>
                            <p className="text-xs text-gray-600 mt-1">
                              Create and manage presale transactions
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="set_permissions.sell_watchlist"
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
                              Ability to sell items marked on the watchlist
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

            {/* Accountant Custom Permissions */}
            {selectedRole === "ACCOUNTANT" && (
              <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-5 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Accountant Permissions
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure financial visibility and access permissions
                  </p>
                </div>

                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="set_permissions.view_transactions"
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
                              Access all transaction records and financial data
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="set_permissions.view_orders"
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
                              View Orders and History
                            </FormLabel>
                            <p className="text-xs text-gray-600 mt-1">
                              Review order history and transaction records
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4 p-3 bg-blue-100 rounded-md">
                  <p className="text-xs text-blue-800 font-medium">
                    Note: Accountants have view-only access to inventory and
                    cannot perform restocking, transfers, returns, or damage
                    operations.
                  </p>
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
                  {/* <FormField
                    control={form.control}
                    name="set_permissions.manage_inventory_across_branches"
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
                  /> */}

                  <FormField
                    control={form.control}
                    name="set_permissions.restock_products"
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
                    name="set_permissions.move_items_to_production"
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
                    name="set_permissions.transfer_items"
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
                    name="set_permissions.return_items"
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
                    name="set_permissions.damage_items"
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

            {/* Production Manager Custom Permissions */}
            {selectedRole === "PRODUCTION-MANAGER" && (
              <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-5 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Production Manager Permissions
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure production and inventory management permissions
                  </p>
                </div>

                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="set_permissions.restock_products"
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
                              Restock Products
                            </FormLabel>
                            <p className="text-xs text-gray-600 mt-1">
                              Add new inventory quantities for production items
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="set_permissions.damage_items"
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
                              Document damaged or unusable production items
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="set_permissions.return_items"
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
                              Process Product Returns
                            </FormLabel>
                            <p className="text-xs text-gray-600 mt-1">
                              Handle returned items and process them back into
                              inventory
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="set_permissions.raw_material"
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
                              Can View Raw Materials
                            </FormLabel>
                            <p className="text-xs text-gray-600 mt-1">
                              Access and view raw material inventory items
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="set_permissions.transfer_items"
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
                              Transfer Products
                            </FormLabel>
                            <p className="text-xs text-gray-600 mt-1">
                              Transfer products to other branches or locations
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4 p-3 bg-amber-100 rounded-md">
                  <p className="text-xs text-amber-800 font-medium">
                    Note: Production Managers cannot sell at POS, view payments,
                    or see checklist products.
                  </p>
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

            {/* Permissions Summary for roles with custom permissions */}
            {roleConfig &&
              roleConfig.hasCustomPermissions &&
              getSelectedPermissionsCount() > 0 && (
                <div className={`rounded-lg border-2 p-5 ${roleConfig.color}`}>
                  <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                    Selected Permissions Summary (
                    {getSelectedPermissionsCount()} selected)
                  </h3>
                  <div className="space-y-2">
                    {/* {permissions.manage_inventory_across_branches && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${roleConfig.iconColor}`}
                        />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can manage inventory across multiple branches
                        </span>
                      </div>
                    )} */}
                    {permissions.restock_products && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${roleConfig.iconColor}`}
                        />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can restock products
                        </span>
                      </div>
                    )}
                    {permissions.move_items_to_production && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${roleConfig.iconColor}`}
                        />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can move items to production
                        </span>
                      </div>
                    )}
                    {permissions.transfer_items && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${roleConfig.iconColor}`}
                        />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can transfer to other locations
                        </span>
                      </div>
                    )}
                    {permissions.return_items && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${roleConfig.iconColor}`}
                        />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can process product returns
                        </span>
                      </div>
                    )}
                    {permissions.damage_items && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${roleConfig.iconColor}`}
                        />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can record damaged products
                        </span>
                      </div>
                    )}
                    {permissions.raw_material && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${roleConfig.iconColor}`}
                        />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can view raw materials
                        </span>
                      </div>
                    )}
                    {permissions.process_sales && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${roleConfig.iconColor}`}
                        />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can process sales
                        </span>
                      </div>
                    )}
                    {permissions.make_presale && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${roleConfig.iconColor}`}
                        />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can make presale
                        </span>
                      </div>
                    )}
                    {permissions.sell_watchlist && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${roleConfig.iconColor}`}
                        />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can sell watchlisted items
                        </span>
                      </div>
                    )}
                    {permissions.view_transactions && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${roleConfig.iconColor}`}
                        />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can view transactions
                        </span>
                      </div>
                    )}
                    {permissions.view_orders && (
                      <div className="flex items-start space-x-3 bg-white/50 p-2 rounded">
                        <CheckCircle2
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${roleConfig.iconColor}`}
                        />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          Can view orders and history
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
