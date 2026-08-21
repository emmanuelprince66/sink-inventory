"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { Skeleton } from "@/components/ui/skeleton";
import { useFormatMoney } from "@/utils/formatMoney";
import { Gift, Link2, Plus, TrendingUp, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import CreateReferralProgramme from "./referrals/CreateReferralProgramme";
import ReferralProgrammeCard from "./referrals/ReferralProgrammeCard";
import { useCustomerReferrals } from "./referrals/useCustomerReferrals";

const STEPS = [
  "Add a loyal customer to your programme",
  "They share their unique sync360 link",
  "New customer signs up via the link",
  "Both get rewarded automatically",
];

const SummaryTile = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) => (
  <div className="min-w-0 rounded-xl bg-primary-green-500 p-3">
    <div className="text-primary-green-300">{icon}</div>
    <p className="mt-1.5 truncate text-lg font-extrabold text-grey-1">{value}</p>
    <p className="truncate text-[10px] text-grey-3">{label}</p>
  </div>
);

const CustomerReferrals = () => {
  const router = useRouter();
  const formatMoney = useFormatMoney();
  const {
    business_id,
    overview,
    overviewLoading,
    programmes,
    programmesLoading,
    view,
    setView,
    closeView,
    refresh,
  } = useCustomerReferrals();

  const tiles = [
    {
      icon: <Gift className="h-4 w-4" />,
      value: String(overview?.total_programmes ?? 0),
      label: "Programmes",
    },
    {
      icon: <Users className="h-4 w-4" />,
      value: String(overview?.total_participants ?? 0),
      label: "Participants",
    },
    {
      icon: <Link2 className="h-4 w-4" />,
      value: String(overview?.total_referrals ?? 0),
      label: "Total Referrals",
    },
    {
      icon: <Gift className="h-4 w-4" />,
      value: formatMoney(Number(overview?.total_paid_out ?? 0)),
      label: "Paid Out",
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      // The API formats this one itself, multiplier sign and all.
      value: overview?.conversion_rate_formatted ?? "0×",
      label: "Conversion",
    },
  ];

  return (
    <div className="w-full min-w-0 space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-grey-5 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-grey-1 sm:text-xl">
              Referral Programmes
            </h2>
            <p className="mt-0.5 text-xs text-warning-1">
              Turn your loyal customers into your best marketers
            </p>
          </div>
          <button
            onClick={() => setView({ kind: "create" })}
            className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary-green-100 px-4 text-sm font-bold text-white hover:bg-primary-green-100/90 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Programme
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {overviewLoading
            ? [0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-[86px] rounded-xl bg-grey-5" />
              ))
            : tiles.map((tile) => (
                <SummaryTile key={tile.label} {...tile} />
              ))}
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-2xl bg-primary-green-100 p-5 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
          How <span className="text-primary-green-300">Referrals</span> Work
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-start gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-green-300 text-[11px] font-extrabold text-white">
                {index + 1}
              </span>
              <p className="text-[11px] leading-relaxed text-white/80">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {programmesLoading ? (
        <Skeleton className="h-72 w-full rounded-2xl bg-grey-5" />
      ) : programmes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-grey-5 bg-white px-4 py-14 text-center">
          <p className="text-sm font-bold text-grey-1">
            No referral programmes yet
          </p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-grey-3">
            Create one to give your customers a link they can share, and set the
            cut they earn on every referral it brings in.
          </p>
        </div>
      ) : (
        programmes.map((programme) => (
          <ReferralProgrammeCard
            key={programme.id}
            programme={programme}
            onManage={() =>
              router.push(`/customers/referrals/${programme.id}`)
            }
          />
        ))
      )}

      {view.kind === "create" && (
        <CustomModal
          isOpen
          onClose={closeView}
          trigger={false}
          title="New Referral Programme"
        >
          <CreateReferralProgramme
            business_id={business_id}
            onCreated={() => {
              refresh();
              closeView();
            }}
            onCancel={closeView}
          />
        </CustomModal>
      )}

    </div>
  );
};

export default CustomerReferrals;
