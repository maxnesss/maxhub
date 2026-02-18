"use client";

import Link from "next/link";
import { useRef } from "react";

const INVOICE_TEMPLATES = [
  {
    id: "deep-systems",
    name: "Deep Systems",
    description: "Clean Czech invoice layout with supplier, buyer, table, and totals.",
  },
];

export function TemplatePickerModal() {
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
        className="cursor-pointer rounded-xl border border-[#bcd0f2] bg-[#eef4ff] px-5 py-3 text-sm font-semibold text-[#32548f] hover:bg-[#e5efff]"
      >
        Create invoice
      </button>

      <dialog
        ref={dialogRef}
        className="fixed top-1/2 left-1/2 m-0 w-[min(94vw,44rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#dce6f8] bg-white p-0 text-[#162947] shadow-[0_24px_80px_-32px_rgba(17,31,56,0.45)] backdrop:bg-black/30"
      >
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-[#162947]">
              Choose template
            </h2>
            <button
              type="button"
              onClick={closeModal}
              className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-3 py-1.5 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              Close
            </button>
          </div>

          <div className="space-y-3">
            {INVOICE_TEMPLATES.map((template) => (
              <article
                key={template.id}
                className="rounded-xl border border-[#d9e2f3] bg-[#fbfdff] p-4"
              >
                <h3 className="text-lg font-semibold text-[#162947]">{template.name}</h3>
                <p className="mt-1 text-sm text-(--text-muted)">{template.description}</p>
                <div className="mt-3">
                  <Link
                    href={`/apps/invoice/create-invoice?template=${template.id}`}
                    className="inline-flex rounded-lg border border-[#bcd0f2] bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#32548f] hover:bg-[#e5efff]"
                  >
                    Use template
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </dialog>
    </>
  );
}
