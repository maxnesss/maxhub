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

function toLoggableError(error: unknown) {
  if (!(error instanceof Error)) {
    return { message: "Unknown error", raw: String(error) };
  }

  const maybeAwsError = error as Error & {
    name?: string;
    code?: string;
    $metadata?: { httpStatusCode?: number; requestId?: string };
    cause?: unknown;
  };

  return {
    name: maybeAwsError.name,
    message: maybeAwsError.message,
    code: maybeAwsError.code,
    httpStatusCode: maybeAwsError.$metadata?.httpStatusCode,
    requestId: maybeAwsError.$metadata?.requestId,
    cause:
      maybeAwsError.cause instanceof Error
        ? maybeAwsError.cause.message
        : maybeAwsError.cause,
  };
}

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
    console.error("[inventory-image-upload] Invalid form file payload.");
    fail("image-invalid");
  }

  console.info("[inventory-image-upload] Upload started.", {
    name: file.name,
    sizeBytes: file.size,
    contentType: file.type,
  });

  try {
    const uploaded = await uploadImageToR2(file, "inventory-brainstorm");
    console.info("[inventory-image-upload] R2 upload succeeded.", {
      objectKey: uploaded.objectKey,
      sizeBytes: uploaded.sizeBytes,
      contentType: uploaded.contentType,
    });

    await prisma.bambooInventoryImage.create({
      data: {
        objectKey: uploaded.objectKey,
        fileName: uploaded.fileName,
        contentType: uploaded.contentType,
        sizeBytes: uploaded.sizeBytes,
      },
    });
    console.info("[inventory-image-upload] Metadata saved to DB.", {
      objectKey: uploaded.objectKey,
    });
  } catch (error) {
    console.error(
      "[inventory-image-upload] Failed to upload image.",
      toLoggableError(error),
    );

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
    console.error("[inventory-image-delete] Invalid form payload.");
    fail("image-invalid");
  }
  const data = parsed.data;

  const record = await prisma.bambooInventoryImage.findUnique({
    where: { id: data.id },
  });

  if (!record) {
    console.warn("[inventory-image-delete] Record not found.", { id: data.id });
    fail("image-missing");
  }

  try {
    await deleteImageFromR2(record.objectKey);
  } catch (error) {
    console.warn(
      "[inventory-image-delete] R2 delete failed, continuing with DB cleanup.",
      { objectKey: record.objectKey, error: toLoggableError(error) },
    );
    // Continue cleanup in DB even if object is already missing in storage.
  }

  await prisma.bambooInventoryImage.delete({
    where: { id: data.id },
  });

  done("image-deleted");
}
