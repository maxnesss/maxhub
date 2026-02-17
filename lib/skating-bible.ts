import { SkatingBibleTaskStatus } from "@prisma/client";

export const SKATING_BIBLE_SECTIONS = [
  {
    label: "Project overview",
    href: "/apps/skating-bible/overview",
    description: "Capture project context, goal, and features.",
  },
  {
    label: "Brainstorm",
    href: "/apps/skating-bible/brainstorm",
    description: "Store project ideas and explore new directions.",
  },
  {
    label: "Tasks",
    href: "/apps/skating-bible/tasks",
    description: "Track grouped tasks and move them through statuses.",
  },
  {
    label: "Charts",
    href: "/apps/skating-bible/charts",
    description: "Visual task status and completion signals.",
  },
  {
    label: "Hackaton",
    href: "/apps/skating-bible/hackaton",
    description: "Countdown to the event, then a 24-hour execution schedule.",
  },
] as const;

export const SKATING_BIBLE_TASK_STATUS_OPTIONS = [
  SkatingBibleTaskStatus.TODO,
  SkatingBibleTaskStatus.IN_PROGRESS,
  SkatingBibleTaskStatus.BLOCKED,
  SkatingBibleTaskStatus.DONE,
] as const;

export const SKATING_BIBLE_TASK_STATUS_LABELS: Record<SkatingBibleTaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  BLOCKED: "Blocked",
  DONE: "Done",
};

export const SKATING_BIBLE_TASK_STATUS_STYLES: Record<SkatingBibleTaskStatus, string> = {
  TODO: "border-[#efdca8] bg-[#fff9e8] text-[#7d621c]",
  IN_PROGRESS: "border-[#bfd6fb] bg-[#eef5ff] text-[#244e8f]",
  BLOCKED: "border-[#f6c8bf] bg-[#fff1ee] text-[#8d3a2b]",
  DONE: "border-[#bfe6cf] bg-[#eefbf3] text-[#1d6e40]",
};

export function parseSkatingBibleTaskGroup(value: string | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function parseSkatingBibleTaskStatus(value: string | undefined) {
  if (!value) {
    return null;
  }

  return SKATING_BIBLE_TASK_STATUS_OPTIONS.includes(value as SkatingBibleTaskStatus)
    ? (value as SkatingBibleTaskStatus)
    : null;
}

export function getNextSkatingBibleTaskStatus(status: SkatingBibleTaskStatus) {
  switch (status) {
    case SkatingBibleTaskStatus.TODO:
      return SkatingBibleTaskStatus.IN_PROGRESS;
    case SkatingBibleTaskStatus.IN_PROGRESS:
      return SkatingBibleTaskStatus.DONE;
    case SkatingBibleTaskStatus.BLOCKED:
      return SkatingBibleTaskStatus.IN_PROGRESS;
    case SkatingBibleTaskStatus.DONE:
      return SkatingBibleTaskStatus.TODO;
    default:
      return SkatingBibleTaskStatus.TODO;
  }
}

type SkatingBibleTaskFilterOptions = {
  group?: string | null;
  status?: SkatingBibleTaskStatus | null;
};

export function skatingBibleTaskFilterHref(options: SkatingBibleTaskFilterOptions) {
  const searchParams = new URLSearchParams();

  if (options.group) {
    searchParams.set("group", options.group);
  }

  if (options.status) {
    searchParams.set("status", options.status);
  }

  const query = searchParams.toString();
  return query ? `/apps/skating-bible/tasks?${query}` : "/apps/skating-bible/tasks";
}
