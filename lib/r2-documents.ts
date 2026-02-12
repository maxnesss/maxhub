import { randomUUID } from "node:crypto";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const MAX_DOCUMENT_SIZE_BYTES = 25 * 1024 * 1024;
const ALLOWED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown",
  "text/csv",
]);

function getR2Config() {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      "Missing R2 config. Set R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET.",
    );
  }

  return {
    endpoint,
    bucket,
    accessKeyId,
    secretAccessKey,
  };
}

function getR2Client() {
  const { endpoint, accessKeyId, secretAccessKey } = getR2Config();

  return new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}

export function validateDocumentFile(file: File) {
  if (!file || file.size === 0) {
    throw new Error("No file selected.");
  }

  if (!ALLOWED_DOCUMENT_TYPES.has(file.type)) {
    throw new Error("Unsupported file type.");
  }

  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    throw new Error("File too large. Max size is 25 MB.");
  }
}

export async function uploadDocumentToR2(file: File, prefix: string) {
  validateDocumentFile(file);

  const { bucket, endpoint } = getR2Config();
  const s3 = getR2Client();

  const safeName = sanitizeFileName(file.name || "document");
  const objectKey = `${prefix}/${Date.now()}-${randomUUID()}-${safeName}`;
  const body = Buffer.from(await file.arrayBuffer());

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        Body: body,
        ContentType: file.type,
      }),
    );
  } catch (error) {
    const message =
      error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error("[r2-documents] PutObject failed.", {
      bucket,
      endpointHost: new URL(endpoint).host,
      objectKey,
      contentType: file.type,
      sizeBytes: file.size,
      error: message,
    });
    throw error;
  }

  return {
    objectKey,
    fileName: file.name,
    contentType: file.type,
    sizeBytes: file.size,
  };
}

export async function deleteDocumentFromR2(objectKey: string) {
  const { bucket, endpoint } = getR2Config();
  const s3 = getR2Client();

  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: objectKey,
      }),
    );
  } catch (error) {
    const message =
      error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error("[r2-documents] DeleteObject failed.", {
      bucket,
      endpointHost: new URL(endpoint).host,
      objectKey,
      error: message,
    });
    throw error;
  }
}

export async function getSignedDocumentUrl(objectKey: string, expiresIn = 10 * 60) {
  const { bucket } = getR2Config();
  const s3 = getR2Client();

  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: bucket,
      Key: objectKey,
    }),
    { expiresIn },
  );
}
