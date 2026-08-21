"use client";

import { CustomModal } from "@/components/app/CustomModal";
import type { LoyaltyProgram } from "@/types/loyalty";
import AddLoyaltyProgram from "../AddLoyaltyProgram";
import LoyaltyMembers from "../LoyaltyMembers";
import LoyaltyTiers from "../LoyaltyTiers";
import PointOfSale from "../PointOfSale";
import ProgramDetailPanel from "../ProgramDetailPanel";
import ProgramQrModal from "../ProgramQrModal";
import type { ModalView } from "./useLoyaltyPrograms";

/**
 * Exactly one overlay is mounted at a time.
 *
 * Previously all six dialogs plus the sheet were rendered together, each with
 * `open={false}`. Radix still mounts a focus scope and a body pointer-events
 * lock per instance, and those instances fight: moving focus inside one
 * (clicking a tab in the sheet) could leave the page locked with no overlay
 * owning it — a frozen screen that only recovered when the window lost and
 * regained focus and Radix re-evaluated. Mounting only the active one removes
 * the conflict entirely rather than papering over it.
 */
const LoyaltyProgramOverlays = ({
  view,
  selected,
  onClose,
}: {
  view: ModalView;
  selected: LoyaltyProgram | null;
  onClose: () => void;
}) => {
  if (view === "edit") {
    return (
      <CustomModal isOpen onClose={onClose} trigger={false} title="Edit Campaign">
        <div className="w-full">
          <AddLoyaltyProgram closeModal={onClose} editData={selected} />
        </div>
      </CustomModal>
    );
  }

  if (view === "qr" && selected?.id) {
    return (
      <CustomModal
        isOpen
        onClose={onClose}
        trigger={false}
        title="Share Campaign"
      >
        <div className="w-full">
          <ProgramQrModal programId={selected.id} />
        </div>
      </CustomModal>
    );
  }

  // Programme detail is a right-side panel, not a centre modal: its four tabs
  // are a working surface a merchant reads alongside the campaign list, and
  // the design keeps that list visible behind it.
  if (view === "participants") {
    return <ProgramDetailPanel program={selected} open onClose={onClose} />;
  }

  if (view === "tiers") {
    return (
      <CustomModal isOpen onClose={onClose} trigger={false} title="Loyalty Tiers">
        <div className="w-full">
          <LoyaltyTiers />
        </div>
      </CustomModal>
    );
  }

  if (view === "members") {
    return (
      <CustomModal
        isOpen
        onClose={onClose}
        trigger={false}
        title="Loyalty Members"
      >
        <div className="w-full">
          <LoyaltyMembers />
        </div>
      </CustomModal>
    );
  }

  if (view === "pos") {
    return (
      <CustomModal isOpen onClose={onClose} trigger={false} title="Point of Sale">
        <div className="w-full">
          <PointOfSale />
        </div>
      </CustomModal>
    );
  }

  return null;
};

export default LoyaltyProgramOverlays;
