import type { ReactNode } from "react";
import { requestAdmin } from "@/lib/api/requests/admin";

export type Localized = { fa: string; en: string };
export type ResourceKey =
  | "projects"
  | "technologies"
  | "experiences"
  | "services"
  | "languages"
  | "contact-methods";
export type Section = string;
export type Item = Record<string, unknown> & { _id?: string };

export type AdminError = Error & {
  code?: number;
  errors?: Record<string, string>;
};

export const emptyLocalized = (): Localized => ({ fa: "", en: "" });
export const localized = (value: unknown): Localized => ({
  fa: (value as Partial<Localized> | undefined)?.fa ?? "",
  en: (value as Partial<Localized> | undefined)?.en ?? "",
});
export const text = (value: unknown, locale: string) =>
  value && typeof value === "object"
    ? (value as Record<string, unknown>)[locale] ||
      (value as Partial<Localized>).en ||
      (value as Partial<Localized>).fa ||
      ""
    : (value ?? "");

export const defaultFor = (key: ResourceKey): Item => ({
  ...(key === "projects"
    ? {
        title: emptyLocalized(),
        slug: "",
        shortDescription: emptyLocalized(),
        description: emptyLocalized(),
        technologies: [],
        liveUrl: "",
        repositoryUrl: "",
        featured: false,
      }
    : {}),
  ...(key === "technologies"
    ? { name: emptyLocalized(), category: "", proficiency: 80 }
    : {}),
  ...(key === "experiences"
    ? {
        company: "",
        role: emptyLocalized(),
        description: emptyLocalized(),
        startDate: "",
        endDate: "",
        current: false,
      }
    : {}),
  ...(key === "services"
    ? { title: emptyLocalized(), description: emptyLocalized(), icon: "" }
    : {}),
  ...(key === "languages"
    ? { name: emptyLocalized(), level: emptyLocalized() }
    : {}),
  ...(key === "contact-methods"
    ? { type: "email", label: emptyLocalized(), value: "", url: "", icon: "" }
    : {}),
  order: 0,
  isVisible: true,
});

/** رابط سازگار قدیمی برای کامپوننت‌های مشترک؛ اجرای واقعی در Axios متمرکز است. */
export function api(path: string, init: RequestInit = {}) {
  return requestAdmin<Record<string, unknown>>(path, init);
}

export const messages = {
  en: {
    validation: "Please fix the highlighted fields.",
    upload: "Upload failed. Check the file and try again.",
    network: "Network error. Please try again.",
    timeout: "The request took too long. Please try again.",
    auth: "Your session has expired. Please sign in again.",
    forbidden: "You do not have permission to perform this action.",
    notFound: "The requested item was not found.",
    rateLimit: "Too many attempts. Please wait and try again.",
    server: "Something went wrong. Please try again.",
    required: "This field is required.",
    localized: "Enter both Persian and English text.",
    email: "Please enter a valid email address.",
    url: "Please enter a valid URL.",
    date: "Please enter a valid date.",
    number: "Please enter a valid number.",
    image: "Choose a JPEG, PNG, WebP, or AVIF image up to 4 MB.",
    pdf: "Choose a PDF file up to 4 MB.",
    saved: "Saved successfully.",
    uploaded: "File uploaded successfully.",
    invalidCredentials: "Invalid email or password.",
    signInFailed: "Unable to sign in. Please try again.",
  },
  fa: {
    validation: "لطفاً خطاهای مشخص‌شده را اصلاح کنید.",
    upload: "بارگذاری انجام نشد. فایل را بررسی و دوباره تلاش کنید.",
    network: "خطای شبکه. لطفاً دوباره تلاش کنید.",
    timeout: "پاسخ‌گویی درخواست بیش از حد طول کشید. دوباره تلاش کنید.",
    auth: "نشست شما منقضی شده است. لطفاً دوباره وارد شوید.",
    forbidden: "شما اجازه انجام این کار را ندارید.",
    notFound: "مورد درخواستی پیدا نشد.",
    rateLimit: "تعداد تلاش‌ها زیاد است. کمی صبر و دوباره تلاش کنید.",
    server: "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
    required: "پر کردن این فیلد الزامی است.",
    localized: "متن فارسی و انگلیسی را وارد کنید.",
    email: "لطفاً ایمیل معتبر وارد کنید.",
    url: "آدرس واردشده معتبر نیست.",
    date: "لطفاً تاریخ معتبر وارد کنید.",
    number: "لطفاً عدد معتبر وارد کنید.",
    image: "تصویر JPEG، PNG، WebP یا AVIF تا حجم ۴ مگابایت انتخاب کنید.",
    pdf: "فایل PDF تا حجم ۴ مگابایت انتخاب کنید.",
    saved: "با موفقیت ذخیره شد.",
    uploaded: "فایل با موفقیت بارگذاری شد.",
    invalidCredentials: "ایمیل یا رمز عبور نادرست است.",
    signInFailed: "ورود انجام نشد. لطفاً دوباره تلاش کنید.",
  },
} as const;

export const localizedServerErrors = (error: unknown, locale: string) => {
  const lang = locale === "fa" ? messages.fa : messages.en;
  const errors = (error as AdminError)?.errors || {};
  return Object.fromEntries(
    Object.entries(errors).map(([key, value]) => {
      const raw = String(value).toLowerCase();
      if (key.toLowerCase().includes("email") || raw.includes("email"))
        return [key, lang.email];
      if (key.toLowerCase().includes("url") || raw.includes("http"))
        return [key, lang.url];
      if (key.toLowerCase().includes("date")) return [key, lang.date];
      if (raw.includes("number")) return [key, lang.number];
      if (raw.includes("required")) return [key, lang.required];
      return [key, lang.localized];
    }),
  );
};

export const localizedError = (error: unknown, locale: string, upload = false) => {
  const lang = locale === "fa" ? messages.fa : messages.en;
  const adminError = error as AdminError;
  if (adminError.code === 401 || adminError.message === "AUTH_REQUIRED") return lang.auth;
  if (adminError.code === 403) return lang.forbidden;
  if (adminError.code === 404) return lang.notFound;
  if (adminError.code === 408 || adminError.message === "REQUEST_TIMEOUT") return lang.timeout;
  if (adminError.code === 429) return lang.rateLimit;
  if (upload || adminError.code === 413 || /file|image|pdf|upload|media/i.test(adminError.message || "")) return lang.upload;
  if (adminError.code && adminError.code >= 500) return lang.server;
  if (adminError.errors || adminError.code === 400) return lang.validation;
  return lang.network;
};

export const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && value.length <= 2048;
  } catch {
    return false;
  }
};

export type AdminFieldProps = {
  label: string;
  children: ReactNode;
};
