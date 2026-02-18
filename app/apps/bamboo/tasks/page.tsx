import Link from "next/link";
import { BambooTaskStatus } from "@prisma/client";

import { createBambooTaskAction, updateBambooTaskStatusAction } from "./actions";
import { CreateBambooTaskModal } from "./CreateBambooTaskModal";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { canEditApp, requireAppRead } from "@/lib/authz";
import { getBambooLocale } from "@/lib/bamboo-i18n-server";
import {
  BAMBOO_TASK_CATEGORY_OPTIONS,
  BAMBOO_TASK_PHASE_OPTIONS,
  BAMBOO_TASK_PHASE_STYLES,
  BAMBOO_TASK_PRIORITY_OPTIONS,
  BAMBOO_TASK_PRIORITY_STYLES,
  BAMBOO_TASK_STATUS_OPTIONS,
  BAMBOO_TASK_STATUS_STYLES,
  bambooTaskFilterHref,
  getNextBambooTaskStatus,
  getBambooStatusTransitionLabel,
  getBambooTaskCategoryLabels,
  getBambooTaskPhaseLabels,
  getBambooTaskPriorityLabels,
  getBambooTaskStatusLabels,
  parseBambooTaskCategory,
  parseBambooTaskPhase,
  parseBambooTaskStatus,
} from "@/lib/bamboo-tasks";
import { prisma } from "@/prisma";

type BambooTasksPageProps = {
  searchParams: Promise<{
    category?: string;
    phase?: string;
    status?: string;
    saved?: string;
    error?: string;
  }>;
};

export default async function BambooTasksPage({ searchParams }: BambooTasksPageProps) {
  const user = await requireAppRead("BAMBOO");
  const canEdit = canEditApp(user, "BAMBOO");
  const locale = await getBambooLocale();
  const taskCategoryLabels = getBambooTaskCategoryLabels(locale);
  const taskPhaseLabels = getBambooTaskPhaseLabels(locale);
  const taskPriorityLabels = getBambooTaskPriorityLabels(locale);
  const taskStatusLabels = getBambooTaskStatusLabels(locale);
  const isZh = locale === "zh";
  const { category, phase, status, saved, error } = await searchParams;

  const categoryFilter = parseBambooTaskCategory(category);
  const phaseFilter = parseBambooTaskPhase(phase);
  const statusFilter = parseBambooTaskStatus(status);

  const where = {
    ...(categoryFilter ? { category: categoryFilter } : {}),
    ...(phaseFilter ? { phase: phaseFilter } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const [tasks, openByCategory, openByPhase] = await Promise.all([
    prisma.bambooTask.findMany({
      where,
      orderBy: [{ phase: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
    }),
    prisma.bambooTask.groupBy({
      by: ["category"],
      where: { status: { not: BambooTaskStatus.DONE } },
      _count: { _all: true },
    }),
    prisma.bambooTask.groupBy({
      by: ["phase"],
      where: { status: { not: BambooTaskStatus.DONE } },
      _count: { _all: true },
    }),
  ]);

  const openCountByCategory = new Map(
    openByCategory.map((row) => [row.category, row._count._all]),
  );
  const openCountByPhase = new Map(openByPhase.map((row) => [row.phase, row._count._all]));
  const totalOpen = [...openCountByCategory.values()].reduce((sum, count) => sum + count, 0);
  const currentFilterHref = bambooTaskFilterHref({
    category: categoryFilter,
    phase: phaseFilter,
    status: statusFilter,
  });

  const createTaskDefaultCategory = categoryFilter ?? BAMBOO_TASK_CATEGORY_OPTIONS[0];
  const createTaskDefaultPhase = phaseFilter ?? BAMBOO_TASK_PHASE_OPTIONS[0];
  const createTaskCategoryOptions = BAMBOO_TASK_CATEGORY_OPTIONS.map((item) => ({
    value: item,
    label: taskCategoryLabels[item],
  }));
  const createTaskPhaseOptions = BAMBOO_TASK_PHASE_OPTIONS.map((item) => ({
    value: item,
    label: taskPhaseLabels[item],
  }));
  const createTaskPriorityOptions = BAMBOO_TASK_PRIORITY_OPTIONS.map((item) => ({
    value: item,
    label: taskPriorityLabels[item],
  }));

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      {saved === "created" ? <Toast message={isZh ? "任务已创建。" : "Task created."} /> : null}
      {saved === "status" ? <Toast message={isZh ? "任务状态已更新。" : "Task status updated."} /> : null}
      {error === "invalid" ? <Toast message={isZh ? "任务输入无效。" : "Invalid task input."} tone="error" /> : null}

      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: isZh ? "任务" : "Tasks" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          {isZh ? "任务看板" : "Task board"}
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          {isZh
            ? "Bamboo 全模块共享任务看板。可按分类、状态和阶段筛选。"
            : "Shared task board for all Bamboo sections. Filter by category, status, and phase."}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/apps/bamboo/timeline"
            className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
          >
            {isZh ? "打开阶段概览" : "Open phase overview"}
          </Link>
          <Link
            href="/apps/bamboo/tasks/graph-overview"
            className="inline-flex rounded-xl border border-[#d9e2f3] bg-[#f4f8ff] px-4 py-2 text-sm font-semibold text-[#3d5588] hover:bg-[#ebf2ff]"
          >
            {isZh ? "图表概览" : "Graph overview"}
          </Link>
          {canEdit ? (
            <CreateBambooTaskModal
              action={createBambooTaskAction}
              categoryOptions={createTaskCategoryOptions}
              phaseOptions={createTaskPhaseOptions}
              priorityOptions={createTaskPriorityOptions}
              defaultCategory={createTaskDefaultCategory}
              defaultPhase={createTaskDefaultPhase}
              locale={locale}
            />
          ) : null}
          <span className="inline-flex rounded-xl border border-[#d9e2f3] bg-[#f8faff] px-4 py-2 text-sm font-semibold text-[#4e5e7a]">
            {isZh ? `开放任务：${totalOpen}` : `Open tasks: ${totalOpen}`}
          </span>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-lg font-semibold tracking-tight text-[#162947]">
          {isZh ? "按阶段筛选" : "Filter by phase"}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={bambooTaskFilterHref({ category: categoryFilter, status: statusFilter })}
            className={`inline-flex rounded-lg border px-3 py-2 text-xs font-semibold tracking-[0.08em] uppercase ${
              !phaseFilter
                ? "border-[#c8d8f5] bg-[#eef4ff] text-[#334e7f]"
                : "border-[#d9e2f3] bg-white text-[#4e5e7a] hover:bg-[#f8faff]"
            }`}
          >
            {isZh ? `全部 (${totalOpen})` : `All (${totalOpen})`}
          </Link>
          {BAMBOO_TASK_PHASE_OPTIONS.map((item) => (
            <Link
              key={item}
              href={bambooTaskFilterHref({
                category: categoryFilter,
                phase: item,
                status: statusFilter,
              })}
              className={`inline-flex rounded-lg border px-3 py-2 text-xs font-semibold tracking-[0.08em] uppercase ${
                phaseFilter === item
                  ? "border-[#c8d8f5] bg-[#eef4ff] text-[#334e7f]"
                  : "border-[#d9e2f3] bg-white text-[#4e5e7a] hover:bg-[#f8faff]"
              }`}
            >
              {taskPhaseLabels[item]} ({openCountByPhase.get(item) ?? 0})
            </Link>
          ))}
        </div>

        <h2 className="mt-6 text-lg font-semibold tracking-tight text-[#162947]">
          {isZh ? "按分类筛选" : "Filter by category"}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={bambooTaskFilterHref({ phase: phaseFilter, status: statusFilter })}
            className={`inline-flex rounded-lg border px-3 py-2 text-xs font-semibold tracking-[0.08em] uppercase ${
              !categoryFilter
                ? "border-[#c8d8f5] bg-[#eef4ff] text-[#334e7f]"
                : "border-[#d9e2f3] bg-white text-[#4e5e7a] hover:bg-[#f8faff]"
            }`}
          >
            {isZh ? `全部 (${totalOpen})` : `All (${totalOpen})`}
          </Link>
          {BAMBOO_TASK_CATEGORY_OPTIONS.map((item) => (
            <Link
              key={item}
              href={bambooTaskFilterHref({ phase: phaseFilter, category: item, status: statusFilter })}
              className={`inline-flex rounded-lg border px-3 py-2 text-xs font-semibold tracking-[0.08em] uppercase ${
                categoryFilter === item
                  ? "border-[#c8d8f5] bg-[#eef4ff] text-[#334e7f]"
                  : "border-[#d9e2f3] bg-white text-[#4e5e7a] hover:bg-[#f8faff]"
              }`}
            >
              {taskCategoryLabels[item]} ({openCountByCategory.get(item) ?? 0})
            </Link>
          ))}
        </div>

        <h2 className="mt-6 text-lg font-semibold tracking-tight text-[#162947]">
          {isZh ? "按状态筛选" : "Filter by status"}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={bambooTaskFilterHref({ category: categoryFilter, phase: phaseFilter })}
            className={`inline-flex rounded-lg border px-3 py-2 text-xs font-semibold tracking-[0.08em] uppercase ${
              !statusFilter
                ? "border-[#c8d8f5] bg-[#eef4ff] text-[#334e7f]"
                : "border-[#d9e2f3] bg-white text-[#4e5e7a] hover:bg-[#f8faff]"
            }`}
          >
            {isZh ? "全部" : "All"}
          </Link>
          {BAMBOO_TASK_STATUS_OPTIONS.map((item) => (
            <Link
              key={item}
              href={bambooTaskFilterHref({ category: categoryFilter, phase: phaseFilter, status: item })}
              className={`inline-flex rounded-lg border px-3 py-2 text-xs font-semibold tracking-[0.08em] uppercase ${
                statusFilter === item
                  ? "border-[#c8d8f5] bg-[#eef4ff] text-[#334e7f]"
                  : "border-[#d9e2f3] bg-white text-[#4e5e7a] hover:bg-[#f8faff]"
              }`}
            >
              {taskStatusLabels[item]}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-(--line) bg-white">
        <div className="space-y-3 p-4 md:hidden">
          {tasks.length > 0 ? (
            tasks.map((task) => {
              const nextStatus = getNextBambooTaskStatus(task.status);
              const hasDescription = Boolean(task.description && task.description.trim().length > 0);

              return (
                <article
                  key={task.id}
                  className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4"
                >
                  <p className="text-sm font-semibold text-[#1a2b49]">{task.title}</p>
                  {task.subCategory ? <p className="mt-1 text-xs text-[#5b6c8d]">{task.subCategory}</p> : null}
                  {hasDescription ? (
                    <p className="mt-2 text-xs leading-5 text-(--text-muted)">{task.description}</p>
                  ) : null}
                  <p className="mt-3 text-xs text-(--text-muted)">
                    {taskCategoryLabels[task.category]} · {taskPhaseLabels[task.phase]}
                  </p>
                  <p className="mt-1 text-xs text-(--text-muted)">
                    {isZh ? "负责人" : "Owner"}: {task.owner}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`inline-flex w-fit rounded-full border px-2 py-1 text-xs font-semibold ${BAMBOO_TASK_PRIORITY_STYLES[task.priority]}`}
                    >
                      {taskPriorityLabels[task.priority]}
                    </span>
                    <span
                      className={`inline-flex w-fit rounded-full border px-2 py-1 text-xs font-semibold ${BAMBOO_TASK_STATUS_STYLES[task.status]}`}
                    >
                      {taskStatusLabels[task.status]}
                    </span>
                  </div>
                  {canEdit ? (
                    <form action={updateBambooTaskStatusAction} className="mt-3">
                      <input type="hidden" name="id" value={task.id} />
                      <input type="hidden" name="status" value={nextStatus} />
                      <input type="hidden" name="returnTo" value={currentFilterHref} />
                      <button
                        type="submit"
                        className="block cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-3 py-2 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                      >
                        {getBambooStatusTransitionLabel(task.status, locale)}
                      </button>
                    </form>
                  ) : null}
                </article>
              );
            })
          ) : (
            <p className="text-sm text-(--text-muted)">
              {isZh ? "当前筛选条件下没有任务。" : "No tasks found for current filters."}
            </p>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[1.5fr_0.8fr_1fr_0.7fr_0.6fr_0.8fr] bg-[#f8faff] px-4 py-3 text-xs font-semibold tracking-[0.12em] text-[#617294] uppercase">
              <span>{isZh ? "任务" : "Task"}</span>
              <span>{isZh ? "分类" : "Category"}</span>
              <span>{isZh ? "阶段" : "Phase"}</span>
              <span>{isZh ? "负责人" : "Owner"}</span>
              <span>{isZh ? "优先级" : "Priority"}</span>
              <span>{isZh ? "状态" : "Status"}</span>
            </div>

            {tasks.length > 0 ? (
              tasks.map((task) => {
                const nextStatus = getNextBambooTaskStatus(task.status);
                const hasDescription = Boolean(task.description && task.description.trim().length > 0);

                return (
                  <div
                    key={task.id}
                    className="grid grid-cols-[1.5fr_0.8fr_1fr_0.7fr_0.6fr_0.8fr] items-start gap-2 border-t border-[#edf2fb] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1a2b49]">{task.title}</p>
                      {task.subCategory ? (
                        <p className="mt-1 text-xs text-[#5b6c8d]">{task.subCategory}</p>
                      ) : null}
                      {hasDescription ? (
                        <p className="mt-1 text-xs leading-5 text-(--text-muted)">{task.description}</p>
                      ) : null}
                    </div>
                    <p className="text-sm text-(--text-muted)">
                      {taskCategoryLabels[task.category]}
                    </p>
                    <span
                      className={`inline-flex w-fit rounded-full border px-2 py-1 text-xs font-semibold ${BAMBOO_TASK_PHASE_STYLES[task.phase]}`}
                    >
                      {taskPhaseLabels[task.phase]}
                    </span>
                    <p className="text-sm text-(--text-muted)">{task.owner}</p>
                    <span
                      className={`inline-flex w-fit rounded-full border px-2 py-1 text-xs font-semibold ${BAMBOO_TASK_PRIORITY_STYLES[task.priority]}`}
                    >
                      {taskPriorityLabels[task.priority]}
                    </span>
                    <div className="space-y-2">
                      <span
                        className={`inline-flex w-fit rounded-full border px-2 py-1 text-xs font-semibold ${BAMBOO_TASK_STATUS_STYLES[task.status]}`}
                      >
                        {taskStatusLabels[task.status]}
                      </span>
                      {canEdit ? (
                        <form action={updateBambooTaskStatusAction}>
                          <input type="hidden" name="id" value={task.id} />
                          <input type="hidden" name="status" value={nextStatus} />
                          <input type="hidden" name="returnTo" value={currentFilterHref} />
                          <button
                            type="submit"
                            className="block cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-3 py-1 text-xs font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
                          >
                            {getBambooStatusTransitionLabel(task.status, locale)}
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-4 text-sm text-(--text-muted)">
                {isZh ? "当前筛选条件下没有任务。" : "No tasks found for current filters."}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
