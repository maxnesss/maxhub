export type BambooJourneyStageId = "SETUP" | "INVENTORY" | "BRAND" | "SHOP" | "LAUNCH";

export type BambooJourneyStage = {
  id: BambooJourneyStageId;
  label: string;
  description: string;
  href: string;
};

export type BambooJourneyPage = {
  href: string;
  label: string;
  stageId: BambooJourneyStageId;
};

type BambooTaskProgressRow = {
  category: string;
  status: string;
  _count: {
    _all: number;
  };
};

export type BambooSectionProgress = {
  id: BambooJourneyStageId;
  label: string;
  href: string;
  done: number;
  total: number;
  percent: number;
};

const JOURNEY_STAGE_TASK_CATEGORIES: Record<BambooJourneyStageId, string[]> = {
  SETUP: ["SETUP_COMPANY", "FINANCE"],
  INVENTORY: ["INVENTORY"],
  BRAND: ["BRAND"],
  SHOP: ["SHOP"],
  LAUNCH: ["GENERAL"],
};

export const BAMBOO_JOURNEY_STAGES: BambooJourneyStage[] = [
  {
    id: "SETUP",
    label: "Setup",
    description: "Legal form, company registration, and finance basics.",
    href: "/apps/bamboo/company-setup",
  },
  {
    id: "INVENTORY",
    label: "Inventory",
    description: "Select products, suppliers, and import path.",
    href: "/apps/bamboo/inventory",
  },
  {
    id: "BRAND",
    label: "Name brainstorm",
    description: "Choose brand direction, shortlist names, and validate fit.",
    href: "/apps/bamboo/name-brand",
  },
  {
    id: "SHOP",
    label: "Shop",
    description: "Define concept, location, channels, and operating model.",
    href: "/apps/bamboo/shop",
  },
  {
    id: "LAUNCH",
    label: "Launch",
    description: "Finalize plan, tasks, timeline, and execution.",
    href: "/apps/bamboo/tasks",
  },
];

export const BAMBOO_JOURNEY_PAGES: BambooJourneyPage[] = [
  { href: "/apps/bamboo", label: "Workspace", stageId: "SETUP" },
  { href: "/apps/bamboo/start-here", label: "Start here", stageId: "SETUP" },
  { href: "/apps/bamboo/overview", label: "Overview", stageId: "SETUP" },
  { href: "/apps/bamboo/company-setup", label: "Company setup", stageId: "SETUP" },
  {
    href: "/apps/bamboo/target-legal-form",
    label: "Target legal form and structure",
    stageId: "SETUP",
  },
  {
    href: "/apps/bamboo/company-setup/finance-requirements",
    label: "Finance requirements",
    stageId: "SETUP",
  },
  { href: "/apps/bamboo/legal-compliance", label: "Legal and compliance", stageId: "SETUP" },
  { href: "/apps/bamboo/estimated-setup-cost", label: "Estimated setup cost", stageId: "SETUP" },
  { href: "/apps/bamboo/recommended-capital", label: "Recommended capital", stageId: "SETUP" },
  { href: "/apps/bamboo/inventory", label: "Inventory", stageId: "INVENTORY" },
  { href: "/apps/bamboo/inventory/brainstorm", label: "Inventory brainstorm", stageId: "INVENTORY" },
  {
    href: "/apps/bamboo/inventory/producers-contact",
    label: "Producers contact",
    stageId: "INVENTORY",
  },
  {
    href: "/apps/bamboo/inventory/import-to-czech",
    label: "Import of products",
    stageId: "INVENTORY",
  },
  { href: "/apps/bamboo/inventory/budget", label: "Inventory budget", stageId: "INVENTORY" },
  { href: "/apps/bamboo/name-brand", label: "Name brainstorm", stageId: "BRAND" },
  { href: "/apps/bamboo/shop", label: "Shop overview", stageId: "SHOP" },
  { href: "/apps/bamboo/shop/concept", label: "Shop concept", stageId: "SHOP" },
  { href: "/apps/bamboo/shop/location", label: "Shop location", stageId: "SHOP" },
  { href: "/apps/bamboo/shop/budget", label: "Shop budget", stageId: "SHOP" },
  { href: "/apps/bamboo/eshop", label: "Eshop + webpage", stageId: "SHOP" },
  { href: "/apps/bamboo/project-charter", label: "Project charter", stageId: "LAUNCH" },
  { href: "/apps/bamboo/tasks", label: "Tasks", stageId: "LAUNCH" },
  { href: "/apps/bamboo/tasks/graph-overview", label: "Task graph overview", stageId: "LAUNCH" },
  { href: "/apps/bamboo/timeline", label: "Phase overview", stageId: "LAUNCH" },
  { href: "/apps/bamboo/finance", label: "Finance setup", stageId: "LAUNCH" },
  { href: "/apps/bamboo/documents", label: "Documents", stageId: "LAUNCH" },
];

function normalizePathname(pathname: string) {
  if (!pathname) {
    return "/apps/bamboo";
  }

  const withoutQuery = pathname.split("?")[0] ?? pathname;
  const withoutHash = withoutQuery.split("#")[0] ?? withoutQuery;

  if (withoutHash.length > 1 && withoutHash.endsWith("/")) {
    return withoutHash.slice(0, -1);
  }

  return withoutHash;
}

function resolveJourneyPage(pathname: string) {
  const normalizedPath = normalizePathname(pathname);
  const exact = BAMBOO_JOURNEY_PAGES.find((page) => page.href === normalizedPath);

  if (exact) {
    return exact;
  }

  let match: BambooJourneyPage | undefined;

  for (const page of BAMBOO_JOURNEY_PAGES) {
    if (!normalizedPath.startsWith(`${page.href}/`)) {
      continue;
    }

    if (!match || page.href.length > match.href.length) {
      match = page;
    }
  }

  return match ?? BAMBOO_JOURNEY_PAGES[0];
}

export function getBambooJourneyContext(pathname: string) {
  const normalizedPath = normalizePathname(pathname);

  if (!normalizedPath.startsWith("/apps/bamboo")) {
    return null;
  }

  const current = resolveJourneyPage(normalizedPath);
  const currentIndex = BAMBOO_JOURNEY_PAGES.findIndex((page) => page.href === current.href);
  const previous = currentIndex > 0 ? BAMBOO_JOURNEY_PAGES[currentIndex - 1] : null;
  const next =
    currentIndex < BAMBOO_JOURNEY_PAGES.length - 1
      ? BAMBOO_JOURNEY_PAGES[currentIndex + 1]
      : null;
  const currentStage = BAMBOO_JOURNEY_STAGES.find((stage) => stage.id === current.stageId)
    ?? BAMBOO_JOURNEY_STAGES[0];

  return {
    current,
    previous,
    next,
    currentIndex: currentIndex + 1,
    totalPages: BAMBOO_JOURNEY_PAGES.length,
    currentStage,
  };
}

export function getBambooSectionProgress(rows: BambooTaskProgressRow[]): BambooSectionProgress[] {
  const categoryToStage = new Map<string, BambooJourneyStageId>();

  for (const stage of BAMBOO_JOURNEY_STAGES) {
    for (const category of JOURNEY_STAGE_TASK_CATEGORIES[stage.id]) {
      categoryToStage.set(category, stage.id);
    }
  }

  const counters = new Map<BambooJourneyStageId, { done: number; total: number }>();
  for (const stage of BAMBOO_JOURNEY_STAGES) {
    counters.set(stage.id, { done: 0, total: 0 });
  }

  for (const row of rows) {
    const stageId = categoryToStage.get(row.category);

    if (!stageId) {
      continue;
    }

    const counter = counters.get(stageId);
    if (!counter) {
      continue;
    }

    counter.total += row._count._all;
    if (row.status === "DONE") {
      counter.done += row._count._all;
    }
  }

  return BAMBOO_JOURNEY_STAGES.map((stage) => {
    const counter = counters.get(stage.id) ?? { done: 0, total: 0 };
    const percent = counter.total > 0 ? Math.round((counter.done / counter.total) * 100) : 0;

    return {
      id: stage.id,
      label: stage.label,
      href: stage.href,
      done: counter.done,
      total: counter.total,
      percent,
    };
  });
}
