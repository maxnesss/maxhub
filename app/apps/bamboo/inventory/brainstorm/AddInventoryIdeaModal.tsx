"use client";

import { useRef } from "react";

import type { BambooLocale } from "@/lib/bamboo-i18n";

type AddInventoryIdeaModalProps = {
  action: (formData: FormData) => void | Promise<void>;
  locale: BambooLocale;
};

export function AddInventoryIdeaModal({ action, locale }: AddInventoryIdeaModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const isZh = locale === "zh";

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
        {isZh ? "新增想法" : "Add new idea"}
      </button>

      <dialog
        ref={dialogRef}
        className="fixed top-1/2 left-1/2 m-0 w-[min(92vw,36rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#dce6f8] bg-white p-0 text-[#162947] shadow-[0_24px_80px_-32px_rgba(17,31,56,0.45)] backdrop:bg-black/30"
      >
        <form action={action} className="space-y-4 p-6">
          <h2 className="text-xl font-semibold tracking-tight">
            {isZh ? "添加货品想法" : "Add inventory idea"}
          </h2>

          <input
            type="text"
            name="name"
            required
            placeholder={isZh ? "想法名称" : "Idea name"}
            maxLength={120}
            className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
          />

          <input
            type="text"
            name="targetPriceBand"
            required
            placeholder={isZh ? "目标价格（例如 200-900 CZK）" : "Target price (e.g. 200-900 CZK)"}
            maxLength={80}
            className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
          />

          <textarea
            name="notes"
            required
            rows={4}
            placeholder={isZh ? "备注" : "Notes"}
            maxLength={1000}
            className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              {isZh ? "取消" : "Cancel"}
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              {isZh ? "添加" : "Add"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
