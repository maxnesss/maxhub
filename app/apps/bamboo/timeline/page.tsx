import Link from "next/link";
import { BambooTaskStatus } from "@prisma/client";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { canEditApp, requireAppRead } from "@/lib/authz";
import {
  BAMBOO_TASK_CATEGORY_LABELS,
  BAMBOO_TASK_PRIORITY_LABELS,
  BAMBOO_TASK_PRIORITY_STYLES,
  BAMBOO_TASK_STATUS_LABELS,
  BAMBOO_TASK_STATUS_STYLES,
  getNextBambooTaskStatus,
} from "@/lib/bamboo-tasks";
import { prisma } from "@/prisma";

import { updateBambooTaskStatusAction } from "../tasks/actions";

type BambooTimelinePageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

function getStatusTransitionLabel(status: BambooTaskStatus) {
  switch (status) {
    case BambooTaskStatus.TODO:
      return "Start";
    case BambooTaskStatus.IN_PROGRESS:
      return "Mark done";
    case BambooTaskStatus.DONE:
      return "Reopen";
    default:
      return "Update";
  }
}

export default async function BambooTimelinePage({ searchParams }: BambooTimelinePageProps) {
  const user = await requireAppRead("BAMBOO");
  const canEdit = canEditApp(user, "BAMBOO");
  const { saved, error } = await searchParams;

  const tasks = await prisma.bambooTask.findMany({
    orderBy: [{ timelineWeek: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
  });

  const tasksByWeek = new Map<number, typeof tasks>();
  for (const task of tasks) {
    const list = tasksByWeek.get(task.timelineWeek) ?? [];
    list.push(task);
    tasksByWeek.set(task.timelineWeek, list);
  }

  const weeks = [...tasksByWeek.keys()].sort((a, b) => a - b);
  const doneCount = tasks.filter((task) => task.status === BambooTaskStatus.DONE).length;
  const inProgressCount = tasks.filter(
    (task) => task.status === BambooTaskStatus.IN_PROGRESS,
  ).length;
  const todoCount = tasks.filter((task) => task.status === BambooTaskStatus.TODO).length;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      {saved === "status" ? <Toast message="Task status updated." /> : null}
      {error === "invalid" ? <Toast message="Invalid task action." tone="error" /> : null}

      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: "Timeline" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Bamboo timeline
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Weekly execution plan across all categories. Keep this view as the
          launch-critical sequence from week 1 to opening.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="inline-flex rounded-xl border border-[#d9e2f3] bg-[#f8faff] px-4 py-2 text-sm font-semibold text-[#4e5e7a]">
            To do: {todoCount}
          </span>
          <span className="inline-flex rounded-xl border border-[#d9e2f3] bg-[#f8faff] px-4 py-2 text-sm font-semibold text-[#4e5e7a]">
            In progress: {inProgressCount}
          </span>
          <span className="inline-flex rounded-xl border border-[#d9e2f3] bg-[#f8faff] px-4 py-2 text-sm font-semibold text-[#4e5e7a]">
            Done: {doneCount}
          </span>
          <Link
            href="/apps/bamboo/tasks"
            className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
          >
            Open task board
          </Link>
        </div>
      </section>

      <section className="mt-6 space-y-4">
        {weeks.length > 0 ? (
          weeks.map((week) => {
            const weekTasks = tasksByWeek.get(week) ?? [];
            return (
              <article key={week} className="rounded-2xl border border-(--line) bg-white p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
                    Week {week}
                  </h2>
                  <span className="rounded-lg border border-[#d9e2f3] bg-[#f8faff] px-3 py-1 text-xs font-semibold text-[#4e5e7a]">
                    {weekTasks.length} task{weekTasks.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {weekTasks.map((task) => {
                    const nextStatus = getNextBambooTaskStatus(task.status);
                    const hasDescription = Boolean(
                      task.description && task.description.trim().length > 0,
                    );
                    return (
                      <div
                        key={task.id}
                        className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[#1a2b49]">{task.title}</p>
                            <p className="mt-1 text-xs text-[#5b6c8d]">
                              {BAMBOO_TASK_CATEGORY_LABELS[task.category]}
                              {task.subCategory ? ` • ${task.subCategory}` : ""}
                              {" • "}
                              Owner: {task.owner}
                            </p>
                            {hasDescription ? (
                              <p className="mt-2 text-xs leading-5 text-(--text-muted)">
                                {task.description}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${BAMBOO_TASK_PRIORITY_STYLES[task.priority]}`}
                            >
                              {BAMBOO_TASK_PRIORITY_LABELS[task.priority]}
                            </span>
                            <span
                              className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${BAMBOO_TASK_STATUS_STYLES[task.status]}`}
                            >
                              {BAMBOO_TASK_STATUS_LABELS[task.status]}
                            </span>
                            {canEdit ? (
                              <form action={updateBambooTaskStatusAction}>
                                <input type="hidden" name="id" value={task.id} />
                                <input type="hidden" name="status" value={nextStatus} />
                                <input
                                  type="hidden"
                                  name="returnTo"
                                  value="/apps/bamboo/timeline"
                                />
                                <button
                                  type="submit"
                                  className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-3 py-1 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                                >
                                  {getStatusTransitionLabel(task.status)}
                                </button>
                              </form>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })
        ) : (
          <article className="rounded-2xl border border-(--line) bg-white p-6">
            <p className="text-sm text-(--text-muted)">
              No tasks yet. Open task board and create the first one.
            </p>
          </article>
        )}
      </section>
    </main>
  );
}
