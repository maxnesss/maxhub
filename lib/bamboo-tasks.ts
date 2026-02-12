import {
  BambooTaskCategory,
  BambooTaskPriority,
  BambooTaskStatus,
} from "@prisma/client";

export const BAMBOO_TASK_CATEGORY_OPTIONS = [
  BambooTaskCategory.GENERAL,
  BambooTaskCategory.SETUP_COMPANY,
  BambooTaskCategory.INVENTORY,
  BambooTaskCategory.SHOP,
  BambooTaskCategory.FINANCE,
  BambooTaskCategory.BRAND,
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
  BRAND: "Name and brand",
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

export function parseBambooTaskCategory(value: string | undefined) {
  if (!value) {
    return null;
  }

  return BAMBOO_TASK_CATEGORY_OPTIONS.includes(value as BambooTaskCategory)
    ? (value as BambooTaskCategory)
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
  filters: { category?: BambooTaskCategory | null; status?: BambooTaskStatus | null },
  basePath = "/apps/bamboo/tasks",
) {
  const params = new URLSearchParams();

  if (filters.category) {
    params.set("category", filters.category);
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
