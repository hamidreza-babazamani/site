import { getLocale } from "next-intl/server";
import HeroImage from "@/components/HeroImage";
import HeroTechEcosystem from "@/components/HeroTechEcosystem";
import type { PublicHero, PublicMedia } from "@/lib/services/public-portfolio";

export default async function Photo({
  hero,
  fallbackImage,
}: {
  hero: PublicHero | null;
  fallbackImage?: PublicMedia;
}) {
  const locale = await getLocale();

  const alt =
    hero?.image?.alt?.[locale as "fa" | "en"] ||
    hero?.image?.alt?.en ||
    (locale === "fa"
      ? "تصویر حمیدرضا بابازمانی، توسعه‌دهنده بک‌اند و فول‌استک"
      : "Portrait of Hamidreza Babazamani, Backend & Full-Stack Developer");

  return (
    <div
      className="
        relative mx-auto
        aspect-square w-[min(72vw,260px)] max-w-full
        sm:h-[360px] sm:w-[360px]
        xl:h-[480px] xl:w-[480px]
      "
    >
      <HeroImage
        src={hero?.image?.url}
        fallbackSrc={fallbackImage?.url}
        alt={alt}
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0 z-10
          rounded-full bg-black/20
        "
      />

      <HeroTechEcosystem
        ecosystem={hero?.technologyEcosystem}
        locale={locale}
      />
    </div>
  );
}
