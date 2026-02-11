"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAppEdit } from "@/lib/authz";
import { prisma } from "@/prisma";

const ideaSchema = z.object({
  name: z.string().trim().min(2).max(120),
  notes: z.string().trim().min(2).max(1000),
  targetPriceBand: z.string().trim().min(1).max(80),
});

const updateSchema = ideaSchema.extend({
  id: z.string().trim().min(1),
});

const deleteSchema = z.object({
  id: z.string().trim().min(1),
});

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase();
}

export async function addInventoryIdeaAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = ideaSchema.safeParse({
    name: formData.get("name"),
    notes: formData.get("notes"),
    targetPriceBand: formData.get("targetPriceBand"),
  });

  if (!parsed.success) {
    redirect("/apps/bamboo/inventory/brainstorm?error=invalid");
  }

  try {
    await prisma.bambooInventoryIdea.create({
      data: {
        name: parsed.data.name,
        normalizedName: normalizeName(parsed.data.name),
        notes: parsed.data.notes,
        targetPriceBand: parsed.data.targetPriceBand,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      redirect("/apps/bamboo/inventory/brainstorm?error=duplicate");
    }

    throw error;
  }

  revalidatePath("/apps/bamboo/inventory/brainstorm");
  redirect("/apps/bamboo/inventory/brainstorm?saved=added");
}

export async function updateInventoryIdeaAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    notes: formData.get("notes"),
    targetPriceBand: formData.get("targetPriceBand"),
  });

  if (!parsed.success) {
    redirect("/apps/bamboo/inventory/brainstorm?error=invalid");
  }

  try {
    await prisma.bambooInventoryIdea.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        normalizedName: normalizeName(parsed.data.name),
        notes: parsed.data.notes,
        targetPriceBand: parsed.data.targetPriceBand,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      redirect("/apps/bamboo/inventory/brainstorm?error=duplicate");
    }

    throw error;
  }

  revalidatePath("/apps/bamboo/inventory/brainstorm");
  redirect("/apps/bamboo/inventory/brainstorm?saved=updated");
}

export async function deleteInventoryIdeaAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = deleteSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    redirect("/apps/bamboo/inventory/brainstorm?error=invalid");
  }

  await prisma.bambooInventoryIdea.delete({
    where: { id: parsed.data.id },
  });

  revalidatePath("/apps/bamboo/inventory/brainstorm");
  redirect("/apps/bamboo/inventory/brainstorm?saved=deleted");
}
