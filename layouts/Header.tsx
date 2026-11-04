
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import MobileNavbar from "@/components/MobileNavbar";
import NavDecks from "@/components/NavDecks";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import type { PublicMedia } from "@/lib/services/public-portfolio";

function Header({ siteLogo }: { siteLogo?: PublicMedia }) {
  const locale = useLocale();
  const t = useTranslations("HomePage");

  return (
    <header
      dir={locale === "fa" ? "rtl" : "ltr"}
      className="relative z-40 w-full"
    >
      <div
        className="
          container mx-auto
          grid min-h-20 w-full
          grid-cols-[auto_minmax(0,1fr)_auto]
          items-center gap-2
          px-3 py-3
          sm:gap-4 sm:px-6
          xl:flex xl:min-h-24
          xl:justify-between xl:gap-6
          xl:py-4
        "
      >
        {/* Language & Theme */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        {siteLogo?.url && (
          <Link
            href="/"
            aria-label="Hamidreza Babazamani - Home"
            className="
              flex min-w-0 items-center justify-center
              justify-self-center
              transition-transform duration-300
              hover:scale-[1.03]
              focus-visible:outline-2
              focus-visible:outline-offset-4
              focus-visible:outline-emerald-500
            "
          >
            <Image
              src={siteLogo.url}
              alt={siteLogo.alt?.[locale as "fa" | "en"] || "Website logo"}
              width={220}
              height={110}
              priority
              sizes="(max-width: 640px) 110px, (max-width: 1280px) 150px, 180px"
              className="
                h-auto w-[105px]
                max-w-full object-contain
                sm:w-[145px]
                xl:w-[180px]
                dark:brightness-110
              "
            />
          </Link>
        )}

        {/* Mobile Navigation */}
        <div className="shrink-0 justify-self-end xl:hidden">
          <MobileNavbar />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden min-w-0 items-center gap-6 xl:flex 2xl:gap-8">
          <NavDecks />

          <Link href="/contact" className="shrink-0">
            <Button>{t("worke")}</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
