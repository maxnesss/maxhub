export const APP_CODES = [
  "PROJECTS",
  "TASKS",
  "CALENDAR",
  "BAMBOO",
  "WORKOUT",
  "SMOOTHIE",
  "INVOICE",
  "SKATING_BIBLE",
] as const;

export type AppCode = (typeof APP_CODES)[number];

export type AppDefinition = {
  label: string;
  description: string;
  href?: string;
};

export const APP_DEFINITIONS: Record<AppCode, AppDefinition> = {
  PROJECTS: {
    label: "Projects",
    description: "Track tasks, releases, and deadlines in one feed.",
    href: "/apps/projects",
  },
  TASKS: {
    label: "Tasks",
    description: "Manage personal and shared to-do flows across apps.",
  },
  CALENDAR: {
    label: "Calendar",
    description: "Plan events with a monthly board, color tags, and reminders.",
    href: "/apps/calendar",
  },
  BAMBOO: {
    label: "Bamboo",
    description: "Interactive business plan with live sections and milestones.",
    href: "/apps/bamboo",
  },
  WORKOUT: {
    label: "Workout",
    description: "Quick training tools with tile-based modules and timers.",
    href: "/apps/workout",
  },
  SMOOTHIE: {
    label: "Smoothie",
    description: "Simple smoothie recipes you can browse and make quickly.",
    href: "/apps/smoothie",
  },
  INVOICE: {
    label: "Invoice",
    description: "Create professional invoice PDFs from reusable templates.",
    href: "/apps/invoice",
  },
  SKATING_BIBLE: {
    label: "Skating bible",
    description: "Project workspace for overview, brainstorms, grouped tasks, and charts.",
    href: "/apps/skating-bible",
  },
};

export function isAppCode(value: string): value is AppCode {
  return APP_CODES.includes(value as AppCode);
}

export function parseAppCodes(values: string[]) {
  return values.filter(isAppCode);
}
