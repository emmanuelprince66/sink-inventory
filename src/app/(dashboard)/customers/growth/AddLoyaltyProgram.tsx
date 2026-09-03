"use client";

import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import {
  CONDITION_TYPES,
  REWARD_STYLES,
  REWARD_TYPES,
  TIMEOUT_ACTIONS,
  useLoyaltyHook,
} from "@/hooks/useLoyaltyHook";
import type { LoyaltyProgram } from "@/types/loyalty";
import {
  clampPercentage,
  PERCENTAGE_MAX,
  PERCENTAGE_MIN,
} from "./loyaltyFormat";

const NOTIFY_FIELDS = [
  { name: "notify_welcome", label: "Welcome message on join" },
  { name: "notify_progress", label: "Progress updates" },
  { name: "notify_reward_ready", label: "Reward ready alert" },
  { name: "notify_expiry_reminder", label: "Expiry reminder" },
] as const;

const AddLoyaltyProgram = ({
  closeModal,
  editData,
}: {
  closeModal: () => void;
  editData?: LoyaltyProgram | null;
}) => {
  const { form, onSubmit, submitLoading, isEditing } = useLoyaltyHook({
    closeModal,
    editData,
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="w-full space-y-5">
        {/* Basics */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campaign name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Visit Streak Reward" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What is this campaign for?"
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End date (optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Trigger */}
        <div className="border-t border-grey-5 pt-4 space-y-4">
          <h4 className="text-sm font-extrabold text-grey-1">Trigger</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="condition_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>When customer reaches</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select trigger" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CONDITION_TYPES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Reward */}
        <div className="border-t border-grey-5 pt-4 space-y-4">
          <h4 className="text-sm font-extrabold text-grey-1">Reward</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="reward_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reward type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select reward" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REWARD_TYPES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reward_value"
              render={({ field }) => {
                // A percentage is a share of the bill, so it is held to 1-100
                // as it is typed; the schema checks it again on submit for
                // anything pasted straight in.
                const isPercentage = form.watch("reward_type") === "PERCENTAGE";

                return (
                  <FormItem>
                    <FormLabel>
                      {isPercentage ? "Reward value (%)" : "Reward value"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={isPercentage ? "e.g. 15" : "e.g. 2000"}
                        inputMode="decimal"
                        {...(isPercentage
                          ? {
                              type: "number",
                              min: PERCENTAGE_MIN,
                              max: PERCENTAGE_MAX,
                            }
                          : {})}
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            isPercentage
                              ? clampPercentage(e.target.value)
                              : e.target.value,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>

          <FormField
            control={form.control}
            name="reward_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reward description</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. ₦2,000 Cash Discount" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reward_style"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repeatable?</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {REWARD_STYLES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Timing */}
        <div className="border-t border-grey-5 pt-4 space-y-4">
          <h4 className="text-sm font-extrabold text-grey-1">Timing</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField
              control={form.control}
              name="visit_window_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visit window (hrs)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="24" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="completion_window_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Completion (days)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeout_action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>On timeout</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIMEOUT_ACTIONS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="border-t border-grey-5 pt-4 space-y-3">
          <h4 className="text-sm font-extrabold text-grey-1">Notifications</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {NOTIFY_FIELDS.map((n) => (
              <FormField
                key={n.name}
                control={form.control}
                name={n.name}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-medium text-grey-2 cursor-pointer">
                      {n.label}
                    </FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitLoading} className="gap-2">
            {submitLoading && <Spinner className="w-4 h-4" />}
            {isEditing ? "Save changes" : "Create Campaign"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddLoyaltyProgram;
