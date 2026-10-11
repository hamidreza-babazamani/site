import { publicApiClient } from "@/lib/api/axios";
import type { ApiListEnvelope, PublicProject } from "@/lib/api/types";

/**
 * پروژه‌های قابل نمایش را دریافت می‌کند.
 * پارامترهای visibility و limit مطابق قرارداد فعلی backend هستند و پاسخ در data
 * قرار دارد. چون مسیر same-origin است، نیازی به URL دامنه یا CORS جداگانه نیست.
 */
export async function listPublicProjects(limit = 50) {
  const response = await publicApiClient.get<ApiListEnvelope<PublicProject>>(
    "/api/public/projects",
    { params: { limit, visible: true } },
  );
  return response.data;
}
