"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAppRead } from "@/lib/authz";
import { prisma } from "@/prisma";

const CUSTOM_CATEGORY = "Custom category";

const shortlistSchema = z.object({
  name: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(80),
  shortlisted: z.enum(["0", "1"]),
});

const customNameSchema = z.object({
  name: z.string().trim().min(2).max(120),
});

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase();
}

export async function setNameShortlistAction(formData: FormData) {
  await requireAppRead("BAMBOO");

  const parsed = shortlistSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    shortlisted: formData.get("shortlisted"),
  });

  if (!parsed.success) {
    redirect("/apps/bamboo/name-brand?error=invalid");
  }

  const normalizedName = normalizeName(parsed.data.name);
  const shouldShortlist = parsed.data.shortlisted === "1";

  if (shouldShortlist) {
    await prisma.bambooNameIdea.upsert({
      where: { normalizedName },
      update: {
        name: parsed.data.name,
        category: parsed.data.category,
        shortlisted: true,
      },
      create: {
        name: parsed.data.name,
        normalizedName,
        category: parsed.data.category,
        isCustom: parsed.data.category === CUSTOM_CATEGORY,
        shortlisted: true,
      },
    });
  } else {
    await prisma.bambooNameIdea.updateMany({
      where: { normalizedName },
      data: { shortlisted: false },
    });
  }

  revalidatePath("/apps/bamboo/name-brand");
  redirect("/apps/bamboo/name-brand?saved=shortlist");
}

export async function addCustomNameAction(formData: FormData) {
  await requireAppRead("BAMBOO");

  const parsed = customNameSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    redirect("/apps/bamboo/name-brand?error=invalid");
  }

  const name = parsed.data.name;
  const normalizedName = normalizeName(name);

  const existing = await prisma.bambooNameIdea.findUnique({
    where: { normalizedName },
    select: {
      id: true,
      isCustom: true,
    },
  });

  if (existing && !existing.isCustom) {
    redirect("/apps/bamboo/name-brand?error=duplicate");
  }

  if (existing?.isCustom) {
    await prisma.bambooNameIdea.update({
      where: { normalizedName },
      data: {
        name,
        category: CUSTOM_CATEGORY,
      },
    });
  } else {
    await prisma.bambooNameIdea.create({
      data: {
        name,
        normalizedName,
        category: CUSTOM_CATEGORY,
        isCustom: true,
        shortlisted: false,
      },
    });
  }

  revalidatePath("/apps/bamboo/name-brand");
  redirect("/apps/bamboo/name-brand?saved=custom");
}
