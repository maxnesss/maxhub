"use server";

import {
  HeadBucketCommand,
  ListBucketsCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";
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
  const bucket = process.env.R2_BUCKET;

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
    // Preferred for Cloudflare R2: many keys are bucket-scoped and cannot call ListBuckets.
    if (bucket) {
      await s3.send(new HeadBucketCommand({ Bucket: bucket }));
      redirectWithParams({
        r2: "ok",
        bucket,
      });
    }

    const response = await s3.send(new ListBucketsCommand({}));
    redirectWithParams({
      r2: "ok",
      buckets: String(response.Buckets?.length ?? 0),
    });
  } catch (error) {
    if (
      error instanceof S3ServiceException &&
      error.name === "AccessDenied" &&
      !bucket
    ) {
      redirectWithParams({
        r2: "access-denied",
      });
    }

    redirectWithParams({
      r2: "error",
      message: resolveErrorMessage(error).slice(0, 180),
    });
  }
}
