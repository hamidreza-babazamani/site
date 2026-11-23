import axios from "axios";
import { apiClient } from "@/lib/api/axios";

export type AdminResource =
  | "projects"
  | "technologies"
  | "experiences"
  | "education"
  | "services"
  | "languages"
  | "stats"
  | "contact-methods";

export type AdminRequestInit = {
  method?: string;
  body?: BodyInit | null;
  headers?: HeadersInit;
  signal?: AbortSignal | null;
};

export type AdminApiError = Error & {
  code?: number;
  errors?: Record<string, string>;
};

/**
 * مرز واحد درخواست‌های پنل مدیریت است.
 * مسیرها relative هستند تا روی دامنه اصلی Vercel و محیط توسعه یکسان بمانند.
 * Axios کوکی HttpOnly را برای same-origin ارسال می‌کند؛ JWT هرگز از cookie خوانده
 * نمی‌شود. بدنه JSON و FormData بدون تغییر قرارداد backend عبور داده می‌شوند.
 */
const TUNNELED_METHODS = new Set(["PUT", "PATCH", "DELETE"]);

const extractErrorSnippet = (raw: unknown): string | undefined => {
  if (typeof raw !== "string") return undefined;
  const plain = raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return plain ? plain.slice(0, 140) : undefined;
};

export async function requestAdmin<T = Record<string, unknown>>(
  path: string,
  init: AdminRequestInit = {},
): Promise<T> {
  const requestedMethod = (init.method ?? "GET").toUpperCase();
  const shouldTunnel = TUNNELED_METHODS.has(requestedMethod);
  const transportMethod = shouldTunnel ? "POST" : requestedMethod;

  try {
    const headers = new Headers(init.headers);
    const isFormData =
      typeof FormData !== "undefined" && init.body instanceof FormData;
    if (isFormData) headers.delete("Content-Type");
    if (shouldTunnel) headers.set("x-admin-method", requestedMethod);
    const response = await apiClient.request<T>({
      url: path,
      method: transportMethod,
      headers: Object.fromEntries(headers.entries()),
      data: init.body,
      signal: init.signal ?? undefined,
      ...(isFormData ? { timeout: 90_000 } : {}),
    });
    return response.data;
  } catch (error) {
    if (!axios.isAxiosError(error)) throw error;
    const rawData = error.response?.data;
    const payload =
      rawData && typeof rawData === "object"
        ? (rawData as Record<string, unknown>)
        : undefined;
    const textSnippet = payload ? undefined : extractErrorSnippet(rawData);
    const isTimeout =
      error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";
    const status = error.response?.status ?? (isTimeout ? 408 : 0);
    if (status === 401 && typeof window !== "undefined")
      window.dispatchEvent(new Event("admin:expired"));
    const normalized = Object.assign(
      new Error(
        String(
          payload?.message ||
            textSnippet ||
            (isTimeout
              ? "REQUEST_TIMEOUT"
              : status
                ? "REQUEST_FAILED"
                : "NETWORK_ERROR"),
        ),
      ),
      {
        code: status,
        errors: payload?.errors,
        endpoint: `${requestedMethod} ${path}`,
      },
    ) as AdminApiError;
    throw normalized;
  }
}

/** دریافت صفحه‌ای منابع عادی مدیریت با meta صفحه‌بندی backend. */
export function listAdminResource(
  resource: AdminResource,
  query = "",
) {
  return requestAdmin<{ success: true; data: unknown[]; meta: Record<string, number> }>(
    `/api/admin/${resource}${query}`,
  );
}

/** ایجاد، ویرایش جزئی و حذف رکوردهای منابع عادی مدیریت. */
export const createAdminResource = (resource: AdminResource, body: unknown) =>
  requestAdmin(`/api/admin/${resource}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const updateAdminResource = (
  resource: AdminResource,
  id: string,
  body: unknown,
) =>
  requestAdmin(`/api/admin/${resource}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const deleteAdminResource = (resource: AdminResource, id: string) =>
  requestAdmin(`/api/admin/${resource}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

/** خواندن و ذخیره Hero/Profile/Resume؛ singletonها قرارداد PUT فعلی را حفظ می‌کنند. */
export const getAdminSingleton = (resource: "hero" | "profile" | "resume") =>
  requestAdmin(`/api/admin/${resource}`);

export const saveAdminSingleton = (
  resource: "hero" | "profile" | "resume",
  body: unknown,
) =>
  requestAdmin(`/api/admin/${resource}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const deleteAdminSingletonMedia = (
  resource: "hero" | "profile" | "resume",
) => {
  const segment = resource === "resume" ? "file" : "image";
  return requestAdmin(`/api/admin/${resource}/${segment}`, { method: "DELETE" });
};
