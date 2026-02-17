"use client";

import { useRef } from "react";

type CreateSkatingBibleTaskGroupModalProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function CreateSkatingBibleTaskGroupModal({ action }: CreateSkatingBibleTaskGroupModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

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
        className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
      >
        Add group
      </button>

      <dialog
        ref={dialogRef}
        className="fixed top-1/2 left-1/2 m-0 w-[min(92vw,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#dce6f8] bg-white p-0 text-[#162947] shadow-[0_24px_80px_-32px_rgba(17,31,56,0.45)] backdrop:bg-black/30"
      >
        <form action={action} className="space-y-4 p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">Add task group</h2>

          <label className="space-y-1">
            <span className="text-xs font-semibold tracking-[0.12em] text-[#5f6f8f] uppercase">Name</span>
            <input
              type="text"
              name="name"
              required
              maxLength={80}
              className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
              placeholder="Group name"
            />
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
              Create group
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
