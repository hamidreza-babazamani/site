import { publicApiClient } from "@/lib/api/axios";
import type { ApiEnvelope } from "@/lib/api/types";

export type ContactMessagePayload = {
  name: string;
  email: string;
  subject?: string;
  message: string;
  locale?: "fa" | "en";
};

/**
 * پیام فرم عمومی را با POST ارسال می‌کند.
 * مسیر relative است تا در localhost، preview و دامنه اصلی Vercel یکسان باشد.
 * این endpoint عمومی است و نباید کوکی یا اطلاعات مدیر را از فرم دریافت کند؛
 * محدودیت نرخ و اعتبارسنجی نهایی در backend انجام می‌شود.
 */
export async function createContactMessage(payload: ContactMessagePayload) {
  const response = await publicApiClient.post<ApiEnvelope<{ id: string }>>(
    "/api/public/contact-messages",
    payload,
  );
  return response.data;
}
