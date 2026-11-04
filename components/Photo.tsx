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
      ? "تصویر حمیدرضا بابازمانی، توسعه‌دهنده فرانت‌اند"
      : "Portrait of Hamidreza Babazamani, Front-end Developer");

  return (
    <div
      className="
        relative mx-auto
        h-[280px] w-[280px]
        sm:h-[380px] sm:w-[380px]
        xl:h-[498px] xl:w-[498px]
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
