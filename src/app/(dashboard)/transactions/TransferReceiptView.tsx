"use client";

import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/toast/useToast";
import { useBusinessDataStore } from "@/lib/store/useBusinessDataStore";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { formatToNaira } from "@/utils/formatMoney";
import {
  Document,
  Page,
  PDFDownloadLink,
  Text,
  View,
} from "@react-pdf/renderer";
import { ChevronLeft, Download, Printer, Share2 } from "lucide-react";
import moment from "moment";
import printJS from "print-js";
import { useRef, useState } from "react";
import { RECEIPT_PRINT_STYLE, styles } from "../pos/PrintReceiptView";
import type { TransferReceiptDetails } from "./TransferReceipt";

/**
 * A wallet transfer's receipt, in the POS receipt's design and structure
 * (see PrintReceiptView): business header, the amount where the POS puts its
 * total, the transaction details block, the payment method box and the same
 * footer — printed with the same stylesheet, saved with the same PDF styles.
 * A transfer has no line items, so the items table is the one section left
 * out.
 */

const orDash = (value?: string) => (value?.trim() ? value : "-");

const detailRows = (details: TransferReceiptDetails) => [
  { label: "Transaction Type:", value: "Outward" },
  { label: "Sender:", value: orDash(details.senderName) },
  { label: "Beneficiary:", value: orDash(details.beneficiaryName) },
  { label: "Account No:", value: orDash(details.beneficiaryAccount) },
  { label: "Bank:", value: orDash(details.beneficiaryBank) },
  { label: "Narration:", value: orDash(details.narration) },
  { label: "Transaction ID:", value: orDash(details.transactionId) },
  { label: "Status:", value: details.status ?? "Successful" },
  {
    label: "Date:",
    value: moment(details.date ?? undefined).format("MMMM D, YYYY, h:mm A"),
  },
];

const TransferReceiptPDF = ({
  details,
  business,
}: {
  details: TransferReceiptDetails;
  business: any;
}) => {
  const contactEmail = business?.email || business?.owner?.email || "";
  const contactPhone = business?.phone || business?.owner?.phone || "";

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>TRANSACTION RECEIPT</Text>
          <Text style={styles.subtitle}>
            TRANSFER {(details.status ?? "Successful").toUpperCase()}
          </Text>
          <Text style={styles.businessName}>{business?.name || "STORE"}</Text>
          {(business?.street || business?.city) && (
            <Text style={styles.businessAddress}>
              {business?.street && `${business.street}, `}
              {business?.city}, {business?.state}, {business?.country}
            </Text>
          )}
          <View style={styles.contactInfo}>
            {contactEmail && (
              <Text style={styles.contactText}>{contactEmail}</Text>
            )}
            {contactEmail && contactPhone && (
              <Text style={styles.separator}>|</Text>
            )}
            {contactPhone && (
              <Text style={styles.contactText}>{contactPhone}</Text>
            )}
          </View>
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>AMOUNT:</Text>
          <Text style={styles.totalAmount}>
            {formatToNaira(Number(details.amount) || 0)}
          </Text>
        </View>

        <View style={styles.transactionDetails}>
          {detailRows(details).map((row) => (
            <View key={row.label} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{row.label}</Text>
              <Text style={styles.detailValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.paymentMethodBox}>
          <Text style={styles.paymentMethodTitle}>PAYMENT METHOD(S):</Text>
          <Text style={styles.paymentMethodValue}>BANK TRANSFER</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.thankyou}>THANK YOU!</Text>
          <Text style={styles.poweredBy}>
            Powered by Sync360 | www.sync360.africa
          </Text>
        </View>
      </Page>
    </Document>
  );
};

const TransferReceiptView = ({
  details,
  onBack,
}: {
  details: TransferReceiptDetails;
  onBack: () => void;
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const [isPrinting, setIsPrinting] = useState(false);
  const [sharing, setSharing] = useState(false);

  // The sender is the business, so its details head the receipt — read the
  // same way the POS receipt does: live profile, then the cached copy.
  const business_id = useBusinessStore((s) => s.business_id);
  const { data: liveBusinessQuery } = useFetchBusinessById(business_id, {
    staleTime: 0,
    refetchOnMount: "always",
  });
  const { businessData: cachedBusinessData } = useBusinessDataStore();
  const business = liveBusinessQuery?.data || cachedBusinessData;

  const rows = detailRows(details);
  const amount = formatToNaira(Number(details.amount) || 0);
  const fileName = `receipt-${details.transactionId || moment().format("YYYYMMDD-HHmmss")}`;

  const handlePrint = () => {
    if (isPrinting || !receiptRef.current) return;
    setIsPrinting(true);
    const timeoutId = setTimeout(() => setIsPrinting(false), 5000);
    try {
      printJS({
        printable: receiptRef.current.innerHTML,
        type: "raw-html",
        style: RECEIPT_PRINT_STYLE,
        onPrintDialogClose: () => {
          clearTimeout(timeoutId);
          setIsPrinting(false);
        },
        onError: (err) => {
          clearTimeout(timeoutId);
          setIsPrinting(false);
          console.error("Print error:", err);
        },
        modalMessage: "Preparing print...",
      });
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Print failed:", error);
      setIsPrinting(false);
    }
  };

  /**
   * Shares the receipt, best available way first: as an image where the share
   * sheet takes files (phones), as text where it doesn't, and onto the
   * clipboard where there's no share sheet at all.
   */
  const handleShare = async () => {
    setSharing(true);
    try {
      const text = [
        "Transaction Receipt",
        `Amount: ${amount}`,
        ...rows.map((row) => `${row.label} ${row.value}`),
        "",
        "Powered by Sync360 | www.sync360.africa",
      ].join("\n");

      let file: File | null = null;
      if (receiptRef.current) {
        // html2canvas-pro: Tailwind v4's oklch() colours break the original.
        const html2canvas = (await import("html2canvas-pro")).default;
        const canvas = await html2canvas(receiptRef.current, {
          scale: 3,
          backgroundColor: "#ffffff",
          logging: false,
        });
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png", 1.0),
        );
        if (blob) file = new File([blob], `${fileName}.png`, { type: "image/png" });
      }

      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Transaction Receipt", text });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: "Transaction Receipt", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      showToast("Receipt details copied to clipboard", "success");
    } catch (error) {
      // An abort is the person closing the share sheet, not a failure.
      if ((error as Error)?.name === "AbortError") return;
      console.error("Receipt share failed:", error);
      showToast("Couldn't share the receipt.", "error");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-[460px]">
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={onBack}
            aria-label="Back"
            className="-ml-1.5 p-1.5 rounded-lg text-grey-2 hover:bg-grey-6 cursor-pointer transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-[17px] font-bold text-grey-1">
            Transaction Receipt
          </h1>
        </div>

        <div className="flex justify-center rounded-xl border border-grey-5 bg-grey-6/40 p-3">
          {/* Same markup and class names as PrintReceiptView — the print
              stylesheet targets these classes. */}
          <div
            ref={receiptRef}
            className="receipt-container bg-white rounded-lg w-full max-w-[380px] p-2"
          >
            <div className="receipt-header text-center w-full business-info p-2 flex flex-col items-center gap-1 justify-center">
              <h2 className="receipt-title text-[13px] detail-value">
                TRANSACTION RECEIPT
              </h2>
              <p className="business-name receipt-little font-semibold">
                {business?.name}
              </p>
              {(business?.street || business?.city) && (
                <p className="business-address text-[11px] receipt-little text-gray-500">
                  {business?.street && `${business.street}, `}
                  {business?.city}, {business?.state}, {business?.country}
                </p>
              )}
              {(business?.email || business?.owner?.email) && (
                <p className="business-email text-[11px]  receipt-little text-gray-500">
                  {business?.email || business?.owner?.email}
                </p>
              )}
              {(business?.phone || business?.owner?.phone) && (
                <p className="business-phone text-[11px]  receipt-little text-gray-500">
                  {business?.phone || business?.owner?.phone}
                </p>
              )}
            </div>

            <div className="total-row flex justify-between">
              <span className="text-[11px]">AMOUNT:</span>
              <span className=" text-[11px] detail-value">{amount}</span>
            </div>

            <div className="transaction-details">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="detail-row flex justify-between items-start gap-3"
                >
                  <span className="detail-label text-[11px] shrink-0">
                    {row.label}
                  </span>
                  {/* A provider reference is one unbroken run; let it wrap
                      rather than push past the receipt edge. */}
                  <span className="detail-value text-[11px] text-right min-w-0 [overflow-wrap:anywhere]">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="payment-method">
              <span className="payment-method-title text-[11px]">
                PAYMENT METHOD(S):
              </span>
              <span className="payment-method-value text-[11px]">
                BANK TRANSFER
              </span>
            </div>

            <div className="receipt-footer flex justify-between flex-col items-center">
              <p className="thank-you text-[13px] ">THANK YOU!</p>
              <p className="powered-by text-[9px] ">
                Powered by Sync360 | www.sync360.africa
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="h-11 flex-1 gap-2 hover:bg-gray-50 border-green-200"
              disabled={isPrinting}
            >
              {isPrinting ? (
                "Printing..."
              ) : (
                <>
                  <Printer size={18} className="text-green-600" />
                  <span className="text-green-600">Print Receipt</span>
                </>
              )}
            </Button>

            <PDFDownloadLink
              className="flex-1"
              document={
                <TransferReceiptPDF details={details} business={business} />
              }
              fileName={`${fileName}.pdf`}
            >
              {({ loading, error }) => (
                <Button
                  variant="outline"
                  className="h-11 w-full gap-2 hover:bg-gray-50 border-green-200"
                  disabled={loading || !!error}
                >
                  {error ? (
                    "Error generating PDF"
                  ) : loading ? (
                    "Generating PDF..."
                  ) : (
                    <>
                      <Download size={18} className="text-green-600" />
                      <span className="text-green-600">Save as PDF</span>
                    </>
                  )}
                </Button>
              )}
            </PDFDownloadLink>
          </div>

          <Button
            onClick={handleShare}
            disabled={sharing}
            className="h-11 w-full gap-2"
          >
            <Share2 className="h-4 w-4" />
            {sharing ? "Preparing..." : "Share"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransferReceiptView;
