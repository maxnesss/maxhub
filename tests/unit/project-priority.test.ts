import { describe, expect, it } from "vitest";

import {
  PROJECT_PRIORITIES,
  PROJECT_PRIORITY_BADGE_CLASS,
  PROJECT_PRIORITY_LABEL,
} from "@/lib/project-priority";

describe("lib/project-priority", () => {
  it("defines all supported priorities in intended order", () => {
    expect(PROJECT_PRIORITIES).toEqual(["LOW", "MEDIUM", "HIGH"]);
  });

  it("has labels and badge classes for each priority", () => {
    for (const priority of PROJECT_PRIORITIES) {
      expect(PROJECT_PRIORITY_LABEL[priority]).toBeTypeOf("string");
      expect(PROJECT_PRIORITY_LABEL[priority].length).toBeGreaterThan(0);
      expect(PROJECT_PRIORITY_BADGE_CLASS[priority]).toBeTypeOf("string");
      expect(PROJECT_PRIORITY_BADGE_CLASS[priority].length).toBeGreaterThan(0);
    }
  });
});
