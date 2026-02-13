import {
  BambooTaskCategory,
  BambooTaskPhase,
  BambooTaskStatus,
} from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  BAMBOO_TASK_CATEGORY_OPTIONS,
  BAMBOO_TASK_PHASE_OPTIONS,
  BAMBOO_TASK_STATUS_OPTIONS,
  bambooTaskFilterHref,
  getNextBambooTaskStatus,
  parseBambooTaskCategory,
  parseBambooTaskPhase,
  parseBambooTaskStatus,
} from "@/lib/bamboo-tasks";

describe("lib/bamboo-tasks", () => {
  it("keeps the canonical category, phase, and status option order", () => {
    expect(BAMBOO_TASK_CATEGORY_OPTIONS).toEqual([
      BambooTaskCategory.GENERAL,
      BambooTaskCategory.SETUP_COMPANY,
      BambooTaskCategory.INVENTORY,
      BambooTaskCategory.SHOP,
      BambooTaskCategory.FINANCE,
      BambooTaskCategory.BRAND,
    ]);
    expect(BAMBOO_TASK_PHASE_OPTIONS).toEqual([
      BambooTaskPhase.PHASE_1_PREPARATION,
      BambooTaskPhase.PHASE_2_SETUP,
      BambooTaskPhase.PHASE_3_HOT_PRE_START,
      BambooTaskPhase.PHASE_4_START,
    ]);
    expect(BAMBOO_TASK_STATUS_OPTIONS).toEqual([
      BambooTaskStatus.TODO,
      BambooTaskStatus.IN_PROGRESS,
      BambooTaskStatus.DONE,
    ]);
  });

  it("parses known category and phase values and rejects unknown/empty values", () => {
    expect(parseBambooTaskCategory("GENERAL")).toBe(BambooTaskCategory.GENERAL);
    expect(parseBambooTaskCategory("UNKNOWN")).toBeNull();
    expect(parseBambooTaskCategory(undefined)).toBeNull();

    expect(parseBambooTaskPhase("PHASE_3_HOT_PRE_START")).toBe(
      BambooTaskPhase.PHASE_3_HOT_PRE_START,
    );
    expect(parseBambooTaskPhase("PHASE_5")).toBeNull();
    expect(parseBambooTaskPhase(undefined)).toBeNull();
  });

  it("parses known status values and rejects unknown/empty values", () => {
    expect(parseBambooTaskStatus("TODO")).toBe(BambooTaskStatus.TODO);
    expect(parseBambooTaskStatus("DONE")).toBe(BambooTaskStatus.DONE);
    expect(parseBambooTaskStatus("BLOCKED")).toBeNull();
    expect(parseBambooTaskStatus(undefined)).toBeNull();
  });

  it("builds filter hrefs with only active filters", () => {
    expect(bambooTaskFilterHref({})).toBe("/apps/bamboo/tasks");
    expect(
      bambooTaskFilterHref({
        category: BambooTaskCategory.SHOP,
        phase: BambooTaskPhase.PHASE_2_SETUP,
        status: BambooTaskStatus.IN_PROGRESS,
      }),
    ).toBe("/apps/bamboo/tasks?category=SHOP&phase=PHASE_2_SETUP&status=IN_PROGRESS");
  });

  it("supports custom base path for filter hrefs", () => {
    expect(
      bambooTaskFilterHref(
        { status: BambooTaskStatus.DONE },
        "/internal/bamboo",
      ),
    ).toBe("/internal/bamboo?status=DONE");
  });

  it("cycles task status in TODO -> IN_PROGRESS -> DONE -> TODO order", () => {
    expect(getNextBambooTaskStatus(BambooTaskStatus.TODO)).toBe(
      BambooTaskStatus.IN_PROGRESS,
    );
    expect(getNextBambooTaskStatus(BambooTaskStatus.IN_PROGRESS)).toBe(
      BambooTaskStatus.DONE,
    );
    expect(getNextBambooTaskStatus(BambooTaskStatus.DONE)).toBe(
      BambooTaskStatus.TODO,
    );
  });

  it("falls back to TODO for unexpected status input", () => {
    expect(getNextBambooTaskStatus("INVALID" as BambooTaskStatus)).toBe(
      BambooTaskStatus.TODO,
    );
  });
});
