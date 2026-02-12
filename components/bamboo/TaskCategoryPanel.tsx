import Link from "next/link";
import { BambooTaskPriority, BambooTaskStatus } from "@prisma/client";

import {
  BAMBOO_TASK_PRIORITY_LABELS,
  BAMBOO_TASK_PRIORITY_STYLES,
  BAMBOO_TASK_STATUS_LABELS,
  BAMBOO_TASK_STATUS_STYLES,
} from "@/lib/bamboo-tasks";

type TaskCategoryPanelItem = {
  id: string;
  title: string;
  timelineWeek: number;
  status: BambooTaskStatus;
  priority: BambooTaskPriority;
  owner: string;
};

type TaskCategoryPanelProps = {
  title: string;
  tasks: TaskCategoryPanelItem[];
  href: string;
  emptyLabel: string;
};

export function TaskCategoryPanel({
  title,
  tasks,
  href,
  emptyLabel,
}: TaskCategoryPanelProps) {
  return (
    <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">{title}</h2>
        <Link
          href={href}
          className="inline-flex rounded-lg border border-[#d9e2f3] px-3 py-2 text-xs font-semibold tracking-[0.1em] text-[#4e5e7a] uppercase hover:bg-[#f8faff]"
        >
          Open board
        </Link>
      </div>

      {tasks.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-3"
            >
              <p className="text-sm font-semibold text-[#1a2b49]">{task.title}</p>
              <p className="mt-1 text-xs text-[#5b6c8d]">
                Week {task.timelineWeek} • Owner: {task.owner}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
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
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-(--text-muted)">{emptyLabel}</p>
      )}
    </section>
  );
}
