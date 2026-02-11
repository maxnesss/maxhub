"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAppEdit } from "@/lib/authz";
import { prisma } from "@/prisma";

const budgetSchema = z.object({
  category: z.string().trim().min(2).max(120),
  monthlyCost: z.string().trim().min(1).max(120),
  oneTimeCost: z.string().trim().min(1).max(120),
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
  redirect(`/apps/bamboo/shop/budget?saved=${saved}`);
}

function invalid() {
  redirect("/apps/bamboo/shop/budget?error=invalid");
}

export async function addShopBudgetItemAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = budgetSchema.safeParse({
    category: formData.get("category"),
    monthlyCost: formData.get("monthlyCost"),
    oneTimeCost: formData.get("oneTimeCost"),
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    invalid();
  }

  await prisma.bambooShopBudgetItem.create({
    data: parsed.data,
  });

  done("added");
}

export async function updateShopBudgetItemAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = updateBudgetSchema.safeParse({
    id: formData.get("id"),
    category: formData.get("category"),
    monthlyCost: formData.get("monthlyCost"),
    oneTimeCost: formData.get("oneTimeCost"),
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    invalid();
  }

  await prisma.bambooShopBudgetItem.update({
    where: { id: parsed.data.id },
    data: {
      category: parsed.data.category,
      monthlyCost: parsed.data.monthlyCost,
      oneTimeCost: parsed.data.oneTimeCost,
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
