import { SectionTabs } from "../SectionTabs";
import { SetupRequiredNotice } from "../SetupRequiredNotice";

import {
  addSkatingBibleIdeaAction,
  createSkatingBibleBrainstormAction,
  deleteSkatingBibleBrainstormAction,
  deleteSkatingBibleIdeaAction,
  renameSkatingBibleBrainstormAction,
  saveSkatingBibleIdeaPositionAction,
  updateSkatingBibleCenterTopicAction,
  updateSkatingBibleIdeaAction,
} from "../actions";
import { BrainstormListSection } from "./BrainstormListSection";
import { BrainstormMap } from "./BrainstormMap";
import { getSkatingBrainstormColor } from "./colors";

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
  if (saved === "deleted") {
    return "Idea deleted.";
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
  let brainstorms: Array<{
    id: string;
    title: string;
    colorKey: string;
    createdAt: Date;
  }> = [];
  let selectedBrainstormId: string | null = null;
  let centerTitle = "Main brainstorm";
  let selectedBrainstormColorKey = "sky";
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
        colorKey: true,
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
      selectedBrainstormColorKey = selectedBrainstorm.colorKey;

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
        <BrainstormListSection
          canEdit={canEdit}
          brainstorms={brainstorms.map((item) => ({
            id: item.id,
            title: item.title,
            colorKey: item.colorKey,
            color: getSkatingBrainstormColor(item.colorKey),
          }))}
          selectedBrainstormId={selectedBrainstormId}
          createBrainstormAction={createSkatingBibleBrainstormAction}
          renameBrainstormAction={renameSkatingBibleBrainstormAction}
          deleteBrainstormAction={deleteSkatingBibleBrainstormAction}
        />
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
          color={getSkatingBrainstormColor(selectedBrainstormColorKey)}
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
