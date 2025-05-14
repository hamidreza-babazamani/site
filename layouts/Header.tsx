import LanguageSwitcher from "@/components/LanguageSwitcher";
import React from "react";

function Header() {
  return (
    <div className="flex justify-end">
      <LanguageSwitcher />
    </div>
  );
}

export default Header;
