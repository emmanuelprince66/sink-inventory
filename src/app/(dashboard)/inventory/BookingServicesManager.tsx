"use client";

import { useGetCategoriesQuery } from "@/api/category/fetch-categories";
import { useFetchAttendants } from "@/api/attendants/get-all-attendants";
import { CustomModal } from "@/components/app/CustomModal";
import { CustomTable } from "@/components/app/CutomTable";
import {
  BookingServiceRecord,
  getServiceCategoryId,
  getServiceCategoryName,
  getServiceCategoryRecords,
  getBookingPolicy,
  getServiceRecords,
  useBookingPolicyQuery,
  useCreateServiceMutation,
  getServicePagination,
  SERVICES_PAGE_SIZE,
  useServiceCatalogueQuery,
  useUpdateServiceMutation,
} from "@/api/bookings/service-bookings";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useToast } from "@/hooks/toast/useToast";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus, RefreshCw } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import AddCategory from "../categories/AddCategory";

type ServiceForm = {
  name: string;
  categoryId: string;
  description: string;
  amount: string;
  minDepositPercentage: string;
  duration: string;
  capacity: string;
  staffIds: string[];
};

type Option = { id: string; name: string };
type StaffOption = Option & { full_name?: string; email?: string };

const VALID_DURATIONS = new Set([
  15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 210, 240, 270, 300,
  360, 420, 480,
]);
const EMPTY_FORM: ServiceForm = {
  name: "",
  categoryId: "",
  description: "",
  amount: "",
  minDepositPercentage: "",
  duration: "30",
  capacity: "1",
  staffIds: [],
};

const amountLabel = (amount: string | number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const BookingServicesManager = ({
  search,
  canManage,
  createRequested,
  onCreateRequestHandled,
}: {
  search: string;
  canManage: boolean;
  createRequested: boolean;
  onCreateRequestHandled: () => void;
}) => {
  const businessId = useBusinessStore((state) => state.business_id);
  // Server-side pages; search below only filters the page on screen.
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(SERVICES_PAGE_SIZE);
  const { showToast } = useToast();
  const { data: policyResponse } = useBookingPolicyQuery(businessId ?? "");
  const businessDepositPercentage =
    getBookingPolicy(policyResponse)?.min_deposit_percentage ?? null;
  const { data: catalogueResponse, isLoading, isError, refetch } =
    useServiceCatalogueQuery(businessId ?? "", { page, limit: pageSize });
  const {
    data: categoryResponse,
    isFetched: categoriesFetched,
    isRefetching: categoriesRefreshing,
    refetch: refetchCategories,
  } = useGetCategoriesQuery({
    params: { id: businessId ?? "", type: "SERVICE", limit: 100 },
    enabled: Boolean(businessId),
  });
  const { data: staffResponse } = useFetchAttendants(businessId ?? "", {
    enabled: Boolean(businessId),
  });
  const { mutateAsync: createService, isPending: isCreating } =
    useCreateServiceMutation();
  const { mutateAsync: updateService, isPending: isUpdating } =
    useUpdateServiceMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editing, setEditing] = useState<BookingServiceRecord | null>(null);
  const [pendingEdit, setPendingEdit] = useState<BookingServiceRecord | null>(
    null,
  );
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);
  const categories: Option[] = getServiceCategoryRecords(categoryResponse);
  const staff: StaffOption[] = Array.isArray(staffResponse?.data)
    ? staffResponse.data
    : [];
  const services = getServiceRecords(catalogueResponse).filter((service) =>
    `${service.name} ${getServiceCategoryName(service)}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  const { pages: totalPages } = getServicePagination(catalogueResponse, pageSize);

  const resolveServiceCategoryId = (service: BookingServiceRecord) => {
    const serviceCategoryId = getServiceCategoryId(service);
    if (serviceCategoryId && categories.some(({ id }) => id === serviceCategoryId)) {
      return serviceCategoryId;
    }
    const serviceCategory =
      typeof service.category === "string" ? service.category : "";
    if (categories.some(({ id }) => id === serviceCategory)) {
      return serviceCategory;
    }
    const normalizeCategoryName = (name: string) =>
      name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
    const categoryName = normalizeCategoryName(getServiceCategoryName(service));
    return (
      categories.find(
        (category) =>
          normalizeCategoryName(category.name) === categoryName,
      )?.id ??
      serviceCategoryId ??
      ""
    );
  };

  const getEditForm = (service: BookingServiceRecord): ServiceForm => ({
    name: service.name,
    categoryId: resolveServiceCategoryId(service),
    description: service.description ?? "",
    amount: String(service.amount ?? ""),
    minDepositPercentage:
      service.min_deposit_percentage != null
        ? String(service.min_deposit_percentage)
        : "",
    duration: String(service.duration),
    capacity: String(service.max_capacity ?? 1),
    staffIds: service.assigned_staff_ids ?? [],
  });

  useEffect(() => {
    if (!pendingEdit || !categoriesFetched) return;
    const service = pendingEdit;
    setEditing(service);
    setForm(getEditForm(service));
    setIsDialogOpen(true);
    setPendingEdit(null);
  }, [categoriesFetched, categories, pendingEdit]);

  // AddCategory refreshes its own (unlimited) category query, not this one
  // (limit 100 → different key), so refetch here and pre-select whatever is new.
  const handleCategoryCreated = async () => {
    setIsCategoryModalOpen(false);
    const knownIds = new Set(categories.map(({ id }) => id));
    const { data } = await refetchCategories();
    const created = getServiceCategoryRecords(data).find(
      ({ id }) => !knownIds.has(id),
    );
    if (created) {
      setForm((current) => ({ ...current, categoryId: created.id }));
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (!createRequested) return;
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsDialogOpen(true);
    onCreateRequestHandled();
  }, [createRequested, onCreateRequestHandled]);

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const editService = (service: BookingServiceRecord) => {
    setPendingEdit(service);
  };

  const saveService = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!businessId) {
      showToast("Select a business before managing services.", "error");
      return;
    }
    const amount = Number(form.amount);
    // Blank = inherit the business default. On create the backend applies it
    // when the field is omitted; on edit omitting keeps the old override, so
    // send null to clear it (the service then tracks future default changes).
    const minDepositPercentage = form.minDepositPercentage.trim()
      ? Number(form.minDepositPercentage)
      : editing
        ? null
        : undefined;
    const capacity = Number(form.capacity);
    if (!form.name.trim() || !form.categoryId) {
      showToast("Enter a service name and choose a category.", "error");
      return;
    }
    const duration = Number(form.duration);
    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !Number.isInteger(capacity) ||
      capacity < 1
    ) {
      showToast("Enter a valid amount and a capacity of at least one.", "error");
      return;
    }
    if (!VALID_DURATIONS.has(duration)) {
      showToast(
        "Choose a supported duration from 15 to 480 minutes in 15-minute intervals.",
        "error",
      );
      return;
    }
    if (
      minDepositPercentage != null &&
      (!Number.isInteger(minDepositPercentage) ||
        minDepositPercentage < 1 ||
        minDepositPercentage > 100)
    ) {
      showToast("Enter a minimum deposit between 1% and 100%.", "error");
      return;
    }
    const payload = {
      name: form.name.trim(),
      category_id: form.categoryId,
      description: form.description.trim(),
      amount: amount.toFixed(2),
      ...(minDepositPercentage !== undefined && {
        min_deposit_percentage: minDepositPercentage,
      }),
      duration,
      max_capacity: capacity,
      assigned_staff_ids: form.staffIds,
    };
    try {
      if (editing) {
        await updateService({ serviceId: editing.id, payload });
        showToast("Service updated.", "success");
      } else {
        await createService({ businessId, payload });
        showToast("Service created.", "success");
      }
      closeDialog();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not save service.", "error");
    }
  };

  const toggleServiceActive = async (service: BookingServiceRecord) => {
    try {
      await updateService({
        serviceId: service.id,
        payload: { is_active: !service.is_active },
      });
      showToast(service.is_active ? "Service deactivated." : "Service activated.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not update service.", "error");
    }
  };

  const columns: ColumnDef<BookingServiceRecord>[] = [
      {
        accessorKey: "name",
        header: "Service",
        cell: ({ row }) => (
          <div className="min-w-40">
            <p className="font-semibold text-grey-1">{row.original.name}</p>
            <p className="mt-0.5 text-xs text-grey-3">
              {getServiceCategoryName(row.original) ||
                row.original.description ||
                "Service"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: "Price",
        cell: ({ row }) => (
          <span className="font-semibold text-grey-1">
            {amountLabel(row.original.amount)}
          </span>
        ),
      },
      {
        accessorKey: "min_deposit_percentage",
        header: "Min. deposit",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-grey-2">
            {row.original.min_deposit_percentage != null
              ? `${row.original.min_deposit_percentage}%`
              : "Default"}
          </span>
        ),
      },
      {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-grey-2">
            {row.original.duration} min
          </span>
        ),
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
              row.original.is_active
                ? "bg-success-2 text-success-1"
                : "bg-grey-6 text-grey-3"
            }`}
          >
            {row.original.is_active ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) =>
          canManage ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={`Actions for ${row.original.name}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[160px] bg-white">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => editService(row.original)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit service
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => void toggleServiceActive(row.original)}
                >
                  {row.original.is_active ? "Deactivate" : "Activate"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : <span className="text-sm text-grey-3">—</span>,
      },
    ];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-grey-1">Booking services</h3>
          <p className="mt-1 text-sm text-grey-3">
            Manage the services available for appointments.
          </p>
        </div>
      </div>

      {isError ? (
        <div className="rounded-xl border border-error-1/20 bg-white p-6">
          <p className="text-sm text-grey-2">Services could not be loaded.</p>
          <Button className="mt-3" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </div>
      ) : (
        <CustomTable
          columns={columns}
          data={services}
          loading={isLoading}
          noDataText={
            <div className="max-w-sm px-4 text-center">
              <p className="font-semibold text-grey-1">
                {search ? "No services match your search" : "No booking services yet"}
              </p>
              <p className="mt-1 text-sm text-grey-3">
                {search
                  ? "Try another service name or category."
                  : "Add a service to make it available for bookings."}
              </p>
            </div>
          }
          showSerialNumber={false}
          pagination={{
            currentPage: page,
            totalPages,
            pageSize,
            onPageChange: setPage,
            onPageSizeChange: (size) => {
              setPageSize(size);
              setPage(1);
            },
          }}
        />
      )}

      <CustomModal
        isOpen={isDialogOpen}
        onClose={closeDialog}
        title={editing ? "Edit service" : "Add booking service"}
        description="Set pricing, deposit, duration, capacity, and qualified staff."
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="booking-service-form"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating
                ? "Saving..."
                : editing
                  ? "Save changes"
                  : "Create service"}
            </Button>
          </div>
        }
      >
          <form id="booking-service-form" onSubmit={saveService} className="space-y-4">
            <label className="block space-y-1.5 text-sm font-medium text-grey-2">
              Service name
              <Input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <div className="space-y-1.5">
              <label
                htmlFor="booking-service-category"
                className="block text-sm font-medium text-grey-2"
              >
                Category
              </label>
              <div className="flex items-center gap-2">
                <select
                  id="booking-service-category"
                  required
                  className="h-10 min-w-0 flex-1 rounded-lg border border-grey-5 bg-white px-3 text-sm"
                  value={form.categoryId}
                  onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
                >
                  <option value="">
                    {categoriesRefreshing
                      ? "Loading categories..."
                      : categories.length
                        ? "Select a category"
                        : "No service categories yet — add one"}
                  </option>
                  {editing &&
                    form.categoryId &&
                    !categories.some(({ id }) => id === form.categoryId) && (
                      <option value={form.categoryId}>
                        {getServiceCategoryName(editing) || "Current category"}
                      </option>
                    )}
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={() => setIsCategoryModalOpen(true)}
                  aria-label="Add service category"
                  title="Add service category"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <label className="block space-y-1.5 text-sm font-medium text-grey-2">
              Description
              <Input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5 text-sm font-medium text-grey-2">
                Price
                <Input required type="number" min="0" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
              </label>
              <label className="block space-y-1.5 text-sm font-medium text-grey-2">
                Minimum deposit (%)
                <Input
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={form.minDepositPercentage}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      minDepositPercentage: event.target.value,
                    })
                  }
                  placeholder="Business default"
                />
                <span className="block text-xs font-normal text-grey-3">
                  {Number(form.amount) > 0 &&
                  Number(form.minDepositPercentage) >= 1 &&
                  Number(form.minDepositPercentage) <= 100
                    ? `Customers pay at least ${amountLabel(
                        (Number(form.amount) * Number(form.minDepositPercentage)) / 100,
                      )} to secure a booking.`
                    : `Optional (1–100). Leave blank to use the business default${
                        businessDepositPercentage != null
                          ? ` (${businessDepositPercentage}%)`
                          : ""
                      } from Payment & availability.`}
                </span>
              </label>
              <label className="block space-y-1.5 text-sm font-medium text-grey-2">
                Duration
                <Input
                  required
                  type="number"
                  min="15"
                  max="480"
                  step="15"
                  value={form.duration}
                  onChange={(event) =>
                    setForm({ ...form, duration: event.target.value })
                  }
                />
                <span className="block text-xs font-normal text-grey-3">
                  Enter minutes in 15-minute increments (default 30).
                </span>
              </label>
              <label className="block space-y-1.5 text-sm font-medium text-grey-2">
                Slot capacity
                <Input required type="number" min="1" step="1" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} />
              </label>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="assigned-staff" className="rounded-xl border border-grey-5 px-4">
                <AccordionTrigger className="cursor-pointer py-3 hover:no-underline">
                  <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-grey-2">
                    Assigned staff
                    <span className="rounded-full bg-grey-6 px-2 py-0.5 text-xs text-grey-3">
                      {form.staffIds.length || "All"}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  {staff.length ? (
                    <>
                      <label className="mb-3 flex cursor-pointer items-center gap-2 border-b border-grey-6 pb-3 text-sm font-semibold text-grey-2">
                        <Checkbox
                          checked={
                            form.staffIds.length === staff.length
                              ? true
                              : form.staffIds.length > 0
                                ? "indeterminate"
                                : false
                          }
                          onCheckedChange={(checked) =>
                            setForm({
                              ...form,
                              staffIds: checked ? staff.map(({ id }) => id) : [],
                            })
                          }
                        />
                        Select all staff
                      </label>
                      <div className="grid max-h-48 gap-2 overflow-y-auto sm:grid-cols-2">
                        {staff.map((person) => (
                          <label
                            key={person.id}
                            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-grey-2 hover:bg-grey-6"
                          >
                            <Checkbox
                              checked={form.staffIds.includes(person.id)}
                              onCheckedChange={(checked) =>
                                setForm({
                                  ...form,
                                  staffIds: checked
                                    ? [...form.staffIds, person.id]
                                    : form.staffIds.filter((id) => id !== person.id),
                                })
                              }
                            />
                            <span className="truncate">
                              {person.name ?? person.full_name ?? person.email ?? "Staff member"}
                            </span>
                          </label>
                        ))}
                      </div>
                      <p className="mt-3 text-xs text-grey-3">
                        Leave all staff unselected to allow any active attendant.
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-grey-3">
                      No active staff found.
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </form>
      </CustomModal>

      <CustomModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        trigger={false}
        title="Add Service Category"
      >
        <AddCategory type="SERVICE" closeModal={handleCategoryCreated} />
      </CustomModal>
    </section>
  );
};

export default BookingServicesManager;
