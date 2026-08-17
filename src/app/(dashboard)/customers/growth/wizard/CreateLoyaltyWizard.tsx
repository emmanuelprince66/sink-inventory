"use client";

import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import ProgrammeCreated from "./ProgrammeCreated";
import WizardProgress from "./WizardProgress";
import { STEPS, type StepName } from "./config";
import ExpiryStep from "./steps/ExpiryStep";
import GoalStep from "./steps/GoalStep";
import NameStep from "./steps/NameStep";
import NotifyStep from "./steps/NotifyStep";
import ReviewStep from "./steps/ReviewStep";
import RewardStep from "./steps/RewardStep";
import RulesStep from "./steps/RulesStep";
import StyleStep from "./steps/StyleStep";
import TimeStep from "./steps/TimeStep";
import type { StepProps } from "./steps/StepShell";
import { useCreateLoyaltyWizard } from "./useCreateLoyaltyWizard";

/**
 * One component per step, keyed by step name — adding a step is a line in
 * STEPS and an entry here, with no branching in the render path.
 */
const STEP_VIEWS: Record<StepName, (props: StepProps) => React.ReactElement> = {
  Name: NameStep,
  Goal: GoalStep,
  Reward: RewardStep,
  Style: StyleStep,
  Rules: RulesStep,
  Time: TimeStep,
  Expiry: ExpiryStep,
  Notify: NotifyStep,
  Review: ReviewStep,
};

const CreateLoyaltyWizard = ({ onDone }: { onDone: () => void }) => {
  const {
    state,
    set,
    step,
    stepIndex,
    isLastStep,
    percent,
    error,
    created,
    isPending,
    next,
    back,
    goToStep,
    submit,
  } = useCreateLoyaltyWizard();

  // Once created, the wizard hands over to the QR card screen entirely.
  if (created) return <ProgrammeCreated program={created} onDone={onDone} />;

  const StepView = STEP_VIEWS[step];

  return (
    <div className="flex flex-col">
      <WizardProgress
        step={step}
        stepIndex={stepIndex}
        percent={percent}
        onStepClick={goToStep}
      />

      <div className="py-6">
        <StepView state={state} set={set} />

        {error && (
          <p className="mt-3 text-xs font-medium text-error-1">{error}</p>
        )}
      </div>

      <div className="flex shrink-0 gap-3 border-t border-grey-5 pt-4">
        {/* Back on the first step leaves the wizard rather than dead-ending. */}
        <Button
          variant="outline"
          className="h-11 rounded-xl"
          onClick={stepIndex === 0 ? onDone : back}
        >
          {stepIndex === 0 ? "Cancel" : "← Back"}
        </Button>

        {isLastStep ? (
          <Button
            className="h-11 flex-1 gap-2 rounded-xl"
            disabled={isPending}
            onClick={submit}
          >
            {isPending && <Spinner className="h-4 w-4" />}
            Submit
          </Button>
        ) : (
          <Button className="h-11 flex-1 rounded-xl" onClick={next}>
            Continue → {STEPS[stepIndex + 1]}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateLoyaltyWizard;
