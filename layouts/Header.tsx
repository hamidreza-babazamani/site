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
    <div className="container mx-auto flex items-center justify-between">
      <div
        className={`flex items-center ${
          locale === "fa"
            ? "justify-end py-8 mr-4 gap-3"
            : "justify-start py-8 ml-4 gap-3"
        }`}
      >
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="flex flex-col items-center">
        <Link
          className="xl:text-4xl text-xl text-gray-900 dark:text-white p-2 font-semibold"
          href={"/"}
        >
          Kamyar<span className="text-green-500 text-4xl">.</span>Dev
        </Link>
        <div className="hidden xl:flex items-center gap-8">
          <NavDecks />
          <h1>
            <Link href={"/contact"}>
              <Button>{t("worke")}</Button>
            </Link>
          </h1>
        </div>
        {/* mobile size */}
        <div
          className={`xl:hidden ${locale === "en" ? "ml-[7rem]" : "mr-[5rem]"}`}
        >
          <MobileNavbar />
        </div>
      </div>
    </div>
  );
}

export default Header;
