"use client";
import { CustomModal } from "@/components/app/CustomModal";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import SegmentTag from "@/components/SegmentTag";
import { Skeleton } from "@/components/ui/skeleton";
import { useCheckoutHook } from "@/hooks/useCheckoutHook";
import { formatToNaira } from "@/utils/formatMoney";
import { ArrowRight, Crown, Plus, Sprout, Star, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import AddCustomer from "../customers/AddCustomer";

// Same stable-tint idea the customers table uses, so a face keeps its colour
// between the list and the till.
const AVATAR_TONES = [
  "bg-primary-green-300",
  "bg-emerald-500",
  "bg-teal-600",
  "bg-sky-600",
  "bg-violet-500",
  "bg-amber-500",
];

export const avatarTone = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1)
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length];
};

export const initialsOf = (name?: string) =>
  (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "?";

/** Tier chip. Anything unrecognised still gets a chip, just a neutral one. */
const TIER_STYLES: Record<string, { icon: any; className: string }> = {
  VIP: { icon: Crown, className: "bg-amber-100 text-amber-700" },
  Gold: { icon: Crown, className: "bg-amber-100 text-amber-700" },
  Silver: { icon: Star, className: "bg-grey-6 text-grey-2" },
  Bronze: { icon: Sprout, className: "bg-orange-100 text-orange-700" },
  Normal: { icon: Sprout, className: "bg-primary-green-500 text-primary-green-300" },
};

export const tierStyle = (tier?: string | null) =>
  TIER_STYLES[tier ?? ""] ?? {
    icon: Sprout,
    className: "bg-primary-green-500 text-primary-green-300",
  };

/**
 * Shared by the POS till and Create Order, which want different things from a
 * row.
 *
 * "pos" opens the loyalty modal, because a cashier's first question is what
 * this customer has earned, and Add to Sale lives at the bottom of that modal.
 * "simple" — the default — picks the customer and closes, which is all Create
 * Order ever wanted. Defaulting to simple keeps every existing caller on the
 * behaviour it already had.
 */
const CustomerDrawer = ({
  open,
  onOpenChange,
  onCustomerSelect,
  onShippingSelect,
  onViewLoyalty,
  variant = "simple",
}: any) => {
  const isPos = variant === "pos";
  const [searchInput, setSearchInput] = useState("");

  const [openAddCustomerModal, setOpenAddCustomerModal] = useState(false);

  const closeOpenCustomerModal = () => setOpenAddCustomerModal(false);
  const openCustomerModalFunc = () => setOpenAddCustomerModal(true);
  const [page, setPage] = useState<number>(1);
  const { CustomerData, CustomerLoading } = useCheckoutHook({
    searchInput,
    page,
  }); // Pass 'page' to the hook

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1); // Reset to first page on new search
  };

  const handleSelectCustomer = (customer: any) => {
    onCustomerSelect?.(customer);
    onOpenChange(false);
  };

  // Optional-called: Create Order renders this drawer without onViewLoyalty,
  // so an unguarded call would throw on the first tap.
  const handleCardClick = (customer: any) =>
    isPos ? onViewLoyalty?.(customer) : handleSelectCustomer(customer);

  // Initialize pageSize with the limit from API response or default to 15
  const [pageSize, setPageSize] = useState<number>(
    CustomerData?.data?.limit || 15
  );
  const [currentPage, setCurrentPage] = useState<number>(page || 1); // Local page state

  // Sync local page state with parent page prop
  useEffect(() => {
    setCurrentPage(page || 1);
  }, [page]);

  // Calculate pagination values
  const totalPages = CustomerData?.data?.pages || 1;
  const totalItems = CustomerData?.data?.total || 0;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage); // Update local state immediately for UI responsiveness
      setPage(newPage); // Update parent state (which will trigger re-fetch in useCheckoutHook)
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    const newPage = 1;
    setCurrentPage(newPage); // Update local state
    setPage(newPage); // Update parent state
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="bg-white border border-gray-200 flex flex-col">
          {" "}
          {/* Added flex-col */}
          <SheetHeader>
            <SheetTitle>Select Customer</SheetTitle>
            <SheetDescription>
              Choose an existing customer or create a new one
            </SheetDescription>
          </SheetHeader>
          <div className="p-2">
            <SearchInput
              placeholder="Search customers ..."
              value={searchInput}
              onValueChange={handleSearchChange}
            />
          </div>
          <div className="w-full p-2">
            <Button className="w-full h-12" onClick={openCustomerModalFunc}>
              <Plus />
              Create Customer
            </Button>
          </div>
          <div className="mt-2 space-y-4 flex-grow overflow-y-auto w-full">
            {" "}
            {/* Added flex-grow and overflow-y-auto */}
            {CustomerLoading ? (
              // Show skeleton loading states
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-3 space-y-2">
                  <Skeleton className="bg-grey-5 h-6 w-3/4" />
                  <Skeleton className="bg-grey-5 h-4 w-1/2" />
                </div>
              ))
            ) : CustomerData?.data?.results?.data?.length > 0 ? (
              // Show actual customer data when loaded
              CustomerData.data.results.data.map((customer: any) => {
                const tier = tierStyle(customer.tier_name);
                const TierIcon = tier.icon;

                return (
                  
          <div className="flex w-full flex-col px-1" key={customer.id}>
                 <button
                    
                    type="button"
                    // The whole card opens the loyalty view; Add to Sale lives
                    // at the bottom of that modal, so the row needs one target
                    // rather than two competing buttons.
                    onClick={() => handleCardClick(customer)}
                    className="flex w-full items-center rounded-xl border border-grey-5 bg-white p-3 text-left transition-colors hover:border-primary-green-300 hover:bg-primary-green-500/40 cursor-pointer"
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 mr-3 items-center justify-center rounded-full text-xs font-extrabold text-white ${avatarTone(
                        customer.id ?? customer.name ?? "",
                      )}`}
                    >
                      {customer.initials || initialsOf(customer.name)}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-extrabold text-grey-1">
                        {customer.name}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-grey-3">
                        {customer.phone || "No phone"}
                        {" · "}
                        {formatToNaira(Number(customer.total_sales ?? 0))} spent
                      </span>

                      {isPos && (
                      <span className="mt-1.5 flex flex-wrap items-center gap-2">
                        {customer.tier_name && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${tier.className}`}
                          >
                            <TierIcon className="h-3 w-3" />
                            {customer.tier_name}
                          </span>
                        )}
                        {/* reward_count, not visit progress — the list has no
                            streak target to divide by, and a completed reward
                            is the outcome anyway. */}
                        <span className="text-[10px] text-grey-4">
                          {Number(customer.reward_count ?? 0)} rewards
                        </span>

                        {/* Which segment the rules put them in — "VIP", "At
                            Risk" — so a cashier can see who they are dealing
                            with before opening anything. */}
                        <SegmentTag
                          name={customer.segment}
                          segmentType={customer.segment_type}
                        />

                        {/* Wallet credit, where a cashier needs it: it is money
                            this customer can pay with, so it belongs beside
                            their name at the till rather than only on their
                            profile. Shown at zero too — "no credit" is exactly
                            the thing the cashier is checking for. */}
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary-green-500 px-2 py-0.5 text-[10px] font-bold text-primary-green-300">
                          <Wallet className="h-3 w-3" />
                          {formatToNaira(Number(customer.wallet_balance ?? 0))}
                        </span>
                      </span>
                      )}
                    </span>

                    <ArrowRight className="h-4 w-4 shrink-0 text-primary-green-300" />
                  </button>
          </div>   
                );
              })
            ) : (
              <div className="text-center text-gray-500 p-4">
                No customers found
              </div>
            )}
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-2 border-t border-gray-200 mt-auto">
              {" "}
              {/* Added mt-auto to push to bottom */}
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || CustomerLoading}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || CustomerLoading}
              >
                Next
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <CustomModal
        isOpen={openAddCustomerModal}
        onClose={closeOpenCustomerModal}
        trigger={false}
        title="Create Customer"
      >
        <div className="w-full ">
          {/* A phone number that turns out to belong to someone already on
              file puts them on the sale directly — creating the duplicate and
              then hunting for the original is how a customer ends up unable to
              redeem the reward they have earned. */}
          <AddCustomer
            closeOpenCustomerModal={closeOpenCustomerModal}
            onUseExisting={(customer: any) => {
              closeOpenCustomerModal();
              handleCardClick(customer);
            }}
          />
        </div>
      </CustomModal>
    </>
  );
};

export default CustomerDrawer;
