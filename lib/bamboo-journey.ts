import { BAMBOO_DEFAULT_LOCALE, type BambooLocale } from "@/lib/bamboo-i18n";

export type BambooJourneyStageId = "SETUP" | "INVENTORY" | "BRAND" | "SHOP" | "LAUNCH";
export const BAMBOO_JOURNEY_DOCK_STORAGE_KEY = "bamboo:journey-dock-enabled";
export const BAMBOO_JOURNEY_DOCK_EVENT = "bamboo:journey-dock-changed";

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

type BambooJourneyPageDefinition = {
  href: string;
  stageId: BambooJourneyStageId;
  labels: Record<BambooLocale, string>;
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
  SETUP: ["SETUP_COMPANY"],
  INVENTORY: ["INVENTORY"],
  BRAND: ["BRAND"],
  SHOP: ["SHOP"],
  LAUNCH: ["GENERAL", "FINANCE"],
};

const JOURNEY_STAGE_DEFINITIONS = [
  {
    id: "BRAND" as const,
    href: "/apps/bamboo/name-brand",
    labels: {
      en: {
        label: "Name brainstorm",
        description: "Choose brand direction, shortlist names, and validate fit.",
      },
      zh: {
        label: "命名头脑风暴",
        description: "确认品牌方向，筛选名称，并进行适配验证。",
      },
    },
  },
  {
    id: "SETUP" as const,
    href: "/apps/bamboo/company-setup",
    labels: {
      en: {
        label: "Setup",
        description: "Legal form, company registration, and finance basics.",
      },
      zh: {
        label: "公司设立",
        description: "完成法律形式、公司注册和基础财务设置。",
      },
    },
  },
  {
    id: "INVENTORY" as const,
    href: "/apps/bamboo/inventory",
    labels: {
      en: {
        label: "Inventory",
        description: "Select products, suppliers, and import path.",
      },
      zh: {
        label: "货品",
        description: "确定产品、供应商和进口路径。",
      },
    },
  },
  {
    id: "SHOP" as const,
    href: "/apps/bamboo/shop",
    labels: {
      en: {
        label: "Shop",
        description: "Define concept, location, channels, and operating model.",
      },
      zh: {
        label: "门店",
        description: "确定门店定位、选址、渠道和运营模型。",
      },
    },
  },
  {
    id: "LAUNCH" as const,
    href: "/apps/bamboo/tasks",
    labels: {
      en: {
        label: "Launch",
        description: "Finalize plan, tasks, timeline, and execution.",
      },
      zh: {
        label: "启动",
        description: "完成计划、任务、时间线并推进执行。",
      },
    },
  },
];

const JOURNEY_PAGE_DEFINITIONS: BambooJourneyPageDefinition[] = [
  { href: "/apps/bamboo", stageId: "SETUP", labels: { en: "Workspace", zh: "工作台" } },
  { href: "/apps/bamboo/start-here", stageId: "SETUP", labels: { en: "Start here", zh: "开始页面" } },
  { href: "/apps/bamboo/name-brand", stageId: "BRAND", labels: { en: "Name brainstorm", zh: "命名头脑风暴" } },
  { href: "/apps/bamboo/project-charter", stageId: "SETUP", labels: { en: "Project charter", zh: "项目章程" } },
  { href: "/apps/bamboo/overview", stageId: "SETUP", labels: { en: "Overview", zh: "概览" } },
  { href: "/apps/bamboo/company-setup", stageId: "SETUP", labels: { en: "Company setup", zh: "公司设立" } },
  {
    href: "/apps/bamboo/target-legal-form",
    stageId: "SETUP",
    labels: { en: "Target legal form and structure", zh: "目标法律形式与结构" },
  },
  {
    href: "/apps/bamboo/company-setup/finance-requirements",
    stageId: "SETUP",
    labels: { en: "Company setup finance requirements", zh: "公司设立财务要求" },
  },
  {
    href: "/apps/bamboo/legal-compliance",
    stageId: "SETUP",
    labels: { en: "Legal and compliance", zh: "法律与合规" },
  },
  { href: "/apps/bamboo/inventory", stageId: "INVENTORY", labels: { en: "Inventory", zh: "货品" } },
  {
    href: "/apps/bamboo/inventory/brainstorm",
    stageId: "INVENTORY",
    labels: { en: "Inventory brainstorm", zh: "货品头脑风暴" },
  },
  {
    href: "/apps/bamboo/inventory/producers-contact",
    stageId: "INVENTORY",
    labels: { en: "Producers contact", zh: "供应商联系" },
  },
  {
    href: "/apps/bamboo/inventory/import-to-czech",
    stageId: "INVENTORY",
    labels: { en: "Import of products", zh: "产品进口" },
  },
  {
    href: "/apps/bamboo/inventory/budget",
    stageId: "INVENTORY",
    labels: { en: "Inventory budget", zh: "货品预算" },
  },
  { href: "/apps/bamboo/shop", stageId: "SHOP", labels: { en: "Shop overview", zh: "门店概览" } },
  { href: "/apps/bamboo/shop/concept", stageId: "SHOP", labels: { en: "Shop concept", zh: "门店概念" } },
  { href: "/apps/bamboo/shop/location", stageId: "SHOP", labels: { en: "Shop location", zh: "门店选址" } },
  { href: "/apps/bamboo/shop/budget", stageId: "SHOP", labels: { en: "Shop budget", zh: "门店预算" } },
  {
    href: "/apps/bamboo/estimated-setup-cost",
    stageId: "SHOP",
    labels: { en: "Estimated setup cost", zh: "预计设立成本" },
  },
  { href: "/apps/bamboo/eshop", stageId: "SHOP", labels: { en: "Eshop + webpage", zh: "网店 + 网站" } },
  { href: "/apps/bamboo/tasks", stageId: "LAUNCH", labels: { en: "Tasks", zh: "任务" } },
  {
    href: "/apps/bamboo/tasks/graph-overview",
    stageId: "LAUNCH",
    labels: { en: "Task graph overview", zh: "任务图概览" },
  },
  { href: "/apps/bamboo/timeline", stageId: "LAUNCH", labels: { en: "Phase overview", zh: "阶段概览" } },
  { href: "/apps/bamboo/finance", stageId: "LAUNCH", labels: { en: "Finance setup", zh: "财务设置" } },
  { href: "/apps/bamboo/documents", stageId: "LAUNCH", labels: { en: "Documents", zh: "文档" } },
  {
    href: "/apps/bamboo/recommended-capital",
    stageId: "LAUNCH",
    labels: { en: "Recommended capital", zh: "建议启动资金" },
  },
];

export function getBambooJourneyStages(
  locale: BambooLocale = BAMBOO_DEFAULT_LOCALE,
): BambooJourneyStage[] {
  return JOURNEY_STAGE_DEFINITIONS.map((stage) => ({
    id: stage.id,
    href: stage.href,
    label: stage.labels[locale].label,
    description: stage.labels[locale].description,
  }));
}

export function getBambooJourneyPages(
  locale: BambooLocale = BAMBOO_DEFAULT_LOCALE,
): BambooJourneyPage[] {
  return JOURNEY_PAGE_DEFINITIONS.map((page) => ({
    href: page.href,
    stageId: page.stageId,
    label: page.labels[locale],
  }));
}

export const BAMBOO_JOURNEY_STAGES = getBambooJourneyStages();
export const BAMBOO_JOURNEY_PAGES = getBambooJourneyPages();

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

function resolveJourneyPage(pathname: string, pages: BambooJourneyPage[]) {
  const normalizedPath = normalizePathname(pathname);
  const exact = pages.find((page) => page.href === normalizedPath);

  if (exact) {
    return exact;
  }

  let match: BambooJourneyPage | undefined;

  for (const page of pages) {
    if (!normalizedPath.startsWith(`${page.href}/`)) {
      continue;
    }

    if (!match || page.href.length > match.href.length) {
      match = page;
    }
  }

  return match ?? pages[0];
}

export function getBambooJourneyContext(
  pathname: string,
  locale: BambooLocale = BAMBOO_DEFAULT_LOCALE,
) {
  const normalizedPath = normalizePathname(pathname);
  const journeyPages = getBambooJourneyPages(locale);
  const journeyStages = getBambooJourneyStages(locale);

  if (!normalizedPath.startsWith("/apps/bamboo")) {
    return null;
  }

  const current = resolveJourneyPage(normalizedPath, journeyPages);
  const currentIndex = journeyPages.findIndex((page) => page.href === current.href);
  const previous = currentIndex > 0 ? journeyPages[currentIndex - 1] : null;
  const next =
    currentIndex < journeyPages.length - 1
      ? journeyPages[currentIndex + 1]
      : null;
  const currentStage = journeyStages.find((stage) => stage.id === current.stageId)
    ?? journeyStages[0];

  return {
    current,
    previous,
    next,
    currentIndex: currentIndex + 1,
    totalPages: journeyPages.length,
    currentStage,
  };
}

export function getBambooSectionProgress(
  rows: BambooTaskProgressRow[],
  locale: BambooLocale = BAMBOO_DEFAULT_LOCALE,
): BambooSectionProgress[] {
  const journeyStages = getBambooJourneyStages(locale);
  const categoryToStage = new Map<string, BambooJourneyStageId>();

  for (const stage of journeyStages) {
    for (const category of JOURNEY_STAGE_TASK_CATEGORIES[stage.id]) {
      categoryToStage.set(category, stage.id);
    }
  }

  const counters = new Map<BambooJourneyStageId, { done: number; total: number }>();
  for (const stage of journeyStages) {
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

  return journeyStages.map((stage) => {
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
