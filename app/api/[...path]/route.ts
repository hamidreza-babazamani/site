/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { connectDatabase } from "@/lib/server/db";
import {
  Admin,
  ContactMessage,
  ContactMethod,
  Experience,
  Hero,
  Language,
  Profile,
  Project,
  Resume,
  Service,
  SiteSettings,
  Stat,
  Technology,
} from "@/lib/server/models";
import {
  ApiError,
  body,
  ensureId,
  fail,
  isEmail,
  isUrl,
  json,
  localized,
  ok,
  requireAdmin,
  tokenFor,
  validateSameOrigin,
  validate,
} from "@/lib/server/api";
import { removeMedia, saveMedia } from "@/lib/server/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resources: Record<
  string,
  { model: any; key: string; fields: string[]; search: string[] }
> = {
  experiences: {
    model: Experience,
    key: "experience",
    fields: [
      "company",
      "role",
      "description",
      "startDate",
      "endDate",
      "current",
      "order",
      "isVisible",
    ],
    search: ["company", "role.fa", "role.en"],
  },
  services: {
    model: Service,
    key: "service",
    fields: ["title", "description", "icon", "image", "order", "isVisible"],
    search: ["title.fa", "title.en"],
  },
  technologies: {
    model: Technology,
    key: "technology",
    fields: ["name", "category", "icon", "iconMedia", "proficiency", "order", "isVisible"],
    search: ["name.fa", "name.en", "category"],
  },
  languages: {
    model: Language,
    key: "language",
    fields: ["name", "level", "order", "isVisible"],
    search: ["name.fa", "name.en", "level.fa", "level.en"],
  },
  projects: {
    model: Project,
    key: "project",
    fields: [
      "title",
      "slug",
      "shortDescription",
      "description",
      "technologies",
      "liveUrl",
      "repositoryUrl",
      "featured",
      "order",
      "isVisible",
    ],
    search: ["title.fa", "title.en", "slug"],
  },
  "contact-methods": {
    model: ContactMethod,
    key: "contactMethod",
    fields: ["type", "label", "value", "url", "icon", "order", "isVisible"],
    search: ["type", "label.fa", "label.en", "value"],
  },
};
const singleton: Record<string, { model: any; key: string; fields: string[] }> =
  {
    hero: {
      model: Hero,
      key: "hero",
      fields: [
        "jobTitle",
        "headline",
        "description",
        "primaryCta",
        "primaryCtaUrl",
        "isVisible",
      ],
    },
    profile: {
      model: Profile,
      key: "profile",
      fields: ["name", "bio", "location", "availability", "email"],
    },
    resume: { model: Resume, key: "resume", fields: ["title"] },
  };
const publicFields = (item: any) => {
  if (!item) return item;
  const { createdAt, updatedAt, key, updatedBy, ...rest } = item;
  return rest;
};
const publicMedia = (media: any) =>
  !media || typeof media !== "object"
    ? media
    : typeof media.url === "string" && media.url
      ? { url: media.url, ...(media.alt ? { alt: media.alt } : {}) }
      : null;
const publicContent = (item: any): any => {
  const value = publicFields(item);
  if (!value || typeof value !== "object") return value;
  if (value.image) value.image = publicMedia(value.image);
  if (value.iconMedia) value.iconMedia = publicMedia(value.iconMedia);
  if (value.file) value.file = publicMedia(value.file);
  if (Array.isArray(value.images)) value.images = value.images.map(publicMedia);
  return value;
};
const publicProfileFields = (item: any) => {
  const value = publicContent(item);
  if (!value || typeof value !== "object") return value;
  const { email: _email, ...safe } = value;
  return safe;
};
const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const queryOptions = (url: URL, allowedSort: string[] = ["order"]) => {
  const requestedSort = url.searchParams.get("sort") || "order";
  return {
    page: Math.max(1, Number(url.searchParams.get("page")) || 1),
    limit: Math.min(
      100,
      Math.max(1, Number(url.searchParams.get("limit")) || 20),
    ),
    sort: allowedSort.includes(requestedSort) ? requestedSort : "order",
    order: url.searchParams.get("order") === "desc" ? -1 : 1,
    search: url.searchParams.get("search")?.trim() || undefined,
    visible:
      url.searchParams.get("visible") === null
        ? undefined
        : url.searchParams.get("visible") === "true",
  };
};
const normalize = (value: unknown): unknown => {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalize(item)]),
    );
  return value;
};
const clean = (input: Record<string, unknown>, fields: string[]) =>
  Object.fromEntries(
    fields
      .filter((x) => Object.hasOwn(input, x))
      .map((x) => {
        const value = normalize(input[x]);
        return [
          x,
          ["liveUrl", "repositoryUrl", "url", "primaryCtaUrl"].includes(x) &&
          value === ""
            ? null
            : value,
        ];
      }),
  );
const validateStatInput = (
  input: Record<string, unknown>,
  partial = false,
) => {
  validate("stat", input, partial);
  const fields = new Set(["label", "value", "order", "isVisible"]);
  const errors: Record<string, string> = {};
  for (const key of Object.keys(input))
    if (!fields.has(key)) errors[key] = "Field is not permitted";

  if (!partial && input.label === undefined)
    errors.label = "label is required";
  if (input.label !== undefined) {
    if (!localized(input.label)) {
      errors.label = "label must contain non-empty fa and en strings";
    } else {
      const label = input.label as Record<string, unknown>;
      for (const key of Object.keys(label))
        if (key !== "fa" && key !== "en")
          errors[`label.${key}`] = "Field is not permitted";
    }
  }

  if (!partial && input.value === undefined)
    errors.value = "value is required";
  if (
    input.value !== undefined &&
    (typeof input.value !== "number" || !Number.isFinite(input.value))
  )
    errors.value = "value must be a finite number";

  if (input.order !== undefined) {
    const validOrderType =
      typeof input.order === "number" || typeof input.order === "string";
    const order = Number(input.order);
    if (
      !validOrderType ||
      (typeof input.order === "string" && !input.order.trim()) ||
      !Number.isFinite(order) ||
      order < 0
    )
      errors.order = "order must be a valid non-negative number";
  }
  if (input.isVisible !== undefined && typeof input.isVisible !== "boolean")
    errors.isVisible = "isVisible must be a boolean";

  if (partial && Object.keys(input).length === 0)
    errors.body = "At least one field is required";
  if (Object.keys(errors).length)
    throw new ApiError(400, "Validation failed", errors);
  return input;
};
const validateRecordMedia = (
  input: Record<string, unknown>,
  field: "image" | "iconMedia",
) => {
  const value = input[field];
  if (value === undefined || value === null) return;
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new ApiError(400, `${field} must be a media object or null`);

  const mediaValue = value as Record<string, unknown>;
  const allowed = new Set(["url", "key", "fileId", "alt"]);
  const errors: Record<string, string> = {};
  for (const key of Object.keys(mediaValue))
    if (!allowed.has(key)) errors[`${field}.${key}`] = "Field is not permitted";
  if (
    typeof mediaValue.url !== "string" ||
    !mediaValue.url.trim() ||
    !isUrl(mediaValue.url)
  )
    errors[`${field}.url`] = "Must be a valid http(s) URL";
  for (const key of ["key", "fileId"] as const)
    if (
      mediaValue[key] !== undefined &&
      (typeof mediaValue[key] !== "string" || !mediaValue[key].trim())
    )
      errors[`${field}.${key}`] = "Must be a non-empty string";
  if (mediaValue.alt !== undefined) {
    if (!localized(mediaValue.alt)) {
      errors[`${field}.alt`] = "Must contain non-empty fa and en strings";
    } else {
      const alt = mediaValue.alt as Record<string, unknown>;
      for (const key of Object.keys(alt))
        if (key !== "fa" && key !== "en")
          errors[`${field}.alt.${key}`] = "Field is not permitted";
    }
  }
  if (Object.keys(errors).length)
    throw new ApiError(400, "Validation failed", errors);
};
const parseForm = async (request: Request) => {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data"))
    throw new ApiError(400, "Multipart form data is required for uploads");
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw new ApiError(400, "Invalid multipart form data");
  }
  const file = form.get("file");
  const values: Record<string, unknown> = {};
  for (const [key, value] of form.entries())
    if (key !== "file") {
      try {
        values[key] = JSON.parse(value.toString());
      } catch {
        values[key] = value.toString();
      }
    }
  return { values, file: file instanceof File ? file : undefined };
};

// Keep multipart endpoints separate from the JSON resource endpoints.  In
// particular, never call body(request) before this check: a multipart stream
// can only be consumed once and request.json() produces the misleading
// "Invalid JSON body" response for an otherwise valid upload.
const isMediaRoute = (parts: string[]) =>
  Boolean(
    (parts[0] === "projects" && parts[1] && parts[2] === "images") ||
    ((parts[0] === "hero" || parts[0] === "profile") && parts[1] === "image") ||
    (parts[0] === "resume" && parts[1] === "file") ||
    (parts[0] === "site-settings" &&
      parts.length === 2 &&
      siteSettingsMediaFields.includes(parts[1] as (typeof siteSettingsMediaFields)[number])) ||
    (parts[0] === "services" && parts.length === 3 && parts[1] && parts[2] === "image") ||
    (parts[0] === "technologies" && parts.length === 3 && parts[1] && parts[2] === "icon-media"),
  );
const media = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};
const siteSettingsMediaFields = [
  "logo",
  "openGraphImage",
  "favicon",
  "fallbackImage",
] as const;
const localizedText = (value: unknown) =>
  localized(value) &&
  Boolean(
    (value as { fa: string; en: string }).fa.trim() &&
    (value as { fa: string; en: string }).en.trim(),
  );
const contactRate = new Map<string, { count: number; resetAt: number }>();
const checkContactRate = (request: Request) => {
  const key =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const current = contactRate.get(key);
  if (!current || current.resetAt <= now) {
    contactRate.set(key, { count: 1, resetAt: now + 15 * 60_000 });
    return;
  }
  if (current.count >= 10)
    throw new ApiError(429, "Too many contact messages; try again later");
  current.count += 1;
};
const loginRate = new Map<string, { count: number; resetAt: number }>();
const checkLoginRate = (request: Request, _email?: string) => {
  const key =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const current = loginRate.get(key);
  if (!current || current.resetAt <= now) {
    loginRate.set(key, { count: 1, resetAt: now + 15 * 60_000 });
    return key;
  }
  if (current.count >= 8)
    throw new ApiError(429, "Too many login attempts; try again later");
  current.count += 1;
  return key;
};

async function publicGet(parts: string[], url: URL) {
  if (parts[0] === "stats" && parts.length === 1) {
    const stats = await Stat.find({ isVisible: true })
      .sort({ order: 1 })
      .select("label value order -_id")
      .lean();
    return ok(stats);
  }
  if (parts[0] === "site-settings" && parts.length === 1) {
    const settings = await SiteSettings.findOne({ key: "default" }).lean();
    if (!settings) return ok(null);
    const safeMedia = (value: any) =>
      value && typeof value.url === "string"
        ? { url: value.url, ...(value.alt ? { alt: value.alt } : {}) }
        : null;
    return ok({
      siteName: settings.siteName,
      title: settings.title,
      description: settings.description,
      keywords: settings.keywords,
      robots: settings.robots,
      logo: safeMedia(settings.logo),
      openGraphImage: safeMedia(settings.openGraphImage),
      favicon: safeMedia(settings.favicon),
      fallbackImage: safeMedia(settings.fallbackImage),
    });
  }
  if (parts[0] === "resume" && parts[1] === "download" && parts.length === 2) {
    const resume = await Resume.findOne({ key: "default" }).select("file").lean();
    const fileUrl = resume?.file?.url;
    if (!fileUrl) throw new ApiError(404, "Resume is not available");
    let parsedUrl: URL;
    try { parsedUrl = new URL(fileUrl); } catch { throw new ApiError(404, "Resume is not available"); }
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:")
      throw new ApiError(404, "Resume is not available");
    let upstream: Response;
    try {
      upstream = await fetch(parsedUrl, { cache: "no-store", signal: AbortSignal.timeout(15_000) });
    } catch { throw new ApiError(502, "Unable to retrieve the resume"); }
    if (!upstream.ok || !upstream.body) throw new ApiError(502, "Unable to retrieve the resume");
    return new Response(upstream.body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
  if (parts[0] === "portfolio") {
    const [
      hero,
      profile,
      experiences,
      services,
      technologies,
      languages,
      projects,
      resume,
      contactMethods,
    ] = await Promise.all([
      Hero.findOne({ key: "default", isVisible: true }).lean(),
      Profile.findOne({ key: "default" }).lean(),
      Experience.find({ isVisible: true })
        .sort({ order: 1, startDate: -1 })
        .lean(),
      Service.find({ isVisible: true }).sort({ order: 1 }).lean(),
      Technology.find({ isVisible: true }).sort({ order: 1 }).lean(),
      Language.find({ isVisible: true }).sort({ order: 1 }).lean(),
      Project.find({ isVisible: true }).sort({ featured: -1, order: 1 }).lean(),
      Resume.findOne({ key: "default" }).lean(),
      ContactMethod.find({ isVisible: true }).sort({ order: 1 }).lean(),
    ]);
    return ok({
      hero: publicContent(hero),
      profile: publicProfileFields(profile),
      experiences: experiences.map(publicContent),
      services: services.map(publicContent),
      technologies: technologies.map(publicContent),
      languages: languages.map(publicFields),
      projects: projects.map(publicContent),
      resume: publicContent(resume),
      contactMethods: contactMethods.map(publicContent),
    });
  }
  if (singleton[parts[0]]) {
    const item = await singleton[parts[0]].model
      .findOne({
        key: "default",
        ...(parts[0] === "hero" ? { isVisible: true } : {}),
      })
      .lean();
    return ok(parts[0] === "profile" ? publicProfileFields(item) : publicContent(item));
  }
  const resource = resources[parts[0]];
  if (!resource || parts.length !== 1)
    throw new ApiError(
      404,
      `Route not found: GET /api/public/${parts.join("/")}`,
    );
  const q = queryOptions(
    url,
    resource.fields.filter((field) => field !== "image" && field !== "iconMedia"),
  );
  const filter: any = { isVisible: true };
  if (q.search)
    filter.$or = resource.search.map((field) => ({
      [field]: new RegExp(escapeRegex(q.search!), "i"),
    }));
  const data = await resource.model
    .find(filter)
    .sort({ [q.sort]: q.order })
    .skip((q.page - 1) * q.limit)
    .limit(q.limit)
    .select("-createdAt -updatedAt")
    .lean();
  return ok(data.map(publicContent));
}

async function adminGet(parts: string[], url: URL) {
  await requireAdmin();
  const name = parts[0];
  if (name === "stats" && parts.length === 1)
    return ok(await Stat.find({}).sort({ order: 1 }).lean());
  if (name === "site-settings" && parts.length === 1)
    return ok(await SiteSettings.findOne({ key: "default" }).lean());
  if (singleton[name] && parts.length === 1)
    return ok(await singleton[name].model.findOne({ key: "default" }).lean());
  if (name === "contact-messages" || name === "messages") {
    const filter = url.searchParams.get("status")
      ? { status: url.searchParams.get("status") }
      : {};
    if (parts[1]) {
      ensureId(parts[1], "message");
      const item = await ContactMessage.findById(parts[1]).lean();
      if (!item) throw new ApiError(404, "Message not found");
      return ok(item);
    }
    return ok(await ContactMessage.find(filter).sort({ createdAt: -1 }).lean());
  }
  const resource = resources[name];
  if (!resource) throw new ApiError(404, "Route not found");
  if (parts[1]) {
    ensureId(parts[1]);
    const item = await resource.model.findById(parts[1]).lean();
    if (!item) throw new ApiError(404, "Resource not found");
    return ok(item);
  }
  const q = queryOptions(
    url,
    resource.fields.filter((field) => field !== "image" && field !== "iconMedia"),
  );
  const filter: any = {};
  if (q.visible !== undefined) filter.isVisible = q.visible;
  if (q.search)
    filter.$or = resource.search.map((field) => ({
      [field]: new RegExp(escapeRegex(q.search!), "i"),
    }));
  const [data, total] = await Promise.all([
    resource.model
      .find(filter)
      .sort({ [q.sort]: q.order })
      .skip((q.page - 1) * q.limit)
      .limit(q.limit)
      .lean(),
    resource.model.countDocuments(filter),
  ]);
  return json({
    success: true,
    data,
    meta: {
      page: q.page,
      limit: q.limit,
      total,
      pages: Math.ceil(total / q.limit),
    },
  });
}

async function publicPost(parts: string[], request: Request) {
  if (parts[0] !== "contact-messages")
    throw new ApiError(404, "Route not found");
  checkContactRate(request);
  const input = validate("contactMessage", await body(request));
  const item = await ContactMessage.create(
    clean(input, ["name", "email", "subject", "message", "locale"]),
  );
  return json({ success: true, data: { id: item._id.toString() } }, 201);
}
async function adminWrite(parts: string[], request: Request, method: string) {
  validateSameOrigin(request, { requireOrigin: true });
  await requireAdmin();
  const name = parts[0];
  if (name === "contact-messages" || name === "messages") {
    ensureId(parts[1], "message");
    if (method === "DELETE") {
      const item = await ContactMessage.findByIdAndDelete(parts[1]);
      if (!item) throw new ApiError(404, "Message not found");
      return json({ success: true, message: "Message deleted" });
    }
    const input = await body(request);
    const update: any = {};
    if (input.status !== undefined) {
      if (
        !["new", "read", "replied", "archived"].includes(String(input.status))
      )
        throw new ApiError(400, "Invalid message status");
      update.status = input.status;
      if (input.status !== "new") update.readAt = new Date();
    }
    const item = await ContactMessage.findByIdAndUpdate(
      parts[1],
      { $set: update },
      { new: true, runValidators: true },
    ).lean();
    if (!item) throw new ApiError(404, "Message not found");
    return ok(item);
  }
  if (name === "stats") {
    if (parts.length === 1 && method === "POST") {
      const input = await body(request);
      if (!input || typeof input !== "object" || Array.isArray(input))
        throw new ApiError(400, "Invalid statistic body");
      validateStatInput(input);
      const item = await Stat.create(
        clean(input, ["label", "value", "order", "isVisible"]),
      );
      return ok(item, 201);
    }

    if (parts.length === 2 && (method === "PATCH" || method === "DELETE")) {
      ensureId(parts[1], "statistic");
      if (method === "DELETE") {
        const item = await Stat.findByIdAndDelete(parts[1]);
        if (!item) throw new ApiError(404, "Statistic not found");
        return json({ success: true, message: "Statistic deleted" });
      }

      const input = await body(request);
      if (!input || typeof input !== "object" || Array.isArray(input))
        throw new ApiError(400, "Invalid statistic body");
      validateStatInput(input, true);
      const item = await Stat.findByIdAndUpdate(
        parts[1],
        { $set: clean(input, ["label", "value", "order", "isVisible"]) },
        { new: true, runValidators: true },
      ).lean();
      if (!item) throw new ApiError(404, "Statistic not found");
      return ok(item);
    }

    throw new ApiError(405, "Method not allowed");
  }
  if (name === "site-settings" && parts.length === 1) {
    if (method !== "PATCH") throw new ApiError(405, "Method not allowed");
    const input = await body(request);
    if (!input || typeof input !== "object" || Array.isArray(input))
      throw new ApiError(400, "Invalid settings body");

    const fields = [
      "siteName",
      "title",
      "description",
      "keywords",
      "robots",
      "logo",
      "openGraphImage",
      "favicon",
      "fallbackImage",
    ] as const;
    const allowed = new Set<string>(fields);
    const errors: Record<string, string> = {};
    const update: Record<string, unknown> = {};
    for (const key of Object.keys(input))
      if (!allowed.has(key)) errors[key] = "Field is not permitted";

    const record = input as Record<string, unknown>;
    for (const key of ["siteName", "title", "description"] as const) {
      const value = record[key];
      if (value === undefined) continue;
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        errors[key] = `${key} must be a fa/en object`;
        continue;
      }
      const localizedValue = value as Record<string, unknown>;
      for (const locale of Object.keys(localizedValue))
        if (locale !== "fa" && locale !== "en")
          errors[`${key}.${locale}`] = "Locale is not permitted";
      for (const locale of ["fa", "en"] as const) {
        if (localizedValue[locale] === undefined) continue;
        if (
          typeof localizedValue[locale] !== "string" ||
          !localizedValue[locale].trim()
        )
          errors[`${key}.${locale}`] = "Must be a non-empty string";
        else update[`${key}.${locale}`] = localizedValue[locale].trim();
      }
      if (!Object.hasOwn(localizedValue, "fa") && !Object.hasOwn(localizedValue, "en"))
        errors[key] = `${key} must include fa and/or en`;
    }

    if (record.keywords !== undefined) {
      if (!record.keywords || typeof record.keywords !== "object" || Array.isArray(record.keywords)) {
        errors.keywords = "keywords must be a fa/en object";
      } else {
        const keywords = record.keywords as Record<string, unknown>;
        for (const locale of Object.keys(keywords))
          if (locale !== "fa" && locale !== "en")
            errors[`keywords.${locale}`] = "Locale is not permitted";
        for (const locale of ["fa", "en"] as const) {
          if (keywords[locale] === undefined) continue;
          if (!Array.isArray(keywords[locale]) || keywords[locale].some((item) => typeof item !== "string"))
            errors[`keywords.${locale}`] = "Must be an array of strings";
          else update[`keywords.${locale}`] = (keywords[locale] as string[]).map((item) => item.trim());
        }
        if (!Object.hasOwn(keywords, "fa") && !Object.hasOwn(keywords, "en"))
          errors.keywords = "keywords must include fa and/or en";
      }
    }

    if (record.robots !== undefined) {
      if (!record.robots || typeof record.robots !== "object" || Array.isArray(record.robots)) {
        errors.robots = "robots must be an object";
      } else {
        const robots = record.robots as Record<string, unknown>;
        for (const key of Object.keys(robots))
          if (key !== "index" && key !== "follow")
            errors[`robots.${key}`] = "Field is not permitted";
        for (const key of ["index", "follow"] as const) {
          if (robots[key] === undefined) continue;
          if (typeof robots[key] !== "boolean") errors[`robots.${key}`] = "Must be a boolean";
          else update[`robots.${key}`] = robots[key];
        }
        if (!Object.hasOwn(robots, "index") && !Object.hasOwn(robots, "follow"))
          errors.robots = "robots must include index and/or follow";
      }
    }

    for (const key of ["logo", "openGraphImage", "favicon", "fallbackImage"] as const) {
      const value = record[key];
      if (value === undefined) continue;
      if (value === null) {
        update[key] = null;
        continue;
      }
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        errors[key] = `${key} must be a media object or null`;
        continue;
      }
      const mediaValue = value as Record<string, unknown>;
      for (const field of Object.keys(mediaValue))
        if (!["url", "key", "fileId", "alt"].includes(field))
          errors[`${key}.${field}`] = "Field is not permitted";
      if (typeof mediaValue.url !== "string" || !isUrl(mediaValue.url))
        errors[`${key}.url`] = "Must be a valid http(s) URL";
      for (const field of ["key", "fileId"] as const)
        if (mediaValue[field] !== undefined && typeof mediaValue[field] !== "string")
          errors[`${key}.${field}`] = "Must be a string";
      if (mediaValue.alt !== undefined) {
        if (!mediaValue.alt || typeof mediaValue.alt !== "object" || Array.isArray(mediaValue.alt)) {
          errors[`${key}.alt`] = "alt must be a fa/en object";
        } else {
          const alt = mediaValue.alt as Record<string, unknown>;
          for (const locale of Object.keys(alt))
            if (locale !== "fa" && locale !== "en")
              errors[`${key}.alt.${locale}`] = "Locale is not permitted";
          for (const locale of ["fa", "en"] as const)
            if (alt[locale] !== undefined && typeof alt[locale] !== "string")
              errors[`${key}.alt.${locale}`] = "Must be a string";
        }
      }
      update[key] = {
        url: typeof mediaValue.url === "string" ? mediaValue.url.trim() : mediaValue.url,
        ...(typeof mediaValue.key === "string" ? { key: mediaValue.key.trim() } : {}),
        ...(typeof mediaValue.fileId === "string" ? { fileId: mediaValue.fileId.trim() } : {}),
        ...(mediaValue.alt && typeof mediaValue.alt === "object" ? { alt: mediaValue.alt } : {}),
      };
    }

    if (Object.keys(record).length === 0) errors.body = "At least one permitted field is required";
    if (Object.keys(errors).length)
      throw new ApiError(400, "Validation failed", errors);

    const item = await SiteSettings.findOneAndUpdate(
      { key: "default" },
      { $set: update, $setOnInsert: { key: "default" } },
      { upsert: true, new: true, runValidators: true },
    ).lean();
    return ok(item);
  }
  if (singleton[name] && parts.length === 1) {
    const input = validate(
      singleton[name].key,
      await body(request),
      method === "PATCH",
    );
    const item = await singleton[name].model
      .findOneAndUpdate(
        { key: "default" },
        {
          $set: clean(input, singleton[name].fields),
          $setOnInsert: { key: "default" },
        },
        { upsert: true, new: true, runValidators: true },
      )
      .lean();
    return ok(item);
  }
  const resource = resources[name];
  if (!resource) throw new ApiError(404, "Route not found");
  if (parts[1]) {
    ensureId(parts[1]);
    if (method === "DELETE") {
      const item = await resource.model.findByIdAndDelete(parts[1]);
      if (!item) throw new ApiError(404, "Resource not found");
      if (name === "projects")
        for (const image of item.images ?? [])
          await removeMediaIfUnused(image.fileId);
      if (name === "services")
        await removeMediaIfUnused(item.image?.fileId);
      if (name === "technologies")
        await removeMediaIfUnused(item.iconMedia?.fileId);
      return json({ success: true, message: "Resource deleted" });
    }
    const raw = await body(request);
    if (!raw || typeof raw !== "object" || Array.isArray(raw))
      throw new ApiError(400, "Invalid resource body");
    const input = validate(resource.key, raw, true);
    const mediaField =
      name === "services" ? "image" : name === "technologies" ? "iconMedia" : null;
    if (mediaField) validateRecordMedia(input, mediaField);
    const previous = mediaField
      ? await resource.model.findById(parts[1]).select(mediaField).lean()
      : null;
    const item = await resource.model
      .findByIdAndUpdate(
        parts[1],
        { $set: clean(input, resource.fields) },
        { new: true, runValidators: true },
      )
      .lean();
    if (!item) throw new ApiError(404, "Resource not found");
    if (mediaField) {
      const previousFileId = previous?.[mediaField]?.fileId;
      const currentFileId = item[mediaField]?.fileId;
      if (previousFileId && previousFileId !== currentFileId)
        await removeMediaIfUnused(previousFileId);
    }
    return ok(item);
  }
  const raw = await body(request);
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new ApiError(400, "Invalid resource body");
  const input = validate(resource.key, raw);
  if (name === "services") validateRecordMedia(input, "image");
  if (name === "technologies") validateRecordMedia(input, "iconMedia");
  return ok(await resource.model.create(clean(input, resource.fields)), 201);
}

async function removeMediaIfUnused(fileId?: string) {
  if (!fileId) return;
  try {
    const [project, hero, profile, resume, siteSettings, service, technology] =
      await Promise.all([
      Project.exists({ "images.fileId": fileId }),
      Hero.exists({ "image.fileId": fileId }),
      Profile.exists({ "image.fileId": fileId }),
      Resume.exists({ "file.fileId": fileId }),
      SiteSettings.exists({
        $or: [
          { "logo.fileId": fileId },
          { "openGraphImage.fileId": fileId },
          { "favicon.fileId": fileId },
          { "fallbackImage.fileId": fileId },
        ],
      }),
      Service.exists({ "image.fileId": fileId }),
      Technology.exists({ "iconMedia.fileId": fileId }),
    ]);
    if (
      !project &&
      !hero &&
      !profile &&
      !resume &&
      !siteSettings &&
      !service &&
      !technology
    )
      await removeMedia(fileId);
  } catch (error) {
    console.error("Media cleanup failed", { fileId, error });
  }
}

async function mediaWrite(parts: string[], request: Request, method: string) {
  validateSameOrigin(request, { requireOrigin: true });
  await requireAdmin();
  const kind = parts[0];
  const isProject =
    kind === "projects" && Boolean(parts[1]) && parts[2] === "images";
  const isSingleton =
    (kind === "hero" || kind === "profile") && parts[1] === "image";
  const isResume = kind === "resume" && parts[1] === "file";
  const isServiceMedia =
    kind === "services" && parts.length === 3 && parts[2] === "image";
  const isTechnologyMedia =
    kind === "technologies" && parts.length === 3 && parts[2] === "icon-media";
  const isSiteSettingsMedia =
    kind === "site-settings" &&
    parts.length === 2 &&
    siteSettingsMediaFields.includes(parts[1] as (typeof siteSettingsMediaFields)[number]);
  const isRecordMedia = isServiceMedia || isTechnologyMedia;
  const isReferenceCheckedMedia = isRecordMedia || isSiteSettingsMedia;
  if (!isProject && !isSingleton && !isResume && !isReferenceCheckedMedia)
    throw new ApiError(404, "Route not found");
  if (isResume && method === "PATCH")
    throw new ApiError(405, "Method not allowed");
  if (isReferenceCheckedMedia && method === "PATCH")
    throw new ApiError(405, "Method not allowed");
  if (method === "DELETE") {
    if (isSiteSettingsMedia) {
      const field = parts[1] as (typeof siteSettingsMediaFields)[number];
      const existing = await SiteSettings.findOne({ key: "default" })
        .select(field)
        .lean();
      if (!existing) throw new ApiError(404, "Site settings not found");
      const oldMedia = existing[field];
      if (!oldMedia) throw new ApiError(404, "Media not found");
      const item = await SiteSettings.findOneAndUpdate(
        { key: "default" },
        { $set: { [field]: null } },
        { new: true, runValidators: true },
      ).lean();
      if (!item) throw new ApiError(404, "Site settings not found");
      await removeMediaIfUnused(oldMedia.fileId);
      return ok(item);
    }
    if (isRecordMedia) {
      ensureId(parts[1], isServiceMedia ? "service" : "technology");
      const model = isServiceMedia ? Service : Technology;
      const field = isServiceMedia ? "image" : "iconMedia";
      const existing = await model.findById(parts[1]).select(field).lean();
      if (!existing) throw new ApiError(404, "Resource not found");
      const oldMedia = existing[field];
      if (!oldMedia) throw new ApiError(404, "Media not found");
      const item = await model
        .findByIdAndUpdate(
          parts[1],
          { $set: { [field]: null } },
          { new: true, runValidators: true },
        )
        .lean();
      if (!item) throw new ApiError(404, "Resource not found");
      await removeMediaIfUnused(oldMedia.fileId);
      return ok(item);
    }
    if (isProject) {
      const item = await Project.findById(parts[1]);
      if (!item) throw new ApiError(404, "Project not found");
      const index = item.images.findIndex((x: any) => x.key === parts[3]);
      if (index < 0) throw new ApiError(404, "Project image not found");
      const [image] = item.images.splice(index, 1);
      await item.save();
      await removeMediaIfUnused(image.fileId);
      return ok(item.images);
    }
    const model = isResume ? Resume : kind === "hero" ? Hero : Profile;
    const item = await model.findOne({ key: "default" });
    const field = isResume ? "file" : "image";
    if (!item?.[field]) throw new ApiError(404, "Media not found");
    const old = item[field];
    item[field] = null;
    await item.save();
    await removeMediaIfUnused(old.fileId);
    return ok(item);
  }
  if (method === "PATCH") {
    const values = await body(request);
    if (isProject) {
      const item = await Project.findById(parts[1]);
      if (!item) throw new ApiError(404, "Project not found");
      const image = item.images.find((x: any) => x.key === parts[3]);
      if (!image) throw new ApiError(404, "Project image not found");
      if (!localizedText(values.alt))
        throw new ApiError(400, "Persian and English alt text are required");
      image.alt = values.alt;
      await item.save();
      return ok(image);
    }
    const model = kind === "hero" ? Hero : Profile;
    const item = await model.findOne({ key: "default" });
    if (!item?.image) throw new ApiError(404, "Image not found");
    if (!localized(values.alt))
      throw new ApiError(400, "Alt text must contain fa and en strings");
    item.image.alt = values.alt;
    await item.save();
    return ok(item.image);
  }
  if (method !== "POST" && method !== "PUT")
    throw new ApiError(405, "Method not allowed");
  const { values, file } = await parseForm(request);
  if (!file)
    throw new ApiError(400, `A ${isResume ? "PDF" : "image"} file is required`);
  if (
    isReferenceCheckedMedia &&
    Object.keys(values).some((key) => key !== "alt")
  )
    throw new ApiError(400, "Unexpected media upload field");
  if (isReferenceCheckedMedia && values.alt !== undefined) {
    if (!localized(values.alt))
      throw new ApiError(400, "Alt text must contain non-empty fa and en strings");
    const alt = values.alt as Record<string, unknown>;
    if (Object.keys(alt).some((key) => key !== "fa" && key !== "en"))
      throw new ApiError(400, "Unexpected alt text locale");
  }
  if (isProject && !localizedText(values.alt))
    throw new ApiError(400, "Persian and English alt text are required");
  const allowed = isResume ? { "application/pdf": ".pdf" } : media;
  const item = isProject ? await Project.findById(parts[1]) : null;
  if (isProject && !item) throw new ApiError(404, "Project not found");
  const recordModel = isServiceMedia ? Service : Technology;
  const recordField = isServiceMedia ? "image" : "iconMedia";
  const record = isRecordMedia
    ? await recordModel.findById(parts[1]).select(recordField).lean()
    : null;
  if (isRecordMedia && !record)
    throw new ApiError(404, isServiceMedia ? "Service not found" : "Technology not found");
  const settingsField = isSiteSettingsMedia
    ? (parts[1] as (typeof siteSettingsMediaFields)[number])
    : null;
  const settings = settingsField
    ? await SiteSettings.findOne({ key: "default" }).select(settingsField).lean()
    : null;
  const saved = await saveMedia(file, allowed);
  const image = {
    url: saved.url,
    key: saved.key,
    fileId: saved.fileId,
    alt: localized(values.alt) ? values.alt : undefined,
  };
  try {
    if (settingsField) {
      const oldFileId = settings?.[settingsField]?.fileId;
      const updated = await SiteSettings.findOneAndUpdate(
        { key: "default" },
        { $set: { [settingsField]: image }, $setOnInsert: { key: "default" } },
        { upsert: true, new: true, runValidators: true },
      ).lean();
      if (!updated) throw new ApiError(500, "Unable to save site media");
      if (oldFileId && oldFileId !== saved.fileId)
        await removeMediaIfUnused(oldFileId);
      return json(
        { success: true, data: updated[settingsField] },
        method === "PUT" ? 200 : 201,
      );
    }
    if (isRecordMedia) {
      const oldFileId = record?.[recordField]?.fileId;
      const updated = await recordModel
        .findByIdAndUpdate(
          parts[1],
          { $set: { [recordField]: image } },
          { new: true, runValidators: true },
        )
        .lean();
      if (!updated)
        throw new ApiError(404, isServiceMedia ? "Service not found" : "Technology not found");
      if (oldFileId && oldFileId !== saved.fileId)
        await removeMediaIfUnused(oldFileId);
      return json({ success: true, data: image }, method === "PUT" ? 200 : 201);
    }
    if (isProject) {
      const index =
        method === "PUT"
          ? item!.images.findIndex((x: any) => x.key === parts[3])
          : -1;
      if (method === "PUT" && index < 0)
        throw new ApiError(404, "Project image not found");
      const oldFileId =
        method === "PUT" ? item!.images[index]?.fileId : undefined;
      if (method === "PUT") item!.images[index] = image;
      else item!.images.push(image);
      await item!.save();
      if (oldFileId && oldFileId !== saved.fileId)
        await removeMediaIfUnused(oldFileId);
      return json({ success: true, data: image }, method === "PUT" ? 200 : 201);
    }
    const model = isResume ? Resume : kind === "hero" ? Hero : Profile;
    const singletonItem =
      (await model.findOne({ key: "default" })) ??
      new model({ key: "default" });
    const field = isResume ? "file" : "image";
    const oldFileId = singletonItem[field]?.fileId;
    singletonItem[field] = isResume
      ? { url: saved.url, key: saved.key, fileId: saved.fileId }
      : image;
    if (isResume && localized(values.title)) singletonItem.title = values.title;
    await singletonItem.save();
    await removeMediaIfUnused(oldFileId);
    return json(
      { success: true, data: isResume ? singletonItem : singletonItem[field] },
      201,
    );
  } catch (error) {
    if (isReferenceCheckedMedia) await removeMediaIfUnused(saved.fileId);
    else await removeMedia(saved.fileId);
    throw error;
  }
}

async function handler(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const parts = path;
  await connectDatabase();
  const url = new URL(request.url);
  if (parts[0] === "health" && request.method === "GET") {
    const ready =
      (await import("mongoose")).default.connection.readyState === 1;
    return json(
      { success: ready, message: "Backend is running 🚀" },
      ready ? 200 : 503,
    );
  }
  if (parts[0] === "auth") {
    if (parts[1] === "login" && request.method === "POST") {
      validateSameOrigin(request, { requireOrigin: true });
      const input = await body(request);
      if (
        typeof input.email !== "string" ||
        typeof input.password !== "string" ||
        !input.email.trim() ||
        !input.password
      )
        throw new ApiError(400, "Email and password are required");
      const email = input.email.trim().toLowerCase();
      const rateKey = checkLoginRate(request, email);
      const admin = await Admin.findOne({ email }).select("+passwordHash");
      if (!admin || !(await bcrypt.compare(input.password, admin.passwordHash)))
        throw new ApiError(401, "Invalid email or password");
      loginRate.delete(rateKey);
      const safe = {
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
      };
      (await cookies()).set("admin_token", tokenFor(safe), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      return json({ success: true, admin: safe });
    }
    if (parts[1] === "logout" && request.method === "POST") {
      validateSameOrigin(request, { requireOrigin: true });
      (await cookies()).set("admin_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(0),
        path: "/",
      });
      return json({ success: true, message: "Logged out successfully" });
    }
    if (parts[1] === "me" && request.method === "GET")
      return json({ success: true, admin: await requireAdmin() });
    throw new ApiError(404, "Route not found");
  }
  if (parts[0] === "public")
    return request.method === "GET"
      ? publicGet(parts.slice(1), url)
      : request.method === "POST"
        ? publicPost(parts.slice(1), request)
        : Promise.reject(new ApiError(405, "Method not allowed"));
  if (parts[0] === "admin") {
    const sub = parts.slice(1);
    if (
      isMediaRoute(sub) &&
      ["POST", "PATCH", "DELETE", "PUT"].includes(request.method)
    )
      return mediaWrite(sub, request, request.method);
    if (request.method === "GET") return adminGet(sub, url);
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method))
      return adminWrite(sub, request, request.method);
  }
  throw new ApiError(404, `Route not found: ${request.method} ${url.pathname}`);
}
const wrap =
  (fn: typeof handler) =>
  async (request: Request, context: { params: Promise<{ path: string[] }> }) => {
    try {
      const response = await fn(request, context);
      const { path } = await context.params;
      if (path[0] === "admin" && request.method !== "GET") {
        // محتوای عمومی پس از تغییر موفق پنل باید در مسیرهای فارسی و انگلیسی تازه شود.
        // این invalidation فقط هنگام mutation اجرا می‌شود و caching عمومی را خاموش نمی‌کند.
        revalidatePath("/fa", "layout");
        revalidatePath("/en", "layout");
      }
      return response;
    } catch (error) {
      return fail(error);
    }
  };
const route = async (
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) => {
  const { path } = await context.params;
  if (request.method === "GET" && path.length === 1 && path[0] === "health") {
    try {
      await connectDatabase();
      return json({ success: true, message: "Backend is running 🚀" });
    } catch {
      return json({ success: false, message: "Database is unavailable" }, 503);
    }
  }
  return handler(request, context);
};
export const GET = wrap(route);
export const POST = wrap(handler);
export const PUT = wrap(handler);
export const PATCH = wrap(handler);
export const DELETE = wrap(handler);
