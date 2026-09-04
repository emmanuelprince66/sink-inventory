"use client";

import {
  estimateFrom,
  useCampaignEstimateQuery,
  type CampaignEstimateRequest,
} from "@/api/campaign/estimate-campaign";
import { useFetchSegmentsQuery } from "@/api/segment/fetch-segments";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/toast/useToast";
import { useCampaignHook } from "@/hooks/useCampaignHook";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { cn } from "@/lib/utils";
import { ChevronLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import AudienceSelector from "./AudienceSelector";
import { EmailPreview, SmsPreview } from "./CampaignPreview";
import CreditEstimate from "./CreditEstimate";
import {
  CampaignChannel,
  CREDITS_PER_MESSAGE,
  getChannelConfig,
  SMS_MAX_CHARS,
} from "./channel";

/** The formatting the email body toolbar can apply, in toolbar order. */
const RICH_TEXT_ACTIONS = [
  { key: "bold", label: "B", tag: "strong", className: "font-extrabold" },
  { key: "italic", label: "I", tag: "em", className: "italic" },
  { key: "underline", label: "U", tag: "u", className: "underline" },
  { key: "h1", label: "H1", tag: "h1", divider: true },
  { key: "h2", label: "H2", tag: "h2" },
  { key: "list", label: "• List", tag: "li", divider: true },
] as const;

const ComposeCampaign = ({
  channel,
  onBack,
}: {
  channel: CampaignChannel;
  onBack: () => void;
}) => {
  const router = useRouter();
  const { showToast } = useToast();
  const business_id = useBusinessStore((state) => state.business_id);
  const [searchInput, setSearchInput] = useState("");
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  const config = getChannelConfig(channel);
  const Icon = config.icon;
  const isEmail = channel === "EMAIL";
  const creditsPerMessage = CREDITS_PER_MESSAGE[channel];

  // A sent campaign has nowhere to go but the list, so `closeModal` — which
  // the hook fires on success — doubles as the redirect.
  const {
    form,
    onSubmit,
    businessData,
    CustomersData,
    CustomersLoading,
    CampaignGroupData,
    CampaignGroupLoading,
    CreateCampaignLoading,
  } = useCampaignHook({
    closeModal: () => router.push("/campaign"),
    searchInput,
  });

  const customers = CustomersData?.data ?? [];
  const groups = CampaignGroupData?.data ?? [];

  const name = form.watch("name") || "";
  const subject = form.watch("title") || "";
  const previewText = form.watch("preview_text") || "";
  const message = form.watch("message") || "";
  const customerIds = form.watch("customer_ids") || [];
  const groupIds = form.watch("group_ids") || [];

  /**
   * Held outside the form because neither is a field the composer writes.
   *
   * "Everyone" is a shortcut the backend expands for itself — sending
   * thousands of ids would be slower and would still have to be deduped — and
   * segments are dynamic, so their membership is only settled at send time.
   */
  const [sendToAll, setSendToAll] = useState(false);
  const [segmentIds, setSegmentIds] = useState<string[]>([]);

  const { data: segmentsData } = useFetchSegmentsQuery({
    params: { id: business_id ?? "" },
  });
  // Not `segments` — that name is already the SMS segment count above, and
  // these are customer segments. Two different things one letter apart.
  const customerSegments = (segmentsData?.data ?? []) as any[];

  // The registered Sender ID is what the gateway actually stamps on the
  // message; the business name is only a fallback for accounts still waiting
  // on approval. Either way it is displayed, not edited, here.
  const senderName = businessData?.sender_id || businessData?.name || "";

  useEffect(() => {
    form.setValue("channel", channel, { shouldValidate: true });
  }, [channel, form]);

  // The API requires a title on every campaign, but an SMS has no subject
  // line to put there — the campaign name is the only thing that identifies
  // the send in the list, so it stands in.
  useEffect(() => {
    if (!isEmail) form.setValue("title", name, { shouldValidate: true });
  }, [isEmail, name, form]);

  const usedChars = message.length;
  const remainingChars = SMS_MAX_CHARS - usedChars;
  const segments = Math.max(1, Math.ceil(usedChars / SMS_MAX_CHARS));

  const groupRecipients = groups
    .filter((group: any) => groupIds.includes(group.id))
    .reduce(
      (total: number, group: any) => total + Number(group.user_counts ?? 0),
      0,
    );

  const recipients = customerIds.length + groupRecipients;
  const availableCredits = Number(businessData?.message_credit ?? 0);

  /**
   * The audience, as the backend will read it.
   *
   * Sent on every change so the panel always describes the current selection.
   * The local `recipients` count above is only used to decide whether anything
   * is selected at all — what it would reach and cost is not knowable here,
   * because a customer in both a group and the picked list is one recipient,
   * and anyone with no email or phone is none.
   */
  const audience: CampaignEstimateRequest = useMemo(
    () => ({
      channel,
      send_to_all: sendToAll,
      customer_ids: sendToAll ? [] : customerIds,
      group_ids: sendToAll ? [] : groupIds,
      segment_ids: sendToAll ? [] : segmentIds,
    }),
    [channel, sendToAll, customerIds, groupIds, segmentIds],
  );

  const { data: estimateData, isFetching: estimating } =
    useCampaignEstimateQuery(business_id ?? null, audience);
  const estimate = estimateFrom(estimateData);

  /** Wrap whatever is selected in the body with a tag pair, leaving the
   *  selection in place so the merchant can keep typing. */
  const applyFormatting = (tag: string) => {
    const element = bodyRef.current;
    if (!element) return;

    const { selectionStart, selectionEnd, value } = element;
    const open = `<${tag}>`;
    const close = `</${tag}>`;

    form.setValue(
      "message",
      value.slice(0, selectionStart) +
        open +
        value.slice(selectionStart, selectionEnd) +
        close +
        value.slice(selectionEnd),
      { shouldValidate: true },
    );

    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(
        selectionStart + open.length,
        selectionEnd + open.length,
      );
    });
  };

  const handleSend = form.handleSubmit((values) => {
    // Checked against the backend's own estimate rather than a local sum: it
    // is the same calculation the send will run, so a campaign that passes
    // here cannot be refused for cost a moment later.
    if (estimate && !estimate.sufficient_credit) {
      showToast(
        `This campaign needs ${estimate.credits_required} credits — you have ${estimate.current_balance}.`,
        "error",
      );
      return;
    }

    // Everyone picked is uncontactable on this channel. The send would fail
    // upstream with "No customer in campaign has registered Email"; saying so
    // here names the actual problem.
    if (estimate && estimate.reachable_recipients === 0) {
      showToast(
        `None of the customers selected have ${
          channel === "EMAIL" ? "an email address" : "a usable phone number"
        } on file.`,
        "error",
      );
      return;
    }

    onSubmit({ ...values, send_to_all: sendToAll, segment_ids: segmentIds });
  });

  return (
    <div className="w-full max-w-full min-w-0 h-full flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex cursor-pointer items-center gap-1 text-sm font-bold text-grey-3 transition-colors hover:text-primary-green-300"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <span className="hidden h-4 w-px bg-grey-5 sm:block" />

        <span className="flex min-w-0 items-center gap-2 text-sm font-extrabold text-grey-1">
          <Icon
            className={cn(
              "w-4 h-4 shrink-0",
              isEmail ? "text-info-1" : "text-primary-green-300",
            )}
          />
          <span className="truncate">{config.headerLabel}</span>
        </span>

        <span className="shrink-0 rounded-full bg-secondary-6 px-2 py-0.5 text-[10px] font-bold text-primary-green-300">
          Draft
        </span>
      </div>

      {/* Auto-placement puts the fields at 1/1, the rail at 2/1 and the
          actions at 1/2 on desktop; stacked on mobile that reads fields →
          preview and cost → send, so the credit estimate is the last thing
          seen before committing. */}
      <Form {...form}>
        <form
          onSubmit={handleSend}
          className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]"
        >
          <div className="min-w-0 space-y-5">
            <div>
              <p className="text-xl md:text-2xl font-extrabold text-grey-1">
                {config.composerLabel}
              </p>
              <p className="mt-1 text-sm text-grey-3">{config.subtitle}</p>
            </div>

            <div className="rounded-2xl border border-grey-5 bg-white p-4 sm:p-5 space-y-4">
              <p className="text-sm font-extrabold text-grey-1">
                Campaign Details
              </p>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-grey-2">
                      Campaign Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          isEmail
                            ? "e.g. Monthly Newsletter — July"
                            : "e.g. Weekly Promo — July"
                        }
                        className="rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <p className="text-xs font-bold text-grey-2">
                  {isEmail ? "From Name" : "Sender Name"}
                </p>
                <p className="text-[11px] text-grey-4">
                  {isEmail
                    ? "Displayed as the sender in the recipient's inbox"
                    : "This is what recipients see as the sender"}
                </p>
                <Input
                  readOnly
                  value={senderName}
                  placeholder="Awaiting Sender ID approval"
                  className="mt-1.5 cursor-not-allowed rounded-xl border-primary-green-300/40 bg-grey-6/60 text-grey-2"
                />
                <p className="mt-1 text-[11px] text-grey-4">
                  Taken from your approved Sender ID — change it in Campaign
                  settings.
                </p>
              </div>
            </div>

            {isEmail ? (
              <div className="rounded-2xl border border-grey-5 bg-white p-4 sm:p-5 space-y-4">
                <p className="text-sm font-extrabold text-grey-1">
                  Email Content
                </p>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-grey-2">
                        Subject Line
                      </FormLabel>
                      <p className="text-[11px] text-grey-4">
                        The headline customers see in their inbox
                      </p>
                      <FormControl>
                        <Input
                          placeholder="e.g. Exclusive offers just for you 🎉"
                          className="rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preview_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-grey-2">
                        Preview Text
                      </FormLabel>
                      <p className="text-[11px] text-grey-4">
                        Short teaser shown below the subject in inbox lists
                      </p>
                      <FormControl>
                        <Input
                          placeholder="e.g. Don't miss out on this week's deals..."
                          className="rounded-xl"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-grey-2">
                        Email Body
                      </FormLabel>
                      <p className="text-[11px] text-grey-4">
                        The main content of your email
                      </p>

                      <div className="overflow-hidden rounded-xl border border-grey-5">
                        <div className="flex flex-wrap items-center gap-1 border-b border-grey-5 bg-grey-6/60 px-2 py-1.5">
                          {RICH_TEXT_ACTIONS.map((action) => (
                            <span
                              key={action.key}
                              className="flex items-center gap-1"
                            >
                              {"divider" in action && action.divider && (
                                <span className="mx-1 h-4 w-px bg-grey-5" />
                              )}
                              <button
                                type="button"
                                onClick={() => applyFormatting(action.tag)}
                                className={cn(
                                  "cursor-pointer rounded px-2 py-1 text-xs font-bold text-grey-2 transition-colors hover:bg-white hover:text-primary-green-300",
                                  "className" in action && action.className,
                                )}
                              >
                                {action.label}
                              </button>
                            </span>
                          ))}
                        </div>

                        <FormControl>
                          <Textarea
                            placeholder={`Dear [Customer Name],\n\nWe wanted to reach out with something special just for you...\n\nBest regards,\nThe ${senderName || "team"}`}
                            className="min-h-[180px] rounded-none border-0 shadow-none focus:border-0"
                            {...field}
                            ref={(element) => {
                              field.ref(element);
                              bodyRef.current = element;
                            }}
                          />
                        </FormControl>
                      </div>

                      <p className="text-[11px] text-grey-4">
                        {usedChars} characters
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-grey-5 bg-white p-4 sm:p-5 space-y-3">
                <p className="text-sm font-extrabold text-grey-1">Message</p>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Type your SMS message here..."
                          className="min-h-[140px]"
                          maxLength={SMS_MAX_CHARS}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px]">
                  <span className="text-grey-4">
                    {usedChars} / {SMS_MAX_CHARS} characters · {segments} SMS
                  </span>
                  <span
                    className={cn(
                      "font-bold",
                      remainingChars <= 20
                        ? "text-warning-1"
                        : "text-primary-green-300",
                    )}
                  >
                    {remainingChars} remaining
                  </span>
                </div>

                <div className="h-1 w-full overflow-hidden rounded-full bg-grey-6">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      remainingChars <= 20
                        ? "bg-warning-1"
                        : "bg-primary-green-300",
                    )}
                    style={{
                      width: `${Math.min(100, (usedChars / SMS_MAX_CHARS) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <AudienceSelector
              form={form}
              customers={customers}
              customersLoading={CustomersLoading}
              groups={groups}
              groupsLoading={CampaignGroupLoading}
              searchInput={searchInput}
              onSearchChange={setSearchInput}
              sendToAll={sendToAll}
              onSendToAllChange={setSendToAll}
              segments={customerSegments}
              segmentIds={segmentIds}
              onSegmentIdsChange={setSegmentIds}
            />
          </div>

          {/* Sticky rail: the preview is only useful while the fields it
              mirrors are still on screen. */}
          <div className="min-w-0 space-y-5 lg:sticky lg:top-4">
            {isEmail ? (
              <EmailPreview
                senderName={senderName}
                subject={subject}
                previewText={previewText}
                body={message}
              />
            ) : (
              <SmsPreview senderName={senderName} message={message} />
            )}

            <CreditEstimate
              channelLabel={config.label}
              estimate={estimate}
              isLoading={estimating}
              hasSelection={sendToAll || recipients > 0}
              fallbackUnitCost={creditsPerMessage}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => router.push("/campaign")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={CreateCampaignLoading}
              className="h-11 gap-2 rounded-xl sm:min-w-[170px]"
            >
              {CreateCampaignLoading ? (
                <Spinner size="small" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Campaign
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ComposeCampaign;
