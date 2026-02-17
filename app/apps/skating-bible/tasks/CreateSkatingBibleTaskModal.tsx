"use client";

import { useRef } from "react";

type TaskGroupOption = {
  id: string;
  name: string;
};

type CreateSkatingBibleTaskModalProps = {
  action: (formData: FormData) => void | Promise<void>;
  groupOptions: TaskGroupOption[];
  defaultGroupId: string | null;
};

export function CreateSkatingBibleTaskModal({
  action,
  groupOptions,
  defaultGroupId,
}: CreateSkatingBibleTaskModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  function openModal() {
    dialogRef.current?.showModal();
  }

  function closeModal() {
    dialogRef.current?.close();
  }

  const isDisabled = groupOptions.length === 0;

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        disabled={isDisabled}
        className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Add task
      </button>

      <dialog
        ref={dialogRef}
        className="fixed top-1/2 left-1/2 m-0 w-[min(92vw,42rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#dce6f8] bg-white p-0 text-[#162947] shadow-[0_24px_80px_-32px_rgba(17,31,56,0.45)] backdrop:bg-black/30"
      >
        <form action={action} className="space-y-4 p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">Add task</h2>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 md:col-span-2">
              <span className="text-xs font-semibold tracking-[0.12em] text-[#5f6f8f] uppercase">
                Title
              </span>
              <input
                type="text"
                name="title"
                required
                maxLength={180}
                className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                placeholder="Task title"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold tracking-[0.12em] text-[#5f6f8f] uppercase">
                Group
              </span>
              <select
                name="taskGroupId"
                required
                defaultValue={defaultGroupId ?? ""}
                className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
              >
                {groupOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 md:col-span-2">
              <span className="text-xs font-semibold tracking-[0.12em] text-[#5f6f8f] uppercase">
                Details
              </span>
              <textarea
                name="details"
                rows={4}
                maxLength={2000}
                className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                placeholder="Optional notes for this task."
              />
            </label>
          </div>

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
              Create task
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
