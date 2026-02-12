"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAppEdit } from "@/lib/authz";
import { deleteDocumentFromR2, uploadDocumentToR2 } from "@/lib/r2-documents";
import { prisma } from "@/prisma";

const REDIRECT_BASE = "/apps/bamboo/documents";

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

export async function uploadBambooDocumentAction(formData: FormData) {
  const user = await requireAppEdit("BAMBOO");

  const file = formData.get("file");
  if (!(file instanceof File)) {
    fail("invalid-file");
  }

  try {
    const uploaded = await uploadDocumentToR2(file, "bamboo-documents");
    const uploadedBy = user.nickname || user.name || user.email;

    await prisma.bambooDocument.create({
      data: {
        objectKey: uploaded.objectKey,
        fileName: uploaded.fileName,
        contentType: uploaded.contentType,
        sizeBytes: uploaded.sizeBytes,
        uploadedBy,
      },
    });
  } catch (error) {
    console.error(
      "[bamboo-documents] Failed to upload document.",
      toLoggableError(error),
    );

    if (error instanceof Error) {
      if (error.message.includes("Missing R2 config")) {
        fail("config");
      }
      if (
        error.message.includes("No file selected") ||
        error.message.includes("Unsupported file type") ||
        error.message.includes("File too large")
      ) {
        fail("invalid-file");
      }
    }
    fail("upload");
  }

  done("uploaded");
}

export async function deleteBambooDocumentAction(formData: FormData) {
  await requireAppEdit("BAMBOO");

  const parsed = deleteSchema.safeParse({
    id: formData.get("id"),
  });
  if (!parsed.success) {
    fail("invalid");
  }
  const data = parsed.data;

  const record = await prisma.bambooDocument.findUnique({
    where: { id: data.id },
  });
  if (!record) {
    fail("missing");
  }

  try {
    await deleteDocumentFromR2(record.objectKey);
  } catch (error) {
    console.warn("[bamboo-documents] Delete in R2 failed, continuing.", {
      id: data.id,
      objectKey: record.objectKey,
      error: toLoggableError(error),
    });
  }

  await prisma.bambooDocument.delete({
    where: { id: data.id },
  });

  done("deleted");
}
