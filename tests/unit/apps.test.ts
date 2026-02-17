import { describe, expect, it } from "vitest";

import {
  APP_CODES,
  APP_DEFINITIONS,
  isAppCode,
  parseAppCodes,
} from "@/lib/apps";

describe("lib/apps", () => {
  it("recognizes valid app codes", () => {
    for (const appCode of APP_CODES) {
      expect(isAppCode(appCode)).toBe(true);
    }
  });

  it("rejects invalid app codes", () => {
    expect(isAppCode("NOT_REAL")).toBe(false);
    expect(isAppCode("projects")).toBe(false);
  });

  it("filters unknown values from app-code arrays", () => {
    expect(parseAppCodes(["PROJECTS", "BAD", "TASKS", "BAMBOO", "WORKOUT"])).toEqual([
      "PROJECTS",
      "TASKS",
      "BAMBOO",
      "WORKOUT",
    ]);
  });

  it("has definitions for all app codes", () => {
    for (const appCode of APP_CODES) {
      expect(APP_DEFINITIONS[appCode].label.length).toBeGreaterThan(0);
      expect(APP_DEFINITIONS[appCode].description.length).toBeGreaterThan(0);
    }

    expect(APP_DEFINITIONS.PROJECTS.href).toBe("/apps/projects");
    expect(APP_DEFINITIONS.CALENDAR.href).toBe("/apps/calendar");
    expect(APP_DEFINITIONS.BAMBOO.href).toBe("/apps/bamboo");
    expect(APP_DEFINITIONS.WORKOUT.href).toBe("/apps/workout");
  });
});
