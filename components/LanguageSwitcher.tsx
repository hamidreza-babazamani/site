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

  // تشخیص جهت صفحه (LTR یا RTL)
  const direction = locale === "fa" ? "rtl" : "ltr";

  // بستن دراپ‌داون وقتی کلیک خارج انجام بشه
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

  // جابجایی زبان
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

  // جلوگیری از overflow در موبایل (کنترل موقعیت و اندازه)
  // این useEffect برای تغییر موقعیت در صورت overflow می‌تونه اضافه بشه
  useEffect(() => {
    if (!open) return;

    const dropdown = dropdownRef.current;
    if (!dropdown) return;

    const rect = dropdown.getBoundingClientRect();
    const padding = 10; // فاصله از لبه صفحه

    if (direction === "rtl") {
      if (rect.left < padding) {
        // اگر از چپ بیرون رفت، جابجا کن
        dropdown.style.left = `${padding}px`;
        dropdown.style.right = "auto";
      } else {
        dropdown.style.left = "auto";
        dropdown.style.right = "0";
      }
    } else {
      if (rect.right > window.innerWidth - padding) {
        dropdown.style.right = `${padding}px`;
        dropdown.style.left = "auto";
      } else {
        dropdown.style.right = "0";
        dropdown.style.left = "auto";
      }
    }
  }, [open, direction]);

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block text-left ${
        direction === "rtl" ? "direction-rtl" : "direction-ltr"
      }`}
      dir={direction}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full max-w-[160px] sm:max-w-[200px]"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Select language"
      >
        <Image
          src={current?.flag || ""}
          alt={locale}
          width={20}
          height={20}
          className="w-4 h-4 sm:w-5 sm:h-5 object-cover rounded-full flex-shrink-0"
        />
        <span className="truncate">{current?.label}</span>
        <svg
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 transition-transform duration-200 ml-auto ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
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
        className={`absolute z-20 mt-2 w-full max-w-[200px] sm:max-w-[220px] rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-200 origin-top-${
          direction === "rtl" ? "left" : "right"
        } ${
          open
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
        style={{
          right: direction === "ltr" ? "0" : undefined,
          left: direction === "rtl" ? "0" : undefined,
        }}
      >
        <ul className="py-1 max-h-60 overflow-y-auto">
          {languages.map((lang) => (
            <li key={lang.code}>
              <button
                onClick={() => handleChangeLocale(lang.code)}
                className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-left transition-colors truncate ${
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
                  className="w-4 h-4 sm:w-5 sm:h-5 object-cover rounded-full flex-shrink-0"
                />
                <span className="truncate">{lang.label}</span>
                {locale === lang.code && (
                  <svg
                    className="w-4 h-4 ml-auto text-blue-500 flex-shrink-0"
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
