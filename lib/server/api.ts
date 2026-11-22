import "server-only";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { isValidObjectId } from "mongoose";
import { env, requiredEnv } from "./env";
import { Admin, RESUME_SECTION_KEYS } from "./models";
import { connectDatabase } from "./db-core";
import { validateHeroTechnologyEcosystem } from "./hero-technology-config";
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
  if ((error as { name?: string })?.name === "CastError")
    return json({ success: false, message: "Invalid resource identifier" }, 400);
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
const addHostVariants = (
  origins: Set<string>,
  rawHost: string | null | undefined,
  protocols: string[],
) => {
  const host = rawHost?.split(",")[0]?.trim();
  if (!host) return;
  for (const protocol of protocols) {
    try {
      const parsed = new URL(`${protocol}//${host}`);
      origins.add(parsed.origin);
      if (parsed.hostname.startsWith("www.")) {
        const apexHost = parsed.port
          ? `${parsed.hostname.slice(4)}:${parsed.port}`
          : parsed.hostname.slice(4);
        origins.add(new URL(`${protocol}//${apexHost}`).origin);
      } else if (!["localhost", "127.0.0.1", "::1"].includes(parsed.hostname)) {
        const wwwHost = parsed.port
          ? `www.${parsed.hostname}:${parsed.port}`
          : `www.${parsed.hostname}`;
        origins.add(new URL(`${protocol}//${wwwHost}`).origin);
      }
    } catch {
      // Ignore malformed proxy host headers.
    }
  }
};

const addConfiguredOrigin = (
  origins: Set<string>,
  rawUrl: string | undefined,
) => {
  const value = rawUrl?.trim();
  if (!value) return;
  try {
    const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const parsed = new URL(withScheme);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return;
    addHostVariants(origins, parsed.host, [parsed.protocol]);
  } catch {
    // Ignore malformed environment URLs.
  }
};

export const validateSameOrigin = (
  request: Request,
  options: { requireOrigin?: boolean } = {},
) => {
  const allowedOrigins = new Set<string>();
  let requestUrl: URL | null = null;
  try {
    requestUrl = new URL(request.url);
    allowedOrigins.add(requestUrl.origin);
  } catch {
    // Ignore malformed request URL.
  }

  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();
  const protocols = new Set<string>(["https:"]);
  if (forwardedProto === "http" || forwardedProto === "https") {
    protocols.add(`${forwardedProto}:`);
  }
  if (requestUrl?.protocol === "http:" || requestUrl?.protocol === "https:") {
    protocols.add(requestUrl.protocol);
  }

  addHostVariants(
    allowedOrigins,
    request.headers.get("x-forwarded-host"),
    [...protocols],
  );
  addHostVariants(allowedOrigins, request.headers.get("host"), [...protocols]);

  const forwarded = request.headers.get("forwarded");
  const forwardedHostMatch = forwarded?.match(/(?:^|[;,])\s*host=([^;,\s]+)/i);
  if (forwardedHostMatch?.[1]) {
    addHostVariants(
      allowedOrigins,
      forwardedHostMatch[1].replace(/^"|"$/g, ""),
      [...protocols],
    );
  }

  addConfiguredOrigin(allowedOrigins, process.env.NEXT_PUBLIC_SITE_URL);
  addConfiguredOrigin(allowedOrigins, process.env.VERCEL_URL);
  addConfiguredOrigin(
    allowedOrigins,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  );

  const secFetchSite = request.headers.get("sec-fetch-site")?.trim().toLowerCase();
  if (secFetchSite === "cross-site") {
    throw new ApiError(403, "Cross-site requests are forbidden");
  }

  const origin = request.headers.get("origin");
  if (!origin) {
    const referer = request.headers.get("referer");
    if (referer) {
      try {
        if (allowedOrigins.has(new URL(referer).origin)) return;
      } catch {
        throw new ApiError(403, "Invalid referer");
      }
      throw new ApiError(403, "Invalid referer");
    }
    if (secFetchSite === "same-origin") return;
    if (options.requireOrigin) throw new ApiError(403, "Origin is required");
    return;
  }

  let received: string;
  try {
    received = new URL(origin).origin;
  } catch {
    throw new ApiError(403, "Invalid origin");
  }
  if (!allowedOrigins.has(received)) {
    throw new ApiError(403, "Invalid origin");
  }
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

  if (!token) {
    throw new ApiError(401, "Authentication required");
  }

  let payload: string | jwt.JwtPayload;

  try {
    payload = jwt.verify(token, requiredEnv("JWT_SECRET"), {
      algorithms: ["HS256"],
    });
  } catch {
    throw new ApiError(401, "Authentication required");
  }

  if (typeof payload !== "object" || typeof payload.sub !== "string") {
    throw new ApiError(401, "Authentication required");
  }

  // ابتدا اتصال MongoDB را برقرار می‌کنیم.
  await connectDatabase();

  // سپس اطلاعات ادمین را از دیتابیس دریافت می‌کنیم.
  const admin = await Admin.findById(payload.sub).select("email role").lean();

  if (!admin || admin.role !== "admin") {
    throw new ApiError(401, "Authentication required");
  }

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
  const local =
    {
      hero: ["jobTitle", "headline", "description", "primaryCta"],
      profile: ["name", "bio", "location", "availability"],
      experience: ["role", "description"],
      service: ["title", "description"],
      technology: ["name"],
      language: ["name", "level"],
      project: ["title", "shortDescription", "description"],
      contactMethod: ["label"],
      resume: ["title"],
      education: ["institution", "degree", "fieldOfStudy", "location", "description"],
    }[resource] ?? [];
  const requiredLocalized = new Set(
    (
      {
        hero: ["jobTitle", "headline"],
        profile: ["name", "bio"],
        experience: ["role"],
        service: ["title", "description"],
        technology: ["name"],
        language: ["name", "level"],
        project: ["title"],
        education: ["institution", "degree"],
        contactMethod: [],
      } as Record<string, string[]>
    )[resource] ?? [],
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
      ((requiredLocalized.has(key) && required(key)) ||
        (input[key] !== undefined && hasLocalizedContent(input[key]))) &&
      !localized(input[key])
    )
      errors[key] = `${key} must contain non-empty fa and en strings`;
  if (resource === "contactMessage") {
    if (
      typeof input.name !== "string" ||
      !input.name.trim() ||
      input.name.trim().length > 120
    )
      errors.name = "name is required";
    const hasEmail = typeof input.email === "string" && input.email.trim() !== "";
    const hasPhone = typeof input.phone === "string" && input.phone.trim() !== "";
    if (!hasEmail && !hasPhone)
      errors.email = "email or phone is required";
    if (hasEmail && !isEmail(String(input.email).trim()))
      errors.email = "email must be valid";
    if (
      hasPhone &&
      !/^[+\d][\d\s().-]{5,30}$/.test(String(input.phone).trim())
    )
      errors.phone = "phone must be valid";
    for (const key of ["projectType", "budget", "timeline", "subject"] as const) {
      if (
        input[key] !== undefined &&
        input[key] !== null &&
        (typeof input[key] !== "string" || input[key].trim().length > 200)
      )
        errors[key] = `${key} must be a valid string`;
    }
    if (
      input.source !== undefined &&
      input.source !== "contact_form" &&
      input.source !== "collaboration_modal"
    )
      errors.source = "invalid message source";
    if (
      typeof input.message !== "string" ||
      !input.message.trim() ||
      input.message.trim().length > 5000
    )
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
    if (input[key] === undefined || input[key] === null || input[key] === "")
      return;
    const value = Number(input[key]);
    if (
      !Number.isFinite(value) ||
      (min !== undefined && value < min) ||
      (max !== undefined && value > max)
    )
      errors[key] = `${key} must be a valid number`;
  };
  numeric("order", 0);
  if (resource === "technology") numeric("proficiency", 0, 100);
  const textRequired = (key: string) => {
    if (required(key) && (typeof input[key] !== "string" || !input[key].trim()))
      errors[key] = `${key} is required`;
  };
  if (resource === "project") {
    if (
      typeof input.slug === "string" &&
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug.trim())
    )
      errors.slug = "slug must contain lowercase letters, numbers, and hyphens";
    if (
      input.technologies !== undefined &&
      (!Array.isArray(input.technologies) ||
        input.technologies.some((item) => typeof item !== "string"))
    )
      errors.technologies = "technologies must be an array of strings";
    if (input.featured !== undefined && typeof input.featured !== "boolean")
      errors.featured = "featured must be a boolean";
  }
  if (
    input.isVisible !== undefined &&
    typeof input.isVisible !== "boolean" &&
    resource !== "contactMessage"
  )
    errors.isVisible = "isVisible must be a boolean";
  if (resource === "experience") {
    if (
      required("startDate") &&
      (typeof input.startDate !== "string" ||
        Number.isNaN(Date.parse(input.startDate)))
    )
      errors.startDate = "startDate must be a valid date";
    if (
      input.endDate !== undefined &&
      input.endDate !== null &&
      input.endDate !== "" &&
      (typeof input.endDate !== "string" ||
        Number.isNaN(Date.parse(input.endDate)))
    )
      errors.endDate = "endDate must be a valid date";
    if (
      typeof input.startDate === "string" &&
      typeof input.endDate === "string" &&
      input.endDate.trim() !== "" &&
      Date.parse(input.endDate) < Date.parse(input.startDate)
    )
      errors.endDate = "endDate must not be before startDate";
    if (input.current === true && input.endDate)
      errors.endDate = "endDate must be empty for a current experience";
  }
  if (resource === "education") {
    for (const key of ["startDate", "endDate"] as const) {
      const value = input[key];
      if (
        value !== undefined && value !== null && value !== "" &&
        (typeof value !== "string" || Number.isNaN(Date.parse(value)))
      )
        errors[key] = `${key} must be a valid date`;
    }
    if (input.current !== undefined && typeof input.current !== "boolean")
      errors.current = "current must be a boolean";
    if (
      typeof input.startDate === "string" &&
      typeof input.endDate === "string" &&
      Date.parse(input.endDate) < Date.parse(input.startDate)
    )
      errors.endDate = "endDate must not be before startDate";
    if (input.current === true && input.endDate)
      errors.endDate = "endDate must be empty for current education";
    if (input.isVisible !== undefined && typeof input.isVisible !== "boolean")
      errors.isVisible = "isVisible must be a boolean";
  }
  if (
    resource === "contactMethod" &&
    input.type !== undefined &&
    typeof input.type !== "string"
  )
    errors.type = "type is required";
  if (
    resource === "contactMethod" &&
    input.type === "email" &&
    typeof input.value === "string" &&
    !isEmail(input.value.trim())
  )
    errors.value = "value must be a valid email";
  if (resource === "hero" && input.technologyEcosystem !== undefined) {
    Object.assign(errors, validateHeroTechnologyEcosystem(input.technologyEcosystem));
  }
  for (const key of ["company", "type", "value"])
    if (
      resource === "contactMethod"
        ? ["type", "value"].includes(key)
        : resource === "experience" && key === "company"
    )
      textRequired(key);
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

const resumeReferenceFields = [
  "experienceIds",
  "projectIds",
  "technologyIds",
  "educationIds",
  "languageIds",
  "contactMethodIds",
] as const;

export const validateResumeComposition = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new ApiError(400, "Invalid resume composition");

  const input = value as Record<string, unknown>;
  const allowed = new Set([
    "professionalSummary",
    "sectionOrder",
    "sectionVisibility",
    ...resumeReferenceFields,
  ]);
  const errors: Record<string, string> = {};
  for (const key of Object.keys(input))
    if (!allowed.has(key)) errors[key] = "Field is not permitted";

  const summary = input.professionalSummary;
  if (
    !summary || typeof summary !== "object" || Array.isArray(summary) ||
    Object.keys(summary).some((key) => key !== "fa" && key !== "en") ||
    ["fa", "en"].some((key) => typeof (summary as Record<string, unknown>)[key] !== "string")
  ) {
    errors.professionalSummary = "professionalSummary must contain fa and en strings";
  } else {
    const localizedSummary = summary as { fa: string; en: string };
    if (
      Boolean(localizedSummary.fa.trim()) !== Boolean(localizedSummary.en.trim())
    )
      errors.professionalSummary = "Enter both locales or leave both empty";
  }

  const sectionOrder = input.sectionOrder;
  if (
    !Array.isArray(sectionOrder) ||
    sectionOrder.length !== RESUME_SECTION_KEYS.length ||
    new Set(sectionOrder).size !== RESUME_SECTION_KEYS.length ||
    !RESUME_SECTION_KEYS.every((key) =>
      (sectionOrder as unknown[]).includes(key),
    )
  )
    errors.sectionOrder = "sectionOrder must contain every section exactly once";

  const visibility = input.sectionVisibility;
  if (!visibility || typeof visibility !== "object" || Array.isArray(visibility)) {
    errors.sectionVisibility = "sectionVisibility must define every section";
  } else {
    const values = visibility as Record<string, unknown>;
    for (const key of Object.keys(values))
      if (!(RESUME_SECTION_KEYS as readonly string[]).includes(key))
        errors[`sectionVisibility.${key}`] = "Section is not permitted";
    for (const key of RESUME_SECTION_KEYS)
      if (typeof values[key] !== "boolean")
        errors[`sectionVisibility.${key}`] = "Must be a boolean";
  }

  for (const field of resumeReferenceFields) {
    const ids = input[field];
    if (!Array.isArray(ids)) {
      errors[field] = `${field} must be an array of record IDs`;
      continue;
    }
    if (ids.some((id) => typeof id !== "string" || !isValidObjectId(id)))
      errors[field] = `${field} must contain valid record IDs`;
    else if (new Set(ids).size !== ids.length)
      errors[field] = `${field} must not contain duplicate IDs`;
  }

  if (Object.keys(errors).length)
    throw new ApiError(400, "Validation failed", errors);
  return input;
};
export const hashPassword = (password: string) => bcrypt.hash(password, 12);
