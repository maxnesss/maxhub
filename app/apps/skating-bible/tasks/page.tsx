import Link from "next/link";
import { SkatingBibleTaskStatus } from "@prisma/client";

import { SectionTabs } from "../SectionTabs";
import { SetupRequiredNotice } from "../SetupRequiredNotice";
import {
  createSkatingBibleTaskAction,
  createSkatingBibleTaskGroupAction,
  deleteSkatingBibleTaskGroupAction,
  updateSkatingBibleTaskStatusAction,
} from "../actions";

import { CreateSkatingBibleTaskModal } from "./CreateSkatingBibleTaskModal";

import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast } from "@/components/ui/Toast";
import { canEditApp, requireAppRead } from "@/lib/authz";
import { isMissingTableError } from "@/lib/prisma-errors";
import {
  getNextSkatingBibleTaskStatus,
  parseSkatingBibleTaskGroup,
  parseSkatingBibleTaskStatus,
  skatingBibleTaskFilterHref,
  SKATING_BIBLE_TASK_STATUS_LABELS,
  SKATING_BIBLE_TASK_STATUS_OPTIONS,
  SKATING_BIBLE_TASK_STATUS_STYLES,
} from "@/lib/skating-bible";
import { prisma } from "@/prisma";

type SkatingBibleTasksPageProps = {
  searchParams: Promise<{
    group?: string;
    status?: string;
    saved?: string;
    error?: string;
  }>;
};

function getToastMessage(saved: string | undefined) {
  if (saved === "created") {
    return "Task created.";
  }

  if (saved === "status") {
    return "Task status updated.";
  }

  if (saved === "group-created") {
    return "Task group added.";
  }

  if (saved === "group-deleted") {
    return "Task group deleted with its tasks.";
  }

  return null;
}

function getErrorMessage(error: string | undefined) {
  if (error === "invalid") {
    return "Invalid task input.";
  }

  if (error === "group-exists") {
    return "That group name already exists.";
  }

  if (error === "last-group") {
    return "Keep at least one task group.";
  }

  return null;
}

function getStatusTransitionLabel(status: SkatingBibleTaskStatus) {
  switch (status) {
    case SkatingBibleTaskStatus.TODO:
      return "Start";
    case SkatingBibleTaskStatus.IN_PROGRESS:
      return "Mark done";
    case SkatingBibleTaskStatus.BLOCKED:
      return "Unblock";
    case SkatingBibleTaskStatus.DONE:
      return "Reopen";
    default:
      return "Update";
  }
}

export default async function SkatingBibleTasksPage({
  searchParams,
}: SkatingBibleTasksPageProps) {
  const user = await requireAppRead("SKATING_BIBLE");
  const canEdit = canEditApp(user, "SKATING_BIBLE");
  const { group, status, saved, error } = await searchParams;
  const toastMessage = getToastMessage(saved);
  const errorMessage = getErrorMessage(error);

  const requestedGroupFilter = parseSkatingBibleTaskGroup(group);
  const statusFilter = parseSkatingBibleTaskStatus(status);

  let setupRequired = false;
  let groupFilter: string | null = null;
  let taskGroups: Array<{
    id: string;
    name: string;
  }> = [];
  let tasks: Array<{
    id: string;
    title: string;
    details: string | null;
    taskGroupId: string;
    status: SkatingBibleTaskStatus;
  }> = [];
  let openByGroup: Array<{
    taskGroupId: string;
    _count: { _all: number };
  }> = [];

  try {
    taskGroups = await prisma.skatingBibleTaskGroup.findMany({
      orderBy: [{ createdAt: "asc" }],
      select: {
        id: true,
        name: true,
      },
    });

    const groupNameSet = new Set(taskGroups.map((item) => item.name));
    groupFilter = requestedGroupFilter && groupNameSet.has(requestedGroupFilter) ? requestedGroupFilter : null;

    const where = {
      ...(groupFilter ? { taskGroup: { name: groupFilter } } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    };

    [tasks, openByGroup] = await Promise.all([
      prisma.skatingBibleTask.findMany({
        where,
        select: {
          id: true,
          title: true,
          details: true,
          taskGroupId: true,
          status: true,
        },
        orderBy: [{ createdAt: "asc" }],
      }),
      prisma.skatingBibleTask.groupBy({
        by: ["taskGroupId"],
        where: { status: { not: SkatingBibleTaskStatus.DONE } },
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

  const currentFilterHref = skatingBibleTaskFilterHref({
    group: groupFilter,
    status: statusFilter,
  });

  const openByGroupMap = new Map(openByGroup.map((row) => [row.taskGroupId, row._count._all]));
  const totalOpen = [...openByGroupMap.values()].reduce((sum, count) => sum + count, 0);

  const groupedTasks = new Map(
    taskGroups.map((taskGroup) => [
      taskGroup.id,
      tasks.filter((task) => task.taskGroupId === taskGroup.id),
    ]),
  );

  const defaultCreateGroupId =
    (groupFilter ? taskGroups.find((item) => item.name === groupFilter)?.id : null) ??
    taskGroups[0]?.id ??
    null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      {toastMessage ? <Toast message={toastMessage} /> : null}
      {errorMessage ? <Toast message={errorMessage} tone="error" /> : null}

      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Skating bible", href: "/apps/skating-bible" },
            { label: "Tasks" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Grouped tasks
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Keep execution visible by group and move tasks through status transitions.
        </p>

        <SectionTabs current="tasks" />
      </section>

      {setupRequired ? <SetupRequiredNotice /> : null}

      {!setupRequired && canEdit ? (
        <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#162947]">Task groups</h2>
              <p className="mt-1 text-sm text-(--text-muted)">
                Add or remove groups. Removing a group also removes its tasks.
              </p>
            </div>
            <form action={createSkatingBibleTaskGroupAction} className="flex flex-wrap items-end gap-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold tracking-[0.12em] text-[#5f6f8f] uppercase">
                  New group
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  maxLength={80}
                  className="rounded-lg border border-[#d8e2f4] bg-white px-3 py-2 text-sm"
                  placeholder="Group name"
                />
              </label>
              <button
                type="submit"
                className="cursor-pointer rounded-lg border border-[#d9e2f3] bg-white px-4 py-2 text-sm font-semibold text-[#4e5e7a] hover:bg-[#f8faff]"
              >
                Add group
              </button>
            </form>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {taskGroups.length > 0 ? (
              taskGroups.map((item) => (
                <div
                  key={item.id}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#dfe7f7] bg-[#fbfdff] px-3 py-2"
                >
                  <span className="text-sm font-medium text-[#1a2b49]">{item.name}</span>
                  <span className="text-xs text-[#647494]">{openByGroupMap.get(item.id) ?? 0} open</span>
                  <form action={deleteSkatingBibleTaskGroupAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      disabled={taskGroups.length <= 1}
                      className="cursor-pointer rounded-md border border-[#f2d2cb] bg-white px-2 py-1 text-xs font-semibold text-[#9c3d2f] hover:bg-[#fff3f0] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              ))
            ) : (
              <p className="text-sm text-(--text-muted)">No groups yet.</p>
            )}
          </div>
        </section>
      ) : null}

      {!setupRequired && canEdit ? (
        <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-[#162947]">Add task</h2>
            <CreateSkatingBibleTaskModal
              action={createSkatingBibleTaskAction}
              groupOptions={taskGroups}
              defaultGroupId={defaultCreateGroupId}
            />
          </div>
          {taskGroups.length === 0 ? (
            <p className="mt-2 text-sm text-(--text-muted)">Create a group first to add tasks.</p>
          ) : null}
        </section>
      ) : null}

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-[#162947]">Filters</h2>
          <span className="inline-flex rounded-lg border border-[#d9e2f3] bg-[#f8faff] px-3 py-2 text-xs font-semibold tracking-[0.08em] text-[#4e5e7a] uppercase">
            Open tasks: {totalOpen}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={skatingBibleTaskFilterHref({ status: statusFilter })}
            className={`inline-flex rounded-lg border px-3 py-2 text-xs font-semibold tracking-[0.08em] uppercase ${
              !groupFilter
                ? "border-[#c8d8f5] bg-[#eef4ff] text-[#334e7f]"
                : "border-[#d9e2f3] bg-white text-[#4e5e7a] hover:bg-[#f8faff]"
            }`}
          >
            All groups ({totalOpen})
          </Link>
          {taskGroups.map((item) => (
            <Link
              key={item.id}
              href={skatingBibleTaskFilterHref({ group: item.name, status: statusFilter })}
              className={`inline-flex rounded-lg border px-3 py-2 text-xs font-semibold tracking-[0.08em] uppercase ${
                groupFilter === item.name
                  ? "border-[#c8d8f5] bg-[#eef4ff] text-[#334e7f]"
                  : "border-[#d9e2f3] bg-white text-[#4e5e7a] hover:bg-[#f8faff]"
              }`}
            >
              {item.name} ({openByGroupMap.get(item.id) ?? 0})
            </Link>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={skatingBibleTaskFilterHref({ group: groupFilter })}
            className={`inline-flex rounded-lg border px-3 py-2 text-xs font-semibold tracking-[0.08em] uppercase ${
              !statusFilter
                ? "border-[#c8d8f5] bg-[#eef4ff] text-[#334e7f]"
                : "border-[#d9e2f3] bg-white text-[#4e5e7a] hover:bg-[#f8faff]"
            }`}
          >
            All statuses
          </Link>
          {SKATING_BIBLE_TASK_STATUS_OPTIONS.map((item) => (
            <Link
              key={item}
              href={skatingBibleTaskFilterHref({ group: groupFilter, status: item })}
              className={`inline-flex rounded-lg border px-3 py-2 text-xs font-semibold tracking-[0.08em] uppercase ${
                statusFilter === item
                  ? "border-[#c8d8f5] bg-[#eef4ff] text-[#334e7f]"
                  : "border-[#d9e2f3] bg-white text-[#4e5e7a] hover:bg-[#f8faff]"
              }`}
            >
              {SKATING_BIBLE_TASK_STATUS_LABELS[item]}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 space-y-4">
        {taskGroups.map((taskGroup) => {
          if (groupFilter && groupFilter !== taskGroup.name) {
            return null;
          }

          const groupTasks = groupedTasks.get(taskGroup.id) ?? [];

          return (
            <article key={taskGroup.id} className="rounded-2xl border border-(--line) bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold tracking-tight text-[#162947]">{taskGroup.name}</h2>
                <span className="text-xs font-semibold tracking-[0.12em] text-[#617294] uppercase">
                  {groupTasks.length} tasks
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {groupTasks.length > 0 ? (
                  groupTasks.map((task) => {
                    const nextStatus = getNextSkatingBibleTaskStatus(task.status);
                    const hasDetails = Boolean(task.details && task.details.trim().length > 0);

                    return (
                      <div
                        key={task.id}
                        className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] px-4 py-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[#1a2b49]">{task.title}</p>
                            {hasDetails ? (
                              <p className="mt-1 text-xs leading-5 text-(--text-muted)">{task.details}</p>
                            ) : null}
                          </div>
                          <div className="space-y-2">
                            <span
                              className={`inline-flex w-fit rounded-full border px-2 py-1 text-xs font-semibold ${SKATING_BIBLE_TASK_STATUS_STYLES[task.status]}`}
                            >
                              {SKATING_BIBLE_TASK_STATUS_LABELS[task.status]}
                            </span>
                            {canEdit ? (
                              <form action={updateSkatingBibleTaskStatusAction}>
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
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-(--text-muted)">No tasks in this group.</p>
                )}
              </div>
            </article>
          );
        })}

        {!setupRequired && taskGroups.length === 0 ? (
          <article className="rounded-2xl border border-(--line) bg-white p-5">
            <p className="text-sm text-(--text-muted)">No task groups yet. Create one to start planning.</p>
          </article>
        ) : null}
      </section>
    </main>
  );
}
