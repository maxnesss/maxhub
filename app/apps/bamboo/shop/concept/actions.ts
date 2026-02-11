"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAppEdit } from "@/lib/authz";
import { prisma } from "@/prisma";

const conceptSchema = z.object({
  concept: z.string().trim().min(10).max(4000),
  targetSize: z.string().trim().min(3).max(160),
  targetPriceRange: z.string().trim().min(3).max(160),
});

export async function saveShopConceptAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = conceptSchema.safeParse({
    concept: formData.get("concept"),
    targetSize: formData.get("targetSize"),
    targetPriceRange: formData.get("targetPriceRange"),
  });

  if (!parsed.success) {
    redirect("/apps/bamboo/shop/concept?error=invalid");
  }

  await prisma.bambooShopConcept.upsert({
    where: { id: "default" },
    update: {
      concept: parsed.data.concept,
      targetSize: parsed.data.targetSize,
      targetPriceRange: parsed.data.targetPriceRange,
    },
    create: {
      id: "default",
      concept: parsed.data.concept,
      targetSize: parsed.data.targetSize,
      targetPriceRange: parsed.data.targetPriceRange,
    },
  });

  revalidatePath("/apps/bamboo/shop/concept");
  redirect("/apps/bamboo/shop/concept?saved=1");
}
