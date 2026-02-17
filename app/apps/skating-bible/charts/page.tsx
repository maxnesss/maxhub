import type { CSSProperties } from "react";
import { SkatingBibleTaskStatus } from "@prisma/client";

import { SectionTabs } from "../SectionTabs";
import { SetupRequiredNotice } from "../SetupRequiredNotice";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";
import { isMissingTableError } from "@/lib/prisma-errors";
import {
  SKATING_BIBLE_TASK_STATUS_LABELS,
  SKATING_BIBLE_TASK_STATUS_OPTIONS,
} from "@/lib/skating-bible";
import { prisma } from "@/prisma";

const STATUS_CHART_COLORS = {
  TODO: "#d8a34a",
  IN_PROGRESS: "#4c79b9",
  BLOCKED: "#cf6050",
  DONE: "#44a66f",
} as const;

function toPercent(part: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((part / total) * 100);
}

function createPieStyle(counts: number[]): CSSProperties {
  const total = counts.reduce((sum, value) => sum + value, 0);

  if (total === 0) {
    return {
      background: "conic-gradient(#e8edf8 0deg 360deg)",
    };
  }

  const stops: string[] = [];
  let start = 0;
  for (const status of SKATING_BIBLE_TASK_STATUS_OPTIONS) {
    const value = counts[SKATING_BIBLE_TASK_STATUS_OPTIONS.indexOf(status)] ?? 0;
    const end = start + (value / total) * 360;
    stops.push(`${STATUS_CHART_COLORS[status]} ${start}deg ${end}deg`);
    start = end;
  }

  return {
    background: `conic-gradient(${stops.join(", ")})`,
  };
}

export default async function SkatingBibleChartsPage() {
  await requireAppRead("SKATING_BIBLE");

  let setupRequired = false;
  let taskGroups: Array<{ id: string; name: string }> = [];
  let statusRows: Array<{ status: SkatingBibleTaskStatus; _count: { _all: number } }> = [];
  let groupStatusRows: Array<{
    taskGroupId: string;
    status: SkatingBibleTaskStatus;
    _count: { _all: number };
  }> = [];

  try {
    [taskGroups, statusRows, groupStatusRows] = await Promise.all([
      prisma.skatingBibleTaskGroup.findMany({
        orderBy: [{ createdAt: "asc" }],
        select: {
          id: true,
          name: true,
        },
      }),
      prisma.skatingBibleTask.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.skatingBibleTask.groupBy({
        by: ["taskGroupId", "status"],
        _count: { _all: true },
      }),
    ]);
  } catch (readError) {
    if (isMissingTableError(readError, "SkatingBible")) {
      setupRequired = true;
    } else {
      throw readError;
    }
  }

  const statusCount = new Map(statusRows.map((row) => [row.status, row._count._all]));
  const totalTasks = statusRows.reduce((sum, row) => sum + row._count._all, 0);
  const doneCount = statusCount.get(SkatingBibleTaskStatus.DONE) ?? 0;
  const completionRate = toPercent(doneCount, totalTasks);

  const groupStatusMap = new Map(
    taskGroups.map((taskGroup) => [
      taskGroup.id,
      {
        TODO: 0,
        IN_PROGRESS: 0,
        BLOCKED: 0,
        DONE: 0,
      },
    ]),
  );

  for (const row of groupStatusRows) {
    const group = groupStatusMap.get(row.taskGroupId);
    if (!group) {
      continue;
    }

    group[row.status] = row._count._all;
  }

  const groupCards = taskGroups.map((taskGroup) => {
    const counts = groupStatusMap.get(taskGroup.id)!;
    const total = counts.TODO + counts.IN_PROGRESS + counts.BLOCKED + counts.DONE;
    return {
      taskGroup,
      counts,
      total,
      completionRate: toPercent(counts.DONE, total),
    };
  });

  let stalledGroup: {
    taskGroup: { id: string; name: string };
    blocked: number;
  } | null = null;

  for (const card of groupCards) {
    const blocked = card.counts.BLOCKED;
    if (!stalledGroup || blocked > stalledGroup.blocked) {
      stalledGroup = {
        taskGroup: card.taskGroup,
        blocked,
      };
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Skating bible", href: "/apps/skating-bible" },
            { label: "Charts" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Task status charts
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Visual snapshot of task progress across all groups.
        </p>

        <SectionTabs current="charts" />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
            All tasks by status
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <div
              className="relative h-44 w-44 rounded-full"
              style={createPieStyle(
                SKATING_BIBLE_TASK_STATUS_OPTIONS.map((status) => statusCount.get(status) ?? 0),
              )}
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
              {SKATING_BIBLE_TASK_STATUS_OPTIONS.map((status) => {
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
                        {SKATING_BIBLE_TASK_STATUS_LABELS[status]}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-[#2f456b]">
                      {count} ({toPercent(count, totalTasks)}%)
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#647494] uppercase">
            Completion
          </p>
          <div className="mt-4 rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4">
            <p className="text-xs tracking-[0.12em] text-[#647494] uppercase">Done rate</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#162947]">
              {completionRate}%
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e8edf8]">
              <div className="h-full bg-[#7ca5de]" style={{ width: `${completionRate}%` }} />
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4">
            <p className="text-xs tracking-[0.12em] text-[#647494] uppercase">
              Most blocked group
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#162947]">
              {stalledGroup ? stalledGroup.taskGroup.name : "n/a"}
            </p>
            <p className="text-xs text-(--text-muted)">{stalledGroup?.blocked ?? 0} blocked tasks</p>
          </div>
        </article>
      </section>

      {setupRequired ? <SetupRequiredNotice /> : null}

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">By group</h2>
        {groupCards.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {groupCards.map((group) => (
              <article
                key={group.taskGroup.id}
                className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4"
              >
                <p className="text-xs font-semibold tracking-[0.1em] text-[#5b6c8d] uppercase">
                  {group.taskGroup.name}
                </p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-[#162947]">
                  {group.total}
                </p>
                <p className="text-xs text-(--text-muted)">{group.completionRate}% done</p>
                <div className="mt-3 space-y-2">
                  {SKATING_BIBLE_TASK_STATUS_OPTIONS.map((status) => (
                    <div key={status} className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-[#4e5e7a]">
                        <span>{SKATING_BIBLE_TASK_STATUS_LABELS[status]}</span>
                        <span>{group.counts[status]}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#e8edf8]">
                        <div
                          className="h-full"
                          style={{
                            width: `${toPercent(group.counts[status], group.total)}%`,
                            backgroundColor: STATUS_CHART_COLORS[status],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-(--text-muted)">No groups yet.</p>
        )}
      </section>
    </main>
  );
}
