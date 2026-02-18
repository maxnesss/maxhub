import {
  BambooTaskCategory,
  BambooTaskPhase,
  BambooTaskPriority,
  BambooTaskStatus,
} from "@prisma/client";

import { BAMBOO_DEFAULT_LOCALE, type BambooLocale } from "@/lib/bamboo-i18n";

export const BAMBOO_TASK_CATEGORY_OPTIONS = [
  BambooTaskCategory.GENERAL,
  BambooTaskCategory.SETUP_COMPANY,
  BambooTaskCategory.INVENTORY,
  BambooTaskCategory.SHOP,
  BambooTaskCategory.FINANCE,
  BambooTaskCategory.BRAND,
] as const;

export const BAMBOO_TASK_PHASE_OPTIONS = [
  BambooTaskPhase.PHASE_1_PREPARATION,
  BambooTaskPhase.PHASE_2_SETUP,
  BambooTaskPhase.PHASE_3_HOT_PRE_START,
  BambooTaskPhase.PHASE_4_START,
] as const;

export const BAMBOO_TASK_STATUS_OPTIONS = [
  BambooTaskStatus.TODO,
  BambooTaskStatus.IN_PROGRESS,
  BambooTaskStatus.DONE,
] as const;

export const BAMBOO_TASK_PRIORITY_OPTIONS = [
  BambooTaskPriority.LOW,
  BambooTaskPriority.MEDIUM,
  BambooTaskPriority.HIGH,
] as const;

export const BAMBOO_TASK_CATEGORY_LABELS: Record<BambooTaskCategory, string> = {
  GENERAL: "General",
  SETUP_COMPANY: "Setup company",
  INVENTORY: "Inventory",
  SHOP: "Shop",
  FINANCE: "Finance",
  BRAND: "Name brainstorm",
};

export const BAMBOO_TASK_PHASE_LABELS: Record<BambooTaskPhase, string> = {
  PHASE_1_PREPARATION: "Phase 1 - Preparation",
  PHASE_2_SETUP: "Phase 2 - Setup",
  PHASE_3_HOT_PRE_START: "Phase 3 - Pre-launch",
  PHASE_4_START: "Phase 4 - Start",
};

export const BAMBOO_TASK_PHASE_DESCRIPTIONS: Record<BambooTaskPhase, string> = {
  PHASE_1_PREPARATION:
    "Ideas, location research, inventory prep, and samples.",
  PHASE_2_SETUP:
    "Company setup, legal tasks, and first inventory orders.",
  PHASE_3_HOT_PRE_START:
    "Inventory in storage, shop ready, and POS prepared.",
  PHASE_4_START:
    "Launch and early operating stabilization.",
};

export const BAMBOO_TASK_PHASE_STYLES: Record<BambooTaskPhase, string> = {
  PHASE_1_PREPARATION: "border-[#dbe8ff] bg-[#f3f7ff] text-[#2f4c82]",
  PHASE_2_SETUP: "border-[#d8f2de] bg-[#effcf2] text-[#266741]",
  PHASE_3_HOT_PRE_START: "border-[#ffe0bf] bg-[#fff5e8] text-[#8a5617]",
  PHASE_4_START: "border-[#f8d0d8] bg-[#fff1f5] text-[#8f2d4a]",
};

export const BAMBOO_TASK_STATUS_LABELS: Record<BambooTaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

export const BAMBOO_TASK_PRIORITY_LABELS: Record<BambooTaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

const BAMBOO_TASK_CATEGORY_LABELS_ZH: Record<BambooTaskCategory, string> = {
  GENERAL: "通用",
  SETUP_COMPANY: "公司设立",
  INVENTORY: "货品",
  SHOP: "门店",
  FINANCE: "财务",
  BRAND: "命名头脑风暴",
};

const BAMBOO_TASK_PHASE_LABELS_ZH: Record<BambooTaskPhase, string> = {
  PHASE_1_PREPARATION: "阶段 1 - 准备",
  PHASE_2_SETUP: "阶段 2 - 设立",
  PHASE_3_HOT_PRE_START: "阶段 3 - 启动前",
  PHASE_4_START: "阶段 4 - 启动",
};

const BAMBOO_TASK_PHASE_DESCRIPTIONS_ZH: Record<BambooTaskPhase, string> = {
  PHASE_1_PREPARATION: "梳理想法、选址调研、货品准备与样品确认。",
  PHASE_2_SETUP: "完成公司设立、法律事项和首批下单。",
  PHASE_3_HOT_PRE_START: "货品入库、门店就绪、POS 系统准备完成。",
  PHASE_4_START: "正式开业并稳定早期运营。",
};

const BAMBOO_TASK_STATUS_LABELS_ZH: Record<BambooTaskStatus, string> = {
  TODO: "待办",
  IN_PROGRESS: "进行中",
  DONE: "已完成",
};

const BAMBOO_TASK_PRIORITY_LABELS_ZH: Record<BambooTaskPriority, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
};

export const BAMBOO_TASK_STATUS_STYLES: Record<BambooTaskStatus, string> = {
  TODO: "border-[#ffe1b7] bg-[#fff6ea] text-[#8a5a16]",
  IN_PROGRESS: "border-[#cce1ff] bg-[#edf4ff] text-[#294f88]",
  DONE: "border-[#cce9d9] bg-[#eefbf4] text-[#1f6a3b]",
};

export const BAMBOO_TASK_PRIORITY_STYLES: Record<BambooTaskPriority, string> = {
  LOW: "border-[#dce7f9] bg-[#f4f8ff] text-[#425f8f]",
  MEDIUM: "border-[#ffe1b7] bg-[#fff6ea] text-[#8a5a16]",
  HIGH: "border-[#f4c5ba] bg-[#fff1ed] text-[#983f2a]",
};

export function getBambooTaskCategoryLabels(
  locale: BambooLocale = BAMBOO_DEFAULT_LOCALE,
) {
  return locale === "zh" ? BAMBOO_TASK_CATEGORY_LABELS_ZH : BAMBOO_TASK_CATEGORY_LABELS;
}

export function getBambooTaskPhaseLabels(
  locale: BambooLocale = BAMBOO_DEFAULT_LOCALE,
) {
  return locale === "zh" ? BAMBOO_TASK_PHASE_LABELS_ZH : BAMBOO_TASK_PHASE_LABELS;
}

export function getBambooTaskPhaseDescriptions(
  locale: BambooLocale = BAMBOO_DEFAULT_LOCALE,
) {
  return locale === "zh"
    ? BAMBOO_TASK_PHASE_DESCRIPTIONS_ZH
    : BAMBOO_TASK_PHASE_DESCRIPTIONS;
}

export function getBambooTaskStatusLabels(
  locale: BambooLocale = BAMBOO_DEFAULT_LOCALE,
) {
  return locale === "zh" ? BAMBOO_TASK_STATUS_LABELS_ZH : BAMBOO_TASK_STATUS_LABELS;
}

export function getBambooTaskPriorityLabels(
  locale: BambooLocale = BAMBOO_DEFAULT_LOCALE,
) {
  return locale === "zh" ? BAMBOO_TASK_PRIORITY_LABELS_ZH : BAMBOO_TASK_PRIORITY_LABELS;
}

export function getBambooStatusTransitionLabel(
  status: BambooTaskStatus,
  locale: BambooLocale = BAMBOO_DEFAULT_LOCALE,
) {
  if (locale === "zh") {
    switch (status) {
      case BambooTaskStatus.TODO:
        return "开始";
      case BambooTaskStatus.IN_PROGRESS:
        return "标记完成";
      case BambooTaskStatus.DONE:
        return "重新打开";
      default:
        return "更新";
    }
  }

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

export function parseBambooTaskCategory(value: string | undefined) {
  if (!value) {
    return null;
  }

  return BAMBOO_TASK_CATEGORY_OPTIONS.includes(value as BambooTaskCategory)
    ? (value as BambooTaskCategory)
    : null;
}

export function parseBambooTaskPhase(value: string | undefined) {
  if (!value) {
    return null;
  }

  return BAMBOO_TASK_PHASE_OPTIONS.includes(value as BambooTaskPhase)
    ? (value as BambooTaskPhase)
    : null;
}

export function parseBambooTaskStatus(value: string | undefined) {
  if (!value) {
    return null;
  }

  return BAMBOO_TASK_STATUS_OPTIONS.includes(value as BambooTaskStatus)
    ? (value as BambooTaskStatus)
    : null;
}

export function parseBambooTaskPriority(value: string | undefined) {
  if (!value) {
    return null;
  }

  return BAMBOO_TASK_PRIORITY_OPTIONS.includes(value as BambooTaskPriority)
    ? (value as BambooTaskPriority)
    : null;
}

export function bambooTaskFilterHref(
  filters: {
    category?: BambooTaskCategory | null;
    phase?: BambooTaskPhase | null;
    status?: BambooTaskStatus | null;
  },
  basePath = "/apps/bamboo/tasks",
) {
  const params = new URLSearchParams();

  if (filters.category) {
    params.set("category", filters.category);
  }
  if (filters.phase) {
    params.set("phase", filters.phase);
  }
  if (filters.status) {
    params.set("status", filters.status);
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function getNextBambooTaskStatus(status: BambooTaskStatus): BambooTaskStatus {
  switch (status) {
    case BambooTaskStatus.TODO:
      return BambooTaskStatus.IN_PROGRESS;
    case BambooTaskStatus.IN_PROGRESS:
      return BambooTaskStatus.DONE;
    case BambooTaskStatus.DONE:
      return BambooTaskStatus.TODO;
    default:
      return BambooTaskStatus.TODO;
  }
}
