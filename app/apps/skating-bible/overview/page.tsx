import Link from "next/link";

import { SectionTabs } from "../SectionTabs";
import { SetupRequiredNotice } from "../SetupRequiredNotice";

import { updateSkatingBibleOverviewAction } from "../actions";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { canEditApp, requireAppRead } from "@/lib/authz";
import { isMissingTableError } from "@/lib/prisma-errors";
import { prisma } from "@/prisma";

type SkatingBibleOverviewPageProps = {
  searchParams: Promise<{ saved?: string; error?: string; edit?: string }>;
};

export default async function SkatingBibleOverviewPage({
  searchParams,
}: SkatingBibleOverviewPageProps) {
  const user = await requireAppRead("SKATING_BIBLE");
  const canEdit = canEditApp(user, "SKATING_BIBLE");
  const { saved, error, edit } = await searchParams;
  const isEditMode = canEdit && edit === "1";

  let setupRequired = false;
  let overview: {
    projectName: string;
    summary: string;
    goal: string;
    techStack: string;
    keyFeatures: string;
    updatedAt: Date;
  } | null = null;

  try {
    overview = await prisma.skatingBibleOverview.findUnique({
      where: { id: "default" },
      select: {
        projectName: true,
        summary: true,
        goal: true,
        techStack: true,
        keyFeatures: true,
        updatedAt: true,
      },
    });
  } catch (readError) {
    if (isMissingTableError(readError, "SkatingBible")) {
      setupRequired = true;
    } else {
      throw readError;
    }
  }

  const projectName = overview?.projectName ?? "Skating bible";
  const summary = overview?.summary ?? "";
  const goal = overview?.goal ?? "";
  const techStack = overview?.techStack ?? "";
  const keyFeatures = overview?.keyFeatures ?? "";
  const sectionTitleClass = "text-sm font-semibold tracking-[0.08em] text-[#415882] uppercase";

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      {saved === "1" ? <Toast message="Overview saved." /> : null}
      {error === "invalid" ? <Toast message="Invalid overview input." tone="error" /> : null}

      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Skating bible", href: "/apps/skating-bible" },
            { label: "Project overview" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Project overview
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Keep a single source of truth for the project scope and immediate priorities.
        </p>

        <SectionTabs current="overview" />
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        {setupRequired ? (
          <SetupRequiredNotice />
        ) : isEditMode ? (
          <form action={updateSkatingBibleOverviewAction} className="space-y-4">
            <label className="block space-y-1">
              <span className={sectionTitleClass}>
                Project name
              </span>
              <input
                name="projectName"
                defaultValue={projectName}
                maxLength={120}
                required
                className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
              />
            </label>

            <label className="block space-y-1">
              <span className={sectionTitleClass}>
                Summary
              </span>
              <textarea
                name="summary"
                defaultValue={summary}
                rows={6}
                maxLength={4000}
                className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                placeholder="What is this project for?"
              />
            </label>

            <label className="block space-y-1">
              <span className={sectionTitleClass}>
                Goal
              </span>
              <textarea
                name="goal"
                defaultValue={goal}
                rows={4}
                maxLength={1200}
                className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                placeholder="What is the main goal for this project?"
              />
            </label>

            <label className="block space-y-1">
              <span className={sectionTitleClass}>
                Tech stack
              </span>
              <textarea
                name="techStack"
                defaultValue={techStack}
                rows={3}
                maxLength={2000}
                className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                placeholder="Frameworks, libraries, infrastructure, and tools."
              />
            </label>

            <label className="block space-y-1">
              <span className={sectionTitleClass}>
                Features
              </span>
              <textarea
                name="keyFeatures"
                defaultValue={keyFeatures}
                rows={4}
                maxLength={3000}
                className="w-full rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                placeholder="List product features and planned highlights."
              />
            </label>

            <div className="flex items-center justify-between gap-3 pt-1">
              <p className="text-xs text-(--text-muted)">
                Last update: {overview?.updatedAt.toLocaleString() || "not saved yet"}
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href="/apps/skating-bible/overview"
                  className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="cursor-pointer rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                >
                  Save overview
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            {canEdit ? (
              <div className="flex justify-end">
                <Link
                  href="/apps/skating-bible/overview?edit=1"
                  className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                >
                  Edit
                </Link>
              </div>
            ) : null}
            <div>
              <p className={sectionTitleClass}>
                Project name
              </p>
              <p className="mt-1 text-lg font-semibold text-[#162947]">{projectName}</p>
            </div>
            <div>
              <p className={sectionTitleClass}>
                Summary
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-(--text-muted)">
                {summary || "No summary yet."}
              </p>
            </div>
            <div>
              <p className={sectionTitleClass}>
                Goal
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-(--text-muted)">
                {goal || "No goal yet."}
              </p>
            </div>
            <div>
              <p className={sectionTitleClass}>
                Tech stack
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-(--text-muted)">
                {techStack || "No tech stack defined yet."}
              </p>
            </div>
            <div>
              <p className={sectionTitleClass}>
                Features
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-(--text-muted)">
                {keyFeatures || "No features defined yet."}
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
