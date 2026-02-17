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
  let overview: { projectName: string; goal: string; keyFeatures: string } | null = null;
  let ideaCount = 0;
  let taskRows: Array<{ status: SkatingBibleTaskStatus; _count: { _all: number } }> = [];

  try {
    [overview, ideaCount, taskRows] = await Promise.all([
      prisma.skatingBibleOverview.findUnique({
        where: { id: "default" },
        select: {
          projectName: true,
          goal: true,
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
  const doneRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;
  const featurePreview = overview?.keyFeatures?.trim() || "Add features in overview page.";
  const goalPreview = overview?.goal?.trim() || "Set a clear project goal in overview.";

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <article className="rounded-3xl border border-[#d9e3f4] bg-gradient-to-br from-white via-[#fafdff] to-[#f2f7ff] p-8 shadow-[0_24px_46px_-34px_rgba(20,38,70,0.45)]">
          <Breadcrumbs
            items={[
              { label: "Apps", href: "/apps" },
              { label: "Skating bible" },
            ]}
          />
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
            {overview?.projectName || "Skating bible"}
          </h1>
          <p className="mt-4 max-w-2xl text-(--text-muted)">
            One place to steer direction, shape ideas, run execution, and track progress.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#dfe8f8] bg-white/85 p-4">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#67789a] uppercase">
                Goal
              </p>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#203352]">{goalPreview}</p>
            </div>
            <div className="rounded-2xl border border-[#dfe8f8] bg-white/85 p-4">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#67789a] uppercase">
                Features
              </p>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#203352]">{featurePreview}</p>
            </div>
          </div>

          <SectionTabs current="home" />
        </article>

        <article className="rounded-3xl border border-[#d9e3f4] bg-white p-6 shadow-[0_22px_40px_-32px_rgba(19,33,58,0.45)]">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">Project pulse</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#dfe8f8] bg-[#f9fbff] p-3">
              <p className="text-xs text-[#66789b]">Tasks total</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-[#162947]">{totalTasks}</p>
            </div>
            <div className="rounded-xl border border-[#dfe8f8] bg-[#f9fbff] p-3">
              <p className="text-xs text-[#66789b]">Open tasks</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-[#162947]">{openCount}</p>
            </div>
            <div className="rounded-xl border border-[#dfe8f8] bg-[#f9fbff] p-3">
              <p className="text-xs text-[#66789b]">Ideas</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-[#162947]">{ideaCount}</p>
            </div>
            <div className="rounded-xl border border-[#dfe8f8] bg-[#f9fbff] p-3">
              <p className="text-xs text-[#66789b]">Done rate</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-[#162947]">{doneRate}%</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-[#dfe8f8] bg-[#f9fbff] p-3">
            <p className="text-xs font-semibold tracking-[0.1em] text-[#607093] uppercase">Delivery pace</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e6edf9]">
              <div className="h-full rounded-full bg-[#7fa6df]" style={{ width: `${doneRate}%` }} />
            </div>
            <p className="mt-2 text-xs text-(--text-muted)">
              {doneCount} done out of {totalTasks} tasks
            </p>
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {SKATING_BIBLE_SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group relative overflow-hidden rounded-2xl border border-[#dce6f7] bg-white p-6 shadow-[0_16px_34px_-30px_rgba(20,35,61,0.45)] transition hover:-translate-y-0.5 hover:border-[#c8d8f5]"
          >
            <div className="pointer-events-none absolute -top-12 -right-10 h-24 w-24 rounded-full bg-[#eef4ff]" />
            <h2 className="relative text-xl font-semibold tracking-tight text-[#162947]">{section.label}</h2>
            <p className="relative mt-2 text-sm leading-6 text-(--text-muted)">{section.description}</p>
            <p className="relative mt-5 text-xs font-semibold tracking-[0.14em] text-[#556a90] uppercase group-hover:text-[#314a77]">
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
