"use client";
import { useState } from "react";
import { useDarkMode } from "@/hooks/DarkLightMod";
import { Sun, Moon, Laptop } from "lucide-react";

import { useTranslations } from "next-intl";

const ThemeToggle = () => {
  const t = useTranslations("HomePage");

  const options = [
    { value: "light", label: t("dark.light"), icon: <Sun size={18} /> },
    { value: "dark", label: t("dark.darks"), icon: <Moon size={18} /> },
    { value: "system", label: t("dark.system"), icon: <Laptop size={18} /> },
  ];
  const { mode, changeMode } = useDarkMode();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {options.find((opt) => opt.value === mode)?.icon}
        {options.find((opt) => opt.value === mode)?.label}
      </button>

      {open && (
        <ul
          className="absolute z-10 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg transition-all duration-300 ease-in-out animate-fade-in"
          onMouseLeave={() => setOpen(false)}
        >
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                onClick={() => {
                  changeMode(opt.value as "light" | "dark" | "system");
                  setOpen(false);
                }}
                className={`w-full px-4 py-2 flex items-center gap-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  mode === opt.value
                    ? "bg-gray-100 dark:bg-gray-700 font-semibold"
                    : ""
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ThemeToggle;
