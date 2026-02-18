import Link from "next/link";
import { BambooTaskStatus } from "@prisma/client";

import { updateBambooTaskStatusAction } from "../tasks/actions";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { canEditApp, requireAppRead } from "@/lib/authz";
import {
  BAMBOO_TASK_CATEGORY_LABELS,
  BAMBOO_TASK_PHASE_DESCRIPTIONS,
  BAMBOO_TASK_PHASE_LABELS,
  BAMBOO_TASK_PHASE_OPTIONS,
  BAMBOO_TASK_PHASE_STYLES,
  BAMBOO_TASK_PRIORITY_LABELS,
  BAMBOO_TASK_PRIORITY_STYLES,
  BAMBOO_TASK_STATUS_LABELS,
  BAMBOO_TASK_STATUS_STYLES,
  getNextBambooTaskStatus,
} from "@/lib/bamboo-tasks";
import { prisma } from "@/prisma";

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
    orderBy: [{ phase: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
  });

  const tasksByPhase = new Map<typeof BAMBOO_TASK_PHASE_OPTIONS[number], typeof tasks>();
  for (const task of tasks) {
    const list = tasksByPhase.get(task.phase) ?? [];
    list.push(task);
    tasksByPhase.set(task.phase, list);
  }

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
            { label: "Phase overview" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Bamboo phase overview
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Launch plan grouped into four clear phases.
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

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-lg font-semibold tracking-tight text-[#162947]">
          Phase guide
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {BAMBOO_TASK_PHASE_OPTIONS.map((phase) => (
            <article
              key={phase}
              className={`rounded-xl border p-4 ${BAMBOO_TASK_PHASE_STYLES[phase]}`}
            >
              <p className="text-sm font-semibold">
                {BAMBOO_TASK_PHASE_LABELS[phase]}
              </p>
              <p className="mt-1 text-sm opacity-85">
                {BAMBOO_TASK_PHASE_DESCRIPTIONS[phase]}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 space-y-4">
        {BAMBOO_TASK_PHASE_OPTIONS.map((phase) => {
          const phaseTasks = tasksByPhase.get(phase) ?? [];
          return (
            <article key={phase} className="rounded-2xl border border-(--line) bg-white p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2
                    className={`inline-flex rounded-lg border px-3 py-1 text-2xl font-semibold tracking-tight ${BAMBOO_TASK_PHASE_STYLES[phase]}`}
                  >
                    {BAMBOO_TASK_PHASE_LABELS[phase]}
                  </h2>
                  <p className="mt-1 text-sm text-(--text-muted)">
                    {BAMBOO_TASK_PHASE_DESCRIPTIONS[phase]}
                  </p>
                </div>
                <span className="rounded-lg border border-[#d9e2f3] bg-[#f8faff] px-3 py-1 text-xs font-semibold text-[#4e5e7a]">
                  {phaseTasks.length} task{phaseTasks.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {phaseTasks.length > 0 ? (
                  phaseTasks.map((task) => {
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
                  })
                ) : (
                  <p className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4 text-sm text-(--text-muted)">
                    No tasks in this phase yet.
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
