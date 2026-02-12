"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAppEdit } from "@/lib/authz";
import { prisma } from "@/prisma";

const charterSchema = z.object({
  vision: z.string().trim().min(20).max(5000),
  targetCustomer: z.string().trim().min(10).max(3000),
  scopeIn: z.string().trim().min(10).max(4000),
  scopeOut: z.string().trim().min(10).max(4000),
  budgetGuardrail: z.string().trim().min(10).max(3000),
  launchCriteria: z.string().trim().min(10).max(4000),
  keyRisks: z.string().trim().min(10).max(4000),
});

export async function saveBambooProjectCharterAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = charterSchema.safeParse({
    vision: formData.get("vision"),
    targetCustomer: formData.get("targetCustomer"),
    scopeIn: formData.get("scopeIn"),
    scopeOut: formData.get("scopeOut"),
    budgetGuardrail: formData.get("budgetGuardrail"),
    launchCriteria: formData.get("launchCriteria"),
    keyRisks: formData.get("keyRisks"),
  });

  if (!parsed.success) {
    redirect("/apps/bamboo/project-charter?error=invalid");
  }
  const data = parsed.data;

  await prisma.bambooProjectCharter.upsert({
    where: { id: "default" },
    update: {
      vision: data.vision,
      targetCustomer: data.targetCustomer,
      scopeIn: data.scopeIn,
      scopeOut: data.scopeOut,
      budgetGuardrail: data.budgetGuardrail,
      launchCriteria: data.launchCriteria,
      keyRisks: data.keyRisks,
    },
    create: {
      id: "default",
      vision: data.vision,
      targetCustomer: data.targetCustomer,
      scopeIn: data.scopeIn,
      scopeOut: data.scopeOut,
      budgetGuardrail: data.budgetGuardrail,
      launchCriteria: data.launchCriteria,
      keyRisks: data.keyRisks,
    },
  });

  revalidatePath("/apps/bamboo/project-charter");
  revalidatePath("/apps/bamboo/overview");
  redirect("/apps/bamboo/project-charter?saved=1");
}
