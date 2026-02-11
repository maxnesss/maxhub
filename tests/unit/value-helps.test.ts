import { describe, expect, it } from "vitest";

import { APP_CODES } from "@/lib/apps";
import { APP_VALUE_HELP, ROLE_VALUE_HELP, isRoleValue } from "@/lib/value-helps";

describe("lib/value-helps", () => {
  it("exposes known role options", () => {
    const values = ROLE_VALUE_HELP.map((option) => option.value);
    const labels = ROLE_VALUE_HELP.map((option) => option.label);

    expect(values).toContain("ADMIN");
    expect(values).toContain("USER");
    expect(labels).toContain("Admin");
    expect(labels).toContain("User");
  });

  it("validates role strings", () => {
    expect(isRoleValue("ADMIN")).toBe(true);
    expect(isRoleValue("USER")).toBe(true);
    expect(isRoleValue("GUEST")).toBe(false);
  });

  it("maps every app code into app value help", () => {
    expect(APP_VALUE_HELP).toHaveLength(APP_CODES.length);
    expect(APP_VALUE_HELP.map((option) => option.value)).toEqual(APP_CODES);
  });
});
