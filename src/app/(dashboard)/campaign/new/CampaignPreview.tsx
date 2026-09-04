"use client";

import { ArrowUp, Eye } from "lucide-react";

/**
 * Tags the email toolbar can produce. The body is escaped first and only
 * these are handed back to the browser, so a merchant pasting markup into
 * their own body cannot execute anything in the preview.
 */
const ALLOWED_TAGS = ["strong", "em", "u", "h1", "h2", "ul", "ol", "li", "p"];

export const renderRichText = (value: string) => {
  const escaped = value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const restored = ALLOWED_TAGS.reduce(
    (accumulator, tag) =>
      accumulator.replace(
        new RegExp(`&lt;(/?${tag})&gt;`, "gi"),
        (_match, captured) => `<${captured}>`,
      ),
    escaped,
  ).replace(/&lt;br\s*\/?&gt;/gi, "<br />");

  return restored.replace(/\n/g, "<br />");
};

const PreviewHeading = () => (
  <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-grey-3 lg:justify-start">
    <Eye className="w-3.5 h-3.5" />
    Live Preview
  </p>
);

/** Status-bar battery. Two spans rather than an icon so it stays crisp at the
 *  8px scale the handset renders at. */
const BatteryGlyph = () => (
  <span className="flex items-center gap-[1px]">
    <span className="relative h-[7px] w-[12px] rounded-[2px] border border-grey-2">
      <span className="absolute inset-[1px] rounded-[1px] bg-grey-2" />
    </span>
    <span className="h-[3px] w-[1px] rounded-full bg-grey-2" />
  </span>
);

export const SmsPreview = ({
  senderName,
  message,
}: {
  senderName: string;
  message: string;
}) => (
  <div className="space-y-3">
    <PreviewHeading />

    {/* 18/39 is 9:19.5 — the actual iPhone screen ratio — held by
        aspect-ratio rather than a min-height, so the thread flexes to fill
        whatever is left after the chrome and the shell never stretches into a
        card as the message grows or the rail narrows. */}
    <div className="relative mx-auto w-[186px]">
      {/* Side hardware. Purely decorative, but the flat silhouette without
          them is what made the shell read as a rounded rectangle. */}
      <span className="absolute -left-[2px] top-[86px] h-6 w-[2px] rounded-l-sm bg-grey-2" />
      <span className="absolute -left-[2px] top-[118px] h-6 w-[2px] rounded-l-sm bg-grey-2" />
      <span className="absolute -right-[2px] top-[104px] h-10 w-[2px] rounded-r-sm bg-grey-2" />

      <div className="rounded-[2.6rem] bg-grey-1 p-[7px] shadow-[0_18px_40px_-10px_rgba(17,24,39,0.45)]">
        {/* The thread sits on the system grey; only the status bar and the
            contact header are white, which is the contrast that makes the
            screen read as Messages rather than as a white card. */}
        <div className="flex aspect-[18/39] flex-col overflow-hidden rounded-[2.1rem] bg-[#F2F2F6] ring-1 ring-inset ring-black/5">
          {/* Status bar — the island is centred over the row, with the clock
              and battery sitting either side of it, as on the device. */}
          <div className="relative flex h-8 shrink-0 items-center justify-between bg-white px-3.5">
            <span className="text-[8px] font-bold text-grey-1">9:41</span>
            <span className="absolute left-1/2 top-[6px] h-[15px] w-[48px] -translate-x-1/2 rounded-full bg-grey-1" />
            <BatteryGlyph />
          </div>

          <div className="shrink-0 border-b border-grey-5/80 bg-white px-2 pb-2 text-center">
            <p className="truncate text-[11px] font-extrabold leading-tight text-grey-1">
              {senderName || "Your Business"}
            </p>
            <p className="mt-[1px] text-[8px] leading-tight text-grey-4">
              Text Message · Today
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2.5">
            <p className="mb-2 text-center text-[8px] font-bold text-grey-4">
              Today
            </p>

            {message ? (
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-2.5 py-1.5 shadow-[0_1px_2px_rgba(17,24,39,0.08)]">
                <p className="whitespace-pre-wrap break-words text-[9px] leading-[1.5] text-grey-1">
                  {message}
                </p>
              </div>
            ) : (
              <div className="max-w-[78%] rounded-2xl rounded-bl-md border border-dashed border-grey-4/60 px-2.5 py-2">
                <p className="text-[9px] italic leading-[1.5] text-grey-4">
                  Your message will appear here...
                </p>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 px-2.5 pb-3 pt-1">
            <span className="h-[20px] flex-1 truncate rounded-full border border-grey-5 bg-white px-2.5 text-[8px] leading-[18px] text-grey-4">
              iMessage
            </span>
            <span className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full bg-primary-green-300 text-white">
              <ArrowUp className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const EmailPreview = ({
  senderName,
  subject,
  previewText,
  body,
}: {
  senderName: string;
  subject: string;
  previewText: string;
  body: string;
}) => {
  const from = senderName || "Your Business";
  const initials = from.trim().slice(0, 2).toUpperCase();

  return (
    <div className="space-y-3">
      <PreviewHeading />

      {/* Capped and centred on small screens so it reads as a mail client
          window rather than as another full-width form card. */}
      <div className="mx-auto w-full max-w-[320px] overflow-hidden rounded-2xl border border-grey-5 bg-white shadow-sm lg:max-w-none">
        <div className="flex items-center gap-2 border-b border-grey-5 bg-grey-6 px-3 py-2">
          <span className="flex shrink-0 gap-1">
            <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
            <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
            <span className="h-2 w-2 rounded-full bg-[#28c840]" />
          </span>
          <span className="truncate text-[9px] text-grey-3">
            Inbox — customer@email.com
          </span>
        </div>

        <div className="flex items-start gap-2 px-3 py-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-green-300 text-[9px] font-bold text-white">
            {initials}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate text-[11px] font-extrabold text-grey-1">
                {from}
              </p>
              <span className="shrink-0 text-[9px] text-grey-4">Just now</span>
            </div>
            <p className="truncate text-[9px] text-grey-4">
              to: customer@email.com
            </p>
            <p className="mt-1 break-words text-[11px] font-extrabold text-grey-1">
              {subject || "Your subject line will appear here"}
            </p>
            {previewText && (
              <p className="mt-0.5 break-words text-[9px] text-grey-4">
                {previewText}
              </p>
            )}
          </div>
        </div>

        {/* The branded band the recipient actually sees above the body. */}
        <div className="mx-3 flex items-center gap-2 rounded-t-lg bg-grey-1 px-3 py-2.5">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-primary-green-300 text-[8px] font-bold text-white">
            S
          </span>
          <span className="truncate text-[10px] font-bold text-white">
            SalesIQ — {from}
          </span>
        </div>

        <div className="mx-3 min-h-[120px] rounded-b-lg border border-t-0 border-grey-5 px-3 py-3">
          {body ? (
            <div
              className="break-words text-[10px] leading-relaxed text-grey-2 [&_h1]:text-[13px] [&_h1]:font-extrabold [&_h1]:text-grey-1 [&_h2]:text-[11px] [&_h2]:font-bold [&_h2]:text-grey-1 [&_li]:ml-4 [&_li]:list-disc"
              dangerouslySetInnerHTML={{ __html: renderRichText(body) }}
            />
          ) : (
            <p className="text-[10px] italic text-grey-4">
              Your email content will appear here as you type...
            </p>
          )}
        </div>

        <p className="px-4 py-3 text-center text-[8px] leading-relaxed text-grey-4">
          You received this because you opted in to communications from {from}.
          <br />
          <span className="underline">Unsubscribe</span>
        </p>
      </div>
    </div>
  );
};
