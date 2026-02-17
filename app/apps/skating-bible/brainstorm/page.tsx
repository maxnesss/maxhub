import Link from "next/link";

import { SectionTabs } from "../SectionTabs";
import { SetupRequiredNotice } from "../SetupRequiredNotice";

import {
  addSkatingBibleIdeaAction,
  createSkatingBibleBrainstormAction,
  deleteSkatingBibleBrainstormAction,
  deleteSkatingBibleIdeaAction,
  saveSkatingBibleIdeaPositionAction,
  updateSkatingBibleCenterTopicAction,
  updateSkatingBibleIdeaAction,
} from "../actions";
import { BrainstormMap } from "./BrainstormMap";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { canEditApp, requireAppRead } from "@/lib/authz";
import { isMissingTableError } from "@/lib/prisma-errors";
import { prisma } from "@/prisma";

type SkatingBibleBrainstormPageProps = {
  searchParams: Promise<{ saved?: string; error?: string; brainstormId?: string }>;
};

function getToastMessage(saved: string | undefined) {
  if (saved === "added") {
    return "Idea added.";
  }

  if (saved === "updated") {
    return "Idea updated.";
  }

  if (saved === "deleted") {
    return "Idea deleted.";
  }

  if (saved === "center") {
    return "Center topic updated.";
  }

  if (saved === "brainstorm-created") {
    return "Brainstorm created.";
  }

  if (saved === "brainstorm-deleted") {
    return "Brainstorm deleted.";
  }

  return null;
}

export default async function SkatingBibleBrainstormPage({
  searchParams,
}: SkatingBibleBrainstormPageProps) {
  const user = await requireAppRead("SKATING_BIBLE");
  const canEdit = canEditApp(user, "SKATING_BIBLE");
  const { saved, error, brainstormId } = await searchParams;
  const toastMessage = getToastMessage(saved);

  let setupRequired = false;
  let brainstorms: Array<{ id: string; title: string; createdAt: Date }> = [];
  let selectedBrainstormId: string | null = null;
  let centerTitle = "Main brainstorm";
  let ideas: Array<{
    id: string;
    title: string;
    notes: string;
    parentId: string | null;
    posX: number | null;
    posY: number | null;
  }> = [];

  try {
    brainstorms = await prisma.skatingBibleBrainstorm.findMany({
      orderBy: [{ createdAt: "asc" }],
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    });

    const selectedBrainstorm =
      (brainstormId
        ? brainstorms.find((item) => item.id === brainstormId)
        : undefined) ?? brainstorms[0];

    if (selectedBrainstorm) {
      selectedBrainstormId = selectedBrainstorm.id;
      centerTitle = selectedBrainstorm.title;

      ideas = await prisma.skatingBibleIdea.findMany({
        where: {
          brainstormId: selectedBrainstorm.id,
        },
        orderBy: [{ createdAt: "asc" }],
        select: {
          id: true,
          title: true,
          notes: true,
          brainstormId: true,
          parentId: true,
          posX: true,
          posY: true,
        },
      });
    }
  } catch (readError) {
    if (isMissingTableError(readError, "SkatingBible")) {
      setupRequired = true;
    } else {
      throw readError;
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      {toastMessage ? <Toast message={toastMessage} /> : null}
      {error === "invalid" ? <Toast message="Invalid brainstorm input." tone="error" /> : null}
      {error === "setup" ? <Toast message="Run database migration for Skating bible first." tone="error" /> : null}

      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Skating bible", href: "/apps/skating-bible" },
            { label: "Brainstorm" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Brainstorm
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Save raw ideas quickly and keep them visible while planning execution.
        </p>

        <SectionTabs current="brainstorm" />
      </section>

      {setupRequired ? (
        <SetupRequiredNotice />
      ) : (
        <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-[#162947]">Brainstorm list</h2>
              <p className="mt-1 text-sm text-(--text-muted)">
                Switch between brainstorm maps or create a new one.
              </p>
            </div>

            {canEdit ? (
              <form action={createSkatingBibleBrainstormAction} className="flex flex-wrap items-end gap-2">
                <label className="space-y-1">
                  <span className="text-xs font-semibold tracking-[0.12em] text-[#5f6f8f] uppercase">
                    New brainstorm
                  </span>
                  <input
                    name="title"
                    required
                    maxLength={120}
                    className="w-56 rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                    placeholder="Brainstorm title"
                  />
                </label>
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg border border-[#bcd0f2] bg-[#eef4ff] px-3 py-2 text-xs font-semibold text-[#32548f] hover:bg-[#e5efff]"
                >
                  Create
                </button>
              </form>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {brainstorms.length > 0 ? (
              brainstorms.map((brainstorm) => (
                <div key={brainstorm.id} className="inline-flex items-center gap-1 rounded-lg border border-[#d9e2f3] bg-white p-1">
                  <Link
                    href={`/apps/skating-bible/brainstorm?brainstormId=${brainstorm.id}`}
                    className={`rounded-md px-3 py-2 text-xs font-semibold tracking-[0.08em] uppercase ${
                      brainstorm.id === selectedBrainstormId
                        ? "bg-[#eef4ff] text-[#334e7f]"
                        : "text-[#4e5e7a] hover:bg-[#f8faff]"
                    }`}
                  >
                    {brainstorm.title}
                  </Link>
                  {canEdit ? (
                    <form action={deleteSkatingBibleBrainstormAction}>
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
              ))
            ) : (
              <p className="text-sm text-(--text-muted)">No brainstorms created yet.</p>
            )}
          </div>
        </section>
      )}

      {!setupRequired && selectedBrainstormId ? (
        <BrainstormMap
          canEdit={canEdit}
          brainstormId={selectedBrainstormId}
          centerTitle={centerTitle}
          ideas={ideas.map((idea) => ({
            id: idea.id,
            title: idea.title,
            notes: idea.notes,
            parentId: idea.parentId,
            posX: idea.posX,
            posY: idea.posY,
          }))}
          addIdeaAction={addSkatingBibleIdeaAction}
          deleteIdeaAction={deleteSkatingBibleIdeaAction}
          updateIdeaAction={updateSkatingBibleIdeaAction}
          updateCenterTopicAction={updateSkatingBibleCenterTopicAction}
          saveIdeaPositionAction={saveSkatingBibleIdeaPositionAction}
        />
      ) : null}

      {!setupRequired && !selectedBrainstormId ? (
        <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
          <p className="text-sm text-(--text-muted)">
            Create a brainstorm to start mapping ideas.
          </p>
        </section>
      ) : null}
    </main>
  );
}
