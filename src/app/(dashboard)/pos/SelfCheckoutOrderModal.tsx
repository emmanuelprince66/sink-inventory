"use client";

import { useFetchBankQuery } from "@/api/bank/fetch-bank";
import {
  useFinalizeInstoreDraftMutation,
  useInstoreDraftQuery,
} from "@/api/orders/use-instore-draft";
import { CustomModal } from "@/components/app/CustomModal";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/toast/useToast";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { formatToNaira } from "@/utils/formatMoney";
import {
  CheckCircle2,
  Download,
  Printer,
  RefreshCw,
  ScanLine,
} from "lucide-react";
import { useState } from "react";
import AttendantDrawer from "./AttendantDrawer";
import {
  describeDraft,
  normaliseOrderCode,
  toMoneyString,
  type FinalizeDraftPayload,
  type FinalizeDraftResponse,
  type FinalizePaymentMethod,
  type InStoreDraft,
  type InStoreDraftItem,
} from "./instoreDraft";
import { downloadReceiptPdf } from "./receiptPdf";

interface SelfCheckoutOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-filled when the cashier reached this by scanning the customer's QR. */
  initialCode?: string;
}

const TONE_CLASSES = {
  success: "bg-success-2 border-success-1/30 text-success-1",
  pending: "bg-warning-2 border-warning-1/30 text-warning-1",
  error: "bg-error-2 border-error-1/30 text-error-1",
  neutral: "bg-grey-6 border-grey-5 text-grey-2",
} as const;

/** Methods a cashier can take at the counter, in the order they'd reach for. */
const PAYMENT_METHODS: { value: FinalizePaymentMethod; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "POS", label: "POS / Card" },
  { value: "BANK", label: "Bank Transfer" },
  { value: "CREDIT", label: "Credit (pay later)" },
];

/**
 * The cashier's side of the storefront QR flow.
 *
 * Deliberately self-contained: a draft NEVER enters the cart store. That store
 * is persisted and multi-tab, so a draft living in a cart slot could be closed
 * and lost, or rung up twice from two tabs — and for an already-paid draft
 * that would sell the same goods a second time.
 */
const SelfCheckoutOrderModal: React.FC<SelfCheckoutOrderModalProps> = ({
  isOpen,
  onClose,
  initialCode = "",
}) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const { showToast } = useToast();

  const [codeInput, setCodeInput] = useState(initialCode);
  const [activeCode, setActiveCode] = useState(initialCode);

  const [method, setMethod] = useState<FinalizePaymentMethod | "">("");
  const [selectedBank, setSelectedBank] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [attendant, setAttendant] = useState<any | null>(null);
  const [showAttendantDrawer, setShowAttendantDrawer] = useState(false);

  const [completed, setCompleted] = useState<FinalizeDraftResponse | null>(
    null,
  );

  // Counter-side basket edits, keyed by line index. Empty until the cashier
  // changes something, so an untouched order finalizes exactly as the customer
  // built it and `items` is never sent.
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  // Opens the payment buttons on a transfer that hasn't landed. Deliberately
  // a separate action: taking cash for an order the customer already
  // transferred for should be a decision, not the default screen.
  const [showCounterFallback, setShowCounterFallback] = useState(false);

  const { data: bankResponse } = useFetchBankQuery(business_id);
  const banks: any[] = bankResponse?.data ?? [];

  const {
    data: draftResponse,
    isFetching,
    error,
    refetch,
  } = useInstoreDraftQuery(business_id, activeCode || null, {
    enabled: !!activeCode,
  });

  const draft: InStoreDraft | undefined = draftResponse?.data;

  /**
   * What one unit of a line actually costs, taken from line_total divided by
   * quantity rather than unit_price — that way any discount the backend
   * already applied to the line survives a quantity change, without this
   * having to guess whether `discount` is per unit or per line.
   */
  const unitPriceOf = (item: InStoreDraftItem) => {
    const quantity = Number(item.quantity) || 0;
    const lineTotal = Number(item.line_total) || 0;
    return quantity > 0 ? lineTotal / quantity : Number(item.unit_price) || 0;
  };

  const quantityOf = (index: number, item: InStoreDraftItem) =>
    quantities[index] ?? Number(item.quantity) ?? 0;

  const items = draft?.items ?? [];
  const editedTotal = items.reduce(
    (sum, item, index) => sum + unitPriceOf(item) * quantityOf(index, item),
    0,
  );
  const hasEdits = items.some(
    (item, index) => quantityOf(index, item) !== (Number(item.quantity) || 0),
  );
  const hasAnyItems = items.some((item, index) => quantityOf(index, item) > 0);
  // Only an unpaid basket may be changed — a BNPL or prepaid one is for a
  // fixed amount, and the backend rejects items on it.
  const isEditable = !!draft && !draft.can_release_items && !draft.is_collected;
  const amountDue = hasEdits ? editedTotal : Number(draft?.total_amount) || 0;

  const { mutate: finalize, isPending: isFinalizing } =
    useFinalizeInstoreDraftMutation({
      onSuccess: (response) => setCompleted(response.data),
      // A 409 (another till is finalizing this code right now) or a 400
      // (already completed) means what's on screen is stale. Re-reading the
      // draft flips it to "Already collected" and disables the button,
      // instead of inviting the cashier to press it again.
      onError: () => {
        refetch();
      },
    });

  const resetAll = () => {
    setCodeInput("");
    setActiveCode("");
    setMethod("");
    setSelectedBank("");
    setDueDate("");
    setAttendant(null);
    setCompleted(null);
    setQuantities({});
    setShowCounterFallback(false);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleLookup = () => {
    if (!codeInput.trim()) {
      showToast("Enter the customer's order code", "error");
      return;
    }
    setCompleted(null);
    setQuantities({});
    setShowCounterFallback(false);
    setActiveCode(normaliseOrderCode(codeInput));
  };

  /**
   * Sends the finalize call.
   *
   * An already-paid draft posts nothing but the code — the sale exists and the
   * stock is gone, so this only records that the goods were handed over. A
   * COUNTER draft carries the payment, and THAT is the call that deducts
   * stock, which is why "insufficient stock" can surface here and not sooner.
   */
  const handleComplete = () => {
    if (!draft || !business_id) return;

    const payload: FinalizeDraftPayload = { order_code: draft.order_code };

    if (!draft.can_release_items) {
      if (!method) {
        showToast("Choose how the customer is paying", "error");
        return;
      }
      if (method === "BANK" && !selectedBank) {
        showToast("Select which bank account received the transfer", "error");
        return;
      }
      if (method === "CREDIT" && !dueDate) {
        showToast("A credit sale needs a due date", "error");
        return;
      }

      if (hasEdits && !hasAnyItems) {
        showToast("Keep at least one item, or cancel the order", "error");
        return;
      }

      payload.method = method;
      // Normalised to 2dp: the lookup returns totals like "199.0000", which
      // finalize rejects ("no more than 2 decimal places") if echoed back.
      payload.amount_paid =
        method === "CREDIT" ? "0.00" : toMoneyString(amountDue);
      if (method === "BANK") payload.bank = selectedBank;
      if (method === "CREDIT") payload.due_date = dueDate;

      // Sent only when the cashier actually changed something. Finalize then
      // re-prices, re-checks live stock and deducts against THESE lines.
      if (hasEdits) {
        payload.items = draft.items
          .map((item, index) => ({ item, quantity: quantityOf(index, item) }))
          .filter((line) => line.quantity > 0)
          .map((line) => ({
            product_id: line.item.product_id,
            quantity: String(line.quantity),
            variation_id: line.item.variation_id || undefined,
          }));
      }
    }

    // Recorded on both paths — for a paid draft this is the only trace of who
    // handed the goods over.
    if (attendant?.id) payload.attendant = attendant.id;

    finalize({ businessId: business_id, payload });
  };

  /**
   * A draft belonging to a DIFFERENT business than this till.
   *
   * Lookup is no longer scoped to business_id upstream, so one store's code
   * resolves on another store's terminal — but finalize still is, and rejects
   * the other business's product ids with "invalid product or combo IDs".
   * Caught here so the cashier gets the real reason instead of a bare 400,
   * and can't hand over goods this shop was never paid for.
   */
  const isForeignDraft =
    !!draft && !!business_id && draft.business_id !== business_id;

  const status = draft ? describeDraft(draft) : null;
  const alreadyCollected = !!draft?.is_collected;

  /** Transfer chosen, money not confirmed. Treated like BNPL pending. */
  const onlinePending =
    draft?.payment_type === "ONLINE" &&
    !draft.can_release_items &&
    !draft.is_collected;

  const takingPaymentHere = !onlinePending || showCounterFallback;
  const bnplPending = draft?.bnpl_status === "PENDING";
  const canComplete =
    !!draft &&
    !alreadyCollected &&
    !bnplPending &&
    !isFinalizing &&
    !isForeignDraft &&
    takingPaymentHere &&
    (draft.can_release_items || hasAnyItems);

  const lookupErrorMessage =
    (error as any)?.error ||
    (error as any)?.message ||
    "That code wasn't found.";

  return (
    <>
      <CustomModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Self Checkout Order"
        description="Find the basket a customer built on their own phone."
        size="lg"
      >
        {completed ? (
          <CompletedPanel
            result={completed}
            onDone={handleClose}
            onNext={resetAll}
          />
        ) : (
          <div className="space-y-4">
            {/* Code entry */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-grey-1">
                Order Code
              </label>
              <div className="flex gap-2">
                <Input
                  autoFocus
                  placeholder="INS-6290"
                  className="h-11 font-mono uppercase"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                />
                <Button
                  onClick={handleLookup}
                  disabled={isFetching || !codeInput.trim()}
                  className="h-11 px-6"
                >
                  {isFetching ? <Spinner className="h-4 w-4" /> : "Find"}
                </Button>
              </div>
              <p className="flex items-center gap-1.5 text-[11px] text-grey-3">
                <ScanLine className="h-3 w-3" />
                Scanning the customer's QR fills this in automatically.
              </p>
            </div>

            {error && !isFetching && (
              <div className="rounded-lg border border-error-1/30 bg-error-2 p-3">
                <p className="text-sm text-error-1">{lookupErrorMessage}</p>
                {/* Completed orders come back 200, so a miss here is a wrong
                    code, another store's code, or an expired one. */}
                <p className="mt-1 text-[11px] text-error-1/80">
                  Check the code with the customer. Codes only work at the store
                  they were created for, and expire 2 hours after the order is
                  placed.
                </p>
              </div>
            )}

            {isForeignDraft && (
              <div className="rounded-lg border border-error-1/30 bg-error-2 p-3">
                <p className="text-sm font-bold text-error-1">
                  This code belongs to a different store
                </p>
                <p className="mt-1 text-[11px] text-error-1">
                  It was created at another business, so its items aren't in
                  this store's inventory and it can't be completed here. Send
                  the customer to the store they ordered from.
                </p>
              </div>
            )}

            {draft && status && (
              <div className="space-y-4">
                {/* Status — decides everything below it */}
                <div
                  className={`rounded-lg border p-3 ${TONE_CLASSES[status.tone]}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold">{status.label}</p>
                    {(bnplPending || onlinePending) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="h-7 gap-1.5 text-xs"
                      >
                        <RefreshCw
                          className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`}
                        />
                        Refresh
                      </Button>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed">
                    {status.detail}
                  </p>
                </div>

                <CustomerSummary draft={draft} />

                <ItemChecklist
                  draft={draft}
                  editable={isEditable}
                  total={amountDue}
                  quantityOf={quantityOf}
                  onQuantityChange={(index, next) =>
                    setQuantities((current) => ({
                      ...current,
                      [index]: Math.max(0, next),
                    }))
                  }
                />

                {/* An unconfirmed transfer hides the payment buttons until
                    the cashier says the transfer failed — see onlinePending. */}
                <div className="w-full mt-3">
                  {onlinePending && !showCounterFallback && (
                    <button
                      type="button"
                      onClick={() => setShowCounterFallback(true)}
                      className="w-full cursor-pointer rounded-xl border border-dashed border-grey-4 p-3 text-center text-xs font-bold text-grey-2 transition-colors hover:bg-grey-6"
                    >
                      Transfer didn&apos;t arrive? Take payment here instead
                    </button>
                  )}
                </div>

                {/* Payment — only when there's something left to collect */}
                {!draft.can_release_items &&
                  !alreadyCollected &&
                  takingPaymentHere && (
                    <div className="space-y-3 rounded-xl border border-grey-5 p-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-grey-3">
                        Take payment
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        {PAYMENT_METHODS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setMethod(option.value)}
                            className={`rounded-lg border-2 py-2.5 text-sm font-bold transition-colors cursor-pointer ${
                              method === option.value
                                ? "border-primary-green-300 bg-primary-green-300 text-white"
                                : "border-grey-5 text-grey-2 hover:border-grey-4"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>

                      {method === "BANK" && (
                        <Select
                          value={selectedBank}
                          onValueChange={setSelectedBank}
                        >
                          <SelectTrigger className="h-11 w-full">
                            <SelectValue placeholder="Which account received it?" />
                          </SelectTrigger>
                          <SelectContent>
                            {banks.length > 0 ? (
                              banks.map((bank: any) => (
                                <SelectItem key={bank.id} value={bank.id}>
                                  {bank.bank_name} — {bank.account_number}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-xs text-grey-3">
                                No bank accounts added yet.
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      )}

                      {method === "CREDIT" && (
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-grey-2">
                            Due date
                          </label>
                          <Input
                            type="date"
                            className="h-11"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  )}

                {/* Attendant — the only record of who served this */}
                <button
                  type="button"
                  onClick={() => setShowAttendantDrawer(true)}
                  className="flex w-full items-center justify-between rounded-xl border border-grey-5 p-3 text-left cursor-pointer hover:bg-grey-6"
                >
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-grey-3">
                      Served by
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-grey-1">
                      {/* Left blank, the backend records whoever is
                          logged in — so blank means "you", not "nobody". */}
                      {attendant?.name || "You (logged-in user)"}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-primary-green-300">
                    Change
                  </span>
                </button>

                <div className="w-full mt-3">
                  <Button
                    onClick={handleComplete}
                    disabled={!canComplete}
                    className="h-12 w-full text-base font-bold"
                  >
                    {isFinalizing ? (
                      <Spinner className="h-4 w-4" />
                    ) : draft.can_release_items ? (
                      "Release Items"
                    ) : (
                      `Take ${formatToNaira(amountDue)} & Release`
                    )}
                  </Button>
                </div>

                {alreadyCollected && (
                  <p className="text-center text-[11px] text-error-1">
                    This order was already collected
                    {draft.collected_at
                      ? ` on ${new Date(draft.collected_at).toLocaleString()}`
                      : ""}
                    . Check with a supervisor before releasing anything.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CustomModal>

      <AttendantDrawer
        open={showAttendantDrawer}
        onOpenChange={setShowAttendantDrawer}
        onAttendantSelect={setAttendant}
      />
    </>
  );
};

/** Who the order belongs to — the cashier calls this out to the queue. */
const CustomerSummary = ({ draft }: { draft: InStoreDraft }) => (
  <div className="flex items-start justify-between gap-4 rounded-xl bg-grey-6 p-3">
    <div className="min-w-0">
      <p className="truncate text-sm font-bold text-grey-1">
        {draft.customer_name || "In-store customer"}
      </p>
      {draft.customer_phone && (
        <p className="text-xs text-grey-3">{draft.customer_phone}</p>
      )}
      {draft.table_or_room && (
        <p className="mt-0.5 text-xs text-grey-3">{draft.table_or_room}</p>
      )}
      {draft.note && (
        <p className="mt-1 text-[11px] italic text-grey-3">"{draft.note}"</p>
      )}
    </div>
    <div className="shrink-0 text-right">
      <p className="font-mono text-sm font-bold text-grey-1">
        {draft.order_code}
      </p>
      <p className="text-[10px] uppercase tracking-wider text-grey-3">
        {draft.payment_type}
      </p>
    </div>
  </div>
);

/**
 * The list the cashier reads against the physical bag.
 *
 * Doubles as the edit surface for an unpaid order: customers change their mind
 * at the till, and re-ringing a whole basket to drop one item is exactly what
 * the order code was meant to avoid.
 */
const ItemChecklist = ({
  draft,
  editable,
  total,
  quantityOf,
  onQuantityChange,
}: {
  draft: InStoreDraft;
  editable: boolean;
  total: number;
  quantityOf: (index: number, item: InStoreDraftItem) => number;
  onQuantityChange: (index: number, next: number) => void;
}) => (
  <div className="overflow-hidden rounded-xl border border-grey-5">
    <div className="max-h-64 divide-y divide-grey-6 overflow-y-auto">
      {draft.items.map((item, index) => {
        const quantity = quantityOf(index, item);
        const originalQuantity = Number(item.quantity) || 0;
        const unitPrice =
          originalQuantity > 0
            ? (Number(item.line_total) || 0) / originalQuantity
            : Number(item.unit_price) || 0;
        const isRemoved = quantity === 0;

        return (
          <div
            key={`${item.product_id}-${item.variation_id || ""}-${index}`}
            className={`flex items-center gap-3 p-3 ${isRemoved ? "opacity-40" : ""}`}
          >
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt={item.name}
                className="h-10 w-10 shrink-0 rounded object-cover"
              />
            ) : (
              <div className="h-10 w-10 shrink-0 rounded bg-grey-6" />
            )}
            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-sm font-bold text-grey-1 ${isRemoved ? "line-through" : ""}`}
              >
                {item.name}
              </p>
              {item.variation_name && (
                <p className="truncate text-[11px] text-grey-3">
                  {item.variation_name}
                </p>
              )}
              {quantity !== originalQuantity && (
                <p className="text-[11px] font-bold text-warning-1">
                  {isRemoved ? "Removed" : `Was x${originalQuantity}`}
                </p>
              )}
            </div>

            {editable ? (
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  aria-label={`One less ${item.name}`}
                  onClick={() => onQuantityChange(index, quantity - 1)}
                  disabled={quantity <= 0}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-grey-5 text-base font-bold text-grey-2 transition-colors hover:bg-grey-6 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm font-extrabold text-grey-1">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label={`One more ${item.name}`}
                  onClick={() => onQuantityChange(index, quantity + 1)}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-grey-5 text-base font-bold text-grey-2 transition-colors hover:bg-grey-6"
                >
                  +
                </button>
              </div>
            ) : (
              <span className="shrink-0 rounded-full bg-grey-6 px-2 py-0.5 text-xs font-bold text-grey-2">
                x{quantity}
              </span>
            )}

            <span className="w-20 shrink-0 text-right text-sm font-bold text-grey-1">
              {formatToNaira(unitPrice * quantity)}
            </span>
          </div>
        );
      })}
    </div>
    <div className="flex items-center justify-between border-t border-grey-5 bg-grey-6 p-3">
      <span className="text-sm font-bold text-grey-2">Total</span>
      <span className="text-lg font-extrabold text-grey-1">
        {formatToNaira(total)}
      </span>
    </div>
    {editable && (
      <p className="border-t border-grey-5 bg-grey-6 px-3 pb-2 pt-2 text-[11px] text-grey-3">
        Adjust quantities before taking payment. Stock is only checked when you
        complete the sale.
      </p>
    )}
  </div>
);

/**
 * Shown once the order is settled.
 *
 * Prints from its own markup rather than routing through PrintReceiptView,
 * which reads a createSale response shape and the live cart. Building a fake
 * sale response to satisfy it would couple this flow to the multi-cart state
 * it is specifically designed to stay out of.
 */
const CompletedPanel = ({
  result,
  onDone,
  onNext,
}: {
  result: FinalizeDraftResponse;
  onDone: () => void;
  onNext: () => void;
}) => {
  const receipt = result.receipt;
  const { showToast } = useToast();

  // Print goes to whatever printer the till has; this is for the customer who
  // wants the receipt on their phone, or when the printer is out of paper.
  const handleDownloadPdf = () => {
    try {
      downloadReceiptPdf(result);
    } catch (error) {
      console.error("Receipt PDF failed:", error);
      showToast("Couldn't build the PDF. Use Print instead.", "error");
    }
  };

  return (
    <div className="space-y-4">
      {/* window.print() prints the whole document — the POS grid, the cart,
          the modal backdrop. This hides everything but the receipt block for
          the duration of the print, and nothing on screen changes. */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #customer-order-receipt,
          #customer-order-receipt * { visibility: visible !important; }
          #customer-order-receipt {
            position: absolute; left: 0; top: 0; width: 100%;
            border: none !important;
          }
        }
      `}</style>

      <div className="flex flex-col items-center py-4 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success-2">
          <CheckCircle2 className="h-6 w-6 text-success-1" />
        </div>
        <h3 className="text-lg font-extrabold text-grey-1">
          {result.message || "Order completed"}
        </h3>
        <p className="mt-1 font-mono text-sm text-grey-3">
          {result.order_code}
        </p>
      </div>

      <div
        id="customer-order-receipt"
        className="rounded-xl border border-grey-5 p-4"
      >
        {(receipt?.business_name || receipt?.business_phone) && (
          <div className="mb-2 text-center">
            {receipt?.business_name && (
              <p className="text-sm font-extrabold text-grey-1">
                {receipt.business_name}
              </p>
            )}
            {receipt?.business_phone && (
              <p className="text-[11px] text-grey-3">
                {receipt.business_phone}
              </p>
            )}
          </div>
        )}
        {receipt?.customer_name && (
          <p className="mb-3 text-center text-[11px] text-grey-3">
            {receipt.customer_name}
            {receipt.customer_phone ? ` · ${receipt.customer_phone}` : ""}
          </p>
        )}

        <div className="space-y-1.5">
          {(receipt?.items ?? []).map((item, index) => (
            <div key={index} className="flex justify-between gap-3 text-xs">
              <span className="min-w-0 flex-1 truncate text-grey-2">
                {item.name} ×{Number(item.quantity)}
              </span>
              <span className="shrink-0 font-bold text-grey-1">
                {formatToNaira(Number(item.line_total) || 0)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-1 border-t border-grey-5 pt-3 text-xs">
          <Row
            label="Total"
            value={result.total_price ?? receipt?.total_amount}
          />
          <Row label="Paid" value={receipt?.amount_paid} />
          {result.balance && result.balance !== "0.00" && (
            <Row label="Balance" value={result.balance} />
          )}
          <div className="flex justify-between">
            <span className="text-grey-3">Method</span>
            <span className="font-bold text-grey-1">
              {result.payment_method || receipt?.payment_method || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Two rows: four buttons on one line squeezes the labels to the
          point where a cashier mis-taps Done instead of Print. */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-11 flex-1 gap-2"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            className="h-11 flex-1 gap-2"
            onClick={handleDownloadPdf}
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-11 flex-1" onClick={onNext}>
            Next Order
          </Button>
          <Button className="h-11 flex-1" onClick={onDone}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value?: string }) =>
  value ? (
    <div className="flex justify-between">
      <span className="text-grey-3">{label}</span>
      <span className="font-bold text-grey-1">
        {formatToNaira(Number(value) || 0)}
      </span>
    </div>
  ) : null;

export default SelfCheckoutOrderModal;
