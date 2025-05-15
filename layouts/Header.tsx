import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { useLocale } from "next-intl";
import React from "react";

function Header() {
  const locale = useLocale();
  return (
    <div
      className={`flex items-center${
        locale === "fa"
          ? "justify-end py-8 mr-4 gap-3"
          : "justify-start py-8 ml-4 gap-3"
      }`}
    >
      <LanguageSwitcher />
      <ThemeToggle />
    </div>
  );
}

export default Header;
