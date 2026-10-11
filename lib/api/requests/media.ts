import { apiClient } from "@/lib/api/axios";
import type { ApiEnvelope, LocalizedText } from "@/lib/api/types";

type MediaResponse = {
  url: string;
  key: string;
  fileId?: string;
  alt?: Partial<LocalizedText>;
};

/**
 * تصویر پروژه را به‌صورت multipart ارسال می‌کند. فایل و alt در FormData قرار
 * می‌گیرند؛ Content-Type عمداً دستی تنظیم نمی‌شود تا Axios boundary صحیح را بسازد.
 * احراز هویت با کوکی HttpOnly same-origin انجام می‌شود و کلیدهای storage هرگز
 * به مرورگر ارسال نمی‌شوند.
 */
export async function uploadProjectImage(
  projectId: string,
  file: File,
  alt: LocalizedText,
) {
  const form = new FormData();
  form.append("file", file);
  form.append("alt", JSON.stringify(alt));
  const response = await apiClient.post<ApiEnvelope<MediaResponse>>(
    `/api/admin/projects/${encodeURIComponent(projectId)}/images`,
    form,
  );
  return response.data;
}

/** حذف تصویر پروژه؛ پاسخ backend شامل آرایه تصاویر باقی‌مانده است. */
export async function deleteProjectImage(projectId: string, key: string) {
  const response = await apiClient.delete<ApiEnvelope<MediaResponse[]>>(
    `/api/admin/projects/${encodeURIComponent(projectId)}/images/${encodeURIComponent(key)}`,
  );
  return response.data;
}

/**
 * رسانه Hero/Profile/Resume را حذف می‌کند. نوع رسانه فقط مسیر قراردادی backend
 * را تعیین می‌کند و هیچ داده حساس یا credentialای از کلاینت دریافت نمی‌کند.
 */
export async function deleteSingletonMedia(
  resource: "hero" | "profile" | "resume",
) {
  const segment = resource === "resume" ? "file" : "image";
  const response = await apiClient.delete<ApiEnvelope<unknown>>(
    `/api/admin/${resource}/${segment}`,
  );
  return response.data;
}
