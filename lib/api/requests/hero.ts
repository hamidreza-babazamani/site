import { publicApiClient } from "@/lib/api/axios";
import type { ApiEnvelope, LocalizedText } from "@/lib/api/types";
import type { HeroTechnologyEcosystemConfig } from "@/lib/server/hero-technology-config";

export type PublicHero = {
  jobTitle?: Partial<LocalizedText>;
  headline?: Partial<LocalizedText>;
  description?: Partial<LocalizedText>;
  image?: { url: string; alt?: Partial<LocalizedText> } | null;
  isVisible?: boolean;
  technologyEcosystem?: HeroTechnologyEcosystemConfig & {
    items: Array<
      HeroTechnologyEcosystemConfig["items"][number] & {
        name: LocalizedText;
        iconMedia?: { url: string; alt?: Partial<LocalizedText> };
      }
    >;
  };
};

/** دریافت Hero عمومی؛ این درخواست فقط برای اجرای مرورگر است و کوکی مدیر نمی‌خواهد. */
export async function getPublicHero() {
  const response = await publicApiClient.get<ApiEnvelope<PublicHero | null>>(
    "/api/public/hero",
  );
  return response.data;
}
