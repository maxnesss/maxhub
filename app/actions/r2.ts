"use server";

import { ListBucketsCommand, S3Client } from "@aws-sdk/client-s3";
import { redirect } from "next/navigation";

function redirectWithParams(params: Record<string, string>): never {
  const searchParams = new URLSearchParams(params);
  redirect(`/?${searchParams.toString()}`);
}

function resolveErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown R2 connection error.";
}

export async function checkR2ConnectionAction() {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    redirectWithParams({
      r2: "missing-env",
    });
  }

  const s3 = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  try {
    const response = await s3.send(new ListBucketsCommand({}));
    redirectWithParams({
      r2: "ok",
      buckets: String(response.Buckets?.length ?? 0),
    });
  } catch (error) {
    redirectWithParams({
      r2: "error",
      message: resolveErrorMessage(error).slice(0, 180),
    });
  }
}
