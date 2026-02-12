"use client";

import { useRef } from "react";

type TaskOption = {
  value: string;
  label: string;
};

type CreateBambooTaskModalProps = {
  action: (formData: FormData) => void | Promise<void>;
  categoryOptions: TaskOption[];
  priorityOptions: TaskOption[];
  defaultCategory: string;
};

export function CreateBambooTaskModal({
  action,
  categoryOptions,
  priorityOptions,
  defaultCategory,
}: CreateBambooTaskModalProps) {
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
        Create task
      </button>

      <dialog
        ref={dialogRef}
        className="fixed top-1/2 left-1/2 m-0 w-[min(92vw,42rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#dce6f8] bg-white p-0 text-[#162947] shadow-[0_24px_80px_-32px_rgba(17,31,56,0.45)] backdrop:bg-black/30"
      >
        <form action={action} className="space-y-4 p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
            Create task
          </h2>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              name="title"
              required
              maxLength={180}
              placeholder="Task title"
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <input
              type="text"
              name="owner"
              required
              maxLength={80}
              placeholder="Owner (e.g. Founder)"
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <select
              name="category"
              required
              defaultValue={defaultCategory}
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            >
              {categoryOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <select
              name="priority"
              required
              defaultValue="MEDIUM"
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            >
              {priorityOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="subCategory"
              maxLength={120}
              placeholder="Subcategory (optional)"
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <input
              type="number"
              name="timelineWeek"
              min={1}
              max={52}
              defaultValue={4}
              required
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <textarea
              name="description"
              rows={3}
              maxLength={2000}
              placeholder="Description (optional)"
              className="md:col-span-2 rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
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
              Add task
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
