import Link from "next/link";
import { SkatingBibleTaskStatus } from "@prisma/client";

import { SectionTabs } from "./SectionTabs";
import { SetupRequiredNotice } from "./SetupRequiredNotice";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";
import { isMissingTableError } from "@/lib/prisma-errors";
import {
  SKATING_BIBLE_SECTIONS,
  SKATING_BIBLE_TASK_STATUS_LABELS,
  SKATING_BIBLE_TASK_STATUS_OPTIONS,
  SKATING_BIBLE_TASK_STATUS_STYLES,
} from "@/lib/skating-bible";
import { prisma } from "@/prisma";

export default async function SkatingBiblePage() {
  await requireAppRead("SKATING_BIBLE");

  let setupRequired = false;
  let overview: { projectName: string; keyFeatures: string } | null = null;
  let ideaCount = 0;
  let taskRows: Array<{ status: SkatingBibleTaskStatus; _count: { _all: number } }> = [];

  try {
    [overview, ideaCount, taskRows] = await Promise.all([
      prisma.skatingBibleOverview.findUnique({
        where: { id: "default" },
        select: {
          projectName: true,
          keyFeatures: true,
        },
      }),
      prisma.skatingBibleIdea.count(),
      prisma.skatingBibleTask.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);
  } catch (error) {
    if (isMissingTableError(error, "SkatingBible")) {
      setupRequired = true;
    } else {
      throw error;
    }
  }

  const statusCount = new Map(taskRows.map((row) => [row.status, row._count._all]));
  const totalTasks = taskRows.reduce((sum, row) => sum + row._count._all, 0);
  const doneCount = statusCount.get(SkatingBibleTaskStatus.DONE) ?? 0;
  const openCount = totalTasks - doneCount;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Skating bible" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          {overview?.projectName || "Skating bible"}
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Project workspace for keeping a live overview, collecting brainstorms,
          and tracking grouped tasks through delivery.
        </p>

        <SectionTabs current="home" />
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-(--line) bg-white p-5">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
            Tasks total
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#162947]">
            {totalTasks}
          </p>
        </article>
        <article className="rounded-2xl border border-(--line) bg-white p-5">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
            Open tasks
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#162947]">
            {openCount}
          </p>
        </article>
        <article className="rounded-2xl border border-(--line) bg-white p-5">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
            Ideas
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#162947]">
            {ideaCount}
          </p>
        </article>
        <article className="rounded-2xl border border-(--line) bg-white p-5">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
            Features
          </p>
          <p className="mt-2 text-sm leading-6 text-[#1a2b49]">
            {overview?.keyFeatures || "Add features in overview page."}
          </p>
        </article>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {SKATING_BIBLE_SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group rounded-2xl border border-(--line) bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#cfdbf2] hover:bg-[#fcfdff]"
          >
            <h2 className="text-xl font-semibold text-[#162947]">{section.label}</h2>
            <p className="mt-2 text-sm leading-6 text-(--text-muted)">{section.description}</p>
            <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-[#5a6b8f] uppercase group-hover:text-[#384f83]">
              Open section
            </p>
          </Link>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-lg font-semibold tracking-tight text-[#162947]">Task status snapshot</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {SKATING_BIBLE_TASK_STATUS_OPTIONS.map((status) => (
            <div
              key={status}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${SKATING_BIBLE_TASK_STATUS_STYLES[status]}`}
            >
              <span>{SKATING_BIBLE_TASK_STATUS_LABELS[status]}</span>
              <span>{statusCount.get(status) ?? 0}</span>
            </div>
          ))}
        </div>
      </section>

      {setupRequired ? <SetupRequiredNotice /> : null}
    </main>
  );
}
