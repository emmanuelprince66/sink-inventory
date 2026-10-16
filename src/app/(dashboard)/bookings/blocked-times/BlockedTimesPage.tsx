"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getBlockedTimeRecords,
  useCreateBlockedTimeMutation,
  useDeleteBlockedTimeMutation,
  useServiceBlockedTimesQuery,
} from "@/api/bookings/service-bookings";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useToast } from "@/hooks/toast/useToast";
import { format, parseISO } from "date-fns";
import { CalendarOff, Clock3, Plus, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import BookingPageHeader from "../BookingPageHeader";

const toLocalInput = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const BlockedTimesPage = () => {
  const { showToast } = useToast();
  const businessId = useBusinessStore((state) => state.business_id);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const {
    data: blockedResponse,
    isLoading,
    error,
    refetch,
  } = useServiceBlockedTimesQuery(businessId ?? "", selectedDate);
  const { mutateAsync: createBlock, isPending: isCreating } =
    useCreateBlockedTimeMutation();
  const { mutateAsync: deleteBlock } = useDeleteBlockedTimeMutation();
  const blockedTimes = getBlockedTimeRecords(blockedResponse);
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [note, setNote] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (id: string) => {
    if (!businessId) return;
    setRemovingId(id);
    try {
      await deleteBlock({ businessId, id });
      showToast("Blocked time removed.", "success");
    } catch (deleteError) {
      showToast(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not remove blocked time.",
        "error",
      );
    } finally {
      setRemovingId(null);
    }
  };

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    if (
      !title.trim() ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      showToast("Enter a title and a valid start/end time.", "error");
      return;
    }
    if (!businessId) {
      showToast("Select a business before adding blocked time.", "error");
      return;
    }
    try {
      await createBlock({
        businessId,
        payload: {
          date: format(start, "yyyy-MM-dd"),
          start_time: format(start, "HH:mm"),
          end_time: format(end, "HH:mm"),
          reason: [title.trim(), note.trim()].filter(Boolean).join(" — "),
          staff_id: null,
        },
      });
      setSelectedDate(format(start, "yyyy-MM-dd"));
      setTitle("");
      setStartsAt("");
      setEndsAt("");
      setNote("");
      showToast("Blocked time added.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not add blocked time.", "error");
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <BookingPageHeader title="Block time" />

      <div className="flex items-start gap-3 rounded-xl border border-info-1/20 bg-info-2 px-4 py-3 text-xs leading-5 text-grey-2 sm:text-sm">
        <CalendarOff className="mt-0.5 h-4 w-4 shrink-0 text-info-1" />
        Add one-off periods when the business or your team are unavailable.
      </div>

      <section className="rounded-2xl border border-grey-5 bg-white p-4 sm:p-6">
        <h2 className="font-extrabold text-grey-1">Add a blocked period</h2>
        <form onSubmit={handleAdd} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-semibold text-grey-2 sm:col-span-2">
            Title
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Staff meeting"
              required
              className="h-10 rounded-lg text-sm"
            />
          </label>
          <label className="space-y-1.5 text-sm font-semibold text-grey-2">
            Starts
            <Input
              type="datetime-local"
              value={startsAt}
              min={toLocalInput(new Date())}
              onChange={(event) => setStartsAt(event.target.value)}
              required
              className="h-10 rounded-lg text-sm"
            />
          </label>
          <label className="space-y-1.5 text-sm font-semibold text-grey-2">
            Ends
            <Input
              type="datetime-local"
              value={endsAt}
              min={startsAt || toLocalInput(new Date())}
              onChange={(event) => setEndsAt(event.target.value)}
              required
              className="h-10 rounded-lg text-sm"
            />
          </label>
          <label className="space-y-1.5 text-sm font-semibold text-grey-2 sm:col-span-2">
            Note <span className="font-normal text-grey-3">Optional</span>
            <Input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add a note for your team"
              className="h-10 rounded-lg text-sm"
            />
          </label>
          <div className="sm:col-span-2 sm:flex sm:justify-end">
            <Button type="submit" className="w-full sm:w-auto" disabled={isCreating}>
              <Plus className="h-4 w-4" />
              {isCreating ? "Saving..." : "Block this time"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-grey-5 bg-white p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="font-extrabold text-grey-1">Blocked periods</h2>
            <p className="mt-1 text-xs text-grey-3">
              {isLoading
                ? "Loading periods..."
                : `${blockedTimes.length} scheduled ${
                    blockedTimes.length === 1 ? "period" : "periods"
                  } on ${format(parseISO(selectedDate), "EEE, MMM d")}`}
            </p>
          </div>
          <Input
            type="date"
            value={selectedDate}
            onChange={(event) =>
              event.target.value && setSelectedDate(event.target.value)
            }
            aria-label="Filter blocked periods by date"
            className="h-10 w-full rounded-lg text-sm sm:w-44"
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-error-1/20 bg-error-2 p-4 text-center text-sm text-error-1">
            <p>Could not load blocked periods.</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => refetch()}
            >
              Try again
            </Button>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-xl border border-grey-5 p-4"
              >
                <Skeleton className="h-10 w-10 shrink-0 rounded-xl bg-grey-6" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40 bg-grey-6" />
                  <Skeleton className="h-3 w-52 bg-grey-6" />
                </div>
                <Skeleton className="h-8 w-24 shrink-0 rounded-lg bg-grey-6" />
              </div>
            ))}
          </div>
        ) : blockedTimes.length > 0 ? (
          <div className="space-y-3">
            {blockedTimes.map((block) => (
              <article
                key={block.id}
                className="flex items-center gap-3 rounded-xl border border-grey-5 p-3 sm:p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-2 text-warning-1">
                  <CalendarOff className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold text-grey-1">
                    {block.reason}
                  </h3>
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-grey-3">
                    <Clock3 className="h-3.5 w-3.5 shrink-0" />
                    {format(
                      parseISO(`${block.date}T${block.start_time}`),
                      "EEE, MMM d · h:mm a",
                    )}
                    {" – "}
                    {format(parseISO(`${block.date}T${block.end_time}`), "h:mm a")}
                  </p>
                  {block.staff_name && (
                    <p className="mt-1 text-xs text-grey-3">{block.staff_name}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label={`Remove ${block.reason}`}
                  disabled={removingId === block.id}
                  className="shrink-0 text-error-1 hover:bg-error-2 hover:text-error-1"
                  onClick={() => void handleRemove(block.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">
                    {removingId === block.id ? "Removing..." : "Remove"}
                  </span>
                </Button>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-grey-5 px-4 py-8 text-center">
            <CalendarOff className="h-6 w-6 text-grey-4" />
            <p className="mt-2 text-sm font-semibold text-grey-2">
              No blocked periods on this day
            </p>
            <p className="mt-1 text-xs text-grey-3">
              Pick another date or add a blocked period above.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default BlockedTimesPage;
