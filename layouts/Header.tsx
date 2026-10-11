import LanguageSwitcher from "@/components/LanguageSwitcher";
import MobileNavbar from "@/components/MobileNavbar";
import NavDecks from "@/components/NavDecks";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

function Header() {
  const locale = useLocale();
  const t = useTranslations("HomePage");

  return (
    <header dir={locale === "fa" ? "rtl" : "ltr"} className="w-full">
      <div
        className="
          container mx-auto
          grid grid-cols-[auto_minmax(0,1fr)_auto]
          items-center gap-2 px-3 py-4
          sm:gap-4 sm:px-6
          xl:flex xl:justify-between xl:py-6
        "
      >
        {/* Language & Theme */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        {/* Logo */}
        <Link
          href="/"
          className="
            min-w-0 justify-self-center
            whitespace-nowrap
            hidden
            md:block
            text-base font-semibold
            text-gray-900 dark:text-white
            sm:text-xl
            xl:text-4xl
          "
        >
          Kamyar
          <span className="text-2xl text-green-500 sm:text-4xl">.</span>
          Dev
        </Link>

        {/* Mobile Navigation */}
        <div className="justify-self-end xl:hidden">
          <MobileNavbar />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 xl:flex">
          <NavDecks />

          <Link href="/contact">
            <Button>{t("worke")}</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
