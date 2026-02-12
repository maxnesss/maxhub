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

const inventoryBudgetSchema = z.object({
  initialInventoryBuy: amountSchema,
  initialTransportation: amountSchema,
  initialTaxesImportFees: amountSchema,
  initialTransportToShop: amountSchema,
  initialLabelling: amountSchema,
  periodicalInventoryBuy: amountSchema,
  periodicalTransportation: amountSchema,
  periodicalTaxesImportFees: amountSchema,
  periodicalTransportToShop: amountSchema,
  periodicalLabelling: amountSchema,
});

function invalid(): never {
  redirect("/apps/bamboo/inventory/budget?error=invalid");
}

function done(): never {
  revalidatePath("/apps/bamboo/inventory/budget");
  revalidatePath("/apps/bamboo/estimated-setup-cost");
  revalidatePath("/apps/bamboo/recommended-capital");
  revalidatePath("/apps/bamboo");
  redirect("/apps/bamboo/inventory/budget?saved=1");
}

export async function saveInventoryBudgetAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = inventoryBudgetSchema.safeParse({
    initialInventoryBuy: formData.get("initialInventoryBuy"),
    initialTransportation: formData.get("initialTransportation"),
    initialTaxesImportFees: formData.get("initialTaxesImportFees"),
    initialTransportToShop: formData.get("initialTransportToShop"),
    initialLabelling: formData.get("initialLabelling"),
    periodicalInventoryBuy: formData.get("periodicalInventoryBuy"),
    periodicalTransportation: formData.get("periodicalTransportation"),
    periodicalTaxesImportFees: formData.get("periodicalTaxesImportFees"),
    periodicalTransportToShop: formData.get("periodicalTransportToShop"),
    periodicalLabelling: formData.get("periodicalLabelling"),
  });

  if (!parsed.success) {
    invalid();
  }
  const data = parsed.data;

  await prisma.bambooInventoryBudget.upsert({
    where: { id: "default" },
    update: data,
    create: {
      id: "default",
      ...data,
    },
  });

  done();
}
