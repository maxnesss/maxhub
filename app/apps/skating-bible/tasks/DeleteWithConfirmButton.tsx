"use client";

import { useRef } from "react";

type DeleteWithConfirmButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  returnTo?: string;
  title: string;
  description: string;
  ariaLabel: string;
  disabled?: boolean;
};

export function DeleteWithConfirmButton({
  action,
  id,
  returnTo,
  title,
  description,
  ariaLabel,
  disabled,
}: DeleteWithConfirmButtonProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  function openModal() {
    if (disabled) {
      return;
    }

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
        aria-label={ariaLabel}
        title={ariaLabel}
        disabled={disabled}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#f2d2cb] bg-white text-[#9c3d2f] hover:bg-[#fff3f0] disabled:cursor-not-allowed disabled:opacity-45"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
          <path
            d="M2.5 4h11M6.5 2.5h3M5.5 6v6M8 6v6M10.5 6v6M4.5 4.5l.5 8.5h6l.5-8.5"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <dialog
        ref={dialogRef}
        className="fixed top-1/2 left-1/2 m-0 w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#dce6f8] bg-white p-0 text-[#162947] shadow-[0_24px_80px_-32px_rgba(17,31,56,0.45)] backdrop:bg-black/30"
      >
        <form action={action} className="space-y-4 p-6">
          <h2 className="text-lg font-semibold tracking-tight text-[#162947]">{title}</h2>
          <p className="text-sm text-(--text-muted)">{description}</p>

          <input type="hidden" name="id" value={id} />
          {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}

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
              className="cursor-pointer rounded-lg border border-[#f2d2cb] bg-white px-4 py-2 text-sm font-semibold text-[#9c3d2f] hover:bg-[#fff3f0]"
            >
              Delete
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
