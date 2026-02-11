"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireAppEdit } from "@/lib/authz";
import type { NewProjectInput, ProjectEditInput } from "@/lib/validations/project";
import { projectEditSchema, projectSchema } from "@/lib/validations/project";
import { prisma } from "@/prisma";

export async function createProjectAction(input: NewProjectInput) {
  const user = await requireAppEdit("PROJECTS");
  const data = projectSchema.parse(input);

  try {
    const project = await prisma.project.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        priority: data.priority,
        notes: data.notes || "",
        ownerId: user.id,
      },
    });

    revalidatePath("/apps");
    revalidatePath("/apps/projects");
    revalidatePath(`/apps/projects/${project.id}`);

    return project;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("A project with this slug already exists.");
    }

    throw error;
  }
}

export async function updateProjectAction(input: ProjectEditInput) {
  await requireAppEdit("PROJECTS");
  const data = projectEditSchema.parse(input);

  try {
    const project = await prisma.project.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        priority: data.priority,
        notes: data.notes || "",
      },
    });

    revalidatePath("/apps");
    revalidatePath("/apps/projects");
    revalidatePath(`/apps/projects/${project.id}`);
    revalidatePath(`/apps/projects/${project.id}/edit`);

    return project;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("A project with this slug already exists.");
    }

    throw error;
  }
}
