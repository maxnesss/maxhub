"use client";

import { useRef, useState } from "react";

import {
  CALENDAR_EVENT_COLOR_OPTIONS,
  CALENDAR_EVENT_COLORS,
  type CalendarEventColorValue,
} from "./colors";

type AddCalendarEventModalProps = {
  action: (formData: FormData) => void | Promise<void>;
  returnMonth: string;
  defaultStartsAt: string;
};

export function AddCalendarEventModal({
  action,
  returnMonth,
  defaultStartsAt,
}: AddCalendarEventModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [color, setColor] = useState<CalendarEventColorValue>("SKY");

  function openModal() {
    dialogRef.current?.showModal();
  }

  function closeModal() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="cursor-pointer rounded-lg border border-[#bcd0f2] bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#32548f] hover:bg-[#e5efff]"
      >
        Add event
      </button>

      <dialog
        ref={dialogRef}
        className="fixed top-1/2 left-1/2 m-0 w-[min(94vw,42rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#dce6f8] bg-white p-0 text-[#162947] shadow-[0_24px_80px_-32px_rgba(17,31,56,0.45)] backdrop:bg-black/30"
      >
        <form action={action} className="space-y-4 p-6">
          <input type="hidden" name="returnMonth" value={returnMonth} />

          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
            Add calendar event
          </h2>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              name="title"
              required
              maxLength={140}
              placeholder="Event title"
              className="md:col-span-2 rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <label className="space-y-1">
              <span className="text-[11px] font-semibold tracking-[0.08em] text-[#617294] uppercase">
                Starts
              </span>
              <input
                type="datetime-local"
                name="startsAt"
                required
                defaultValue={defaultStartsAt}
                className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[11px] font-semibold tracking-[0.08em] text-[#617294] uppercase">
                Ends
              </span>
              <input
                type="datetime-local"
                name="endsAt"
                className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
              />
            </label>
            <input
              name="location"
              maxLength={180}
              placeholder="Location (optional)"
              className="md:col-span-2 rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <textarea
              name="description"
              rows={3}
              maxLength={2000}
              placeholder="Details (optional)"
              className="md:col-span-2 rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-[#617294] uppercase">
              Color
            </p>
            <div className="flex flex-wrap gap-2">
              {CALENDAR_EVENT_COLOR_OPTIONS.map((option) => {
                const token = CALENDAR_EVENT_COLORS[option.value];
                const isSelected = color === option.value;

                return (
                  <label
                    key={option.value}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-semibold ${
                      isSelected ? "ring-2 ring-[#cddaf3]" : ""
                    }`}
                    style={{
                      backgroundColor: token.chipBg,
                      borderColor: token.chipBorder,
                      color: token.chipText,
                    }}
                  >
                    <input
                      type="radio"
                      name="color"
                      value={option.value}
                      checked={isSelected}
                      onChange={() => setColor(option.value)}
                      className="sr-only"
                    />
                    <span className="h-2.5 w-2.5 rounded-full bg-current" />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-[#4e5e7a]">
            <input type="checkbox" name="isAllDay" value="1" className="h-4 w-4 rounded border-[#cad8ef]" />
            All day event
          </label>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-lg border border-[#bcd0f2] bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#32548f] hover:bg-[#e5efff]"
            >
              Save event
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
