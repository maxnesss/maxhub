"use server";

import { Prisma, SkatingBibleTaskStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAppEdit } from "@/lib/authz";
import { isMissingTableError } from "@/lib/prisma-errors";
import { parseSkatingBibleTaskStatus } from "@/lib/skating-bible";
import { prisma } from "@/prisma";
import { SKATING_BRAINSTORM_COLOR_KEYS } from "./brainstorm/colors";

const overviewSchema = z.object({
  projectName: z.string().trim().min(2).max(120),
  summary: z.string().trim().max(4000).optional(),
  goal: z.string().trim().max(1200).optional(),
  techStack: z.string().trim().max(2000).optional(),
  keyFeatures: z.string().trim().max(3000).optional(),
});

const createIdeaSchema = z.object({
  brainstormId: z.string().trim().min(1),
  title: z.string().trim().min(2).max(140),
  notes: z.string().trim().max(2000).optional(),
  parentId: z.string().trim().min(1).optional(),
});

const deleteIdeaSchema = z.object({
  brainstormId: z.string().trim().min(1),
  id: z.string().trim().min(1),
});

const updateIdeaSchema = z.object({
  brainstormId: z.string().trim().min(1),
  id: z.string().trim().min(1),
  title: z.string().trim().min(2).max(140),
  notes: z.string().trim().max(2000).optional(),
});

const updateCenterTopicSchema = z.object({
  brainstormId: z.string().trim().min(1),
  title: z.string().trim().min(2).max(120),
});

const createBrainstormSchema = z.object({
  title: z.string().trim().min(2).max(120),
  colorKey: z.enum(SKATING_BRAINSTORM_COLOR_KEYS).default("sky"),
});

const deleteBrainstormSchema = z.object({
  id: z.string().trim().min(1),
});

const renameBrainstormSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(2).max(120),
});

const updateIdeaPositionSchema = z.object({
  brainstormId: z.string().trim().min(1),
  id: z.string().trim().min(1),
  posX: z.number().int().min(-5000).max(5000),
  posY: z.number().int().min(-5000).max(5000),
});

const createTaskSchema = z.object({
  title: z.string().trim().min(2).max(180),
  details: z.string().trim().max(2000).optional(),
  taskGroupId: z.string().trim().min(1),
});

const updateTaskStatusSchema = z.object({
  id: z.string().trim().min(1),
  status: z.nativeEnum(SkatingBibleTaskStatus),
  returnTo: z.string().trim().optional(),
});

const createTaskGroupSchema = z.object({
  name: z.string().trim().min(2).max(80),
});

const deleteTaskGroupSchema = z.object({
  id: z.string().trim().min(1),
  returnTo: z.string().trim().optional(),
});

const deleteTaskSchema = z.object({
  id: z.string().trim().min(1),
  returnTo: z.string().trim().optional(),
});

function normalizeOptional(value: string | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function sanitizeReturnTo(value: string | undefined) {
  if (!value || !value.startsWith("/apps/skating-bible")) {
    return "/apps/skating-bible/tasks";
  }

  return value;
}

function revalidateSkatingBibleSurfaces() {
  revalidatePath("/apps/skating-bible");
  revalidatePath("/apps/skating-bible/overview");
  revalidatePath("/apps/skating-bible/brainstorm");
  revalidatePath("/apps/skating-bible/tasks");
  revalidatePath("/apps/skating-bible/charts");
}

function buildBrainstormUrl(options: {
  brainstormId?: string | null;
  saved?: string;
  error?: string;
}) {
  const searchParams = new URLSearchParams();

  if (options.brainstormId) {
    searchParams.set("brainstormId", options.brainstormId);
  }

  if (options.saved) {
    searchParams.set("saved", options.saved);
  }

  if (options.error) {
    searchParams.set("error", options.error);
  }

  const query = searchParams.toString();
  return query ? `/apps/skating-bible/brainstorm?${query}` : "/apps/skating-bible/brainstorm";
}

function buildTasksUrl(options: {
  group?: string | null;
  status?: string | null;
  saved?: string;
  error?: string;
}) {
  const searchParams = new URLSearchParams();

  if (options.group) {
    searchParams.set("group", options.group);
  }

  if (options.status) {
    searchParams.set("status", options.status);
  }

  if (options.saved) {
    searchParams.set("saved", options.saved);
  }

  if (options.error) {
    searchParams.set("error", options.error);
  }

  const query = searchParams.toString();
  return query ? `/apps/skating-bible/tasks?${query}` : "/apps/skating-bible/tasks";
}

function redirectSetupError(path: string): never {
  const separator = path.includes("?") ? "&" : "?";
  redirect(`${path}${separator}error=setup`);
}

export async function updateSkatingBibleOverviewAction(formData: FormData) {
  await requireAppEdit("SKATING_BIBLE");

  const parsed = overviewSchema.safeParse({
    projectName: formData.get("projectName"),
    summary: formData.get("summary"),
    goal: formData.get("goal"),
    techStack: formData.get("techStack"),
    keyFeatures: formData.get("keyFeatures"),
  });

  if (!parsed.success) {
    redirect("/apps/skating-bible/overview?error=invalid");
  }

  try {
    await prisma.skatingBibleOverview.upsert({
      where: { id: "default" },
      update: {
        projectName: parsed.data.projectName,
        summary: parsed.data.summary?.trim() ?? "",
        goal: parsed.data.goal?.trim() ?? "",
        techStack: parsed.data.techStack?.trim() ?? "",
        keyFeatures: parsed.data.keyFeatures?.trim() ?? "",
      },
      create: {
        id: "default",
        projectName: parsed.data.projectName,
        summary: parsed.data.summary?.trim() ?? "",
        goal: parsed.data.goal?.trim() ?? "",
        techStack: parsed.data.techStack?.trim() ?? "",
        keyFeatures: parsed.data.keyFeatures?.trim() ?? "",
      },
    });
  } catch (error) {
    if (isMissingTableError(error, "SkatingBible")) {
      redirectSetupError("/apps/skating-bible/overview");
    }

    throw error;
  }

  revalidateSkatingBibleSurfaces();
  redirect("/apps/skating-bible/overview?saved=1");
}

export async function createSkatingBibleBrainstormAction(formData: FormData) {
  await requireAppEdit("SKATING_BIBLE");

  const parsed = createBrainstormSchema.safeParse({
    title: formData.get("title"),
    colorKey: formData.get("colorKey"),
  });

  if (!parsed.success) {
    redirect(buildBrainstormUrl({ error: "invalid" }));
  }

  try {
    const brainstorm = await prisma.skatingBibleBrainstorm.create({
      data: {
        title: parsed.data.title,
        colorKey: parsed.data.colorKey,
      },
      select: { id: true },
    });

    revalidateSkatingBibleSurfaces();
    redirect(buildBrainstormUrl({ brainstormId: brainstorm.id, saved: "brainstorm-created" }));
  } catch (error) {
    if (isMissingTableError(error, "SkatingBible")) {
      redirectSetupError("/apps/skating-bible/brainstorm");
    }

    throw error;
  }
}

export async function deleteSkatingBibleBrainstormAction(formData: FormData) {
  await requireAppEdit("SKATING_BIBLE");

  const parsed = deleteBrainstormSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    redirect(buildBrainstormUrl({ error: "invalid" }));
  }

  try {
    await prisma.skatingBibleBrainstorm.delete({
      where: { id: parsed.data.id },
    });

    const fallback = await prisma.skatingBibleBrainstorm.findFirst({
      orderBy: [{ createdAt: "asc" }],
      select: { id: true },
    });

    revalidateSkatingBibleSurfaces();
    redirect(
      buildBrainstormUrl({
        brainstormId: fallback?.id,
        saved: "brainstorm-deleted",
      }),
    );
  } catch (error) {
    if (isMissingTableError(error, "SkatingBible")) {
      redirectSetupError("/apps/skating-bible/brainstorm");
    }

    throw error;
  }
}

export async function renameSkatingBibleBrainstormAction(formData: FormData) {
  await requireAppEdit("SKATING_BIBLE");

  const parsed = renameBrainstormSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
  });

  if (!parsed.success) {
    redirect(buildBrainstormUrl({ error: "invalid" }));
  }

  try {
    const updated = await prisma.skatingBibleBrainstorm.updateMany({
      where: { id: parsed.data.id },
      data: { title: parsed.data.title },
    });

    if (updated.count === 0) {
      redirect(buildBrainstormUrl({ error: "invalid" }));
    }
  } catch (error) {
    if (isMissingTableError(error, "SkatingBible")) {
      redirectSetupError("/apps/skating-bible/brainstorm");
    }

    throw error;
  }

  revalidateSkatingBibleSurfaces();
}

export async function addSkatingBibleIdeaAction(formData: FormData) {
  await requireAppEdit("SKATING_BIBLE");

  const parsed = createIdeaSchema.safeParse({
    brainstormId: formData.get("brainstormId"),
    title: formData.get("title"),
    notes: formData.get("notes"),
    parentId: formData.get("parentId") || undefined,
  });

  if (!parsed.success) {
    redirect(buildBrainstormUrl({ error: "invalid" }));
  }

  try {
    if (parsed.data.parentId) {
      const parent = await prisma.skatingBibleIdea.findUnique({
        where: { id: parsed.data.parentId },
        select: { brainstormId: true },
      });

      if (!parent || parent.brainstormId !== parsed.data.brainstormId) {
        redirect(buildBrainstormUrl({ brainstormId: parsed.data.brainstormId, error: "invalid" }));
      }
    }

    await prisma.skatingBibleIdea.create({
      data: {
        brainstormId: parsed.data.brainstormId,
        title: parsed.data.title,
        notes: parsed.data.notes?.trim() ?? "",
        parentId: parsed.data.parentId ?? null,
      },
    });
  } catch (error) {
    if (isMissingTableError(error, "SkatingBible")) {
      redirectSetupError("/apps/skating-bible/brainstorm");
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      redirect(buildBrainstormUrl({ brainstormId: parsed.data.brainstormId, error: "invalid" }));
    }

    throw error;
  }

  revalidateSkatingBibleSurfaces();
}

export async function updateSkatingBibleIdeaAction(formData: FormData) {
  await requireAppEdit("SKATING_BIBLE");

  const parsed = updateIdeaSchema.safeParse({
    brainstormId: formData.get("brainstormId"),
    id: formData.get("id"),
    title: formData.get("title"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    redirect(buildBrainstormUrl({ error: "invalid" }));
  }

  try {
    const updated = await prisma.skatingBibleIdea.updateMany({
      where: {
        id: parsed.data.id,
        brainstormId: parsed.data.brainstormId,
      },
      data: {
        title: parsed.data.title,
        notes: parsed.data.notes?.trim() ?? "",
      },
    });

    if (updated.count === 0) {
      redirect(buildBrainstormUrl({ brainstormId: parsed.data.brainstormId, error: "invalid" }));
    }
  } catch (error) {
    if (isMissingTableError(error, "SkatingBible")) {
      redirectSetupError("/apps/skating-bible/brainstorm");
    }

    throw error;
  }

  revalidateSkatingBibleSurfaces();
}

export async function updateSkatingBibleCenterTopicAction(formData: FormData) {
  await requireAppEdit("SKATING_BIBLE");

  const parsed = updateCenterTopicSchema.safeParse({
    brainstormId: formData.get("brainstormId"),
    title: formData.get("title"),
  });

  if (!parsed.success) {
    redirect(buildBrainstormUrl({ error: "invalid" }));
  }

  try {
    const updated = await prisma.skatingBibleBrainstorm.updateMany({
      where: { id: parsed.data.brainstormId },
      data: { title: parsed.data.title },
    });

    if (updated.count === 0) {
      redirect(buildBrainstormUrl({ brainstormId: parsed.data.brainstormId, error: "invalid" }));
    }
  } catch (error) {
    if (isMissingTableError(error, "SkatingBible")) {
      redirectSetupError("/apps/skating-bible/brainstorm");
    }

    throw error;
  }

  revalidateSkatingBibleSurfaces();
}

export async function saveSkatingBibleIdeaPositionAction(input: {
  brainstormId: string;
  id: string;
  posX: number;
  posY: number;
}) {
  await requireAppEdit("SKATING_BIBLE");

  const parsed = updateIdeaPositionSchema.safeParse(input);
  if (!parsed.success) {
    return;
  }

  try {
    await prisma.skatingBibleIdea.updateMany({
      where: {
        id: parsed.data.id,
        brainstormId: parsed.data.brainstormId,
      },
      data: {
        posX: parsed.data.posX,
        posY: parsed.data.posY,
      },
    });
  } catch (error) {
    if (isMissingTableError(error, "SkatingBible")) {
      return;
    }
  }
}

export async function deleteSkatingBibleIdeaAction(formData: FormData) {
  await requireAppEdit("SKATING_BIBLE");

  const parsed = deleteIdeaSchema.safeParse({
    brainstormId: formData.get("brainstormId"),
    id: formData.get("id"),
  });

  if (!parsed.success) {
    redirect(buildBrainstormUrl({ error: "invalid" }));
  }

  try {
    const deleted = await prisma.skatingBibleIdea.deleteMany({
      where: {
        id: parsed.data.id,
        brainstormId: parsed.data.brainstormId,
      },
    });

    if (deleted.count === 0) {
      redirect(buildBrainstormUrl({ brainstormId: parsed.data.brainstormId, error: "invalid" }));
    }
  } catch (error) {
    if (isMissingTableError(error, "SkatingBible")) {
      redirectSetupError("/apps/skating-bible/brainstorm");
    }

    throw error;
  }

  revalidateSkatingBibleSurfaces();
  redirect(buildBrainstormUrl({ brainstormId: parsed.data.brainstormId, saved: "deleted" }));
}

export async function createSkatingBibleTaskAction(formData: FormData) {
  await requireAppEdit("SKATING_BIBLE");

  const parsed = createTaskSchema.safeParse({
    title: formData.get("title"),
    details: formData.get("details"),
    taskGroupId: formData.get("taskGroupId"),
  });

  if (!parsed.success) {
    redirect(buildTasksUrl({ error: "invalid" }));
  }

  try {
    await prisma.skatingBibleTask.create({
      data: {
        title: parsed.data.title,
        details: normalizeOptional(parsed.data.details),
        taskGroupId: parsed.data.taskGroupId,
        status: SkatingBibleTaskStatus.TODO,
      },
    });
  } catch (error) {
    if (isMissingTableError(error, "SkatingBible")) {
      redirectSetupError("/apps/skating-bible/tasks");
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      redirect(buildTasksUrl({ error: "invalid" }));
    }

    throw error;
  }

  revalidateSkatingBibleSurfaces();
  redirect(buildTasksUrl({ saved: "created" }));
}

export async function createSkatingBibleTaskGroupAction(formData: FormData) {
  await requireAppEdit("SKATING_BIBLE");

  const parsed = createTaskGroupSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    redirect(buildTasksUrl({ error: "invalid" }));
  }

  try {
    await prisma.skatingBibleTaskGroup.create({
      data: {
        name: parsed.data.name,
      },
    });
  } catch (error) {
    if (isMissingTableError(error, "SkatingBible")) {
      redirectSetupError("/apps/skating-bible/tasks");
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      redirect(buildTasksUrl({ error: "group-exists" }));
    }

    throw error;
  }

  revalidateSkatingBibleSurfaces();
  redirect(buildTasksUrl({ saved: "group-created" }));
}

export async function deleteSkatingBibleTaskGroupAction(formData: FormData) {
  await requireAppEdit("SKATING_BIBLE");

  const parsed = deleteTaskGroupSchema.safeParse({
    id: formData.get("id"),
    returnTo: formData.get("returnTo"),
  });

  if (!parsed.success) {
    redirect(buildTasksUrl({ error: "invalid" }));
  }

  try {
    const deleted = await prisma.skatingBibleTaskGroup.deleteMany({
      where: { id: parsed.data.id },
    });

    if (deleted.count === 0) {
      redirect(buildTasksUrl({ error: "invalid" }));
    }
  } catch (error) {
    if (isMissingTableError(error, "SkatingBible")) {
      redirectSetupError("/apps/skating-bible/tasks");
    }

    throw error;
  }

  revalidateSkatingBibleSurfaces();
  const target = sanitizeReturnTo(parsed.data.returnTo);
  const separator = target.includes("?") ? "&" : "?";
  redirect(`${target}${separator}saved=group-deleted`);
}

export async function deleteSkatingBibleTaskAction(formData: FormData) {
  await requireAppEdit("SKATING_BIBLE");

  const parsed = deleteTaskSchema.safeParse({
    id: formData.get("id"),
    returnTo: formData.get("returnTo"),
  });

  if (!parsed.success) {
    redirect(buildTasksUrl({ error: "invalid" }));
  }

  try {
    const deleted = await prisma.skatingBibleTask.deleteMany({
      where: { id: parsed.data.id },
    });

    if (deleted.count === 0) {
      redirect(buildTasksUrl({ error: "invalid" }));
    }
  } catch (error) {
    if (isMissingTableError(error, "SkatingBible")) {
      redirectSetupError("/apps/skating-bible/tasks");
    }

    throw error;
  }

  revalidateSkatingBibleSurfaces();
  const target = sanitizeReturnTo(parsed.data.returnTo);
  const separator = target.includes("?") ? "&" : "?";
  redirect(`${target}${separator}saved=task-deleted`);
}

export async function updateSkatingBibleTaskStatusAction(formData: FormData) {
  await requireAppEdit("SKATING_BIBLE");

  const status = parseSkatingBibleTaskStatus(String(formData.get("status") ?? ""));
  if (!status) {
    redirect("/apps/skating-bible/tasks?error=invalid");
  }

  const parsed = updateTaskStatusSchema.safeParse({
    id: formData.get("id"),
    status,
    returnTo: formData.get("returnTo"),
  });

  if (!parsed.success) {
    redirect("/apps/skating-bible/tasks?error=invalid");
  }

  try {
    await prisma.skatingBibleTask.update({
      where: { id: parsed.data.id },
      data: { status: parsed.data.status },
    });
  } catch (error) {
    if (isMissingTableError(error, "SkatingBible")) {
      redirectSetupError("/apps/skating-bible/tasks");
    }

    throw error;
  }

  revalidateSkatingBibleSurfaces();
  const target = sanitizeReturnTo(parsed.data.returnTo);
  const separator = target.includes("?") ? "&" : "?";
  redirect(`${target}${separator}saved=status`);
}
