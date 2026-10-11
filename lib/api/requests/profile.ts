import { publicApiClient } from "@/lib/api/axios";
import type { ApiEnvelope, LocalizedText } from "@/lib/api/types";

export type PublicProfile = {
  name?: Partial<LocalizedText>;
  bio?: Partial<LocalizedText>;
  image?: { url: string; alt?: Partial<LocalizedText> } | null;
};

/** پروفایل عمومی را با GET می‌خواند؛ پاسخ backend در فیلد data قرار دارد. */
export async function getPublicProfile() {
  const response = await publicApiClient.get<ApiEnvelope<PublicProfile | null>>(
    "/api/public/profile",
  );
  return response.data;
}
