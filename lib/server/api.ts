import "server-only";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { isValidObjectId } from "mongoose";
import { env, requiredEnv } from "./env";
import { Admin } from "./models";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: Record<string, string>,
  ) {
    super(message);
  }
}
export const json = (data: unknown, status = 200) =>
  Response.json(data, { status });
export const ok = (data: unknown, status = 200) =>
  json({ success: true, data }, status);
export const fail = (error: unknown) => {
  if (error instanceof ApiError)
    return json(
      {
        success: false,
        message: error.message,
        ...(error.details ? { errors: error.details } : {}),
      },
      error.status,
    );
  if ((error as { code?: number })?.code === 11000)
    return json({ success: false, message: "Resource already exists" }, 409);
  if ((error as { name?: string })?.name === "ValidationError")
    return json({ success: false, message: "Validation failed" }, 400);
  console.error(error);
  return json({ success: false, message: "Internal server error" }, 500);
};
export const body = async (request: Request) => {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    throw new ApiError(400, "Invalid JSON body");
  }
};

/**
 * اعتبارسنجی Origin برای درخواست‌های تغییر‌دهنده وضعیت.
 * Origin مورد انتظار از URL خود Request ساخته می‌شود و به Host ارسالی کاربر
 * اعتماد نمی‌کنیم. برای endpointهای وابسته به کوکی، نبودن Origin نیز رد می‌شود؛
 * بنابراین مرورگر یا کلاینت داخلی باید صراحتاً همان origin را ارسال کند.
 * endpointهای عمومیِ بدون نشست می‌توانند این بررسی را اختیاری نگه دارند.
 */
export const validateSameOrigin = (
  request: Request,
  options: { requireOrigin?: boolean } = {},
) => {
  const origin = request.headers.get("origin");
  if (!origin) {
    if (options.requireOrigin) throw new ApiError(403, "Origin is required");
    return;
  }

  let expected: string;
  let received: string;
  try {
    expected = new URL(request.url).origin;
    received = new URL(origin).origin;
  } catch {
    throw new ApiError(403, "Invalid origin");
  }
  if (received !== expected) throw new ApiError(403, "Invalid origin");
};
export const safeAdmin = (admin: {
  _id: { toString(): string };
  email: string;
  role: string;
}) => ({ id: admin._id.toString(), email: admin.email, role: admin.role });
export const tokenFor = (admin: ReturnType<typeof safeAdmin>) =>
  jwt.sign({ sub: admin.id, role: admin.role }, requiredEnv("JWT_SECRET"), {
    algorithm: "HS256",
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
export const requireAdmin = async () => {
  const token = (await cookies()).get("admin_token")?.value;
  if (!token) throw new ApiError(401, "Authentication required");
  let payload: string | jwt.JwtPayload;
  try {
    payload = jwt.verify(token, requiredEnv("JWT_SECRET"), {
      algorithms: ["HS256"],
    });
  } catch {
    throw new ApiError(401, "Authentication required");
  }
  if (typeof payload !== "object" || typeof payload.sub !== "string")
    throw new ApiError(401, "Authentication required");

  // خطاهای اعتبارسنجی توکن باید ۴۰۱ باشند؛ خطاهای پایگاه‌داده عمداً عبور می‌کنند.
  const admin = await Admin.findById(payload.sub).select("email role").lean();
  if (!admin || admin.role !== "admin")
    throw new ApiError(401, "Authentication required");
  return safeAdmin(admin);
};

/** نشست مدیر برای Server Componentها؛ توکن هرگز به کلاینت برگردانده نمی‌شود. */
export const getAdminSession = async () => {
  try {
    return await requireAdmin();
  } catch (error) {
    // فقط نشست نامعتبر null می‌شود و خطاهای غیرمنتظره سرور حفظ می‌شوند.
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
};
export const ensureId = (id: string, label = "resource") => {
  if (!isValidObjectId(id)) throw new ApiError(400, `Invalid ${label} id`);
};
export const localized = (v: unknown) =>
  Boolean(
    v &&
    typeof v === "object" &&
    typeof (v as Record<string, unknown>).fa === "string" &&
    typeof (v as Record<string, unknown>).en === "string" &&
    Boolean((v as Record<string, string>).fa.trim()) &&
    Boolean((v as Record<string, string>).en.trim()),
  );
export const isEmail = (v: unknown) =>
  typeof v === "string" &&
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) &&
  v.length <= 254;
export const isUrl = (v: unknown) => {
  try {
    const u = new URL(String(v));
    return (
      (u.protocol === "http:" || u.protocol === "https:") &&
      String(v).length <= 2048
    );
  } catch {
    return false;
  }
};
export const validate = (
  resource: string,
  input: Record<string, unknown>,
  partial = false,
) => {
  const errors: Record<string, string> = {};
  const required = (key: string) => !partial || input[key] !== undefined;
  const local = {
    hero: ["jobTitle", "headline", "description", "primaryCta"],
    profile: ["name", "bio", "location", "availability"],
    experience: ["role", "description"],
    service: ["title", "description"],
    technology: ["name"],
    language: ["name", "level"],
    project: ["title", "shortDescription", "description"],
    contactMethod: ["label"],
    resume: ["title"],
  }[resource] ?? [];
  const requiredLocalized = new Set(
    ({
      hero: ["jobTitle", "headline"],
      profile: ["name", "bio"],
      experience: ["role"],
      service: ["title", "description"],
      technology: ["name"],
      language: ["name", "level"],
      project: ["title"],
      contactMethod: [],
    } as Record<string, string[]>)[resource] ?? [],
  );
  const hasLocalizedContent = (value: unknown) =>
    Boolean(
      value &&
        typeof value === "object" &&
        (["fa", "en"] as const).some((key) =>
          Boolean(String((value as Record<string, unknown>)[key] ?? "").trim()),
        ),
    );
  for (const key of local)
    if (
      (requiredLocalized.has(key) && required(key) ||
        (input[key] !== undefined && hasLocalizedContent(input[key]))) &&
      !localized(input[key])
    )
      errors[key] = `${key} must contain non-empty fa and en strings`;
  if (resource === "contactMessage") {
    if (typeof input.name !== "string" || !input.name.trim())
      errors.name = "name is required";
    if (!isEmail(input.email)) errors.email = "email must be valid";
    if (typeof input.message !== "string" || !input.message.trim())
      errors.message = "message is required";
    if (
      input.locale !== undefined &&
      input.locale !== "fa" &&
      input.locale !== "en"
    )
      errors.locale = "locale must be fa or en";
  }
  if (
    resource === "experience" &&
    required("company") &&
    (typeof input.company !== "string" || !input.company.trim())
  )
    errors.company = "company is required";
  if (
    resource === "project" &&
    required("slug") &&
    (typeof input.slug !== "string" || !input.slug.trim())
  )
    errors.slug = "slug is required";
  if (
    resource === "profile" &&
    input.email !== undefined &&
    input.email !== null &&
    input.email !== "" &&
    !isEmail(input.email)
  )
    errors.email = "email must be valid";
  const numeric = (key: string, min?: number, max?: number) => {
    if (input[key] === undefined || input[key] === null || input[key] === "") return;
    const value = Number(input[key]);
    if (!Number.isFinite(value) || (min !== undefined && value < min) || (max !== undefined && value > max))
      errors[key] = `${key} must be a valid number`;
  };
  numeric("order", 0);
  if (resource === "technology") numeric("proficiency", 0, 100);
  const textRequired = (key: string) => {
    if (required(key) && (typeof input[key] !== "string" || !input[key].trim()))
      errors[key] = `${key} is required`;
  };
  if (resource === "project") {
    if (typeof input.slug === "string" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug.trim()))
      errors.slug = "slug must contain lowercase letters, numbers, and hyphens";
  }
  if (resource === "experience") {
    if (required("startDate") && (typeof input.startDate !== "string" || Number.isNaN(Date.parse(input.startDate))))
      errors.startDate = "startDate must be a valid date";
    if (input.endDate !== undefined && input.endDate !== null && input.endDate !== "" && (typeof input.endDate !== "string" || Number.isNaN(Date.parse(input.endDate))))
      errors.endDate = "endDate must be a valid date";
    if (input.current === true && input.endDate) errors.endDate = "endDate must be empty for a current experience";
  }
  if (resource === "contactMethod" && input.type !== undefined && typeof input.type !== "string")
    errors.type = "type is required";
  if (
    resource === "contactMethod" &&
    input.type === "email" &&
    typeof input.value === "string" &&
    !isEmail(input.value.trim())
  )
    errors.value = "value must be a valid email";
  for (const key of ["company", "type", "value"])
    if (resource === "contactMethod" ? ["type", "value"].includes(key) : resource === "experience" && key === "company") textRequired(key);
  for (const key of ["liveUrl", "repositoryUrl", "url", "primaryCtaUrl"])
    if (
      input[key] !== undefined &&
      input[key] !== null &&
      !(typeof input[key] === "string" && input[key].trim() === "") &&
      !isUrl(input[key])
    )
      errors[key] = `${key} must be an http(s) URL`;
  if (Object.keys(errors).length)
    throw new ApiError(400, "Validation failed", errors);
  return input;
};
export const hashPassword = (password: string) => bcrypt.hash(password, 12);
