"use client";

import { useRef, useState } from "react";

import {
  SKATING_BRAINSTORM_COLOR_OPTIONS,
  type SkatingBrainstormColorKey,
} from "./colors";

type CreateBrainstormModalProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function CreateBrainstormModal({ action }: CreateBrainstormModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [selectedColorKey, setSelectedColorKey] =
    useState<SkatingBrainstormColorKey>(SKATING_BRAINSTORM_COLOR_OPTIONS[0].key);

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
        className="cursor-pointer rounded-lg border border-[#bcd0f2] bg-[#eef4ff] px-3 py-2 text-xs font-semibold text-[#32548f] hover:bg-[#e5efff]"
      >
        Create
      </button>

      <dialog
        ref={dialogRef}
        className="fixed top-1/2 left-1/2 m-0 w-[min(92vw,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#dce6f8] bg-white p-0 text-[#162947] shadow-[0_24px_80px_-32px_rgba(17,31,56,0.45)] backdrop:bg-black/30"
      >
        <form action={action} className="space-y-4 p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
            Create brainstorm
          </h2>

          <label className="mb-3 block space-y-1">
            <span className="text-xs font-semibold tracking-[0.12em] text-[#5f6f8f] uppercase">
              Brainstorm title
            </span>
            <input
              name="title"
              required
              maxLength={120}
              className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
              placeholder="Brainstorm title"
            />
          </label>

          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold tracking-[0.12em] text-[#5f6f8f] uppercase">
              Color
            </legend>
            <div className="flex flex-wrap gap-2">
              {SKATING_BRAINSTORM_COLOR_OPTIONS.map((option) => {
                const isSelected = selectedColorKey === option.key;

                return (
                  <label
                    key={option.key}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-semibold ${
                      isSelected ? "ring-2 ring-[#cddaf3]" : ""
                    }`}
                    style={{
                      borderColor: option.listBorder,
                      backgroundColor: option.listBg,
                      color: option.listText,
                    }}
                  >
                    <input
                      type="radio"
                      name="colorKey"
                      value={option.key}
                      checked={isSelected}
                      onChange={() => setSelectedColorKey(option.key)}
                      className="sr-only"
                    />
                    <span
                      className="h-4 w-4 rounded-full border"
                      style={{
                        borderColor: option.bubbleBorder,
                        backgroundColor: option.bubbleBg,
                      }}
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </fieldset>

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
              Create
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
