import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/authz", () => ({
  requireAppEdit: vi.fn(),
}));

import { createProjectAction, updateProjectAction } from "@/app/apps/projects/actions";
import { requireAppEdit } from "@/lib/authz";
import { prisma } from "@/prisma";

const mockedRequireAppEdit = vi.mocked(requireAppEdit);

const TEST_PREFIX = `it-project-${Date.now()}`;
const TEST_EMAIL = `${TEST_PREFIX}@example.test`;

let testOwnerId = "";

beforeAll(async () => {
  const testUser = await prisma.user.upsert({
    where: { email: TEST_EMAIL },
    update: {
      passwordHash: "test-password-hash",
      role: "ADMIN",
    },
    create: {
      email: TEST_EMAIL,
      name: "Integration Test User",
      passwordHash: "test-password-hash",
      role: "ADMIN",
    },
  });

  testOwnerId = testUser.id;

  mockedRequireAppEdit.mockResolvedValue({
    id: testOwnerId,
    email: TEST_EMAIL,
    name: "Integration Test User",
    nickname: null,
    role: "ADMIN",
    appPermissions: [],
  });
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(async () => {
  await prisma.project.deleteMany({
    where: {
      slug: {
        startsWith: TEST_PREFIX,
      },
    },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: { email: TEST_EMAIL },
  });

  await prisma.$disconnect();
});

describe("app/apps/projects/actions.ts", () => {
  it("creates a project with priority and owner", async () => {
    const project = await createProjectAction({
      title: "Integration Create",
      slug: `${TEST_PREFIX}-create`,
      description: "Created by integration test",
      priority: "HIGH",
      notes: "## Test note",
    });

    expect(project.slug).toBe(`${TEST_PREFIX}-create`);
    expect(project.ownerId).toBe(testOwnerId);
    expect(project.priority).toBe("HIGH");
    expect(mockedRequireAppEdit).toHaveBeenCalledWith("PROJECTS");
  });

  it("throws a friendly error on duplicate slug", async () => {
    const duplicateSlug = `${TEST_PREFIX}-duplicate`;

    await createProjectAction({
      title: "Original",
      slug: duplicateSlug,
      description: "",
      priority: "MEDIUM",
      notes: "",
    });

    await expect(
      createProjectAction({
        title: "Duplicate",
        slug: duplicateSlug,
        description: "",
        priority: "LOW",
        notes: "",
      }),
    ).rejects.toThrow("A project with this slug already exists.");
  });

  it("updates title, slug, priority, and notes", async () => {
    const existing = await prisma.project.create({
      data: {
        title: "Before update",
        slug: `${TEST_PREFIX}-before-update`,
        description: "Before",
        priority: "LOW",
        notes: "before",
        ownerId: testOwnerId,
      },
    });

    const updated = await updateProjectAction({
      id: existing.id,
      title: "After update",
      slug: `${TEST_PREFIX}-after-update`,
      description: "After",
      priority: "HIGH",
      notes: "after",
    });

    expect(updated.id).toBe(existing.id);
    expect(updated.title).toBe("After update");
    expect(updated.slug).toBe(`${TEST_PREFIX}-after-update`);
    expect(updated.priority).toBe("HIGH");
    expect(mockedRequireAppEdit).toHaveBeenCalledWith("PROJECTS");
  });
});
