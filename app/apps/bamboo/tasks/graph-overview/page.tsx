import Link from "next/link";
import type { CSSProperties } from "react";
import { BambooTaskStatus } from "@prisma/client";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";
import {
  BAMBOO_TASK_PHASE_LABELS,
  BAMBOO_TASK_PHASE_OPTIONS,
  BAMBOO_TASK_STATUS_LABELS,
} from "@/lib/bamboo-tasks";
import { prisma } from "@/prisma";

const STATUS_CHART_COLORS: Record<BambooTaskStatus, string> = {
  TODO: "#d8a34a",
  IN_PROGRESS: "#4c79b9",
  DONE: "#44a66f",
};

function toPercent(part: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((part / total) * 100);
}

function createPieStyle(
  todo: number,
  inProgress: number,
  done: number,
): CSSProperties {
  const total = todo + inProgress + done;

  if (total === 0) {
    return {
      background: "conic-gradient(#e8edf8 0deg 360deg)",
    };
  }

  const todoDegrees = (todo / total) * 360;
  const inProgressDegrees = (inProgress / total) * 360;
  const firstStop = Math.round(todoDegrees * 100) / 100;
  const secondStop = Math.round((todoDegrees + inProgressDegrees) * 100) / 100;

  return {
    background: `conic-gradient(
      ${STATUS_CHART_COLORS.TODO} 0deg ${firstStop}deg,
      ${STATUS_CHART_COLORS.IN_PROGRESS} ${firstStop}deg ${secondStop}deg,
      ${STATUS_CHART_COLORS.DONE} ${secondStop}deg 360deg
    )`,
  };
}

export default async function BambooTaskGraphOverviewPage() {
  await requireAppRead("BAMBOO");

  const [statusRows, phaseStatusRows] = await Promise.all([
    prisma.bambooTask.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.bambooTask.groupBy({
      by: ["phase", "status"],
      _count: { _all: true },
    }),
  ]);

  const statusCount = new Map(
    statusRows.map((row) => [row.status, row._count._all]),
  );
  const totalTodo = statusCount.get(BambooTaskStatus.TODO) ?? 0;
  const totalInProgress = statusCount.get(BambooTaskStatus.IN_PROGRESS) ?? 0;
  const totalDone = statusCount.get(BambooTaskStatus.DONE) ?? 0;
  const totalTasks = totalTodo + totalInProgress + totalDone;
  const completionRate = toPercent(totalDone, totalTasks);

  const phaseStatusMap = new Map(
    BAMBOO_TASK_PHASE_OPTIONS.map((phase) => [
      phase,
      {
        todo: 0,
        inProgress: 0,
        done: 0,
      },
    ]),
  );

  for (const row of phaseStatusRows) {
    const phaseBucket = phaseStatusMap.get(row.phase);
    if (!phaseBucket) {
      continue;
    }

    switch (row.status) {
      case BambooTaskStatus.TODO:
        phaseBucket.todo = row._count._all;
        break;
      case BambooTaskStatus.IN_PROGRESS:
        phaseBucket.inProgress = row._count._all;
        break;
      case BambooTaskStatus.DONE:
        phaseBucket.done = row._count._all;
        break;
      default:
        break;
    }
  }

  const phaseCards = BAMBOO_TASK_PHASE_OPTIONS.map((phase) => {
    const counts = phaseStatusMap.get(phase)!;
    const total = counts.todo + counts.inProgress + counts.done;
    const open = counts.todo + counts.inProgress;

    return {
      phase,
      label: BAMBOO_TASK_PHASE_LABELS[phase],
      ...counts,
      total,
      open,
      completionRate: toPercent(counts.done, total),
    };
  });

  const busiestPhase =
    phaseCards.reduce(
      (acc, phase) => (phase.open > acc.open ? phase : acc),
      phaseCards[0],
    ) ?? null;
  const bestCompletionPhase =
    phaseCards.reduce(
      (acc, phase) =>
        phase.completionRate > acc.completionRate ? phase : acc,
      phaseCards[0],
    ) ?? null;
  const stalledPhase =
    phaseCards.reduce(
      (acc, phase) => (phase.todo > acc.todo ? phase : acc),
      phaseCards[0],
    ) ?? null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: "Tasks", href: "/apps/bamboo/tasks" },
            { label: "Graph overview" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Task graph overview
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Visual summary of execution status across all Bamboo tasks and phases.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/apps/bamboo/tasks"
            className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
          >
            Back to task board
          </Link>
          <Link
            href="/apps/bamboo/timeline"
            className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
          >
            Open phase overview
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
            All tasks by status
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <div
              className="relative h-44 w-44 rounded-full"
              style={createPieStyle(totalTodo, totalInProgress, totalDone)}
            >
              <div className="absolute inset-[18%] flex items-center justify-center rounded-full bg-white">
                <div className="text-center">
                  <p className="text-xs font-semibold tracking-[0.12em] text-[#607296] uppercase">
                    Total
                  </p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-[#162947]">
                    {totalTasks}
                  </p>
                </div>
              </div>
            </div>

            <ul className="min-w-[220px] flex-1 space-y-2">
              {[BambooTaskStatus.TODO, BambooTaskStatus.IN_PROGRESS, BambooTaskStatus.DONE].map(
                (status) => {
                  const count = statusCount.get(status) ?? 0;

                  return (
                    <li
                      key={status}
                      className="flex items-center justify-between rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: STATUS_CHART_COLORS[status] }}
                        />
                        <span className="text-sm text-[#1a2b49]">
                          {BAMBOO_TASK_STATUS_LABELS[status]}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-[#2f456b]">
                        {count} ({toPercent(count, totalTasks)}%)
                      </span>
                    </li>
                  );
                },
              )}
            </ul>
          </div>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
            Quick metrics
          </p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4">
              <p className="text-xs tracking-[0.12em] text-[#647494] uppercase">
                Completion rate
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-[#162947]">
                {completionRate}%
              </p>
            </div>
            <div className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4">
              <p className="text-xs tracking-[0.12em] text-[#647494] uppercase">Active tasks</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-[#162947]">
                {totalTodo + totalInProgress}
              </p>
            </div>
            <div className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4">
              <p className="text-xs tracking-[0.12em] text-[#647494] uppercase">
                Completed tasks
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-[#162947]">
                {totalDone}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          By phase
        </h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          Smaller phase facets show each phase breakdown and completion pressure.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {phaseCards.map((phase) => (
            <article
              key={phase.phase}
              className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4"
            >
              <p className="text-xs font-semibold tracking-[0.1em] text-[#5b6c8d] uppercase">
                {phase.label}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div
                  className="relative h-14 w-14 rounded-full"
                  style={createPieStyle(phase.todo, phase.inProgress, phase.done)}
                >
                  <div className="absolute inset-[26%] rounded-full bg-[#fbfdff]" />
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-tight text-[#162947]">
                    {phase.total}
                  </p>
                  <p className="text-xs text-(--text-muted)">
                    {phase.completionRate}% done
                  </p>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e8edf8]">
                <div
                  className="h-full bg-[#7ca5de]"
                  style={{ width: `${phase.completionRate}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[#5f7194]">
                TODO {phase.todo} • In progress {phase.inProgress} • Done {phase.done}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          Signals
        </h2>
        <ul className="mt-4 space-y-2">
          <li className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]">
            Busiest phase:{" "}
            <span className="font-semibold">
              {busiestPhase ? busiestPhase.label : "n/a"}
            </span>{" "}
            ({busiestPhase?.open ?? 0} open tasks)
          </li>
          <li className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]">
            Best completion:{" "}
            <span className="font-semibold">
              {bestCompletionPhase ? bestCompletionPhase.label : "n/a"}
            </span>{" "}
            ({bestCompletionPhase?.completionRate ?? 0}% done)
          </li>
          <li className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]">
            Phase with most TODO:{" "}
            <span className="font-semibold">
              {stalledPhase ? stalledPhase.label : "n/a"}
            </span>{" "}
            ({stalledPhase?.todo ?? 0} tasks waiting to start)
          </li>
        </ul>
      </section>
    </main>
  );
}
