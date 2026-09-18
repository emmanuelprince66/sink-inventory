import { formatToNaira } from "@/utils/formatMoney";

const money = (value: number | string) => formatToNaira(Number(value) || 0);

export default function TransferSummary({
  beneficiaryName,
  bankName,
  accountNumber,
  amount,
  charge,
  total,
}: {
  beneficiaryName?: string;
  bankName?: string;
  accountNumber: string;
  amount: number | string;
  charge: number | string;
  total: number | string;
}) {
  return (
    <div className="rounded-xl bg-grey-6 px-4 py-3 text-sm">
      <div className="flex justify-between gap-4">
        <span className="text-grey-3">Sending to</span>
        <span className="text-right font-semibold">
          {beneficiaryName} · {bankName}
        </span>
      </div>
      <div className="mt-2 flex justify-between gap-4">
        <span className="text-grey-3">Account No.</span>
        <span className="font-semibold">{accountNumber}</span>
      </div>
      <div className="mt-2 flex justify-between gap-4">
        <span className="text-grey-3">Amount</span>
        <span className="font-semibold text-success-1">{money(amount)}</span>
      </div>
      <div className="mt-2 flex justify-between gap-4">
        <span className="text-grey-3">System Charges</span>
        <span className="font-semibold">{money(charge)}</span>
      </div>
      <div className="mt-2 flex justify-between gap-4 border-t border-grey-5 pt-2">
        <span className="font-bold text-grey-1">Total</span>
        <span className="font-bold text-success-1">{money(total)}</span>
      </div>
    </div>
  );
}
