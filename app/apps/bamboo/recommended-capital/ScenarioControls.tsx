"use client";

import { useRef, useState } from "react";

type ScenarioControlsProps = {
  action: (formData: FormData) => void | Promise<void>;
  operatingMonths: number;
  reservePercent: number;
  operatingExpensesLabel: string;
  reserveLabel: string;
};

type FocusTarget = "months" | "reserve";

export function ScenarioControls({
  action,
  operatingMonths,
  reservePercent,
  operatingExpensesLabel,
  reserveLabel,
}: ScenarioControlsProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const monthsSliderRef = useRef<HTMLInputElement | null>(null);
  const reserveSliderRef = useRef<HTMLInputElement | null>(null);

  const [draftMonths, setDraftMonths] = useState(operatingMonths);
  const [draftReservePercent, setDraftReservePercent] = useState(reservePercent);

  function openModal(focus: FocusTarget) {
    setDraftMonths(operatingMonths);
    setDraftReservePercent(reservePercent);
    dialogRef.current?.showModal();

    queueMicrotask(() => {
      if (focus === "months") {
        monthsSliderRef.current?.focus();
      } else {
        reserveSliderRef.current?.focus();
      }
    });
  }

  function closeModal() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => openModal("months")}
        className="cursor-pointer rounded-2xl border border-(--line) bg-white p-5 text-left hover:bg-[#f8fbff]"
      >
        <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
          {operatingMonths} months expenses
        </p>
        <p className="mt-2 text-lg font-semibold tracking-tight text-[#162947]">
          +{operatingExpensesLabel}
        </p>
        <p className="mt-1 text-xs text-[#5f7093]">Click to adjust months</p>
      </button>

      <button
        type="button"
        onClick={() => openModal("reserve")}
        className="cursor-pointer rounded-2xl border border-(--line) bg-white p-5 text-left hover:bg-[#f8fbff]"
      >
        <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
          {reservePercent}% reserve
        </p>
        <p className="mt-2 text-lg font-semibold tracking-tight text-[#162947]">
          +{reserveLabel}
        </p>
        <p className="mt-1 text-xs text-[#5f7093]">Click to adjust reserve</p>
      </button>

      <dialog
        ref={dialogRef}
        className="fixed top-1/2 left-1/2 m-0 w-[min(92vw,34rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#dce6f8] bg-white p-0 text-[#162947] shadow-[0_24px_80px_-32px_rgba(17,31,56,0.45)] backdrop:bg-black/30"
      >
        <form action={action} className="space-y-5 p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
            Recommended capital scenario
          </h2>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[#1a2b49]">
              Operating months: {draftMonths}
            </span>
            <input
              ref={monthsSliderRef}
              name="operatingMonths"
              type="range"
              min={1}
              max={24}
              step={1}
              value={draftMonths}
              onChange={(event) => setDraftMonths(Number(event.target.value))}
              className="w-full"
            />
            <p className="text-xs text-(--text-muted)">Range: 1 to 24 months</p>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[#1a2b49]">
              Reserve: {draftReservePercent}%
            </span>
            <input
              ref={reserveSliderRef}
              name="reservePercent"
              type="range"
              min={0}
              max={60}
              step={1}
              value={draftReservePercent}
              onChange={(event) => setDraftReservePercent(Number(event.target.value))}
              className="w-full"
            />
            <p className="text-xs text-(--text-muted)">Range: 0% to 60%</p>
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
              className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              Apply
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
