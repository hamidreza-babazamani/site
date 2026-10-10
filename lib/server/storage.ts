import "server-only";
import { randomUUID } from "node:crypto";
import ImageKit, { toFile } from "@imagekit/nodejs";
import { env, hasImageKit } from "./env";
import { ApiError } from "./api";

export const MAX_MEDIA_BYTES = 4 * 1024 * 1024;

const client = hasImageKit
  ? new ImageKit({ privateKey: env.imageKitPrivateKey! })
  : null;

const signatures: Record<string, (data: Buffer) => boolean> = {
  "application/pdf": (data) =>
    data.subarray(0, 5).toString("ascii") === "%PDF-",

  "image/jpeg": (data) =>
    data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff,

  "image/png": (data) =>
    data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),

  "image/webp": (data) =>
    data.subarray(0, 4).toString("ascii") === "RIFF" &&
    data.subarray(8, 12).toString("ascii") === "WEBP",

  "image/avif": (data) =>
    data.subarray(4, 12).toString("ascii").includes("ftyp") ||
    data.subarray(8, 12).toString("ascii") === "avif",
};

export const saveMedia = async (
  file: File,
  allowed: Record<string, string>,
) => {
  if (!(file instanceof File) || !file.name) {
    throw new ApiError(400, "A file is required");
  }

  const ext = allowed[file.type];

  if (!ext) {
    throw new ApiError(400, "Unsupported file type");
  }

  if (file.size <= 0) {
    throw new ApiError(400, "File is empty");
  }

  if (file.size > MAX_MEDIA_BYTES) {
    throw new ApiError(400, "File exceeds the 4 MB limit");
  }

  if (!client) {
    throw new ApiError(503, "Media storage is not configured");
  }

  let data: Buffer;

  try {
    data = Buffer.from(await file.arrayBuffer());
  } catch {
    throw new ApiError(400, "Unable to read the uploaded file");
  }

  const signature = signatures[file.type];

  if (signature && !signature(data)) {
    throw new ApiError(400, "File content does not match its MIME type");
  }

  const key = `${randomUUID()}${ext}`;

  try {
    const uploaded = await client.files.upload({
      file: await toFile(data, key, { type: file.type }),
      fileName: key,
      useUniqueFileName: false,
    });
    if (!uploaded.fileId || !uploaded.url) throw new Error("Incomplete upload response");

    return {
      key,
      fileId: uploaded.fileId,
      url: uploaded.url,
      size: data.byteLength,
    };
  } catch (error) {
    console.error("Media upload failed", error);
    throw new ApiError(502, "Unable to store the uploaded file");
  }
};

export const removeMedia = async (fileId?: string) => {
  if (!fileId || !client) return;
  await client.files.delete(fileId);
};
