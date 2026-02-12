"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAppEdit } from "@/lib/authz";
import { prisma } from "@/prisma";

const REDIRECT_BASE = "/apps/bamboo/inventory/producers-contact";

const producerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  contact: z.string().trim().min(2).max(240),
  sortiment: z.string().trim().min(2).max(240),
  notes: z.string().trim().min(0).max(1000),
});

const updateProducerSchema = producerSchema.extend({
  id: z.string().trim().min(1),
});

const deleteSchema = z.object({
  id: z.string().trim().min(1),
});

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase();
}

function fail(message: string): never {
  redirect(`${REDIRECT_BASE}?error=${message}`);
}

function done(message: string): never {
  revalidatePath(REDIRECT_BASE);
  redirect(`${REDIRECT_BASE}?saved=${message}`);
}

export async function addProducerContactAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = producerSchema.safeParse({
    name: formData.get("name"),
    contact: formData.get("contact"),
    sortiment: formData.get("sortiment"),
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    fail("invalid");
  }
  const data = parsed.data;

  try {
    await prisma.bambooProducerContact.create({
      data: {
        name: data.name,
        normalizedName: normalizeName(data.name),
        contact: data.contact,
        sortiment: data.sortiment,
        notes: data.notes,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      fail("duplicate");
    }

    throw error;
  }

  done("added");
}

export async function updateProducerContactAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = updateProducerSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    contact: formData.get("contact"),
    sortiment: formData.get("sortiment"),
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    fail("invalid");
  }
  const data = parsed.data;

  try {
    await prisma.bambooProducerContact.update({
      where: { id: data.id },
      data: {
        name: data.name,
        normalizedName: normalizeName(data.name),
        contact: data.contact,
        sortiment: data.sortiment,
        notes: data.notes,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      fail("duplicate");
    }

    throw error;
  }

  done("updated");
}

export async function deleteProducerContactAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = deleteSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    fail("invalid");
  }
  const data = parsed.data;

  await prisma.bambooProducerContact.delete({
    where: { id: data.id },
  });

  done("deleted");
}
