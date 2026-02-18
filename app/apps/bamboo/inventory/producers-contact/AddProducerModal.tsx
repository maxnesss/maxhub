"use client";

import { useRef } from "react";

import type { BambooLocale } from "@/lib/bamboo-i18n";

type AddProducerModalProps = {
  action: (formData: FormData) => void | Promise<void>;
  locale: BambooLocale;
};

export function AddProducerModal({ action, locale }: AddProducerModalProps) {
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
        {isZh ? "添加供应商" : "Add producer"}
      </button>

      <dialog
        ref={dialogRef}
        className="fixed top-1/2 left-1/2 m-0 w-[min(92vw,42rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#dce6f8] bg-white p-0 text-[#162947] shadow-[0_24px_80px_-32px_rgba(17,31,56,0.45)] backdrop:bg-black/30"
      >
        <form action={action} className="space-y-4 p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
            {isZh ? "添加供应商" : "Add producer"}
          </h2>

          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="text"
              name="name"
              required
              maxLength={120}
              placeholder={isZh ? "供应商名称" : "Producer name"}
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <input
              type="text"
              name="contact"
              required
              maxLength={240}
              placeholder={isZh ? "联系方式" : "Contact"}
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <input
              type="text"
              name="sortiment"
              required
              maxLength={240}
              placeholder={isZh ? "产品范围" : "Sortiment"}
              className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
            <textarea
              name="notes"
              rows={3}
              maxLength={1000}
              placeholder={isZh ? "备注" : "Notes"}
              className="md:col-span-3 rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
            />
          </div>

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
