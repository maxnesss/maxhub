import { describe, expect, it } from "vitest";

import { projectEditSchema, projectSchema } from "@/lib/validations/project";

describe("lib/validations/project", () => {
  it("accepts valid input and trims text fields", () => {
    const parsed = projectSchema.parse({
      title: "  Website Refresh  ",
      slug: "  website-refresh  ",
      description: "  Redesign Q2 landing pages  ",
      priority: "HIGH",
      notes: "## Plan",
    });

    expect(parsed).toEqual({
      title: "Website Refresh",
      slug: "website-refresh",
      description: "Redesign Q2 landing pages",
      priority: "HIGH",
      notes: "## Plan",
    });
  });

  it("rejects invalid slug values", () => {
    const result = projectSchema.safeParse({
      title: "Project A",
      slug: "Project A",
      description: "",
      priority: "MEDIUM",
      notes: "",
    });

    expect(result.success).toBe(false);
  });

  it("requires priority", () => {
    const result = projectSchema.safeParse({
      title: "Project A",
      slug: "project-a",
      description: "",
      notes: "",
    });

    expect(result.success).toBe(false);
  });

  it("requires project id for edit payloads", () => {
    const withoutId = projectEditSchema.safeParse({
      title: "Project A",
      slug: "project-a",
      description: "",
      priority: "LOW",
      notes: "",
    });

    const withId = projectEditSchema.safeParse({
      id: "proj_123",
      title: "Project A",
      slug: "project-a",
      description: "",
      priority: "LOW",
      notes: "",
    });

    expect(withoutId.success).toBe(false);
    expect(withId.success).toBe(true);
  });
});
