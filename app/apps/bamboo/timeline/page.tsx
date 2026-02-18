import Link from "next/link";
import { BambooTaskStatus } from "@prisma/client";

import { updateBambooTaskStatusAction } from "../tasks/actions";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { canEditApp, requireAppRead } from "@/lib/authz";
import { getBambooLocale } from "@/lib/bamboo-i18n-server";
import {
  BAMBOO_TASK_PHASE_OPTIONS,
  BAMBOO_TASK_PHASE_STYLES,
  BAMBOO_TASK_PRIORITY_STYLES,
  BAMBOO_TASK_STATUS_STYLES,
  getBambooStatusTransitionLabel,
  getBambooTaskCategoryLabels,
  getBambooTaskPhaseDescriptions,
  getBambooTaskPhaseLabels,
  getBambooTaskPriorityLabels,
  getBambooTaskStatusLabels,
  getNextBambooTaskStatus,
} from "@/lib/bamboo-tasks";
import { prisma } from "@/prisma";

type BambooTimelinePageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export default async function BambooTimelinePage({ searchParams }: BambooTimelinePageProps) {
  const user = await requireAppRead("BAMBOO");
  const canEdit = canEditApp(user, "BAMBOO");
  const locale = await getBambooLocale();
  const isZh = locale === "zh";
  const taskCategoryLabels = getBambooTaskCategoryLabels(locale);
  const taskPhaseDescriptions = getBambooTaskPhaseDescriptions(locale);
  const taskPhaseLabels = getBambooTaskPhaseLabels(locale);
  const taskPriorityLabels = getBambooTaskPriorityLabels(locale);
  const taskStatusLabels = getBambooTaskStatusLabels(locale);
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
      {saved === "status" ? <Toast message={isZh ? "任务状态已更新。" : "Task status updated."} /> : null}
      {error === "invalid" ? <Toast message={isZh ? "任务操作无效。" : "Invalid task action."} tone="error" /> : null}

      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: isZh ? "阶段概览" : "Phase overview" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          {isZh ? "Bamboo 阶段概览" : "Bamboo phase overview"}
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          {isZh ? "按四个清晰阶段组织的启动计划。" : "Launch plan grouped into four clear phases."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="inline-flex rounded-xl border border-[#d9e2f3] bg-[#f8faff] px-4 py-2 text-sm font-semibold text-[#4e5e7a]">
            {isZh ? `待办：${todoCount}` : `To do: ${todoCount}`}
          </span>
          <span className="inline-flex rounded-xl border border-[#d9e2f3] bg-[#f8faff] px-4 py-2 text-sm font-semibold text-[#4e5e7a]">
            {isZh ? `进行中：${inProgressCount}` : `In progress: ${inProgressCount}`}
          </span>
          <span className="inline-flex rounded-xl border border-[#d9e2f3] bg-[#f8faff] px-4 py-2 text-sm font-semibold text-[#4e5e7a]">
            {isZh ? `已完成：${doneCount}` : `Done: ${doneCount}`}
          </span>
          <Link
            href="/apps/bamboo/tasks"
            className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
          >
            {isZh ? "打开任务看板" : "Open task board"}
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-lg font-semibold tracking-tight text-[#162947]">
          {isZh ? "阶段说明" : "Phase guide"}
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {BAMBOO_TASK_PHASE_OPTIONS.map((phase) => (
            <article
              key={phase}
              className={`rounded-xl border p-4 ${BAMBOO_TASK_PHASE_STYLES[phase]}`}
            >
              <p className="text-sm font-semibold">{taskPhaseLabels[phase]}</p>
              <p className="mt-1 text-sm opacity-85">
                {taskPhaseDescriptions[phase]}
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
                    {taskPhaseLabels[phase]}
                  </h2>
                  <p className="mt-1 text-sm text-(--text-muted)">
                    {taskPhaseDescriptions[phase]}
                  </p>
                </div>
                <span className="rounded-lg border border-[#d9e2f3] bg-[#f8faff] px-3 py-1 text-xs font-semibold text-[#4e5e7a]">
                  {locale === "zh"
                    ? `${phaseTasks.length} 个任务`
                    : `${phaseTasks.length} task${phaseTasks.length === 1 ? "" : "s"}`}
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
                              {taskCategoryLabels[task.category]}
                              {task.subCategory ? ` • ${task.subCategory}` : ""}
                              {" • "}
                              {isZh ? "负责人" : "Owner"}: {task.owner}
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
                              {taskPriorityLabels[task.priority]}
                            </span>
                            <span
                              className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${BAMBOO_TASK_STATUS_STYLES[task.status]}`}
                            >
                              {taskStatusLabels[task.status]}
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
                                  {getBambooStatusTransitionLabel(task.status, locale)}
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
                    {isZh ? "该阶段还没有任务。" : "No tasks in this phase yet."}
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
