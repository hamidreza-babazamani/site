"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChangeLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.replace(segments.join("/"));
    setOpen(false);
  };

  const languages = [
    { code: "fa", label: "فارسی", flag: "/flags/flagiran.webp" },
    { code: "en", label: "English", flag: "/flags/flagamerican.png" },
  ];

  const current = languages.find((l) => l.code === locale);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Image
          src={current?.flag || ""}
          alt={locale}
          width={20}
          height={20}
          className="w-4 h-4 sm:w-5 sm:h-5 object-cover rounded-full"
        />
        {current?.label}
        <svg
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        className={`absolute right-0 z-20 mt-2 w-44 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-200 origin-top-right ${
          open
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        <ul className="py-1">
          {languages.map((lang) => (
            <li key={lang.code}>
              <button
                onClick={() => handleChangeLocale(lang.code)}
                className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-left transition-colors ${
                  locale === lang.code
                    ? "bg-gray-100 dark:bg-gray-700 font-semibold text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Image
                  src={lang.flag}
                  alt={lang.code}
                  width={20}
                  height={20}
                  className="w-4 h-4 sm:w-5 sm:h-5 object-cover rounded-full"
                />
                {lang.label}
                {locale === lang.code && (
                  <svg
                    className="w-4 h-4 ml-auto text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
