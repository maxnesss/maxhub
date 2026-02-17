export const APP_CODES = ["PROJECTS", "TASKS", "CALENDAR", "BAMBOO", "WORKOUT"] as const;

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
    description: "View timelines, key dates, and upcoming milestones.",
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
};

export function isAppCode(value: string): value is AppCode {
  return APP_CODES.includes(value as AppCode);
}

export function parseAppCodes(values: string[]) {
  return values.filter(isAppCode);
}
