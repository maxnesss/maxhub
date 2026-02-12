import { randomUUID } from "node:crypto";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
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

function extensionForType(contentType: string) {
  switch (contentType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/avif":
      return "avif";
    default:
      return "bin";
  }
}

export function validateImageFile(file: File) {
  if (!file || file.size === 0) {
    throw new Error("No file selected.");
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Unsupported image type. Use JPG, PNG, WEBP, GIF, or AVIF.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Image too large. Max size is 5 MB.");
  }
}

export async function uploadImageToR2(file: File, prefix: string) {
  validateImageFile(file);

  const { bucket, endpoint } = getR2Config();
  const s3 = getR2Client();

  const extension = extensionForType(file.type);
  const objectKey = `${prefix}/${Date.now()}-${randomUUID()}.${extension}`;
  const body = Buffer.from(await file.arrayBuffer());

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        Body: body,
        ContentType: file.type,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
  } catch (error) {
    const message =
      error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error("[r2-images] PutObject failed.", {
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

export async function deleteImageFromR2(objectKey: string) {
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
    console.error("[r2-images] DeleteObject failed.", {
      bucket,
      endpointHost: new URL(endpoint).host,
      objectKey,
      error: message,
    });
    throw error;
  }
}

export async function getSignedImageUrl(objectKey: string, expiresIn = 60 * 60) {
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
