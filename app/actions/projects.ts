"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import type { NewProjectInput, ProjectEditInput } from "@/lib/validations/project";
import { projectEditSchema, projectSchema } from "@/lib/validations/project";
import { prisma } from "@/prisma";

export async function createProjectAction(input: NewProjectInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const data = projectSchema.parse(input);

  const project = await prisma.project.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      notes: data.notes || "",
      ownerId: session.user.id,
    },
  });

  revalidatePath("/");
  return project;
}

export async function updateProjectAction(input: ProjectEditInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const data = projectEditSchema.parse(input);

  const existing = await prisma.project.findFirst({
    where: {
      id: data.id,
      ownerId: session.user.id,
    },
    select: { id: true },
  });

  if (!existing) {
    throw new Error("Project not found");
  }

  const project = await prisma.project.update({
    where: {
      id: data.id,
    },
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      notes: data.notes || "",
    },
  });

  revalidatePath("/");
  return project;
}
