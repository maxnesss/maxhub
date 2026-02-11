"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAppEdit } from "@/lib/authz";
import { prisma } from "@/prisma";

const amountSchema = z
  .string()
  .trim()
  .regex(/^\d+$/)
  .transform((value) => Number.parseInt(value, 10))
  .pipe(z.number().int().min(0).max(1_000_000_000));

const budgetSchema = z.object({
  category: z.string().trim().min(2).max(120),
  monthlyCostCzk: amountSchema,
  oneTimeCostCzk: amountSchema,
  notes: z.string().trim().min(0).max(1200),
});

const updateBudgetSchema = budgetSchema.extend({
  id: z.string().trim().min(1),
});

const deleteSchema = z.object({
  id: z.string().trim().min(1),
});

function done(saved: string) {
  revalidatePath("/apps/bamboo/shop/budget");
  revalidatePath("/apps/bamboo/shop");
  revalidatePath("/apps/bamboo");
  redirect(`/apps/bamboo/shop/budget?saved=${saved}`);
}

function invalid() {
  redirect("/apps/bamboo/shop/budget?error=invalid");
}

export async function addShopBudgetItemAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = budgetSchema.safeParse({
    category: formData.get("category"),
    monthlyCostCzk: formData.get("monthlyCostCzk"),
    oneTimeCostCzk: formData.get("oneTimeCostCzk"),
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    invalid();
  }

  await prisma.bambooShopBudgetItem.create({
    data: {
      category: parsed.data.category,
      monthlyCost: String(parsed.data.monthlyCostCzk),
      oneTimeCost: String(parsed.data.oneTimeCostCzk),
      notes: parsed.data.notes,
    },
  });

  done("added");
}

export async function updateShopBudgetItemAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = updateBudgetSchema.safeParse({
    id: formData.get("id"),
    category: formData.get("category"),
    monthlyCostCzk: formData.get("monthlyCostCzk"),
    oneTimeCostCzk: formData.get("oneTimeCostCzk"),
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    invalid();
  }

  await prisma.bambooShopBudgetItem.update({
    where: { id: parsed.data.id },
    data: {
      category: parsed.data.category,
      monthlyCost: String(parsed.data.monthlyCostCzk),
      oneTimeCost: String(parsed.data.oneTimeCostCzk),
      notes: parsed.data.notes,
    },
  });

  done("updated");
}

export async function deleteShopBudgetItemAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = deleteSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    invalid();
  }

  await prisma.bambooShopBudgetItem.delete({
    where: { id: parsed.data.id },
  });

  done("deleted");
}
