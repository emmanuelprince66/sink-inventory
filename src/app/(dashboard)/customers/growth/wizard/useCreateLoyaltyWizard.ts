"use client";

import { useCreateLoyaltyProgramMutation } from "@/api/loyalty/create-loyalty-program";
import { queryKey } from "@/constants/query-key";
import { useQueryClient } from "@/lib/react-query";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import type { LoyaltyProgram } from "@/types/loyalty";
import { useCallback, useState } from "react";
import {
  INITIAL_STATE,
  STEPS,
  buildPayload,
  stepError,
  type WizardState,
} from "./config";

/**
 * Everything the Create Loyalty Programme wizard knows how to do: which step
 * we are on, the answers so far, validation, and the create call. The step
 * components stay presentational — they only read `state` and call `set`.
 */
export const useCreateLoyaltyWizard = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const queryClient = useQueryClient();

  const [stepIndex, setStepIndex] = useState(0);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<LoyaltyProgram | null>(null);

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;
  const percent = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  const set = useCallback(
    <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
      setState((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const { mutate: createProgram, isPending } = useCreateLoyaltyProgramMutation({
    id: business_id ?? "",
    onSuccess: (response: any) => {
      setCreated(response?.data ?? null);
      // The programmes list and the dashboard counters both go stale the
      // moment a programme exists.
      queryClient.invalidateQueries({
        queryKey: [queryKey.loyalty.getLoyaltyPrograms],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKey.loyalty.getLoyaltyDashboard],
      });
    },
  });

  const next = useCallback(() => {
    const problem = stepError(step, state);
    if (problem) return setError(problem);
    setError(null);
    setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
  }, [step, state]);

  const back = useCallback(() => {
    setError(null);
    setStepIndex((index) => Math.max(index - 1, 0));
  }, []);

  /** Only completed steps are reachable from the chips. */
  const goToStep = useCallback(
    (index: number) => {
      if (index >= stepIndex) return;
      setError(null);
      setStepIndex(index);
    },
    [stepIndex],
  );

  const submit = useCallback(() => {
    setError(null);
    createProgram(buildPayload(state) as unknown as LoyaltyProgram);
  }, [createProgram, state]);

  return {
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
  };
};

export type CreateLoyaltyWizardApi = ReturnType<typeof useCreateLoyaltyWizard>;
