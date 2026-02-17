"use client";

import Link from "next/link";
import { useState } from "react";

import { CreateBrainstormModal } from "./CreateBrainstormModal";

type BrainstormListItem = {
  id: string;
  title: string;
  colorKey: string;
  color: {
    listBg: string;
    listBorder: string;
    listText: string;
    bubbleBg: string;
    bubbleBorder: string;
  };
};

type BrainstormListSectionProps = {
  canEdit: boolean;
  brainstorms: BrainstormListItem[];
  selectedBrainstormId: string | null;
  createBrainstormAction: (formData: FormData) => void | Promise<void>;
  renameBrainstormAction: (formData: FormData) => void | Promise<void>;
  deleteBrainstormAction: (formData: FormData) => void | Promise<void>;
};

export function BrainstormListSection({
  canEdit,
  brainstorms,
  selectedBrainstormId,
  createBrainstormAction,
  renameBrainstormAction,
  deleteBrainstormAction,
}: BrainstormListSectionProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[#162947]">Brainstorm list</h2>
          <p className="mt-1 text-sm text-(--text-muted)">
            Switch between brainstorm maps or create a new one.
          </p>
        </div>

        {canEdit ? (
          <div className="flex flex-col items-end gap-2">
            <CreateBrainstormModal action={createBrainstormAction} />
            <button
              type="button"
              onClick={() => setIsEditMode((prev) => !prev)}
              className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
            >
              {isEditMode ? "Done" : "Edit"}
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {brainstorms.length > 0 ? (
          brainstorms.map((brainstorm) => {
            const isSelected = brainstorm.id === selectedBrainstormId;

            return (
              <div
                key={brainstorm.id}
                className="inline-flex items-center gap-1 rounded-lg border border-[#d9e2f3] bg-white p-1"
                style={{
                  borderColor: brainstorm.color.listBorder,
                  backgroundColor: brainstorm.color.listBg,
                }}
              >
                {canEdit && isEditMode ? (
                  <form action={renameBrainstormAction} className="flex items-center gap-1">
                    <input type="hidden" name="id" value={brainstorm.id} />
                    <input
                      name="title"
                      required
                      maxLength={120}
                      defaultValue={brainstorm.title}
                      className={`w-44 rounded-md border px-3 py-2 text-xs font-semibold tracking-[0.08em] uppercase ${
                        isSelected
                          ? "border-[#c8d8f5]"
                          : "border-[#d8e2f4] bg-white"
                      }`}
                      style={{
                        backgroundColor: isSelected
                          ? brainstorm.color.bubbleBg
                          : "white",
                        color: brainstorm.color.listText,
                      }}
                    />
                    <button
                      type="submit"
                      className="cursor-pointer rounded-md border border-[#bcd0f2] bg-[#eef4ff] px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-[#32548f] uppercase hover:bg-[#e5efff]"
                    >
                      Save
                    </button>
                  </form>
                ) : (
                  <Link
                    href={`/apps/skating-bible/brainstorm?brainstormId=${brainstorm.id}`}
                    className={`rounded-md px-3 py-2 text-xs font-semibold tracking-[0.08em] uppercase ${
                      isSelected
                        ? ""
                        : "hover:opacity-90"
                    }`}
                    style={{
                      backgroundColor: isSelected
                        ? brainstorm.color.bubbleBg
                        : brainstorm.color.listBg,
                      color: brainstorm.color.listText,
                    }}
                  >
                    {brainstorm.title}
                  </Link>
                )}

                {canEdit && isEditMode ? (
                  <form action={deleteBrainstormAction}>
                    <input type="hidden" name="id" value={brainstorm.id} />
                    <button
                      type="submit"
                      className="cursor-pointer rounded-md border border-[#efcbc2] bg-[#fff2ef] px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-[#8b3a2d] uppercase hover:bg-[#fee8e3]"
                      title={`Delete ${brainstorm.title}`}
                      aria-label={`Delete ${brainstorm.title}`}
                    >
                      Delete
                    </button>
                  </form>
                ) : null}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-(--text-muted)">No brainstorms created yet.</p>
        )}
      </div>
    </section>
  );
}
