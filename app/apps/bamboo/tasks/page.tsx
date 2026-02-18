import Link from "next/link";
import { BambooTaskStatus } from "@prisma/client";

import { createBambooTaskAction, updateBambooTaskStatusAction } from "./actions";
import { CreateBambooTaskModal } from "./CreateBambooTaskModal";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { canEditApp, requireAppRead } from "@/lib/authz";
import {
  BAMBOO_TASK_CATEGORY_LABELS,
  BAMBOO_TASK_CATEGORY_OPTIONS,
  BAMBOO_TASK_PHASE_LABELS,
  BAMBOO_TASK_PHASE_OPTIONS,
  BAMBOO_TASK_PHASE_STYLES,
  BAMBOO_TASK_PRIORITY_LABELS,
  BAMBOO_TASK_PRIORITY_OPTIONS,
  BAMBOO_TASK_PRIORITY_STYLES,
  BAMBOO_TASK_STATUS_LABELS,
  BAMBOO_TASK_STATUS_OPTIONS,
  BAMBOO_TASK_STATUS_STYLES,
  bambooTaskFilterHref,
  getNextBambooTaskStatus,
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

export default async function BambooTasksPage({ searchParams }: BambooTasksPageProps) {
  const user = await requireAppRead("BAMBOO");
  const canEdit = canEditApp(user, "BAMBOO");
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
    label: BAMBOO_TASK_CATEGORY_LABELS[item],
  }));
  const createTaskPhaseOptions = BAMBOO_TASK_PHASE_OPTIONS.map((item) => ({
    value: item,
    label: BAMBOO_TASK_PHASE_LABELS[item],
  }));
  const createTaskPriorityOptions = BAMBOO_TASK_PRIORITY_OPTIONS.map((item) => ({
    value: item,
    label: BAMBOO_TASK_PRIORITY_LABELS[item],
  }));

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      {saved === "created" ? <Toast message="Task created." /> : null}
      {saved === "status" ? <Toast message="Task status updated." /> : null}
      {error === "invalid" ? <Toast message="Invalid task input." tone="error" /> : null}

      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: "Tasks" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Task board
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Shared task board for all Bamboo sections. Filter by category, status,
          and phase.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/apps/bamboo/timeline"
            className="inline-flex rounded-xl border border-[#d9e2f3] px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
          >
            Open phase overview
          </Link>
          <Link
            href="/apps/bamboo/tasks/graph-overview"
            className="inline-flex rounded-xl border border-[#d9e2f3] bg-[#f4f8ff] px-4 py-2 text-sm font-semibold text-[#3d5588] hover:bg-[#ebf2ff]"
          >
            Graph overview
          </Link>
          {canEdit ? (
            <CreateBambooTaskModal
              action={createBambooTaskAction}
              categoryOptions={createTaskCategoryOptions}
              phaseOptions={createTaskPhaseOptions}
              priorityOptions={createTaskPriorityOptions}
              defaultCategory={createTaskDefaultCategory}
              defaultPhase={createTaskDefaultPhase}
            />
          ) : null}
          <span className="inline-flex rounded-xl border border-[#d9e2f3] bg-[#f8faff] px-4 py-2 text-sm font-semibold text-[#4e5e7a]">
            Open tasks: {totalOpen}
          </span>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-lg font-semibold tracking-tight text-[#162947]">Filter by phase</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={bambooTaskFilterHref({ category: categoryFilter, status: statusFilter })}
            className={`inline-flex rounded-lg border px-3 py-2 text-xs font-semibold tracking-[0.08em] uppercase ${
              !phaseFilter
                ? "border-[#c8d8f5] bg-[#eef4ff] text-[#334e7f]"
                : "border-[#d9e2f3] bg-white text-[#4e5e7a] hover:bg-[#f8faff]"
            }`}
          >
            All ({totalOpen})
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
              {BAMBOO_TASK_PHASE_LABELS[item]} ({openCountByPhase.get(item) ?? 0})
            </Link>
          ))}
        </div>

        <h2 className="mt-6 text-lg font-semibold tracking-tight text-[#162947]">Filter by category</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={bambooTaskFilterHref({ phase: phaseFilter, status: statusFilter })}
            className={`inline-flex rounded-lg border px-3 py-2 text-xs font-semibold tracking-[0.08em] uppercase ${
              !categoryFilter
                ? "border-[#c8d8f5] bg-[#eef4ff] text-[#334e7f]"
                : "border-[#d9e2f3] bg-white text-[#4e5e7a] hover:bg-[#f8faff]"
            }`}
          >
            All ({totalOpen})
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
              {BAMBOO_TASK_CATEGORY_LABELS[item]} ({openCountByCategory.get(item) ?? 0})
            </Link>
          ))}
        </div>

        <h2 className="mt-6 text-lg font-semibold tracking-tight text-[#162947]">Filter by status</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={bambooTaskFilterHref({ category: categoryFilter, phase: phaseFilter })}
            className={`inline-flex rounded-lg border px-3 py-2 text-xs font-semibold tracking-[0.08em] uppercase ${
              !statusFilter
                ? "border-[#c8d8f5] bg-[#eef4ff] text-[#334e7f]"
                : "border-[#d9e2f3] bg-white text-[#4e5e7a] hover:bg-[#f8faff]"
            }`}
          >
            All
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
              {BAMBOO_TASK_STATUS_LABELS[item]}
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
                    {BAMBOO_TASK_CATEGORY_LABELS[task.category]} · {BAMBOO_TASK_PHASE_LABELS[task.phase]}
                  </p>
                  <p className="mt-1 text-xs text-(--text-muted)">Owner: {task.owner}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`inline-flex w-fit rounded-full border px-2 py-1 text-xs font-semibold ${BAMBOO_TASK_PRIORITY_STYLES[task.priority]}`}
                    >
                      {BAMBOO_TASK_PRIORITY_LABELS[task.priority]}
                    </span>
                    <span
                      className={`inline-flex w-fit rounded-full border px-2 py-1 text-xs font-semibold ${BAMBOO_TASK_STATUS_STYLES[task.status]}`}
                    >
                      {BAMBOO_TASK_STATUS_LABELS[task.status]}
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
                        {getStatusTransitionLabel(task.status)}
                      </button>
                    </form>
                  ) : null}
                </article>
              );
            })
          ) : (
            <p className="text-sm text-(--text-muted)">No tasks found for current filters.</p>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[1.5fr_0.8fr_1fr_0.7fr_0.6fr_0.8fr] bg-[#f8faff] px-4 py-3 text-xs font-semibold tracking-[0.12em] text-[#617294] uppercase">
              <span>Task</span>
              <span>Category</span>
              <span>Phase</span>
              <span>Owner</span>
              <span>Priority</span>
              <span>Status</span>
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
                      {BAMBOO_TASK_CATEGORY_LABELS[task.category]}
                    </p>
                    <span
                      className={`inline-flex w-fit rounded-full border px-2 py-1 text-xs font-semibold ${BAMBOO_TASK_PHASE_STYLES[task.phase]}`}
                    >
                      {BAMBOO_TASK_PHASE_LABELS[task.phase]}
                    </span>
                    <p className="text-sm text-(--text-muted)">{task.owner}</p>
                    <span
                      className={`inline-flex w-fit rounded-full border px-2 py-1 text-xs font-semibold ${BAMBOO_TASK_PRIORITY_STYLES[task.priority]}`}
                    >
                      {BAMBOO_TASK_PRIORITY_LABELS[task.priority]}
                    </span>
                    <div className="space-y-2">
                      <span
                        className={`inline-flex w-fit rounded-full border px-2 py-1 text-xs font-semibold ${BAMBOO_TASK_STATUS_STYLES[task.status]}`}
                      >
                        {BAMBOO_TASK_STATUS_LABELS[task.status]}
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
                            {getStatusTransitionLabel(task.status)}
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-4 text-sm text-(--text-muted)">
                No tasks found for current filters.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
