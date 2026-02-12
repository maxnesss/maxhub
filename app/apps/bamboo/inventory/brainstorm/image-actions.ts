"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAppEdit } from "@/lib/authz";
import { deleteImageFromR2, uploadImageToR2 } from "@/lib/r2-images";
import { prisma } from "@/prisma";

const REDIRECT_BASE = "/apps/bamboo/inventory/brainstorm";

const deleteSchema = z.object({
  id: z.string().trim().min(1),
});

function done(saved: string): never {
  revalidatePath(REDIRECT_BASE);
  redirect(`${REDIRECT_BASE}?saved=${saved}`);
}

function fail(error: string): never {
  redirect(`${REDIRECT_BASE}?error=${error}`);
}

export async function uploadInventoryImageAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const file = formData.get("image");
  if (!(file instanceof File)) {
    fail("image-invalid");
  }

  try {
    const uploaded = await uploadImageToR2(file, "inventory-brainstorm");

    await prisma.bambooInventoryImage.create({
      data: {
        objectKey: uploaded.objectKey,
        fileName: uploaded.fileName,
        contentType: uploaded.contentType,
        sizeBytes: uploaded.sizeBytes,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Missing R2 config")) {
        fail("image-config");
      }
      if (
        error.message.includes("No file selected") ||
        error.message.includes("Unsupported image type") ||
        error.message.includes("Image too large")
      ) {
        fail("image-invalid");
      }
    }
    fail("image-upload");
  }

  done("image-added");
}

export async function deleteInventoryImageAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = deleteSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    fail("image-invalid");
  }
  const data = parsed.data;

  const record = await prisma.bambooInventoryImage.findUnique({
    where: { id: data.id },
  });

  if (!record) {
    fail("image-missing");
  }

  try {
    await deleteImageFromR2(record.objectKey);
  } catch {
    // Continue cleanup in DB even if object is already missing in storage.
  }

  await prisma.bambooInventoryImage.delete({
    where: { id: data.id },
  });

  done("image-deleted");
}
