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
    data.length >= 5 && data.subarray(0, 5).toString("ascii") === "%PDF-",

  "image/jpeg": (data) =>
    data.length >= 3 &&
    data[0] === 0xff &&
    data[1] === 0xd8 &&
    data[2] === 0xff,

  "image/png": (data) =>
    data.length >= 8 &&
    data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),

  "image/webp": (data) =>
    data.length >= 12 &&
    data.subarray(0, 4).toString("ascii") === "RIFF" &&
    data.subarray(8, 12).toString("ascii") === "WEBP",

  "image/avif": (data) =>
    data.length >= 12 &&
    data.subarray(4, 8).toString("ascii") === "ftyp" &&
    ["avif", "avis", "mif1", "miaf"].includes(
      data.subarray(8, 12).toString("ascii"),
    ),
};

const resolveAllowedMedia = (
  declaredType: string,
  data: Buffer,
  allowed: Record<string, string>,
) => {
  if (declaredType && allowed[declaredType] && signatures[declaredType]?.(data)) {
    return { mime: declaredType, ext: allowed[declaredType] };
  }

  for (const [mime, ext] of Object.entries(allowed)) {
    if (signatures[mime]?.(data)) {
      return { mime, ext };
    }
  }

  if (declaredType && !allowed[declaredType] && declaredType !== "application/octet-stream") {
    throw new ApiError(400, "Unsupported file type");
  }

  throw new ApiError(400, "File content does not match any supported format");
};

export const saveMedia = async (
  file: File,
  allowed: Record<string, string>,
) => {
  if (!(file instanceof File) || !file.name) {
    throw new ApiError(400, "A file is required");
  }

  if (file.size <= 0) {
    throw new ApiError(400, "File is empty");
  }

  if (file.size > MAX_MEDIA_BYTES) {
    throw new ApiError(400, "File exceeds the 4 MB limit");
  }

  let data: Buffer;

  try {
    data = Buffer.from(await file.arrayBuffer());
  } catch {
    throw new ApiError(400, "Unable to read the uploaded file");
  }

  const detected = resolveAllowedMedia(file.type, data, allowed);

  if (!client) {
    throw new ApiError(503, "Media storage is not configured");
  }

  const key = `${randomUUID()}${detected.ext}`;

  try {
    const uploaded = await client.files.upload({
      file: await toFile(data, key, { type: detected.mime }),
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
