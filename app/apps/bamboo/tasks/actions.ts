"use server";

import { BambooTaskCategory, BambooTaskStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAppEdit } from "@/lib/authz";
import {
  parseBambooTaskCategory,
  parseBambooTaskPriority,
  parseBambooTaskStatus,
} from "@/lib/bamboo-tasks";
import { prisma } from "@/prisma";

const createTaskSchema = z.object({
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(2000).optional(),
  category: z.nativeEnum(BambooTaskCategory),
  subCategory: z.string().trim().max(120).optional(),
  timelineWeek: z.coerce.number().int().min(1).max(52),
  owner: z.string().trim().min(2).max(80),
});

const updateStatusSchema = z.object({
  id: z.string().trim().min(1),
  status: z.nativeEnum(BambooTaskStatus),
  returnTo: z.string().trim().optional(),
});

function normalizeOptional(value: string | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function sanitizeReturnTo(value?: string) {
  if (!value || !value.startsWith("/apps/bamboo")) {
    return "/apps/bamboo/tasks";
  }

  return value;
}

function revalidateBambooTaskSurfaces() {
  revalidatePath("/apps/bamboo");
  revalidatePath("/apps/bamboo/overview");
  revalidatePath("/apps/bamboo/tasks");
  revalidatePath("/apps/bamboo/timeline");
  revalidatePath("/apps/bamboo/company-setup");
  revalidatePath("/apps/bamboo/inventory");
  revalidatePath("/apps/bamboo/shop");
  revalidatePath("/apps/bamboo/finance");
  revalidatePath("/apps/bamboo/name-brand");
}

export async function createBambooTaskAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const category = parseBambooTaskCategory(String(formData.get("category") ?? ""));
  const priority = parseBambooTaskPriority(String(formData.get("priority") ?? ""));

  if (!category || !priority) {
    redirect("/apps/bamboo/tasks?error=invalid");
  }

  const parsed = createTaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category,
    subCategory: formData.get("subCategory"),
    timelineWeek: formData.get("timelineWeek"),
    owner: formData.get("owner"),
  });

  if (!parsed.success) {
    redirect("/apps/bamboo/tasks?error=invalid");
  }

  const data = parsed.data;

  await prisma.bambooTask.create({
    data: {
      title: data.title,
      description: normalizeOptional(data.description),
      category: data.category,
      subCategory: normalizeOptional(data.subCategory),
      timelineWeek: data.timelineWeek,
      owner: data.owner,
      priority,
      status: BambooTaskStatus.TODO,
    },
  });

  revalidateBambooTaskSurfaces();
  redirect("/apps/bamboo/tasks?saved=created");
}

export async function updateBambooTaskStatusAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const status = parseBambooTaskStatus(String(formData.get("status") ?? ""));
  if (!status) {
    redirect("/apps/bamboo/tasks?error=invalid");
  }

  const parsed = updateStatusSchema.safeParse({
    id: formData.get("id"),
    status,
    returnTo: formData.get("returnTo"),
  });

  if (!parsed.success) {
    redirect("/apps/bamboo/tasks?error=invalid");
  }

  const data = parsed.data;
  await prisma.bambooTask.update({
    where: { id: data.id },
    data: { status: data.status },
  });

  revalidateBambooTaskSurfaces();

  const target = sanitizeReturnTo(data.returnTo);
  const separator = target.includes("?") ? "&" : "?";
  redirect(`${target}${separator}saved=status`);
}
