"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAppEdit } from "@/lib/authz";
import { prisma } from "@/prisma";

const scenarioSchema = z.object({
  operatingMonths: z.coerce.number().int().min(1).max(24),
  reservePercent: z.coerce.number().int().min(0).max(60),
});

export async function saveCapitalScenarioAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = scenarioSchema.safeParse({
    operatingMonths: formData.get("operatingMonths"),
    reservePercent: formData.get("reservePercent"),
  });

  if (!parsed.success) {
    redirect("/apps/bamboo/recommended-capital?error=invalid");
  }

  await prisma.bambooCapitalScenario.upsert({
    where: { id: "default" },
    update: {
      operatingMonths: parsed.data.operatingMonths,
      reservePercent: parsed.data.reservePercent,
    },
    create: {
      id: "default",
      operatingMonths: parsed.data.operatingMonths,
      reservePercent: parsed.data.reservePercent,
    },
  });

  revalidatePath("/apps/bamboo/recommended-capital");
  revalidatePath("/apps/bamboo/overview");
  revalidatePath("/apps/bamboo");

  redirect("/apps/bamboo/recommended-capital?saved=scenario");
}
